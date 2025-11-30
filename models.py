from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, TIMESTAMP, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)  # Nome correto do campo
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP, server_default=func.now())
   
    acoes = relationship("Acao", back_populates="usuario")
    contatos = relationship("Contato", back_populates="usuario")

class Acao(Base):
    __tablename__ = "acoes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(50))
    data = Column(Date)
    cidade = Column(String(100))
    bairro = Column(String(100))
    lat = Column(Numeric(10, 6))
    lng = Column(Numeric(10, 6))
    responsavel = Column(String(100))
    contato = Column(String(20))
    criado_em = Column(TIMESTAMP, server_default=func.now())
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    usuario = relationship("Usuario", back_populates="acoes")

class Contato(Base):
    __tablename__ = "contatos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    idade = Column(Integer)
    sexo = Column(String(20))
    email = Column(String(255))
    telefone = Column(String(20), nullable=False)
    cidade = Column(String(100), nullable=False)
    bairro = Column(String(100), nullable=False)
    escolaridade = Column(String(100))
    assessor = Column(String(100))
    assunto = Column(String(100))
    observacao = Column(Text)
    status = Column(String(20), default="ativo")
    data_cadastro = Column(Date, server_default=func.current_date())
    lat = Column(Numeric(10, 8))
    lng = Column(Numeric(11, 8))
    criado_em = Column(TIMESTAMP, server_default=func.now())
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    usuario = relationship("Usuario", back_populates="contatos")