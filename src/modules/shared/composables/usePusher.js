import Pusher from 'pusher-js'

let pusherInstance = null

export function usePusher() {
  function connect(getAccessToken) {
    if (pusherInstance) return pusherInstance
    pusherInstance = new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
      cluster: 'mt1',
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: import.meta.env.VITE_REVERB_PORT,
      wssPort: import.meta.env.VITE_REVERB_PORT,
      forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'wss',
      enabledTransports: ['ws', 'wss'],
      channelAuthorization: {
        customHandler: ({ channelName, socketId }, callback) => {
          fetch(`${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_PUSHER_AUTH_ENDPOINT}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAccessToken()}`,
            },
            body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
          })
            .then((res) => res.json())
            .then((data) => callback(null, data))
            .catch((err) => callback(err, null))
        },
      },
    })
    return pusherInstance
  }

  function disconnect() {
    if (pusherInstance) {
      pusherInstance.disconnect()
      pusherInstance = null
    }
  }

  function getPusher() {
    return pusherInstance
  }

  return { connect, disconnect, getPusher }
}
