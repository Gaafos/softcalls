-- Este script roda automaticamente na PRIMEIRA vez que o container Postgres
-- é criado (quando o volume ainda está vazio).
-- Nas próximas vezes que subir o container, este script é ignorado.

-- Habilita geração de UUIDs nativamente no banco.
-- O Prisma vai usar isso nos models com @id @default(uuid()).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
