// Espace de gestion, chargé avant Decap (src/pages/admin.astro). Fichier du site plutôt que script en ligne :
// la politique de sécurité de /admin n'autorise que les scripts du site, sans 'unsafe-inline' (SEC-04).
window.CMS_MANUAL_INIT = true
// Déconnexion après 8 heures d’inactivité (SEC-08)
;(function () {
  const USER = 'decap-cms-user'
  const LAST = 'gcg-admin-last-activity'
  const MAX = 8 * 3600 * 1000
  const expired = function () {
    return Date.now() - (Number(localStorage.getItem(LAST)) || Date.now()) > MAX
  }
  try {
    if (expired()) localStorage.removeItem(USER)
    const touch = function () {
      localStorage.setItem(LAST, String(Date.now()))
    }
    touch()
    addEventListener('click', touch, { passive: true })
    addEventListener('keydown', touch, { passive: true })
    setInterval(function () {
      if (expired() && localStorage.getItem(USER)) {
        localStorage.removeItem(USER)
        location.reload()
      }
    }, 60000)
  } catch {
    // stockage local indisponible (navigation privée) : pas de déconnexion automatique
  }
})()
