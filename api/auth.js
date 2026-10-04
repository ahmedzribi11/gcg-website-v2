// Vercel : connexion GitHub de l’espace de gestion, étape 1 (voir server/oauth.js).
import { authStart } from '../server/oauth.js'

export function GET(request) {
  return authStart(request, process.env)
}
