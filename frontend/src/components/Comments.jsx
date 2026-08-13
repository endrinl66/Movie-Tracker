import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api, { translateText } from '../api/client'
import { useAuth } from '../context/AuthContext'

function Comments({ movieId, showId }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const endpoint = movieId ? `/comments/movie/${movieId}` : `/comments/show/${showId}`

  const loadComments = async () => {
    setLoading(true)
    try {
      const res = await api.get(endpoint)
      setComments(res.data)
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [movieId, showId])

  useEffect(() => {
    if (comments.length === 0) return
    if (i18n.language === 'en') {
      setComments((prev) => prev.map((c) => ({ ...c, displayedText: c.text })))
      return
    }
    let cancelled = false
    Promise.all(
      comments.map((c) =>
        translateText(c.text, i18n.language).catch(() => c.text)
      )
    ).then((translatedTexts) => {
      if (cancelled) return
      setComments((prev) =>
        prev.map((c, idx) => ({ ...c, displayedText: translatedTexts[idx] }))
      )
    })
    return () => { cancelled = true }
  }, [i18n.language, comments.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await api.post('/comments', {
        movie_id: movieId || null,
        show_id: showId || null,
        text: text.trim(),
      })
      setText('')
      loadComments()
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || 'Could not post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err) {
      // silently fail
    }
  }

  return (
    <div className="mt-10 border-t border-slate-800 pt-8">
      <h2 className="text-lg font-semibold mb-4">{t('comments.title')}</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder={t('comments.placeholder')}
            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? t('comments.posting') : t('comments.post')}
          </button>
        </form>
      ) : (
        <p className="text-slate-400 text-sm mb-6">
          <a href="/login" className="text-blue-400 hover:underline">{t('nav.login')}</a> {t('comments.loginPrompt')}
        </p>
      )}

      {loading ? (
        <p className="text-slate-400 text-sm">{t('comments.loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-slate-400 text-sm">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{c.username}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  {user && user.username === c.username && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400 hover:underline text-xs"
                    >
                      {t('comments.delete')}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-300 text-sm">{c.displayedText ?? c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments