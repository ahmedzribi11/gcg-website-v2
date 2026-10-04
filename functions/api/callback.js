// Cloudflare Pages : connexion GitHub de l’espace de gestion, étape 2 (voir server/oauth.js).
import { authCallback } from '../../server/oauth.js'

export const onRequestGet = ({ request, env }) => authCallback(request, env)
