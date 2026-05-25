import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ChamadosPage from './pages/ChamadosPage'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/chamados" element={
        <ProtectedRoute>
          <ChamadosPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
