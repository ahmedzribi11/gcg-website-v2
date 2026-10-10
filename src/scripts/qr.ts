import { encode } from 'uqr'

/**
 * Domaine définitif connu au build (SITE_URL, voir astro.config.mjs) : les QR codes et les liens
 * partagés l’encodent quel que soit l’hôte qui affiche la page (aperçu Vercel, apex, local) (SHR-02).
 * Vide si SITE_URL n’est pas renseigné : on encode alors l’adresse de la page.
 */
const SITE_ORIGIN: string = import.meta.env.PUBLIC_QR_ORIGIN || ''

/**
 * Rend les QR codes [data-qr] côté client.
 * data-qr : chemin (/realisations/...) ou URL complète.
 */
export function qrUrl(target: string) {
  return /^https?:\/\//.test(target) ? target : new URL(target, SITE_ORIGIN || location.origin).href
}

/**
 * Correction d’erreur : M (15 %) pour les codes affichés à l’écran ; Q (25 %) pour ce qui part à l’impression,
 * affiche et fichiers téléchargés, car un panneau de chantier prend la poussière, la pluie et le soleil (SHR-04).
 */
export type QrEcc = 'M' | 'Q'

const colour = (c: string, fallback: string) => (/^#[\da-f]{3,8}$/i.test(c) ? c : fallback)

/**
 * Modules du code (zone blanche de 4 modules comprise) regroupés en segments horizontaux : un tracé par suite
 * de modules foncés, et non un carré par module, évite les fines lignes claires entre carrés à l’impression (SHR-12).
 */
function qrRuns(url: string, ecc: QrEcc) {
  const { data, size } = encode(url, { ecc, border: 4 })
  const runs: [x: number, y: number, w: number][] = []
  data.forEach((row, y) => {
    for (let x = 0; x < size; x++) {
      if (!row[x]) continue
      const start = x
      while (row[x + 1]) x++
      runs.push([start, y, x - start + 1])
    }
  })
  return { size, runs }
}

/** SVG du code ; `mm` donne au fichier une taille physique (fichier téléchargé), sinon il suit son conteneur. */
export function qrSvg(url: string, dark = '#052e14', light = '#ffffff', ecc: QrEcc = 'M', mm?: number) {
  const { size, runs } = qrRuns(url, ecc)
  const u = 10
  const d = runs.map(([x, y, w]) => `M${x * u},${y * u}h${w * u}v${u}h-${w * u}z`).join('')
  const dims = mm ? ` width="${mm}mm" height="${mm}mm"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size * u} ${size * u}"${dims}><rect fill="${colour(light, '#ffffff')}" width="${size * u}" height="${size * u}"/><path fill="${colour(dark, '#052e14')}" d="${d}"/></svg>`
}

/** PNG net : un nombre entier de pixels par module (40), deux couleurs seulement, sans lissage (SHR-12). */
function qrPng(url: string, ecc: QrEcc): Promise<Blob | null> {
  const { size, runs } = qrRuns(url, ecc)
  const px = 40
  const c = document.createElement('canvas')
  c.width = c.height = size * px
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#052e14'
  for (const [x, y, w] of runs) ctx.fillRect(x * px, y * px, w * px, px)
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'))
}

export function renderQrs(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-qr]').forEach((el) => {
    const url = qrUrl(el.dataset.qr!)
    el.innerHTML = qrSvg(url, el.dataset.qrDark || '#052e14', el.dataset.qrLight || '#ffffff', el.dataset.qrEcc === 'Q' ? 'Q' : 'M')
    const svg = el.querySelector('svg')
    if (svg) {
      svg.setAttribute('role', 'img')
      // Deux-points selon la langue de la page ; insécable en français (CONT-06, CONT-08)
      svg.setAttribute('aria-label', `QR code${document.documentElement.lang === 'fr' ? '\u00a0: ' : ': '}${url}`)
      svg.removeAttribute('width')
      svg.removeAttribute('height')
      svg.style.width = '100%'
      svg.style.height = 'auto'
      svg.style.display = 'block'
    }
    el.dataset.qrUrl = url
    el.querySelectorAll<HTMLElement>('[data-qr-label]').forEach((l) => (l.textContent = url))
  })
  root.querySelectorAll<HTMLElement>('[data-qr-text]').forEach((el) => {
    el.textContent = qrUrl(el.dataset.qrText!)
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
  })
}

renderQrs()

/**
 * Ne pas imprimer (SHR-02) : le domaine définitif n’est pas connu au build, ou la page est ouverte
 * sur une autre adresse que lui (aperçu, apex non redirigé, local) et ce domaine n’est peut-être pas encore en ligne.
 */
if (!SITE_ORIGIN || location.origin !== SITE_ORIGIN) {
  document.querySelectorAll<HTMLElement>('[data-qr-warning]').forEach((el) => el.removeAttribute('hidden'))
}

/* Téléchargement SVG / PNG */
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLElement>('[data-qr-download]')
  if (!btn) return
  const target = document.getElementById(btn.dataset.qrDownload!)
  const url = target?.dataset.qrUrl
  if (!url) return
  const name = btn.dataset.qrName || 'gcg-qr'
  // Fichiers pour l’impression : correction Q (SHR-04) ; SVG de 100 mm de côté, PNG à 40 px par module (SHR-12)
  if (btn.dataset.format === 'png') {
    const png = await qrPng(url, 'Q')
    if (png) save(png, `${name}.png`)
  } else save(new Blob([qrSvg(url, '#052e14', '#ffffff', 'Q', 100)], { type: 'image/svg+xml' }), `${name}.svg`)
})

function save(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.append(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(a.href)
    a.remove()
  }, 1000)
}

/* Partage natif / copie du lien */
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element).closest<HTMLElement>('[data-share], [data-copy]')
  if (!btn) return
  const url = qrUrl(btn.dataset.share ?? btn.dataset.copy ?? location.pathname)
  if (btn.dataset.share !== undefined && navigator.share) {
    try {
      await navigator.share({ url, title: btn.dataset.title || document.title })
      return
    } catch {
      /* annulé : on copie le lien */
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    const label = btn.querySelector<HTMLElement>('[data-copy-label]')
    if (label) {
      const prev = label.textContent
      label.textContent = btn.dataset.copied || '✓'
      setTimeout(() => (label.textContent = prev), 1800)
    }
  } catch {
    prompt('', url)
  }
})
