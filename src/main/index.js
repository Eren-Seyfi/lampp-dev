// Electron modüllerini içe aktar
import { app, shell, BrowserWindow, ipcMain } from 'electron'

// Dosya yolu işlemleri için 'path' modülünden 'join' fonksiyonu alınır
import { join } from 'path'

// Electron Toolkit yardımcıları: geliştirme kontrolü, kısayol izleme, vs.
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// Uygulama güncellemeleri için electron-updater modülünden autoUpdater alınır
import { autoUpdater } from 'electron-updater'

// Uygulama simgesi import edilir (Vite sayesinde bu şekilde çağrılır)
import icon from '../../resources/icon.png?asset'

// Ana pencereyi oluşturacak fonksiyon

function createWindow() {
  // Yeni bir tarayıcı penceresi oluştur
  const mainWindow = new BrowserWindow({
    width: 900, // pencere genişliği
    height: 670, // pencere yüksekliği
    show: false, // pencere hazır olana kadar gösterilmesin
    autoHideMenuBar: true, // menü çubuğunu gizle
    ...(process.platform === 'linux' ? { icon } : {}), // yalnızca Linux için ikon kullan
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // preload script dosyası
      sandbox: false // sandbox özelliğini devre dışı bırak (gelişmiş erişim için)
    }
  })

  // Pencere yüklendiğinde göster
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Yeni pencere açma isteği gelirse dış tarayıcıda aç (örn. linklere tıklama)
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url) // tarayıcıda aç
    return { action: 'deny' } // Electron içinde pencere açılmasını engelle
  })

  // Geliştirme ortamındaysa local sunucu URL'sini yükle (vite dev server)
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // Üretim ortamındaysa derlenmiş HTML dosyasını yükle
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 🟡 Electron autoUpdater ile güncelleme kontrolü başlatılır
  autoUpdater.checkForUpdatesAndNotify()

  // Güncelleme mevcutsa consola yaz
  autoUpdater.on('update-available', () => {
    console.log('🔁 Yeni güncelleme mevcut, indiriliyor...')
  })

  // Güncelleme indirildikten sonra
  autoUpdater.on('update-downloaded', () => {
    console.log('✅ Güncelleme indirildi. Uygulama kapatıldığında kurulacak.')
    // Otomatik kurulum yapılması istenirse aşağıdaki satır açılabilir:
    // autoUpdater.quitAndInstall();
  })

  // Güncelleme sırasında hata olursa consola yaz
  autoUpdater.on('error', (err) => {
    console.error('⚠️ Güncelleme sırasında hata oluştu:', err)
  })
}

// Uygulama Electron tarafından tamamen yüklendiğinde çalışır
app.whenReady().then(() => {
  // Windows için uygulama modeli kimliği ayarlanır (gerekli)
  electronApp.setAppUserModelId('com.electron')

  // Pencere oluşturulurken F12 ve kısayolların davranışları belirlenir
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Basit IPC örneği: Renderer'dan 'ping' geldiğinde consola 'pong' yaz
  ipcMain.on('ping', () => console.log('pong'))

  // Ana pencere oluşturulur
  createWindow()

  // MacOS'ta uygulama simgesine tıklanırsa yeni pencere oluştur
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Tüm pencereler kapatıldığında uygulamayı sonlandır (Mac hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
