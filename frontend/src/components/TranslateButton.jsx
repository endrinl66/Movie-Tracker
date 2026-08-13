import { useState } from 'react'
import { translateText } from '../api/client'

const LANGUAGES = [
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
]

function TranslateButton({ originalText, onTranslated }) {
  const [lang, setLang] = useState('es')
  const [loading, setLoading] = useState(false)
  const [translated, setTranslated] = useState(false)

  const handleTranslate = async () => {
    setLoading(true)
    try {
      const result = await translateText(originalText, lang)
      onTranslated(result)
      setTranslated(true)
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    onTranslated(originalText)
    setTranslated(false)
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      {translated ? (
        <button onClick={handleReset} className="text-xs text-blue-400 hover:underline">
          Show original
        </button>
      ) : (
        <>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded px-1 py-0.5"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="text-xs text-blue-400 hover:underline disabled:opacity-50"
          >
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </>
      )}
    </div>
  )
}

export default TranslateButton