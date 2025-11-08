# 🏛️ SEMDE - Sistema de Gestão Política

Sistema backend para gestão de ações políticas com autenticação JWT e PostgreSQL.

## 🚀 Começando

### Pré-requisitos
- Python 3.11+
- PostgreSQL 12+
- pip (gerenciador de pacotes Python)

### 📥 Instalação

**1. Clone o repositório**

git clone https://github.com/bastosmelo/SEMDE.git
cd SEMDE

**2. Configure o ambiente**

# Copie o template de variáveis
cp .env.example .env

# Edite o .env com suas configurações
nano .env  # ou use seu editor favorito

**3. Instale as dependências**

pip install -r requirements.txt

**4. Configure o banco de dados**

python setup_database.py

**5. Execute o servidor**

python main.py
O servidor estará disponível em: http://localhost:8000


**📊 API Endpoints**

**Autenticação**
POST /registrar - Registrar novo usuário
POST /login - Fazer login
GET /perfil - Obter perfil do usuário (requer autenticação)

**Ações**
GET /acoes - Listar ações
POST /acoes - Criar ação (requer autenticação)
GET /estatisticas - Estatísticas (requer autenticação)
