import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sq', label: 'Shqip' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const handleChange = (e) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('appLanguage', lang)
  }

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1"
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  )
}

export default LanguageSwitcher