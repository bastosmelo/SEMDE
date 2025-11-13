from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
import os
from dotenv import load_dotenv
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configurações do banco com valores padrão robustos
DB_CONFIG = {
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "admin"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "database": os.getenv("DB_NAME", "sistema_login")
}

# String de conexão para psycopg
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg://{DB_CONFIG['user']}:{DB_CONFIG['password']}"
    f"@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"
)

print(f"🔗 Tentando conectar em: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")

try:
    # Configuração do engine com otimizações
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        # Configurações de pool
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_timeout=30,
        # Configurações de performance
        echo=os.getenv("DB_ECHO", "False").lower() == "true",
        # Configurações de conexão
        connect_args={
            "connect_timeout": 10,
            "application_name": "sistema_login_app"
        }
    )
    
    # Testar conexão de forma correta para SQLAlchemy 2.0+
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version(), current_database(), current_user"))
        db_info = result.fetchone()
        print("✅ Conectado ao PostgreSQL com sucesso!")
        print(f"   📊 PostgreSQL: {db_info[0]}")
        print(f"   🗄️  Database: {db_info[1]}")
        print(f"   👤 Usuário: {db_info[2]}")
        
except Exception as e:
    logger.error(f"❌ Erro ao conectar no PostgreSQL: {e}")
    print(f"❌ Erro detalhado: {str(e)}")
    
    # Tentativa de fallback sem informações detalhadas
    try:
        print("🔄 Tentando conexão simplificada...")
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            echo=False
        )
        
        # Teste simplificado
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Conectado ao PostgreSQL!")
            
    except Exception as e2:
        logger.error(f"❌ Erro também na conexão alternativa: {e2}")
        print("💡 Dicas para solucionar:")
        print("   1. Verifique se o PostgreSQL está rodando")
        print("   2. Confirme usuário/senha no .env")
        print("   3. Verifique se o database existe")
        print("   4. Teste a conexão manualmente: psql -h localhost -U postgres -d sistema_login")
        raise e

# Configuração da sessão
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False
)

Base = declarative_base()

def get_db():
    """
    Dependency para obter sessão do banco de dados.
    Use em dependencies do FastAPI: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
        logger.debug("Sessão do banco utilizada com sucesso")
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro na sessão do banco: {e}")
        raise e
    finally:
        db.close()

@contextmanager
def get_db_context():
    """
    Context manager para uso fora do FastAPI (scripts, testes, etc.)
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Erro no contexto do banco: {e}")
        raise e
    finally:
        db.close()

def test_connection():
    """
    Testa a conexão com o banco de dados
    """
    try:
        with engine.connect() as conn:
            # Teste básico correto para SQLAlchemy 2.0+
            conn.execute(text("SELECT 1"))
            print("✅ Conexão com o banco está funcionando perfeitamente!")
            return True
    except Exception as e:
        print(f"❌ Falha no teste de conexão: {e}")
        return False

def get_db_stats():
    """
    Retorna estatísticas do pool de conexões
    """
    try:
        pool = engine.pool
        return {
            "checkedout": pool.checkedout(),
            "checkedin": pool.checkedin(),
            "overflow": pool.overflow(),
            "size": pool.size()
        }
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do pool: {e}")
        return {}

def create_tables():
    """
    Cria todas as tabelas definidas nos modelos
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas/verificadas com sucesso!")
        return True
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {e}")
        return False

# Executar teste de conexão ao importar o módulo
if __name__ == "__main__":
    print("🧪 Executando testes de conexão...")
    test_connection()
    create_tables()