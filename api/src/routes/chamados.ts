import { FastifyInstance } from 'fastify'
import { Status } from '../../generated/prisma/client'
import { authenticate } from '../hooks/authenticate'

interface ChamadoBody {
  titulo: string
  conteudo: string
  categoriaId: string
  prazo?: string
}

interface StatusBody {
  status: Status
}

const chamadoSchema = {
  body: {
    type: 'object',
    required: ['titulo', 'conteudo', 'categoriaId'],
    properties: {
      titulo: { type: 'string' },
      conteudo: { type: 'string' },
      categoriaId: { type: 'string' },
      prazo: { type: 'string' }
    }
  }
}

const statusSchema = {
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: Object.values(Status) }
    }
  }
}

const chamadoSelect = {
  id: true,
  titulo: true,
  conteudo: true,
  status: true,
  prazo: true,
  createdAt: true,
  autor: { select: { id: true, nome: true, email: true, setor: true } },
  categoria: { select: { id: true, nome: true } }
}

export async function chamadosRoutes(app: FastifyInstance) {
  app.post<{ Body: ChamadoBody }>(
    '/chamados',
    { preHandler: authenticate, schema: chamadoSchema },
    async (request, reply) => {
      const { titulo, conteudo, categoriaId, prazo } = request.body
      const autorId = request.user.id

      const categoria = await app.prisma.categoria.findUnique({ where: { id: categoriaId } })
      if (!categoria) {
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      const chamado = await app.prisma.chamado.create({
        data: {
          titulo,
          conteudo,
          categoriaId,
          autorId,
          prazo: prazo ? new Date(prazo) : undefined
        },
        select: chamadoSelect
      })

      return reply.status(201).send(chamado)
    }
  )

  app.get('/chamados', { preHandler: authenticate }, async (request) => {
    const { perfil, id } = request.user
    const isFuncionario = perfil === 'FUNCIONARIO'

    return app.prisma.chamado.findMany({
      where: isFuncionario ? { autorId: id } : undefined,
      select: chamadoSelect,
      orderBy: { createdAt: 'desc' }
    })
  })

  app.get<{ Params: { id: string } }>(
    '/chamados/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      const { id } = request.params
      const { perfil, id: userId } = request.user

      const chamado = await app.prisma.chamado.findUnique({
        where: { id },
        select: chamadoSelect
      })

      if (!chamado) {
        return reply.status(404).send({ error: 'Chamado não encontrado' })
      }

      if (perfil === 'FUNCIONARIO' && chamado.autor.id !== userId) {
        return reply.status(403).send({ error: 'Acesso negado' })
      }

      return chamado
    }
  )

  app.patch<{ Params: { id: string }; Body: StatusBody }>(
    '/chamados/:id/status',
    { preHandler: authenticate, schema: statusSchema },
    async (request, reply) => {
      const { perfil } = request.user

      if (perfil === 'FUNCIONARIO') {
        return reply.status(403).send({ error: 'Apenas técnicos e administradores podem atualizar o status' })
      }

      const { id } = request.params
      const { status } = request.body

      const chamado = await app.prisma.chamado.findUnique({ where: { id } })
      if (!chamado) {
        return reply.status(404).send({ error: 'Chamado não encontrado' })
      }

      const atualizado = await app.prisma.chamado.update({
        where: { id },
        data: { status },
        select: chamadoSelect
      })

      return atualizado
    }
  )

  app.delete<{ Params: { id: string } }>(
    '/chamados/:id',
    { preHandler: authenticate },
    async (request, reply) => {
      if (request.user.perfil !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem excluir chamados' })
      }

      const { id } = request.params

      const chamado = await app.prisma.chamado.findUnique({ where: { id } })
      if (!chamado) {
        return reply.status(404).send({ error: 'Chamado não encontrado' })
      }

      await app.prisma.chamado.delete({ where: { id } })

      return reply.status(204).send()
    }
  )
}
