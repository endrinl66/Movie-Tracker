import axios from 'axios'

const api = axios.create({
  baseURL: 'https://movie-tracker-6423.onrender.com',
  timeout: 15000,
})

export const translateText = async (text, targetLang) => {
  const res = await api.post('/translate', { text, target_lang: targetLang })
  return res.data.translated_text
}

export default api