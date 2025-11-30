from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime

class UsuarioBase(BaseModel):
    email: EmailStr
    nome: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    senha: str
    
    @validator('senha')
    def validar_senha(cls, v):
        if len(v) < 6:
            raise ValueError('A senha deve ter pelo menos 6 caracteres')
        return v

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AcaoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    tipo: str
    data: Optional[date] = None
    cidade: str
    bairro: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    responsavel: Optional[str] = None
    contato: Optional[str] = None

class AcaoCreate(AcaoBase):
    pass

class AcaoResponse(AcaoBase):
    id: int
    usuario_id: int
    criado_em: datetime

    class Config:
        from_attributes = True

class EstatisticasResponse(BaseModel):
    total_actions: int
    active_cities: int
    covered_neighborhoods: int
    monthly_actions: int

class ContatoBase(BaseModel):
    nome: str
    idade: Optional[int] = None
    sexo: Optional[str] = None
    email: Optional[str] = None
    telefone: str
    cidade: str
    bairro: str
    escolaridade: Optional[str] = None
    assessor: Optional[str] = None
    assunto: Optional[str] = None
    observacao: Optional[str] = None
    status: Optional[str] = "ativo"
    data_cadastro: Optional[date] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class ContatoCreate(ContatoBase):
    pass

class ContatoUpdate(ContatoBase):
    pass

class ContatoResponse(ContatoBase):
    id: int
    usuario_id: int
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        from_attributes = True