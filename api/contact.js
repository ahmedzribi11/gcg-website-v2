// Vercel : formulaire de contact (voir server/contact.js).
import { handleContact } from '../server/contact.js'

export function POST(request) {
  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
  return handleContact(request, process.env, ip)
}
