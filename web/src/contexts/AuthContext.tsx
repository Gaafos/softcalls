import { createContext, useContext, useState, ReactNode } from 'react'

interface Usuario {
  id: string
  email: string
  perfil: 'FUNCIONARIO' | 'TECNICO' | 'ADMIN'
}

interface AuthContextData {
  token: string | null
  usuario: Usuario | null
  login: (token: string) => void
  logout: () => void
}

function decodeToken(token: string): Usuario {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload))
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem('token')

  const [token, setToken] = useState<string | null>(stored)
  const [usuario, setUsuario] = useState<Usuario | null>(
    stored ? decodeToken(stored) : null
  )

  function login(newToken: string) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUsuario(decodeToken(newToken))
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
