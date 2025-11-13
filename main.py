from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Usuario, Acao
from schemas import UsuarioCreate, UsuarioLogin, Token, AcaoCreate, AcaoResponse, EstatisticasResponse
from auth import gerar_hash, verificar_senha, criar_token, verificar_token
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from sqlalchemy import func
from datetime import datetime, date

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gestão Política")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependência de autenticação
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """
    Obtém o usuário atual baseado no token JWT
    """
    token = credentials.credentials
    payload = verificar_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    email: str = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
   
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    return user

# ==================== ROTAS DE AUTENTICAÇÃO ====================

@app.post("/registrar", status_code=status.HTTP_201_CREATED)
def registrar(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário no sistema
    """
    # Verifica se o e-mail já existe
    existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail já cadastrado"
        )

    novo_usuario = Usuario(
        email=usuario.email,
        senha_hash=gerar_hash(usuario.senha),
        nome=usuario.nome or usuario.email.split('@')[0]
    )
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    
    return {"mensagem": "Usuário criado com sucesso!"}

@app.post("/login", response_model=Token)
def login(usuario: UsuarioLogin, db: Session = Depends(get_db)):
    """
    Realiza login e retorna token JWT
    """
    user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    
    if not user or not verificar_senha(usuario.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )

    token = criar_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# ==================== ROTAS DE AÇÕES ====================

@app.get("/acoes", response_model=List[AcaoResponse])
def listar_acoes(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista todas as ações do usuário logado
    """
    acoes = db.query(Acao).filter(Acao.usuario_id == current_user.id).order_by(Acao.data.desc()).all()
    return acoes

@app.post("/acoes", response_model=AcaoResponse)
def criar_acao(
    acao: AcaoCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cria uma nova ação
    """
    try:
        # Converte a data se for string
        data_acao = acao.data
        if isinstance(data_acao, str):
            try:
                data_acao = datetime.strptime(acao.data, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Formato de data inválido. Use YYYY-MM-DD"
                )
        
        nova_acao = Acao(
            titulo=acao.titulo,
            descricao=acao.descricao,
            tipo=acao.tipo,
            data=data_acao,
            cidade=acao.cidade,
            bairro=acao.bairro,
            lat=acao.latitude,  # Mapeia latitude para lat
            lng=acao.longitude, # Mapeia longitude para lng
            responsavel=acao.responsavel,
            contato=acao.contato,
            usuario_id=current_user.id
        )
        
        db.add(nova_acao)
        db.commit()
        db.refresh(nova_acao)
        
        return nova_acao
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar ação: {str(e)}"
        )

@app.get("/acoes/{acao_id}", response_model=AcaoResponse)
def obter_acao(
    acao_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtém uma ação específica pelo ID
    """
    acao = db.query(Acao).filter(
        Acao.id == acao_id, 
        Acao.usuario_id == current_user.id
    ).first()
    
    if not acao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ação não encontrada"
        )
    
    return acao

@app.put("/acoes/{acao_id}", response_model=AcaoResponse)
def atualizar_acao(
    acao_id: int, 
    acao_data: AcaoCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Atualiza uma ação existente
    """
    acao = db.query(Acao).filter(
        Acao.id == acao_id, 
        Acao.usuario_id == current_user.id
    ).first()
    
    if not acao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ação não encontrada"
        )
    
    try:
        # Converte a data se for string
        data_acao = acao_data.data
        if isinstance(data_acao, str):
            try:
                data_acao = datetime.strptime(acao_data.data, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Formato de data inválido. Use YYYY-MM-DD"
                )
        
        # Atualizar campos
        acao.titulo = acao_data.titulo
        acao.descricao = acao_data.descricao
        acao.tipo = acao_data.tipo
        acao.data = data_acao
        acao.cidade = acao_data.cidade
        acao.bairro = acao_data.bairro
        acao.lat = acao_data.latitude
        acao.lng = acao_data.longitude
        acao.responsavel = acao_data.responsavel
        acao.contato = acao_data.contato
        acao.atualizado_em = datetime.now()
        
        db.commit()
        db.refresh(acao)
        
        return acao
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar ação: {str(e)}"
        )

@app.delete("/acoes/{acao_id}")
def deletar_acao(
    acao_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Deleta uma ação
    """
    acao = db.query(Acao).filter(
        Acao.id == acao_id, 
        Acao.usuario_id == current_user.id
    ).first()
    
    if not acao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ação não encontrada"
        )
    
    db.delete(acao)
    db.commit()
    
    return {"mensagem": "Ação deletada com sucesso"}

# ==================== ROTAS DE ESTATÍSTICAS E PERFIL ====================

@app.get("/estatisticas", response_model=EstatisticasResponse)
def obter_estatisticas(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna estatísticas das ações do usuário
    """
    try:
        # Total de ações
        total_actions = db.query(Acao).filter(Acao.usuario_id == current_user.id).count()
       
        # Cidades únicas
        active_cities = db.query(Acao.cidade).filter(Acao.usuario_id == current_user.id).distinct().count()
       
        # Bairros únicos
        covered_neighborhoods = db.query(Acao.bairro).filter(Acao.usuario_id == current_user.id).distinct().count()
       
        # Ações deste mês
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_actions = db.query(Acao).filter(
            Acao.usuario_id == current_user.id,
            Acao.data >= current_month
        ).count()
       
        return EstatisticasResponse(
            total_actions=total_actions,
            active_cities=active_cities,
            covered_neighborhoods=covered_neighborhoods,
            monthly_actions=monthly_actions
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )

@app.get("/perfil")
def obter_perfil(current_user: Usuario = Depends(get_current_user)):
    """
    Retorna informações do perfil do usuário logado
    """
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "criado_em": current_user.criado_em
    }

# ==================== ROTAS DE SAÚDE ====================

@app.get("/")
def root():
    """
    Rota raiz
    """
    return {
        "message": "API do Sistema de Gestão Política",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Verifica a saúde da API e conexão com banco de dados
    """
    try:
        # Testar conexão com o banco
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# ==================== INICIALIZAÇÃO ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)