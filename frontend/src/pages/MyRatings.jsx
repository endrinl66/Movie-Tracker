import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function MyRatings() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ratings, setRatings] = useState([])
  const [movies, setMovies] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    const loadRatings = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/ratings/me', { params: { limit: 50 } })
        setRatings(res.data)

        const movieDetails = {}
        await Promise.all(
          res.data.map(async (r) => {
            try {
              const endpoint = r.movie_id ? `/movies/${r.movie_id}` : `/shows/${r.show_id}`
              const movieRes = await api.get(endpoint)
              const key = r.movie_id ? `movie-${r.movie_id}` : `show-${r.show_id}`
              movieDetails[key] = movieRes.data
            } catch {
              // skip if a movie fails to load
            }
          })
        )
        setMovies(movieDetails)
      } catch (err) {
        setError('Could not load your ratings.')
      } finally {
        setLoading(false)
      }
    }
    loadRatings()
  }, [user])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 text-center">
        <p className="text-slate-400">
          <a href="/login" className="text-blue-400 hover:underline">{t('nav.login')}</a> {t('myRatings.loginPrompt')}
        </p>
      </div>
    )
  }

  if (loading) return <p className="text-center text-slate-400 py-10">{t('myRatings.loading')}</p>
  if (error) return <p className="text-center text-red-400 py-10">{error}</p>

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">{t('myRatings.title')}</h1>

      {ratings.length === 0 ? (
        <p className="text-slate-400">
          {t('myRatings.empty')}{' '}
          <a href="/" className="text-blue-400 hover:underline">{t('myRatings.searchLink')}</a>
        </p>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => {
            const key = rating.movie_id ? `movie-${rating.movie_id}` : `show-${rating.show_id}`
            const item = movies[key]
            return (
              <div
                key={rating.id}
                onClick={() => {
                  if (!item) return
                  navigate(rating.movie_id ? `/movie/${item.tmdb_id}` : `/show/${item.tmdb_id}`)
                }}
                className="flex gap-4 bg-slate-800 rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
              >
                {item?.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-slate-700 rounded flex-shrink-0 flex items-center justify-center text-slate-500 text-xs">
                    N/A
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item ? item.title : `#${rating.movie_id || rating.show_id}`}</h3>
                    <span className="text-yellow-400 font-bold">{rating.rating} / 10</span>
                  </div>
                  {rating.review_text && (
                    <p className="text-slate-400 text-sm mt-2">{rating.review_text}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-2">
                    {new Date(rating.watched_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyRatings