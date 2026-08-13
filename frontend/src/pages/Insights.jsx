import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'

function MovieCard({ item }) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
      {item.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
          alt={item.title}
          className="w-full h-auto"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
          No poster
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
        <p className="text-slate-400 text-xs mt-1">
          {item.avg_rating.toFixed(1)} / 10 · {item.num_ratings} rating{item.num_ratings !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

function PersonCard({ item }) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
      {item.profile_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w300${item.profile_path}`}
          alt={item.name}
          className="w-full h-auto"
        />
      ) : (
        <div className="w-full aspect-[2/3] bg-slate-700 flex items-center justify-center text-slate-400 text-sm">
          No photo
        </div>
      )}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
        <p className="text-slate-400 text-xs mt-1">
          {item.avg_rating.toFixed(1)} / 10 · {item.num_ratings} rating{item.num_ratings !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Insights() {
  const { t } = useTranslation()
  const [topMovies, setTopMovies] = useState([])
  const [topShows, setTopShows] = useState([])
  const [topActors, setTopActors] = useState([])
  const [topDirectors, setTopDirectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true)
      setError(null)
      try {
        const [moviesRes, showsRes, actorsRes, directorsRes] = await Promise.all([
          api.get('/insights/top-movies', { params: { limit: 10 } }),
          api.get('/insights/top-shows', { params: { limit: 10 } }),
          api.get('/insights/top-actors', { params: { limit: 10 } }),
          api.get('/insights/top-directors', { params: { limit: 10 } }),
        ])
        setTopMovies(moviesRes.data)
        setTopShows(showsRes.data)
        setTopActors(actorsRes.data)
        setTopDirectors(directorsRes.data)
      } catch (err) {
        setError('Could not load insights.')
      } finally {
        setLoading(false)
      }
    }
    loadInsights()
  }, [])

  if (loading) return <p className="text-center text-slate-400 py-10">{t('insights.loading')}</p>
  if (error) return <p className="text-center text-red-400 py-10">{error}</p>

  const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-10">{t('insights.title')}</h1>

      <Section title={t('insights.topMovies')}>
        {topMovies.length === 0 ? (
          <p className="text-slate-400 text-sm">{t('insights.notEnoughMovies')}</p>
        ) : (
          <div className={gridClass}>
            {topMovies.map((m) => (
              <MovieCard key={m.movie_id} item={m} />
            ))}
          </div>
        )}
      </Section>

      <Section title={t('insights.topShows')}>
        {topShows.length === 0 ? (
          <p className="text-slate-400 text-sm">{t('insights.notEnoughShows')}</p>
        ) : (
          <div className={gridClass}>
            {topShows.map((s) => (
              <MovieCard key={s.show_id} item={s} />
            ))}
          </div>
        )}
      </Section>

      <Section title={t('insights.topActors')}>
        {topActors.length === 0 ? (
          <p className="text-slate-400 text-sm">{t('insights.notEnoughActors')}</p>
        ) : (
          <div className={gridClass}>
            {topActors.map((a) => (
              <PersonCard key={a.person_id} item={a} />
            ))}
          </div>
        )}
      </Section>

      <Section title={t('insights.topDirectors')}>
        {topDirectors.length === 0 ? (
          <p className="text-slate-400 text-sm">{t('insights.notEnoughDirectors')}</p>
        ) : (
          <div className={gridClass}>
            {topDirectors.map((d) => (
              <PersonCard key={d.person_id} item={d} />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

export default Insights