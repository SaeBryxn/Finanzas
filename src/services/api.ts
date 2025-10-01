import axios from 'axios'

const baseURL =
    import.meta.env.VITE_API_URL   // producción (Vercel)
    || '/api'                      // dev (proxy a json-server)

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

export default api
