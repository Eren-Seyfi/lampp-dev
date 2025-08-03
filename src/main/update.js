// src/main/update.js

import { autoUpdater } from 'electron-updater'

// ⚠️ Test amaçlı gömülü token (PROD'da GÖMME!)
const GITHUB_TOKEN = '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'

// Github releases URL’si (generic provider)
const updateURL = `https://${GITHUB_TOKEN}:x-oauth-basic@api.github.com/repos/Eren-Seyfi/lampp-dev/releases/download/latest/`

/**
 * Güncellemeyi başlatan fonksiyon
 */
export function initAutoUpdater() {
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: updateURL
  })

  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', () => {
    console.log('🔄 Yeni güncelleme mevcut, indiriliyor...')
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('✅ Güncelleme indirildi. Kapatınca otomatik kurulacak.')
    // autoUpdater.quitAndInstall(); // İstersen doğrudan kur
  })

  autoUpdater.on('error', (err) => {
    console.error('❌ Güncelleme hatası:', err)
  })
}
