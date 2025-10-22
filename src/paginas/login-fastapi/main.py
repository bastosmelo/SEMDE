# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import Usuario
from schemas import UsuarioCreate, UsuarioLogin, Token
from auth import gerar_hash, verificar_senha, criar_token
from fastapi.middleware.cors import CORSMiddleware #

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
