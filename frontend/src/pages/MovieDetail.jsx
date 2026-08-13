import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { translateText } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Comments from '../components/Comments'

function MovieDetail() {
  const { t, i18n } = useTranslation()
  const { tmdbId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [displayedOverview, setDisplayedOverview] = useState(null)

  const [ratingValue, setRatingValue] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [watchStatus, setWatchStatus] = useState(null)
  const [watchLoading, setWatchLoading] = useState(false)

  useEffect(() => {
  const loadMovie = async () => {
    setLoading(true)
    setError(null)
    try {
      const ingestRes = await api.post(`/movies/ingest/${tmdbId}`)
      const detailRes = await api.get(`/movies/${ingestRes.data.id}`)
      setMovie(detailRes.data)
    } catch (err) {
      console.error('Failed to load movie:', err)
      setError(t('detail.couldNotLoadMovie'))
    } finally {
      setLoading(false)
    }
  }
  loadMovie()
}, [tmdbId])

  useEffect(() => {
    if (!movie || !movie.overview) return
    if (i18n.language === 'en') {
      setDisplayedOverview(movie.overview)
      return
    }
    let cancelled = false
    translateText(movie.overview, i18n.language)
      .then((translated) => {
        if (!cancelled) setDisplayedOverview(translated)
      })
      .catch(() => {
        if (!cancelled) setDisplayedOverview(movie.overview)
      })
    return () => { cancelled = true }
  }, [movie, i18n.language])

  const handleSetWatchStatus = async (status) => {
    setWatchLoading(true)
    try {
      await api.post('/watch-status', { movie_id: movie.id, status })
      setWatchStatus(status)
    } catch (err) {
      // silently ignore for now
    } finally {
      setWatchLoading(false)
    }
  }

  const handleRate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    try {
      await api.post('/ratings', {
        movie_id: movie.id,
        rating: parseFloat(ratingValue),
        review_text: reviewText || null,
      })
      setSubmitSuccess(true)
    } catch (err) {
      setSubmitError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Could not submit rating.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-center text-slate-400 py-10">{t('detail.loading')}</p>
  if (error) return <p className="text-center text-red-400 py-10">{error}</p>
  if (!movie) return null

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex justify-start mb-6">
        <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline text-sm">
          {t('detail.back')}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
            alt={movie.title}
            className="w-64 sm:w-72 md:w-80 lg:w-96 aspect-[2/3] object-cover rounded-xl shadow-2xl flex-shrink-0 mx-auto md:mx-0"
          />
        ) : (
          <div className="w-64 sm:w-72 md:w-80 lg:w-96 aspect-[2/3] bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-sm flex-shrink-0 mx-auto md:mx-0">
            {t('search.noPoster')}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {movie.title} {movie.release_year && <span className="text-slate-400 font-normal">({movie.release_year})</span>}
          </h1>

          {user && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleSetWatchStatus('want_to_watch')}
                disabled={watchLoading}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  watchStatus === 'want_to_watch' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {t('detail.wantToWatch')}
              </button>
              <button
                onClick={() => handleSetWatchStatus('watched')}
                disabled={watchLoading}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                  watchStatus === 'watched' ? 'bg-green-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {t('detail.watched')}
              </button>
            </div>
          )}

          {movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((g) => (
                <span key={g} className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-300">{g}</span>
              ))}
            </div>
          )}

          {movie.directors.length > 0 && (
            <p className="text-slate-400 text-sm mb-2">
              {t('detail.directedBy')} {movie.directors.map((d) => d.name).join(', ')}
            </p>
          )}

          <p className="text-slate-300 mb-6">{displayedOverview ?? movie.overview}</p>

          {movie.cast.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">{t('detail.cast')}</h2>
              <div className="flex flex-wrap gap-2">
                {movie.cast.slice(0, 8).map((c) => (
                  <span key={c.id} className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-300">
                    {c.name}{c.character_name ? ` as ${c.character_name}` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 border-t border-slate-800 pt-8">
        {user ? (
          <form onSubmit={handleRate} className="max-w-md">
            <h2 className="text-lg font-semibold mb-4">{t('detail.rateMovie')}</h2>
            <label className="block text-sm text-slate-400 mb-1">{t('detail.rating')}</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={ratingValue}
              onChange={(e) => setRatingValue(e.target.value)}
              className="w-24 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm text-slate-400 mb-1">{t('detail.review')}</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('detail.reviewPlaceholder')}
            />
            {submitError && <p className="text-red-400 text-sm mb-3">{submitError}</p>}
            {submitSuccess && <p className="text-green-400 text-sm mb-3">{t('detail.ratingSaved')}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {submitting ? t('detail.saving') : t('detail.submitRating')}
            </button>
          </form>
        ) : (
          <p className="text-slate-400">
            <a href="/login" className="text-blue-400 hover:underline">{t('nav.login')}</a> {t('detail.loginToRateMovie')}
          </p>
        )}
      </div>

      <Comments movieId={movie.id} />
    </div>
  )
}

export default MovieDetail