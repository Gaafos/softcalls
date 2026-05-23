import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import prismaPlugin from './plugins/prisma'
import { healthRoutes } from './routes/health'
import { authRoutes } from './routes/auth'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(fastifyJwt, { secret: process.env.JWT_SECRET! })
  app.register(prismaPlugin)
  app.register(healthRoutes)
  app.register(authRoutes)

  return app
}
