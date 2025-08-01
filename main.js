const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'bti logo.jpg'),
        title: "BTI Student's Club Budget Manager"
    })

    // Remove menu bar
    win.setMenuBarVisibility(false)

    // Load your HTML file
    win.loadFile('index.html')

    // Prevent links from opening in browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        return { action: 'deny' }
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

