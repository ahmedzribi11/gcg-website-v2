import { renderSVG } from 'uqr'

/**
 * Rend les QR codes [data-qr] côté client à partir de l’adresse réelle du site
 * (fonctionne quel que soit le domaine : Vercel, domaine définitif, local).
 * data-qr : chemin (/realisations/...) ou URL complète.
 */
export function qrUrl(target: string) {
  return /^https?:\/\//.test(target) ? target : new URL(target, location.origin).href
}

export function qrSvg(url: string, dark = '#052e14', light = '#ffffff') {
  return renderSVG(url, { ecc: 'M', border: 4, pixelSize: 10, blackColor: dark, whiteColor: light })
}

export function renderQrs(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-qr]').forEach((el) => {
    const url = qrUrl(el.dataset.qr!)
    el.innerHTML = qrSvg(url, el.dataset.qrDark || '#052e14', el.dataset.qrLight || '#ffffff')
    const svg = el.querySelector('svg')
    if (svg) {
      svg.setAttribute('role', 'img')
      svg.setAttribute('aria-label', `QR code : ${url}`)
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

/** Adresse provisoire (Vercel, Cloudflare, local) : les QR codes ne doivent pas être imprimés. */
if (/(\.vercel\.app|\.pages\.dev|localhost|127\.0\.0\.1)$/.test(location.hostname)) {
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
  const svg = qrSvg(url, '#052e14', '#ffffff')
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  if (btn.dataset.format === 'png') {
    const img = new Image()
    img.src = URL.createObjectURL(blob)
    await img.decode()
    const c = document.createElement('canvas')
    c.width = c.height = 1200
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 0, 0, 1200, 1200)
    c.toBlob((b) => b && save(b, `${name}.png`), 'image/png')
  } else save(blob, `${name}.svg`)
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
