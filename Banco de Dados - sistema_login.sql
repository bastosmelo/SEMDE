
-- ================================================
-- Estrutura de Banco de Dados - Squad 08
-- Projeto SEMDE - Plataforma de Gestão Parlamentar
-- ================================================

-- 1. Tabela Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('Parlamentar','Equipe')) NOT NULL,
    telefone VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela Demandas
CREATE TABLE demandas (
    id SERIAL PRIMARY KEY,
    area VARCHAR(30) CHECK (area IN ('Jurídico','Atendimento','Financeiro','Estratégico')) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Pendente','Em Andamento','Concluída')) DEFAULT 'Pendente',
    prazo DATE,
    responsavel_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela Tarefas
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) CHECK (status IN ('Não iniciada','Em andamento','Concluída')) DEFAULT 'Não iniciada',
    prazo DATE,
    responsavel_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    demanda_id INT REFERENCES demandas(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela Financeiro
CREATE TABLE financeiro (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(10) CHECK (tipo IN ('Receita','Despesa')) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
