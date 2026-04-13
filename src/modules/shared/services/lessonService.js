import api from '@/core/services/api.js'

//  Playlists

export async function getPlaylists(params = {}) {
  const res = await api.get('/playlists', { params })
  return res.data
}

export async function createPlaylist(data) {
  const res = await api.post('/playlists', data)
  return res.data.data
}

export async function getPlaylist(id) {
  const res = await api.get(`/playlists/${id}`)
  return res.data.data
}

export async function updatePlaylist(id, data) {
  const res = await api.put(`/playlists/${id}`, data)
  return res.data.data
}

export async function deletePlaylist(id) {
  const res = await api.delete(`/playlists/${id}`)
  return res.data
}

//  Videos

export async function getVideos(playlistId) {
  const res = await api.get(`/playlists/${playlistId}/videos`)
  return res.data.data
}

export async function addVideo(playlistId, data) {
  const res = await api.post(`/playlists/${playlistId}/videos`, data)
  return res.data.data
}

export async function updateVideo(playlistId, videoId, data) {
  const res = await api.put(`/playlists/${playlistId}/videos/${videoId}`, data)
  return res.data.data
}

export async function deleteVideo(playlistId, videoId) {
  const res = await api.delete(`/playlists/${playlistId}/videos/${videoId}`)
  return res.data
}

export async function reorderVideos(playlistId, videos) {
  const res = await api.patch(`/playlists/${playlistId}/videos/reorder`, { videos })
  return res.data.data
}

//  Telegram

export async function sendVideoToTelegram(playlistId, videoId, data) {
  const res = await api.post(`/playlists/${playlistId}/videos/${videoId}/send`, data)
  return res.data
}

export async function sendPlaylistToTelegram(playlistId, data) {
  const res = await api.post(`/playlists/${playlistId}/send`, data)
  return res.data
}

//  YouTube helpers

export function extractYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] || null
}

export function getYouTubeThumbnail(videoId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

export async function fetchYouTubeMeta(url) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('Could not fetch video info. Check the URL.')
  const data = await res.json()
  const videoId = extractYouTubeId(url)
  return {
    title:    data.title,
    author:   data.author_name,
    thumbnail: videoId ? getYouTubeThumbnail(videoId, 'maxresdefault') : data.thumbnail_url,
    videoId,
  }
}

// kept for backward-compat
export const lessonService = {
  getAll:  (p) => getPlaylists(p),
  add:     (playlistId, data) => addVideo(playlistId, data),
  update:  (playlistId, videoId, data) => updateVideo(playlistId, videoId, data),
  remove:  (playlistId, videoId) => deleteVideo(playlistId, videoId),
}
