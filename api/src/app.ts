import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import prismaPlugin from './plugins/prisma'
import { healthRoutes } from './routes/health'
import { authRoutes } from './routes/auth'
import { categoriasRoutes } from './routes/categorias'
import { chamadosRoutes } from './routes/chamados'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(fastifyJwt, { secret: process.env.JWT_SECRET! })
  app.register(prismaPlugin)
  app.register(healthRoutes)
  app.register(authRoutes)
  app.register(categoriasRoutes)
  app.register(chamadosRoutes)

  return app
}
