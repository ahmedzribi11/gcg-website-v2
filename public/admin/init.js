// Démarrage de Decap, chargé après /admin/decap/decap-cms.js (src/pages/admin.astro, SEC-04).
// La connexion GitHub passe par les fonctions /api/auth et /api/callback du même domaine.
CMS.init({
  config: {
    backend: {
      name: 'github',
      repo: 'ahmedzribi11/gcg-website-v2',
      branch: 'main',
      base_url: location.origin,
      auth_endpoint: 'api/auth',
      // Dépôt public : accès aux seuls dépôts publics de l’éditeur, pas à ses dépôts privés (SEC-03)
      auth_scope: 'public_repo',
    },
    site_url: location.origin,
    display_url: location.origin,
  },
})
