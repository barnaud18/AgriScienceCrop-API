-- Script de inicialização do banco de dados AgriScienceCrop
-- Este script será executado automaticamente quando o container PostgreSQL for criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar usuário específico se necessário (opcional, já criado via env vars)
-- CREATE USER agriscience WITH PASSWORD 'agriscience123';
-- GRANT ALL PRIVILEGES ON DATABASE agriscience TO agriscience;

-- Log de inicialização
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
