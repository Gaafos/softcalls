import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginService } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import styles from './LoginPage.module.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    try {
      const token = await loginService(email, senha)
      login(token)
      navigate('/chamados')
    } catch {
      setErro('E-mail ou senha inválidos')
    }
  }

  return (
    <div className={styles.container}>
      <aside className={styles.aside}>
        <h1 className={styles.title}>Softcalls</h1>
        <p className={styles.subtitle}>Faça login para acessar o sistema</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
          />
          {erro && <p className={styles.error}>{erro}</p>}
          <button className={styles.button} type="submit">Entrar</button>
        </form>
      </aside>
      <div className={styles.decoration} />
    </div>
  )
}

export default LoginPage
