/**
 * Mesure d’audience sans cookie (Umami). Le script n’est chargé que si la variable
 * d’environnement PUBLIC_UMAMI_WEBSITE_ID est définie ; sinon ces appels ne font rien.
 * Événements : whatsapp, phone, email, form, download, language, qr.
 */
type Props = Record<string, string>

declare global {
  interface Window {
    umami?: { track: (event: string, props?: Props) => void }
  }
}

export function track(event: string, props?: Props) {
  try {
    window.umami?.track(event, props)
  } catch {
    /* la mesure ne doit jamais casser la page */
  }
}
