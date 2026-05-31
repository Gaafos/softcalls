import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  listarChamados,
  criarChamado,
  atualizarStatus,
  excluirChamado,
  type Chamado
} from '../services/chamados'
import { listarCategorias, type Categoria } from '../services/categorias'
import styles from './ChamadosPage.module.css'

const STATUS_LABEL: Record<Chamado['status'], string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em andamento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado'
}

const STATUS_COR: Record<Chamado['status'], string> = {
  ABERTO: '#2196f3',
  EM_ANDAMENTO: '#ff9800',
  RESOLVIDO: '#4caf50',
  FECHADO: '#9e9e9e'
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function ChamadosPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [chamados, setChamados] = useState<Chamado[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [prazo, setPrazo] = useState('')
  const [erro, setErro] = useState('')

  const podeGerenciar = usuario?.perfil === 'TECNICO' || usuario?.perfil === 'ADMIN'
  const podeExcluir = usuario?.perfil === 'ADMIN'
  const colunas = podeGerenciar || podeExcluir ? 7 : 6

  useEffect(() => {
    async function carregar() {
      try {
        const [listaChamados, listaCategorias] = await Promise.all([
          listarChamados(),
          listarCategorias()
        ])
        setChamados(listaChamados)
        setCategorias(listaCategorias)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  function abrirModal() {
    setTitulo('')
    setConteudo('')
    setCategoriaId('')
    setPrazo('')
    setErro('')
    setModalAberto(true)
  }

  async function handleCriar() {
    setErro('')
    try {
      const novo = await criarChamado({ titulo, conteudo, categoriaId, prazo: prazo || undefined })
      setChamados(prev => [novo, ...prev])
      setModalAberto(false)
    } catch {
      setErro('Erro ao criar chamado. Verifique os dados e tente novamente.')
    }
  }

  async function handleStatus(id: string, novoStatus: Chamado['status']) {
    const anterior = chamados.find(c => c.id === id)!.status
    setChamados(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c))
    try {
      const atualizado = await atualizarStatus(id, novoStatus)
      setChamados(prev => prev.map(c => c.id === id ? atualizado : c))
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      setChamados(prev => prev.map(c => c.id === id ? { ...c, status: anterior } : c))
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      alert(msg ?? 'Erro ao atualizar status — veja o console (F12) para detalhes.')
    }
  }

  async function handleEncerrar(id: string) {
    if (!confirm('Deseja encerrar este chamado?')) return
    try {
      const atualizado = await atualizarStatus(id, 'FECHADO')
      setChamados(prev => prev.map(c => c.id === id ? atualizado : c))
    } catch {
      alert('Erro ao encerrar chamado. Tente novamente.')
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm('Deseja excluir este chamado permanentemente? Essa ação não pode ser desfeita.')) return
    try {
      await excluirChamado(id)
      setChamados(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Erro ao excluir chamado. Tente novamente.')
    }
  }

  if (carregando) return <div className={styles.loading}>Carregando...</div>

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>Softcalls</span>
        <div className={styles.userInfo}>
          <span>{usuario?.email}</span>
          <span className={styles.perfil}>{usuario?.perfil}</span>
          <button className={styles.btnSair} onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.toolbar}>
          <h2 className={styles.pageTitle}>Chamados</h2>
          <button className={styles.btnPrimary} onClick={abrirModal}>+ Novo chamado</button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Autor</th>
                <th>Data</th>
                <th>Prazo</th>
                {(podeGerenciar || podeExcluir) && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {chamados.length === 0 && (
                <tr>
                  <td colSpan={colunas} className={styles.empty}>Nenhum chamado encontrado</td>
                </tr>
              )}
              {chamados.map(chamado => (
                <tr key={chamado.id}>
                  <td className={styles.tdTitulo}>{chamado.titulo}</td>
                  <td>{chamado.categoria.nome}</td>
                  <td>
                    <span
                      className={styles.badge}
                      style={{ background: STATUS_COR[chamado.status] }}
                    >
                      {STATUS_LABEL[chamado.status]}
                    </span>
                  </td>
                  <td>{chamado.autor.nome}</td>
                  <td>{formatarData(chamado.createdAt)}</td>
                  <td>{chamado.prazo ? formatarData(chamado.prazo) : '—'}</td>
                  {(podeGerenciar || podeExcluir) && (
                    <td className={styles.acoes}>
                      {podeGerenciar && (
                        <select
                          className={styles.selectStatus}
                          value={chamado.status}
                          onChange={e => handleStatus(chamado.id, e.target.value as Chamado['status'])}
                        >
                          <option value="ABERTO">Aberto</option>
                          <option value="EM_ANDAMENTO">Em andamento</option>
                          <option value="RESOLVIDO">Resolvido</option>
                          <option value="FECHADO">Fechado</option>
                        </select>
                      )}
                      {podeGerenciar && chamado.status !== 'FECHADO' && (
                        <button
                          className={styles.btnEncerrar}
                          onClick={() => handleEncerrar(chamado.id)}
                        >
                          Encerrar
                        </button>
                      )}
                      {podeExcluir && (
                        <button
                          className={styles.btnExcluir}
                          onClick={() => handleExcluir(chamado.id)}
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {modalAberto && (
        <div className={styles.overlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Novo chamado</h3>
            <form onSubmit={e => { e.preventDefault(); handleCriar() }}>
              <div className={styles.field}>
                <label className={styles.label}>Título</label>
                <input
                  className={styles.input}
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Descrição</label>
                <textarea
                  className={styles.input}
                  value={conteudo}
                  onChange={e => setConteudo(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Categoria</label>
                <select
                  className={styles.input}
                  value={categoriaId}
                  onChange={e => setCategoriaId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Prazo (opcional)</label>
                <input
                  className={styles.input}
                  type="date"
                  value={prazo}
                  onChange={e => setPrazo(e.target.value)}
                />
              </div>
              {erro && <p className={styles.error}>{erro}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Criar chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChamadosPage
