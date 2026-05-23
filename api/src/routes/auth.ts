import { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { Perfil, Setor } from '../../generated/prisma/client'

interface RegisterBody {
  nome: string
  email: string
  senha: string
  perfil: Perfil
  setor: Setor
}

interface LoginBody {
  email: string
  senha: string
}

const registerSchema = {
  body: {
    type: 'object',
    required: ['nome', 'email', 'senha', 'perfil', 'setor'],
    properties: {
      nome: { type: 'string' },
      email: { type: 'string' },
      senha: { type: 'string', minLength: 6 },
      perfil: { type: 'string', enum: Object.values(Perfil) },
      setor: { type: 'string', enum: Object.values(Setor) }
    }
  }
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'senha'],
    properties: {
      email: { type: 'string' },
      senha: { type: 'string' }
    }
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>('/auth/register', { schema: registerSchema }, async (request, reply) => {
    const { nome, email, senha, perfil, setor } = request.body

    const existente = await app.prisma.usuario.findUnique({ where: { email } })
    if (existente) {
      return reply.status(409).send({ error: 'E-mail já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const usuario = await app.prisma.usuario.create({
      data: { nome, email, senha: senhaHash, perfil, setor },
      select: { id: true, nome: true, email: true, perfil: true, setor: true, createdAt: true }
    })

    return reply.status(201).send(usuario)
  })

  app.post<{ Body: LoginBody }>('/auth/login', { schema: loginSchema }, async (request, reply) => {
    const { email, senha } = request.body

    const usuario = await app.prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const token = app.jwt.sign({ id: usuario.id, email: usuario.email, perfil: usuario.perfil })

    return { token }
  })
}
