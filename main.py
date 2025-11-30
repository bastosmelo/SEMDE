from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Usuario, Acao, Contato
from schemas import UsuarioCreate, UsuarioLogin, Token, AcaoCreate, AcaoResponse, EstatisticasResponse, ContatoCreate, ContatoResponse, ContatoUpdate
from auth import gerar_hash, verificar_senha, criar_token, verificar_token
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from sqlalchemy import func
from datetime import datetime, date
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criar tabelas
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tabelas criadas/verificadas com sucesso!")
except Exception as e:
    logger.error(f"❌ Erro ao criar tabelas: {e}")

# Configuração do esquema de segurança para Swagger
security_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="Insira o token JWT no formato: Bearer <token>"
)

app = FastAPI(
    title="Sistema de Gestão Política",
    description="API para gerenciamento de contatos e ações políticas",
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
        "displayRequestDuration": True
    }
)

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
            lat=acao.lat,
            lng=acao.lng,
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
        acao.lat = acao_data.lat
        acao.lng = acao_data.lng
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

# ==================== ROTAS DE CONTATOS ====================

@app.get("/contatos", response_model=List[ContatoResponse])
def listar_contatos(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Lista todos os contatos do usuário logado
    """
    contatos = db.query(Contato).filter(Contato.usuario_id == current_user.id).order_by(Contato.criado_em.desc()).all()
    return contatos

@app.post("/contatos", response_model=ContatoResponse)
def criar_contato(
    contato: ContatoCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cria um novo contato
    """
    try:
        # Verifica se já existe contato com o mesmo telefone para este usuário
        existente = db.query(Contato).filter(
            Contato.telefone == contato.telefone,
            Contato.usuario_id == current_user.id
        ).first()
        
        if existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um contato com este telefone"
            )
        
        novo_contato = Contato(
            nome=contato.nome,
            idade=contato.idade,
            sexo=contato.sexo,
            email=contato.email,
            telefone=contato.telefone,
            cidade=contato.cidade,
            bairro=contato.bairro,
            escolaridade=contato.escolaridade,
            assessor=contato.assessor,
            assunto=contato.assunto,
            observacao=contato.observacao,
            status=contato.status or "ativo",
            data_cadastro=contato.data_cadastro or date.today(),
            lat=contato.lat,
            lng=contato.lng,
            usuario_id=current_user.id
        )
        
        db.add(novo_contato)
        db.commit()
        db.refresh(novo_contato)
        
        return novo_contato
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar contato: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar contato: {str(e)}"
        )

@app.get("/contatos/{contato_id}", response_model=ContatoResponse)
def obter_contato(
    contato_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Obtém um contato específico pelo ID
    """
    contato = db.query(Contato).filter(
        Contato.id == contato_id, 
        Contato.usuario_id == current_user.id
    ).first()
    
    if not contato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contato não encontrado"
        )
    
    return contato

@app.put("/contatos/{contato_id}", response_model=ContatoResponse)
def atualizar_contato(
    contato_id: int, 
    contato_data: ContatoUpdate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Atualiza um contato existente
    """
    contato = db.query(Contato).filter(
        Contato.id == contato_id, 
        Contato.usuario_id == current_user.id
    ).first()
    
    if not contato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contato não encontrado"
        )
    
    try:
        # Verifica se o novo telefone já existe em outro contato
        if contato_data.telefone != contato.telefone:
            telefone_existente = db.query(Contato).filter(
                Contato.telefone == contato_data.telefone,
                Contato.usuario_id == current_user.id,
                Contato.id != contato_id
            ).first()
            
            if telefone_existente:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Já existe outro contato com este telefone"
                )
        
        # Atualizar campos
        contato.nome = contato_data.nome
        contato.idade = contato_data.idade
        contato.sexo = contato_data.sexo
        contato.email = contato_data.email
        contato.telefone = contato_data.telefone
        contato.cidade = contato_data.cidade
        contato.bairro = contato_data.bairro
        contato.escolaridade = contato_data.escolaridade
        contato.assessor = contato_data.assessor
        contato.assunto = contato_data.assunto
        contato.observacao = contato_data.observacao
        contato.status = contato_data.status
        contato.data_cadastro = contato_data.data_cadastro
        contato.lat = contato_data.lat
        contato.lng = contato_data.lng
        contato.atualizado_em = datetime.now()
        
        db.commit()
        db.refresh(contato)
        
        return contato
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar contato: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar contato: {str(e)}"
        )

@app.delete("/contatos/{contato_id}")
def deletar_contato(
    contato_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Deleta um contato
    """
    contato = db.query(Contato).filter(
        Contato.id == contato_id, 
        Contato.usuario_id == current_user.id
    ).first()
    
    if not contato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contato não encontrado"
        )
    
    db.delete(contato)
    db.commit()
    
    return {"mensagem": "Contato deletado com sucesso"}

# ==================== ROTAS DE ESTATÍSTICAS ====================

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
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )

@app.get("/estatisticas-contatos")
def obter_estatisticas_contatos(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Retorna estatísticas dos contatos do usuário
    """
    try:
        # Total de contatos
        total_contacts = db.query(Contato).filter(Contato.usuario_id == current_user.id).count()
        
        # Contatos ativos
        active_contacts = db.query(Contato).filter(
            Contato.usuario_id == current_user.id,
            Contato.status == 'ativo'
        ).count()
        
        # Cidades únicas
        total_cities = db.query(Contato.cidade).filter(Contato.usuario_id == current_user.id).distinct().count()
        
        # Novos hoje
        new_today = db.query(Contato).filter(
            Contato.usuario_id == current_user.id,
            Contato.data_cadastro == date.today()
        ).count()
        
        return {
            "total_contacts": total_contacts,
            "active_contacts": active_contacts,
            "total_cities": total_cities,
            "new_today": new_today
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de contatos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas de contatos: {str(e)}"
        )

# ==================== ROTAS DE PERFIL ====================

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
        logger.error(f"Erro no health check: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# ==================== ROTA PARA CRIAR USUÁRIO INICIAL ====================

@app.post("/criar-usuario-inicial")
def criar_usuario_inicial(db: Session = Depends(get_db)):
    """
    Cria um usuário inicial para testes
    """
    try:
        # Verificar se já existe
        existente = db.query(Usuario).filter(Usuario.email == "admin@exemplo.com").first()
        if existente:
            return {"mensagem": "Usuário já existe", "email": "admin@exemplo.com"}
        
        novo_usuario = Usuario(
            email="admin@exemplo.com",
            senha_hash=gerar_hash("123456"),
            nome="Administrador"
        )
        
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)
        
        return {
            "mensagem": "Usuário criado com sucesso", 
            "email": "admin@exemplo.com", 
            "senha": "123456",
            "dica": "Use estas credenciais para fazer login"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )

# ==================== INICIALIZAÇÃO ====================

if __name__ == "__main__":
    import uvicorn
    print("🚀 Iniciando servidor FastAPI...")
    print("📍 http://localhost:8000")
    print("📚 Documentação: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    print("👤 Criar usuário inicial: http://localhost:8000/criar-usuario-inicial")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        print("💡 Verifique se a porta 8000 está disponível")
        input("Pressione Enter para sair...")