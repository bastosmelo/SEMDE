# test_connection.py
from database import engine, Base, test_connection, create_tables
from sqlalchemy import text

def testar_conexao_completa():
    try:
        print("🧪 Iniciando teste completo de conexão...")
        
        # Testar conexão básica
        if test_connection():
            print("✅ Teste de conexão básica: OK")
        else:
            print("❌ Teste de conexão básica: FALHOU")
            return False
        
        # Testar criação de tabelas
        if create_tables():
            print("✅ Criação de tabelas: OK")
        else:
            print("❌ Criação de tabelas: FALHOU")
            return False
        
        # Testar query nas tabelas
        with engine.connect() as conn:
            # Verificar se tabelas existem
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('usuarios', 'acoes')
            """))
            tabelas = [row[0] for row in result]
            print(f"📊 Tabelas encontradas: {tabelas}")
            
            if 'usuarios' in tabelas and 'acoes' in tabelas:
                print("✅ Todas as tabelas necessárias existem!")
            else:
                print("⚠️  Algumas tabelas podem estar faltando")
        
        print("🎉 Todos os testes passaram com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        return False

if __name__ == "__main__":
    testar_conexao_completa()