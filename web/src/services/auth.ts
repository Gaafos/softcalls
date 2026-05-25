import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export async function login(email: string, senha: string) {
  const response = await api.post('/auth/login', { email, senha })
  return response.data.token as string
}

export default api
