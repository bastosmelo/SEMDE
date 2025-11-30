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
                AND table_name IN ('usuarios', 'acoes', 'contatos')
            """))
            tabelas = [row[0] for row in result]
            print(f"📊 Tabelas encontradas: {tabelas}")
            
            tabelas_necessarias = ['usuarios', 'acoes', 'contatos']
            tabelas_faltando = [tabela for tabela in tabelas_necessarias if tabela not in tabelas]
            
            if not tabelas_faltando:
                print("✅ Todas as tabelas necessárias existem!")
                
                # Testar estrutura da tabela contatos
                print("\n🔍 Verificando estrutura da tabela contatos...")
                result = conn.execute(text("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'contatos'
                    ORDER BY ordinal_position
                """))
                
                colunas_contatos = []
                for row in result:
                    colunas_contatos.append({
                        'nome': row[0],
                        'tipo': row[1],
                        'nulo': row[2]
                    })
                    print(f"   - {row[0]}: {row[1]} ({'NULL' if row[2] == 'YES' else 'NOT NULL'})")
                
                # Verificar colunas essenciais
                colunas_essenciais = ['nome', 'telefone', 'cidade', 'bairro', 'usuario_id']
                colunas_faltando = [coluna for coluna in colunas_essenciais if coluna not in [c['nome'] for c in colunas_contatos]]
                
                if not colunas_faltando:
                    print("✅ Estrutura da tabela contatos: OK")
                else:
                    print(f"❌ Colunas faltando na tabela contatos: {colunas_faltando}")
                    
            else:
                print(f"⚠️  Tabelas faltando: {tabelas_faltando}")
                
                # Tentar criar tabelas específicas se faltarem
                if 'contatos' in tabelas_faltando:
                    print("🛠️  Tentando criar tabela contatos...")
                    try:
                        from models import Contato
                        Contato.__table__.create(engine)
                        print("✅ Tabela contatos criada com sucesso!")
                    except Exception as e:
                        print(f"❌ Erro ao criar tabela contatos: {e}")
        
        # Testar inserção de dados de exemplo
        print("\n🧪 Testando inserção de dados...")
        try:
            with engine.connect() as conn:
                # Verificar se já existem contatos
                result = conn.execute(text("SELECT COUNT(*) FROM contatos"))
                count_contatos = result.scalar()
                print(f"📊 Contatos existentes: {count_contatos}")
                
                # Inserir contato de teste se não existirem
                if count_contatos == 0:
                    conn.execute(text("""
                        INSERT INTO contatos (nome, telefone, cidade, bairro, usuario_id, status)
                        VALUES ('Contato Teste', '(79) 99999-9999', 'Aracaju', 'Centro', 1, 'ativo')
                    """))
                    conn.commit()
                    print("✅ Contato de teste inserido com sucesso!")
                else:
                    print("✅ Já existem contatos na tabela")
                    
        except Exception as e:
            print(f"⚠️  Erro ao testar inserção: {e}")
        
        print("\n🎉 Todos os testes foram executados!")
        return True
        
    except Exception as e:
        print(f"❌ Erro durante os testes: {e}")
        return False

def testar_endpoints_api():
    """
    Teste adicional para verificar se os endpoints da API estão funcionando
    """
    import requests
    import json
    
    print("\n🌐 Testando endpoints da API...")
    
    base_url = "http://localhost:8000"
    
    try:
        # Testar endpoint de saúde
        response = requests.get(f"{base_url}/health")
        print(f"🔧 Health check: {response.status_code} - {response.json()}")
        
        # Testar se precisa de autenticação para contatos
        response = requests.get(f"{base_url}/contatos")
        print(f"📞 Endpoint /contatos: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Autenticação necessária (esperado)")
        else:
            print(f"⚠️  Status inesperado: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erro ao testar API: {e}")

if __name__ == "__main__":
    # Testar conexão com banco
    sucesso_banco = testar_conexao_completa()
    
    # Testar API (opcional)
    if sucesso_banco:
        testar_endpoints_api()
    
    if sucesso_banco:
        print("\n✨ Todos os testes foram concluídos com sucesso!")
        print("\n📝 Próximos passos:")
        print("1. Verifique se o servidor FastAPI está rodando: uvicorn main:app --reload")
        print("2. Teste o cadastro de contatos no frontend")
        print("3. Verifique os logs no console do navegador")
    else:
        print("\n💥 Alguns testes falharam. Verifique a configuração do banco.")