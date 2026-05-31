import api from './auth'

export interface Categoria {
  id: string
  nome: string
  descricao: string | null
}

export async function listarCategorias(): Promise<Categoria[]> {
  const response = await api.get('/categorias')
  return response.data
}
