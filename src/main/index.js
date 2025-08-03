// Electron modüllerini içe aktar
import { app, shell, BrowserWindow, ipcMain } from 'electron'

// Dosya yollarını birleştirmek için 'path' modülünden 'join' fonksiyonu alınır
import { join } from 'path'

// Electron Toolkit yardımcıları: geliştirme kontrolü, kısayol izleme, vs.
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// Uygulama simgesi (Vite sayesinde bu şekilde çağrılır)
import icon from '../../resources/icon.png?asset'

// 🔄 Güncelleyici modülünü dahil et (ayrı dosyada!)
import { initAutoUpdater } from './update'

// Ana pencereyi oluşturacak fonksiyon
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Pencere hazır olduğunda göster
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Pencerede link tıklanırsa varsayılan tarayıcıda aç
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Geliştirme modundaysa Vite sunucusunu yükle
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Üretim modundaysa HTML dosyasını yükle
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 🔄 Güncelleme sistemini başlat
  initAutoUpdater()
}

// Uygulama Electron tarafından tamamen yüklendiğinde çalışır
app.whenReady().then(() => {
  // Windows için uygulama modeli kimliği ayarlanır (bildirim için önemli)
  electronApp.setAppUserModelId('com.electron')

  // Pencere oluşturulurken kısayollar tanımlanır (F12 vs.)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test: Renderer'dan 'ping' mesajı geldiğinde consola 'pong' yaz
  ipcMain.on('ping', () => console.log('pong'))

  // Ana pencere oluştur
  createWindow()

  // MacOS'ta uygulama simgesine tıklanırsa yeni pencere oluştur
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Tüm pencereler kapatıldığında uygulamayı sonlandır (Mac hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Tüm pencereler kapatıldığında uygulamayı sonlandır (Mac hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
