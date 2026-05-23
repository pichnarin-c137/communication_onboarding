import { createI18n } from 'vue-i18n'
import en from './locales/en'
import km from './locales/km'

const savedLocale = localStorage.getItem('coms_locale') || 'en'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, km },
})

// Hot-update messages when a locale file changes during dev.
// vue-i18n instantiates messages once at startup from static imports, so
// edits to en.js/km.js otherwise require a full page reload to appear.
if (import.meta.hot) {
  import.meta.hot.accept(['./locales/en', './locales/km'], ([newEn, newKm]) => {
    if (newEn) i18n.global.setLocaleMessage('en', newEn.default)
    if (newKm) i18n.global.setLocaleMessage('km', newKm.default)
  })
}
