from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
import asyncpg
import os

# Configuração do banco
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://usuario:senha@localhost:5432/sistema_login")

# Models Pydantic
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
    status: str = "ativo"
    data_cadastro: Optional[date] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class ContatoCreate(ContatoBase):
    pass

class ContatoUpdate(ContatoBase):
    pass

class Contato(ContatoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Router
router = APIRouter(prefix="/contatos", tags=["contatos"])

# Conexão com o banco
async def get_db_connection():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Endpoints
@router.get("/", response_model=List[Contato])
async def listar_contatos(conn=Depends(get_db_connection)):
    try:
        rows = await conn.fetch("""
            SELECT id, nome, idade, sexo, email, telefone, cidade, bairro, 
                   escolaridade, assessor, assunto, observacao, status, 
                   data_cadastro, lat, lng, created_at, updated_at
            FROM contatos 
            ORDER BY created_at DESC
        """)
        
        contatos = []
        for row in rows:
            contatos.append({
                "id": row["id"],
                "nome": row["nome"],
                "idade": row["idade"],
                "sexo": row["sexo"],
                "email": row["email"],
                "telefone": row["telefone"],
                "cidade": row["cidade"],
                "bairro": row["bairro"],
                "escolaridade": row["escolaridade"],
                "assessor": row["assessor"],
                "assunto": row["assunto"],
                "observacao": row["observacao"],
                "status": row["status"],
                "data_cadastro": row["data_cadastro"],
                "lat": float(row["lat"]) if row["lat"] else None,
                "lng": float(row["lng"]) if row["lng"] else None,
                "created_at": row["created_at"],
                "updated_at": row["updated_at"]
            })
        
        return contatos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contatos: {str(e)}")

@router.get("/{contato_id}", response_model=Contato)
async def obter_contato(contato_id: int, conn=Depends(get_db_connection)):
    try:
        row = await conn.fetchrow("""
            SELECT id, nome, idade, sexo, email, telefone, cidade, bairro, 
                   escolaridade, assessor, assunto, observacao, status, 
                   data_cadastro, lat, lng, created_at, updated_at
            FROM contatos 
            WHERE id = $1
        """, contato_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Contato não encontrado")
        
        return {
            "id": row["id"],
            "nome": row["nome"],
            "idade": row["idade"],
            "sexo": row["sexo"],
            "email": row["email"],
            "telefone": row["telefone"],
            "cidade": row["cidade"],
            "bairro": row["bairro"],
            "escolaridade": row["escolaridade"],
            "assessor": row["assessor"],
            "assunto": row["assunto"],
            "observacao": row["observacao"],
            "status": row["status"],
            "data_cadastro": row["data_cadastro"],
            "lat": float(row["lat"]) if row["lat"] else None,
            "lng": float(row["lng"]) if row["lng"] else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contato: {str(e)}")

@router.post("/", response_model=Contato)
async def criar_contato(contato: ContatoCreate, conn=Depends(get_db_connection)):
    try:
        # Inserir no banco
        row = await conn.fetchrow("""
            INSERT INTO contatos (
                nome, idade, sexo, email, telefone, cidade, bairro, 
                escolaridade, assessor, assunto, observacao, status, 
                data_cadastro, lat, lng
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id, nome, idade, sexo, email, telefone, cidade, bairro, 
                     escolaridade, assessor, assunto, observacao, status, 
                     data_cadastro, lat, lng, created_at, updated_at
        """, 
            contato.nome, contato.idade, contato.sexo, contato.email, 
            contato.telefone, contato.cidade, contato.bairro, 
            contato.escolaridade, contato.assessor, contato.assunto, 
            contato.observacao, contato.status, contato.data_cadastro,
            contato.lat, contato.lng
        )
        
        return {
            "id": row["id"],
            "nome": row["nome"],
            "idade": row["idade"],
            "sexo": row["sexo"],
            "email": row["email"],
            "telefone": row["telefone"],
            "cidade": row["cidade"],
            "bairro": row["bairro"],
            "escolaridade": row["escolaridade"],
            "assessor": row["assessor"],
            "assunto": row["assunto"],
            "observacao": row["observacao"],
            "status": row["status"],
            "data_cadastro": row["data_cadastro"],
            "lat": float(row["lat"]) if row["lat"] else None,
            "lng": float(row["lng"]) if row["lng"] else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar contato: {str(e)}")

@router.put("/{contato_id}", response_model=Contato)
async def atualizar_contato(contato_id: int, contato: ContatoUpdate, conn=Depends(get_db_connection)):
    try:
        # Verificar se contato existe
        existing = await conn.fetchrow("SELECT id FROM contatos WHERE id = $1", contato_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Contato não encontrado")
        
        # Atualizar no banco
        row = await conn.fetchrow("""
            UPDATE contatos SET
                nome = $1, idade = $2, sexo = $3, email = $4, telefone = $5,
                cidade = $6, bairro = $7, escolaridade = $8, assessor = $9,
                assunto = $10, observacao = $11, status = $12, 
                data_cadastro = $13, lat = $14, lng = $15, updated_at = CURRENT_TIMESTAMP
            WHERE id = $16
            RETURNING id, nome, idade, sexo, email, telefone, cidade, bairro, 
                     escolaridade, assessor, assunto, observacao, status, 
                     data_cadastro, lat, lng, created_at, updated_at
        """, 
            contato.nome, contato.idade, contato.sexo, contato.email, 
            contato.telefone, contato.cidade, contato.bairro, 
            contato.escolaridade, contato.assessor, contato.assunto, 
            contato.observacao, contato.status, contato.data_cadastro,
            contato.lat, contato.lng, contato_id
        )
        
        return {
            "id": row["id"],
            "nome": row["nome"],
            "idade": row["idade"],
            "sexo": row["sexo"],
            "email": row["email"],
            "telefone": row["telefone"],
            "cidade": row["cidade"],
            "bairro": row["bairro"],
            "escolaridade": row["escolaridade"],
            "assessor": row["assessor"],
            "assunto": row["assunto"],
            "observacao": row["observacao"],
            "status": row["status"],
            "data_cadastro": row["data_cadastro"],
            "lat": float(row["lat"]) if row["lat"] else None,
            "lng": float(row["lng"]) if row["lng"] else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar contato: {str(e)}")

@router.delete("/{contato_id}")
async def excluir_contato(contato_id: int, conn=Depends(get_db_connection)):
    try:
        # Verificar se contato existe
        existing = await conn.fetchrow("SELECT id FROM contatos WHERE id = $1", contato_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Contato não encontrado")
        
        # Excluir do banco
        await conn.execute("DELETE FROM contatos WHERE id = $1", contato_id)
        
        return {"message": "Contato excluído com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir contato: {str(e)}")

@router.get("/estatisticas/geral")
async def estatisticas_gerais(conn=Depends(get_db_connection)):
    try:
        # Total de contatos
        total = await conn.fetchval("SELECT COUNT(*) FROM contatos")
        
        # Contatos ativos
        ativos = await conn.fetchval("SELECT COUNT(*) FROM contatos WHERE status = 'ativo'")
        
        # Cidades únicas
        cidades = await conn.fetchval("SELECT COUNT(DISTINCT cidade) FROM contatos")
        
        # Novos hoje
        novos_hoje = await conn.fetchval("""
            SELECT COUNT(*) FROM contatos 
            WHERE DATE(created_at) = CURRENT_DATE
        """)
        
        return {
            "total_contacts": total,
            "active_contacts": ativos,
            "total_cities": cidades,
            "new_today": novos_hoje
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")