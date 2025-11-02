# fix_users.py
from database import SessionLocal
from models import Usuario
from auth import gerar_hash

def verificar_e_corrigir_usuarios():
    db = SessionLocal()
    try:
        # Listar todos os usuários
        usuarios = db.query(Usuario).all()
        
        if not usuarios:
            print("❌ Nenhum usuário encontrado. Crie um usuário primeiro.")
            return
        
        print(f"📋 Encontrados {len(usuarios)} usuário(s):")
        
        for usuario in usuarios:
            print(f"\n👤 Usuário: {usuario.email}")
            print(f"   Nome: {usuario.nome}")
            print(f"   Hash length: {len(usuario.senha_hash) if usuario.senha_hash else 'NULL'}")
            
            # Verificar se o hash é válido
            if not usuario.senha_hash or len(usuario.senha_hash.strip()) == 0:
                print("   ❌ Hash inválido/vazio - Corrigindo...")
                usuario.senha_hash = gerar_hash("senha_temp_123")
                db.commit()
                print("   ✅ Hash corrigido")
            else:
                print("   ✅ Hash parece válido")
        
        print("\n🎯 AGORA CRIE UM NOVO USUÁRIO:")
        print("1. Vá para http://localhost:8000/docs")
        print("2. Use o endpoint /registrar")
        print("3. Depois use /login com as mesmas credenciais")
                
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verificar_e_corrigir_usuarios()