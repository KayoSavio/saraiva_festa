import { ADDRESS, ADDRESS_FULL } from './config'

const hasCoords = ADDRESS.lat !== null && ADDRESS.lng !== null
const coords = hasCoords ? `${ADDRESS.lat},${ADDRESS.lng}` : null
// O endereço escrito acha o número certo; as coordenadas servem para o Street View.
const query = encodeURIComponent(ADDRESS_FULL)

/** Links sem chave de API: funcionam no celular abrindo o app do Maps/Waze. */
export const maps = {
  embed: `https://www.google.com/maps?q=${query}&z=16&output=embed`,
  open: `https://www.google.com/maps/search/?api=1&query=${query}`,
  route: `https://www.google.com/maps/dir/?api=1&destination=${query}`,
  waze: `https://waze.com/ul?q=${query}&navigate=yes`,
  /** Street View precisa das coordenadas exatas. */
  streetView: coords ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coords}` : null,
}
