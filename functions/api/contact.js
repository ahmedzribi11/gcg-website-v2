// Cloudflare Pages : formulaire de contact (voir server/contact.js).
import { handleContact } from '../../server/contact.js'

export const onRequestPost = ({ request, env }) => handleContact(request, env, request.headers.get('cf-connecting-ip') ?? '')
