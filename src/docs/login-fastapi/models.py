from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(TIMESTAMP)
    perfis = relationship("UsuarioPerfil", back_populates="usuario")


class Perfil(Base):
    __tablename__ = "perfis"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(50), unique=True, nullable=False)
    descricao = Column(Text)
    usuarios = relationship("UsuarioPerfil", back_populates="perfil")


class UsuarioPerfil(Base):
    __tablename__ = "usuario_perfil"

    usuario_id = Column(Integer, ForeignKey("usuarios.id"), primary_key=True)
    perfil_id = Column(Integer, ForeignKey("perfis.id"), primary_key=True)

    usuario = relationship("Usuario", back_populates="perfis")
    perfil = relationship("Perfil", back_populates="usuarios")


class LogLogin(Base):
    __tablename__ = "logs_login"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    data_hora = Column(TIMESTAMP)
    ip = Column(String(45))
    sucesso = Column(Boolean)


class RedefinicaoSenha(Base):
    __tablename__ = "redefinicao_senha"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    token = Column(String(255), unique=True)
    criado_em = Column(TIMESTAMP)
    expiracao = Column(TIMESTAMP)
