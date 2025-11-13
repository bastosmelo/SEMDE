# setup_database.py
import os
import subprocess
import sys
from database import engine, Base
from models import Usuario, Acao

def check_postgresql():
    """Verificar se PostgreSQL está instalado e acessível"""
    try:
        result = subprocess.run(
            ["psql", "--version"], 
            capture_output=True, 
            text=True
        )
        if result.returncode == 0:
            print("✅ PostgreSQL encontrado")
            return True
        else:
            print("❌ PostgreSQL não encontrado")
            return False
    except FileNotFoundError:
        print("❌ PostgreSQL não está instalado ou não está no PATH")
        return False

def create_database():
    """Criar banco de dados se não existir"""
    try:
        # Tentar conectar ao banco
        with engine.connect() as conn:
            print("✅ Banco de dados conectado com sucesso!")
            return True
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        print("\n🔧 Para criar o banco manualmente, execute:")
        print("   psql -h localhost -U postgres -c 'CREATE DATABASE sistema_login;'")
        return False

def setup_tables():
    """Criar tabelas no banco"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def create_admin_user():
    """Criar usuário administrador padrão"""
    from database import SessionLocal
    from auth import gerar_hash
    
    db = SessionLocal()
    try:
        # Verificar se já existe
        existing = db.query(Usuario).filter(Usuario.email == "admin@teste.com").first()
        if existing:
            print("✅ Usuário administrador já existe")
            return True
        
        # Criar novo usuário
        admin = Usuario(
            email="admin@teste.com",
            senha_hash=gerar_hash("admin1"),
            nome="Administrador"
        )
        db.add(admin)
        db.commit()
        print("✅ Usuário administrador criado:")
        print("   📧 Email: admin@teste.com")
        print("   🔐 Senha: admin1")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário: {e}")
        return False
    finally:
        db.close()

def main():
    print("🚀 CONFIGURAÇÃO DO SISTEMA SEMDE")
    print("=" * 40)
    
    # Verificar .env
    if not os.path.exists(".env"):
        print("❌ Arquivo .env não encontrado!")
        print("💡 Copie .env.example para .env e configure as variáveis")
        return
    
    # Executar setup
    steps = [
        ("Verificando PostgreSQL", check_postgresql),
        ("Conectando ao banco", create_database),
        ("Criando tabelas", setup_tables),
        ("Criando usuário admin", create_admin_user)
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        if not step_func():
            print(f"❌ Falha em: {step_name}")
            return
    
    print("\n🎉 CONFIGURAÇÃO CONCLUÍDA!")
    print("\n📝 PRÓXIMOS PASSOS:")
    print("1. Inicie o servidor: python main.py")
    print("2. Acesse: http://localhost:8000/docs")
    print("3. Use as credenciais:")
    print("   - Email: admin@teste.com")
    print("   - Senha: admin1")

if __name__ == "__main__":
    main()