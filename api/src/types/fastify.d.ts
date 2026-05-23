declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string; perfil: string }
    user: { id: string; email: string; perfil: string }
  }
}
