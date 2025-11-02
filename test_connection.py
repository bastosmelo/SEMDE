# test_connection.py
from database import engine, Base
from models import Usuario, Acao

def testar_conexao():
    try:
        # Testar conexão
        with engine.connect() as conn:
            print("✅ Conexão com PostgreSQL estabelecida com sucesso!")
        
        # Criar tabelas
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na conexão: {e}")
        return False

if __name__ == "__main__":
    testar_conexao()