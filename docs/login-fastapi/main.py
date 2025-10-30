# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import Usuario
from schemas import UsuarioCreate, UsuarioLogin, Token
from auth import gerar_hash, verificar_senha, criar_token
from fastapi.middleware.cors import CORSMiddleware #
from typing import List, Optional
from sqlalchemy import func

Base.metadata.create_all(bind=engine)

app = FastAPI()

#
origins = [
    "http://127.0.0.1:5500", # Se você usa o Live Server do VS Code
    "null", # Para permitir requisições de arquivos locais (file://)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (POST, GET, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Dependência para obter sessão do BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/registrar")
def registrar(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    # Verifica se o e-mail já existe
    existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    novo_usuario = Usuario(
        email=usuario.email,
        senha=gerar_hash(usuario.senha)
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"mensagem": "Usuário criado com sucesso!"}


@app.post("/login", response_model=Token)
def login(usuario: UsuarioLogin, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if not user or not verificar_senha(usuario.senha, user.senha):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    token = criar_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/acoes", response_model=List[AcaoResponse])
def listar_acoes(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    acoes = db.query(Acao).filter(Acao.usuario_id == current_user.id).all()
    return acoes

@app.post("/acoes", response_model=AcaoResponse)
def criar_acao(acao: AcaoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    nova_acao = Acao(
        **acao.dict(),
        usuario_id=current_user.id
    )
    db.add(nova_acao)
    db.commit()
    db.refresh(nova_acao)
    return nova_acao

@app.put("/acoes/{acao_id}", response_model=AcaoResponse)
def atualizar_acao(acao_id: int, acao: AcaoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    acao_db = db.query(Acao).filter(Acao.id == acao_id, Acao.usuario_id == current_user.id).first()
    if not acao_db:
        raise HTTPException(status_code=404, detail="Ação não encontrada")
    
    for key, value in acao.dict().items():
        setattr(acao_db, key, value)
    
    db.commit()
    db.refresh(acao_db)
    return acao_db

@app.delete("/acoes/{acao_id}")
def excluir_acao(acao_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    acao = db.query(Acao).filter(Acao.id == acao_id, Acao.usuario_id == current_user.id).first()
    if not acao:
        raise HTTPException(status_code=404, detail="Ação não encontrada")
    
    db.delete(acao)
    db.commit()
    return {"message": "Ação excluída com sucesso"}

@app.get("/estatisticas", response_model=EstatisticasResponse)
def obter_estatisticas(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    # Total de ações
    total_actions = db.query(Acao).filter(Acao.usuario_id == current_user.id).count()
    
    # Cidades únicas
    active_cities = db.query(Acao.cidade).filter(Acao.usuario_id == current_user.id).distinct().count()
    
    # Bairros únicos
    covered_neighborhoods = db.query(Acao.bairro).filter(Acao.usuario_id == current_user.id).distinct().count()
    
    # Ações deste mês
    current_month = func.date_trunc('month', func.now())
    monthly_actions = db.query(Acao).filter(
        Acao.usuario_id == current_user.id,
        func.date_trunc('month', Acao.data) == current_month
    ).count()
    
    return EstatisticasResponse(
        total_actions=total_actions,
        active_cities=active_cities,
        covered_neighborhoods=covered_neighborhoods,
        monthly_actions=monthly_actions
    )

# Adicione esta função de autenticação no main.py
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user
