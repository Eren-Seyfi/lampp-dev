// Electron'dan 'contextBridge' modülünü içe aktar
// contextBridge, güvenli şekilde veri alışverişi sağlar
import { contextBridge } from 'electron'

// electron-toolkit üzerinden gelen hazır API'leri içe aktar (örn. pencere kapatma, yeniden yükleme vs.)
import { electronAPI } from '@electron-toolkit/preload'

// Renderer tarafına özel kendi API'lerini burada tanımlayabilirsin
// Şimdilik boş bir obje ama istenirse içine özel IPC fonksiyonları eklenebilir
const api = {}

// Eğer Electron'da context isolation (bağlam yalıtımı) açık ise (güvenlik için önerilir):
if (process.contextIsolated) {
  try {
    // Main process'ten gelen 'electronAPI' nesnesini renderer tarafında 'window.electron' olarak erişilebilir hale getir
    contextBridge.exposeInMainWorld('electron', electronAPI)

    // Kendi özel api objeni de 'window.api' olarak sun
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    // Hata olursa consola yaz
    console.error(error)
  }
} else {
  // Eğer context isolation kapalıysa doğrudan window'a yaz (güvenli değil ama çalışır)
  window.electron = electronAPI
  window.api = api
}
