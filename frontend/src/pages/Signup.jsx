import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function Signup() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/auth/signup', { username, email, password })

      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      const loginResponse = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      login(loginResponse.data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong signing up.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8">{t('signup.title')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={t('signup.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder={t('signup.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder={t('signup.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold"
          >
            {t('signup.button')}
          </button>
        </form>
        <p className="text-center text-slate-400 text-sm mt-4">
          {t('signup.haveAccount')} <Link to="/login" className="text-blue-400 hover:underline">{t('signup.loginLink')}</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup