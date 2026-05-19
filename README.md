# Sistema de Chamados

Aplicação full stack de gerenciamento de chamados (help desk), desenvolvida como projeto de portfólio.

## Stack

- **Frontend:** Next.js + TypeScript + React
- **API:** Node.js + Fastify + TypeScript
- **Banco de dados:** PostgreSQL + Prisma ORM
- **Microserviço:** Java + Spring Boot (notificações)
- **Autenticação:** NextAuth.js + JWT
- **Infra:** Docker + Docker Compose

## Funcionalidades

- Abertura e acompanhamento de chamados por funcionários
- Fila de atendimento para técnicos
- Painel administrativo com relatórios
- Notificações por e-mail

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

## Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/Gaafos/softcalls.git chamados
cd chamados

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env se quiser trocar senhas ou portas

# 3. Suba os containers
docker compose up
```

Aguarde até ver no terminal:
```
softcalls-postgres | database system is ready to accept connections
```

## Serviços disponíveis

| Serviço | URL | Descrição |
|---|---|---|
| pgAdmin | http://localhost:8080 | Interface visual do banco de dados |
| PostgreSQL | localhost:5432 | Banco de dados (acesso direto) |

### Conectando ao banco no pgAdmin

1. Acesse `http://localhost:8080`
2. Login: email e senha definidos no `.env`
3. Clique em **Add New Server** e preencha:
   - **Host:** `softcalls-postgres`
   - **Port:** `5432`
   - **Database:** valor de `POSTGRES_DB` no `.env`
   - **Username:** valor de `POSTGRES_USER` no `.env`
   - **Password:** valor de `POSTGRES_PASSWORD` no `.env`

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores conforme necessário. O arquivo `.env` nunca é commitado — contém senhas locais.

## Comandos úteis

```bash
# Subir em background (libera o terminal)
docker compose up -d

# Ver logs em tempo real
docker compose logs -f

# Parar tudo
docker compose down

# Parar e apagar os dados do banco (volume)
docker compose down -v
```
