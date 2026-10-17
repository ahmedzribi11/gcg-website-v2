/**
 * Mesure d’audience sans cookie (Umami). Le script n’est chargé que si la variable
 * d’environnement PUBLIC_UMAMI_WEBSITE_ID est définie ; sinon ces appels ne font rien.
 * Événements (UX-04), chacun avec `from` (chemin de la page) et `place` (zone du clic) :
 * - whatsapp, phone, email, download : tout lien de contact ou de téléchargement (src/scripts/site.ts) ;
 * - form : demande envoyée par le formulaire de contact ; whatsapp ou email avec place « formulaire ».
 * Les scans de QR codes sont comptés par Umami grâce au marquage utm_* des adresses /q et /qr.
 */
type Props = Record<string, string>

declare global {
  interface Window {
    umami?: { track: (event: string, props?: Props) => void }
  }
}

/** Chemin de la page sans « .html » ni barre finale : « /realisations/green-city ». */
export const pageName = () => location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/'

export function track(event: string, props?: Props) {
  try {
    window.umami?.track(event, props)
  } catch {
    /* la mesure ne doit jamais casser la page */
  }
}
