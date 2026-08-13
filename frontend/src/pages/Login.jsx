import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import PosterBackdrop from '../components/PosterBackdrop'

function Login() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      login(response.data.access_token)
      navigate('/')
    } catch (err) {
      setError(t('login.invalid'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      <PosterBackdrop />
      <div className="relative flex items-center justify-center min-h-screen px-6" style={{ zIndex: 2 }}>
        <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <h1 className="text-3xl font-bold text-center mb-8">{t('login.title')}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder={t('login.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
            >
              {t('login.button')}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-4">
            {t('login.noAccount')} <Link to="/signup" className="text-blue-400 hover:underline">{t('login.signupLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login