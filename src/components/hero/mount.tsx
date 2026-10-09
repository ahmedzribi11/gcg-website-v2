import { createRoot } from 'react-dom/client'
import HeroIsland from './HeroIsland'
import type { Tier } from '../../scenes/device'

/** Monte la scène 3D dans `host` ; appelé par le script du hero une fois la page utilisable. */
export function mountHero(host: HTMLElement, sectionId: string, tier: Exclude<Tier, 'none'>) {
  createRoot(host).render(<HeroIsland sectionId={sectionId} tier={tier} />)
}
