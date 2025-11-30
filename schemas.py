from pydantic import BaseModel, EmailStr, validator, field_validator
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

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

    # VALIDADORES CRÍTICOS - Convertem strings vazias para None
    @validator('email', 'sexo', 'escolaridade', 'assessor', 'assunto', 'observacao', 'status', pre=True)
    def empty_string_to_none(cls, v):
        """Converte strings vazias para None para evitar erro 422"""
        if v == "" or v == "null" or v == "undefined":
            return None
        return v

    @validator('idade', pre=True)
    def empty_age_to_none(cls, v):
        """Converte idade vazia para None"""
        if v == "" or v == "null" or v == "undefined":
            return None
        return v

    @validator('lat', 'lng', pre=True)
    def empty_coords_to_none(cls, v):
        """Converte coordenadas vazias para None"""
        if v == "" or v == "null" or v == "undefined":
            return None
        return v

    @validator('data_cadastro', pre=True)
    def empty_date_to_none(cls, v):
        """Converte data vazia para None"""
        if v == "" or v == "null" or v == "undefined":
            return None
        return v

    # Validadores para campos obrigatórios
    @validator('nome', 'telefone', 'cidade', 'bairro')
    def validate_required_fields(cls, v):
        if not v or v.strip() == "":
            raise ValueError('Este campo é obrigatório')
        return v.strip()

class ContatoCreate(ContatoBase):
    pass

class ContatoUpdate(BaseModel):
    # No update, todos os campos são opcionais exceto os que queremos forçar
    nome: Optional[str] = None
    idade: Optional[int] = None
    sexo: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    escolaridade: Optional[str] = None
    assessor: Optional[str] = None
    assunto: Optional[str] = None
    observacao: Optional[str] = None
    status: Optional[str] = None
    data_cadastro: Optional[date] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

    # Aplicar os mesmos validadores de conversão
    @validator('email', 'sexo', 'escolaridade', 'assessor', 'assunto', 'observacao', 'status', 'nome', 'telefone', 'cidade', 'bairro', pre=True)
    def empty_string_to_none(cls, v):
        if v == "" or v == "null" or v == "undefined":
            return None
        return v

    @validator('idade', 'lat', 'lng', pre=True)
    def empty_to_none(cls, v):
        if v == "" or v == "null" or v == "undefined":
            return None
        return v

class ContatoResponse(ContatoBase):
    id: int
    usuario_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema flexível para debug
class ContatoCreateFlexivel(BaseModel):
    nome: str
    telefone: str
    cidade: str
    bairro: str
    idade: Optional[str] = None  # Aceita string para debug
    sexo: Optional[str] = None
    email: Optional[str] = None
    escolaridade: Optional[str] = None
    assessor: Optional[str] = None
    assunto: Optional[str] = None
    observacao: Optional[str] = None
    status: Optional[str] = "ativo"
    data_cadastro: Optional[str] = None  # Aceita string
    lat: Optional[str] = None  # Aceita string
    lng: Optional[str] = None  # Aceita string

    @validator('idade', 'lat', 'lng', pre=True)
    def parse_numbers(cls, v):
        if v == "" or v is None:
            return None
        try:
            return float(v) if v else None
        except (TypeError, ValueError):
            return None

    @validator('data_cadastro', pre=True)
    def parse_date(cls, v):
        if v == "" or v is None:
            return None
        try:
            return datetime.strptime(v, "%Y-%m-%d").date() if v else None
        except (TypeError, ValueError):
            return None