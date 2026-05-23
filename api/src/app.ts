import Fastify from 'fastify'
import cors from '@fastify/cors'
import prismaPlugin from './plugins/prisma'
import { healthRoutes } from './routes/health'

export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(prismaPlugin)
  app.register(healthRoutes)

  return app
}
