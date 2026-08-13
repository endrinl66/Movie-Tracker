import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function PosterBackdrop() {
  const [posters, setPosters] = useState([])
  const navigate = useNavigate()

  const loadPosters = () => {
    api.get('/movies/trending/backdrop')
      .then((res) => setPosters(res.data.slice(0, 27)))
      .catch(() => {})
  }

  useEffect(() => {
    loadPosters()
    const interval = setInterval(loadPosters, 15000)
    return () => clearInterval(interval)
  }, [])

  if (posters.length === 0) return null

  const handleGridClick = (e) => {
    const tmdbId = e.target.getAttribute('data-tmdb-id')
    if (tmdbId) {
      navigate(`/movie/${tmdbId}`)
    }
  }

  return (
    <div
      onClick={handleGridClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
      }}
      className="bg-slate-900"
    >
      <div className="grid grid-cols-9 grid-rows-3 gap-1 h-full w-full">
        {posters.map((movie) => (
          <img
            key={movie.tmdb_id}
            data-tmdb-id={movie.tmdb_id}
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover opacity-45 hover:opacity-100 transition duration-500 cursor-pointer"
          />
        ))}
      </div>
    </div>
  )
}

export default PosterBackdrop