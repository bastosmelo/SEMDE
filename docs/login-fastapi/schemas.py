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

class AcaoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    tipo: str
    data: Optional[str] = None
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
    criado_em: str

    class Config:
        orm_mode = True

class EstatisticasResponse(BaseModel):
    total_actions: int
    active_cities: int
    covered_neighborhoods: int
    monthly_actions: int
