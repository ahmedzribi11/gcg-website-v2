// Vercel : connexion GitHub de l’espace de gestion, étape 2 (voir server/oauth.js).
import { authCallback } from '../server/oauth.js'

export function GET(request) {
  return authCallback(request, process.env)
}
