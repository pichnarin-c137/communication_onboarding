import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

const pinia = createPinia()
setActivePinia(pinia)

import App from './App.vue'
import router, { installGuards } from '@/core/router/index.js'
import { i18n } from '@/core/i18n/index.js'
import './assets/styles.css'

const app = createApp(App)
app.use(pinia)
app.use(i18n)
installGuards()
app.use(router)
app.mount('#app')
