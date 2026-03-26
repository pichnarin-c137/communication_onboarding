import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const KH_BOUNDS = L.latLngBounds([10.3, 102.3], [14.7, 107.7])
const PHNOM_PENH = [11.5564, 104.9160]

export const STATUS_COLORS = {
  at_office: '#378ADD',
  en_route: '#BA7517',
  leave_office: '#BA7517',
  traveling: '#BA7517',
  arrived: '#1D9E75',
  in_session: '#534AB7',
  in_progress: '#534AB7',
  completed: '#639922',
  done: '#639922'
}

const iconCache = new Map()

export function useMap() {
  let map = null
  let trainerMarker = null
  let customerMarker = null
  let branchMarker = null
  let geofenceCircle = null
  let trailPolyline = null
  let routeLayer = null

  function init(container, opts = {}) {
    map = L.map(container, {
      center: PHNOM_PENH,
      zoom: 13,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: KH_BOUNDS,
      maxBoundsViscosity: 0.9,
      ...opts
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)
    return map
  }

  function _makeIcon(color, size = 14) {
    const key = `${color}-${size}`
    if (iconCache.has(key)) return iconCache.get(key)
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.45)"></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
    iconCache.set(key, icon)
    return icon
  }

  function setTrainerPin(lat, lng, status, name = null) {
    if (!map || lat == null || lng == null) return
    const color = STATUS_COLORS[status] || '#9CA3AF'
    if (trainerMarker) {
      trainerMarker.setLatLng([lat, lng])
      trainerMarker.setIcon(_makeIcon(color, 16))
    } else {
      trainerMarker = L.marker([lat, lng], { icon: _makeIcon(color, 16) }).addTo(map)
    }
    if (name) {
      trainerMarker.bindPopup(`<strong style="font-size:12px">${name}</strong>`)
    }
  }

  function setCustomerPin(lat, lng, name, geofenceRadius = 200) {
    if (!map || lat == null || lng == null) return
    if (customerMarker) {
      customerMarker.setLatLng([lat, lng])
    } else {
      customerMarker = L.marker([lat, lng], { icon: _makeIcon('#DC2626', 14) }).addTo(map)
    }
    if (name) customerMarker.bindPopup(`<strong style="font-size:12px">${name}</strong>`)
    if (geofenceCircle) {
      geofenceCircle.setLatLng([lat, lng])
      geofenceCircle.setRadius(geofenceRadius)
    } else {
      geofenceCircle = L.circle([lat, lng], {
        radius: geofenceRadius,
        color: '#10B981',
        fillColor: '#10B981',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6 4'
      }).addTo(map)
    }
  }

  function setBranchPin(lat, lng, name) {
    if (!map || lat == null || lng == null) return
    if (branchMarker) {
      branchMarker.setLatLng([lat, lng])
    } else {
      branchMarker = L.marker([lat, lng], { icon: _makeIcon('#6366F1', 12) }).addTo(map)
    }
    if (name) branchMarker.bindPopup(`<strong style="font-size:12px">${name}</strong>`)
  }

  function drawTrail(points) {
    if (!map || !points?.length) return
    const latlngs = points.map(p => [p.lat, p.lng])
    if (trailPolyline) {
      trailPolyline.setLatLngs(latlngs)
    } else {
      trailPolyline = L.polyline(latlngs, { color: '#6366F1', weight: 3, opacity: 0.6 }).addTo(map)
    }
  }

  function drawRoute(geojson) {
    if (!map || !geojson) return
    if (routeLayer) map.removeLayer(routeLayer)
    routeLayer = L.geoJSON(geojson, {
      style: { color: '#013486', weight: 4 }
    }).addTo(map)
  }

  function fitToContent() {
    if (!map) return
    const points = []
    if (trainerMarker) points.push(trainerMarker.getLatLng())
    if (customerMarker) points.push(customerMarker.getLatLng())
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 15 })
    } else if (points.length === 1) {
      map.setView(points[0], 14)
    }
  }

  function clearAll() {
    if (trainerMarker) { map?.removeLayer(trainerMarker); trainerMarker = null }
    if (branchMarker) { map?.removeLayer(branchMarker); branchMarker = null }
    if (customerMarker) { map?.removeLayer(customerMarker); customerMarker = null }
    if (geofenceCircle) { map?.removeLayer(geofenceCircle); geofenceCircle = null }
    if (trailPolyline) { map?.removeLayer(trailPolyline); trailPolyline = null }
    if (routeLayer) { map?.removeLayer(routeLayer); routeLayer = null }
  }

  function destroy() {
    clearAll()
    map?.remove()
    map = null
  }

  function invalidateSize() {
    map?.invalidateSize()
  }

  return {
    init,
    setTrainerPin,
    setCustomerPin,
    setBranchPin,
    drawTrail,
    drawRoute,
    fitToContent,
    clearAll,
    destroy,
    invalidateSize
  }
}
