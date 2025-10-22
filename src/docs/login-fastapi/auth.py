from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

# Chave secreta (use algo seguro em produção)
SECRET_KEY = "segredo-super-seguro"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verificar_senha(senha, senha_hash):
    return pwd_context.verify(senha, senha_hash)

def gerar_hash(senha):
    return pwd_context.hash(senha)

def criar_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
