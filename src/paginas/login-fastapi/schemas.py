from pydantic import BaseModel

class UsuarioCreate(BaseModel):
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str
