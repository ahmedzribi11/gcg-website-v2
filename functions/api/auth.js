// Cloudflare Pages : connexion GitHub de l’espace de gestion, étape 1 (voir server/oauth.js).
import { authStart } from '../../server/oauth.js'

export const onRequestGet = ({ request, env }) => authStart(request, env)
