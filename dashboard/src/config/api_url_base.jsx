// Backend = notre propre déploiement Railway. Surchargeable via VITE_API_BASE
// (ex. un dev front qui veut viser un backend local : VITE_API_BASE=http://localhost:8000).
export const  API_URL_BASE = import.meta.env.VITE_API_BASE || "https://backend-production-0726b.up.railway.app"