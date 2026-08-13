import { useState } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from './api/client'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MovieDetail from './pages/MovieDetail'
import ShowDetail from './pages/ShowDetail'
import Insights from './pages/Insights'
import MyRatings from './pages/MyRatings'
import LanguageSwitcher from './components/LanguageSwitcher'
import PosterBackdrop from './components/PosterBackdrop'

function SearchPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState('movie')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const endpoint = mode === 'movie' ? '/movies/search' : '/shows/search'
      const response = await api.get(endpoint, { params: { query } })
      setResults(response.data)
    } catch (err) {
      setError(t('search.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (tmdbId) => {
    navigate(mode === 'movie' ? `/movie/${tmdbId}` : `/show/${tmdbId}`)
  }

  const hasResults = results.length > 0

  if (hasResults) {
    return (
      <div style={{ position: 'relative', zIndex: 2 }} className="min-h-[calc(100vh-56px)] bg-slate-900 px-6 py-10">
        <div className="max-w-xl mx-auto mb-8 flex flex-col items-center">
          <div className="inline-flex gap-1 mb-3 bg-slate-800 rounded-full p-0.5">
            <button
              onClick={() => { setMode('movie'); setResults([]) }}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition ${mode === 'movie' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t('search.moviesToggle')}
            </button>
            <button
              onClick={() => { setMode('tv'); setResults([]) }}
              className={`px-4 py-1 rounded-full text-xs font-semibold transition ${mode === 'tv' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t('search.tvToggle')}
            </button>
          </div>
          <form onSubmit={handleSearch} className="w-full max-w-[240px] flex items-center gap-1.5 bg-black/60 backdrop-blur-xl rounded-full pl-3 pr-1 py-0.5 border border-white/10 shadow-2xl">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder={mode === 'movie' ? t('search.moviePlaceholder') : t('search.showPlaceholder')}
    className="flex-1 bg-transparent text-xs placeholder-slate-400 focus:outline-none py-1"
  />
  <button
    type="submit"
    className="px-3 py-1 text-xs rounded-full bg-blue-600 hover:bg-blue-500 transition font-semibold whitespace-nowrap"
  >
    {t('search.button')}
  </button>
</form>
          {loading && <p className="text-center text-slate-400 text-sm mt-3">{t('search.searching')}</p>}
          {error && <p className="text-center text-red-400 text-sm mt-3">{error}</p>}
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((item) => (
            <div
              key={item.tmdb_id}
              onClick={() => handleCardClick(item.tmdb_id)}
              className="bg-slate-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  alt={item.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
                  {t('search.noPoster')}
                </div>
              )}
              <div className="p-2.5">
                <h3 className="font-semibold text-sm leading-tight truncate">{item.title}</h3>
                {(item.release_year || item.first_air_year) && (
                  <p className="text-slate-400 text-xs mt-1">{item.release_year || item.first_air_year}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(50% + 65px)',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '384px',
        padding: '0 24px',
        zIndex: 2,
      }}
    >
      <div
        className="absolute inset-0 rounded-3xl blur-2xl opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.5) 0%, rgba(37,99,235,0) 70%)' }}
      />

      <div className="relative w-full flex flex-col items-center">
        <div className="inline-flex gap-1 mb-0.5 bg-black/50 backdrop-blur-xl rounded-full p-0.5 border border-white/10 shadow-2xl">
  <button
    onClick={() => { setMode('movie'); setResults([]) }}
    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mode === 'movie' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
  >
    {t('search.moviesToggle')}
  </button>
  <button
    onClick={() => { setMode('tv'); setResults([]) }}
    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${mode === 'tv' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
  >
    {t('search.tvToggle')}
  </button>
</div>

<form onSubmit={handleSearch} className="w-full flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-full pl-4 pr-1 py-1 border border-white/10 shadow-2xl">
  <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder={mode === 'movie' ? t('search.moviePlaceholder') : t('search.showPlaceholder')}
    className="flex-1 bg-transparent text-xs placeholder-slate-400 focus:outline-none"
  />
  <button
    type="submit"
    className="px-4 py-1.5 text-xs rounded-full bg-blue-600 hover:bg-blue-500 transition font-semibold whitespace-nowrap"
  >
    {t('search.button')}
  </button>
</form>

        {loading && <p className="text-center text-slate-200 text-sm mt-3 drop-shadow-lg">{t('search.searching')}</p>}
        {error && <p className="text-center text-red-400 text-sm mt-3 drop-shadow-lg">{error}</p>}
      </div>
    </div>
  )
}

function NavBar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <nav style={{ position: 'relative', zIndex: 2 }} className="flex items-center justify-between px-6 py-3 bg-slate-900/70 backdrop-blur-sm">
      <Link to="/" className="text-xl font-bold">{t('nav.title')}</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/insights" className="text-blue-400 hover:underline">{t('nav.topRated')}</Link>
        {user ? (
          <>
            <Link to="/my-ratings" className="text-blue-400 hover:underline">{t('nav.myRatings')}</Link>
            <span className="text-slate-400">{t('nav.greeting', { name: user.username })}</span>
            <button onClick={logout} className="text-blue-400 hover:underline">{t('nav.logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-400 hover:underline">{t('nav.login')}</Link>
            <Link to="/signup" className="text-blue-400 hover:underline">{t('nav.signup')}</Link>
          </>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  )
}

function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen text-white bg-slate-900">
      {isHome && <PosterBackdrop />}
      <NavBar />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/movie/:tmdbId" element={<MovieDetail />} />
        <Route path="/show/:tmdbId" element={<ShowDetail />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/my-ratings" element={<MyRatings />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App