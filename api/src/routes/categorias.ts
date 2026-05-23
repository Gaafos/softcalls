import { FastifyInstance } from 'fastify'
import { authenticate } from '../hooks/authenticate'

interface CategoriaBody {
  nome: string
  descricao?: string
}

const categoriaSchema = {
  body: {
    type: 'object',
    required: ['nome'],
    properties: {
      nome: { type: 'string' },
      descricao: { type: 'string' }
    }
  }
}

export async function categoriasRoutes(app: FastifyInstance) {
  app.get('/categorias', { preHandler: authenticate }, async () => {
    return app.prisma.categoria.findMany({
      orderBy: { nome: 'asc' }
    })
  })

  app.post<{ Body: CategoriaBody }>(
    '/categorias',
    { preHandler: authenticate, schema: categoriaSchema },
    async (request, reply) => {
      if (request.user.perfil !== 'ADMIN') {
        return reply.status(403).send({ error: 'Apenas administradores podem criar categorias' })
      }

      const { nome, descricao } = request.body

      const existente = await app.prisma.categoria.findUnique({ where: { nome } })
      if (existente) {
        return reply.status(409).send({ error: 'Categoria já existe' })
      }

      const categoria = await app.prisma.categoria.create({
        data: { nome, descricao }
      })

      return reply.status(201).send(categoria)
    }
  )
}
