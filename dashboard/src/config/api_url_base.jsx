// Backend = déploiement de production sur AWS (api.map-action.com). Surchargeable
// via VITE_API_BASE (ex. un dev front qui vise un backend local : VITE_API_BASE=http://localhost:8000).
export const  API_URL_BASE = import.meta.env.VITE_API_BASE || "https://api.map-action.com"