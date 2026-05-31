import api from './auth'

export interface Chamado {
  id: string
  titulo: string
  conteudo: string
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO'
  prazo: string | null
  createdAt: string
  autor: { id: string; nome: string; email: string; setor: string }
  categoria: { id: string; nome: string }
}

export async function listarChamados(): Promise<Chamado[]> {
  const response = await api.get('/chamados')
  return response.data
}

export async function criarChamado(data: {
  titulo: string
  conteudo: string
  categoriaId: string
  prazo?: string
}): Promise<Chamado> {
  const response = await api.post('/chamados', data)
  return response.data
}

export async function atualizarStatus(id: string, status: Chamado['status']): Promise<Chamado> {
  const response = await api.patch(`/chamados/${id}/status`, { status })
  return response.data
}

export async function excluirChamado(id: string): Promise<void> {
  await api.delete(`/chamados/${id}`)
}
