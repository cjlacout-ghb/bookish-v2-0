const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net_module = require('net');

let mainWindow;
let backendProcess;

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Get the covers folder path using the same logic as Python's config.py
// This mirrors SHGetFolderPathW — we use app.getPath('documents') which is
// the official Electron equivalent, resolves correctly for every Windows user
// ─────────────────────────────────────────────────────────────────────────────
function getCoversPath() {
  const documents = app.getPath('documents');
  return path.join(documents, 'Bookish', 'data', 'portadas');
}

function getCapturasPath() {
  const documents = app.getPath('documents');
  return path.join(documents, 'Bookish', 'data', 'capturas');
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Register a custom protocol "app://"
// This intercepts requests like app://covers/foto.jpg and serves the file
// directly from disk — no Python involved, no HTTP, no permissions issue
// Must be called BEFORE app.whenReady()
// ─────────────────────────────────────────────────────────────────────────────
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,        // treated as HTTPS (no mixed-content errors)
      standard: true,      // allows relative URLs to work correctly
      supportFetchAPI: true
    }
  }
]);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Wait for a TCP port to be ready before showing the window
// ─────────────────────────────────────────────────────────────────────────────
function waitForPort(port, host, retries, delay) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const try_connect = () => {
      const socket = new net_module.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => { socket.destroy(); resolve(); });
      socket.on('error', () => {
        socket.destroy();
        attempts++;
        if (attempts >= retries) return reject(new Error('Backend did not start in time'));
        setTimeout(try_connect, delay);
      });
      socket.connect(port, host);
    };
    try_connect();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Start the Python backend (unchanged from your original logic)
// ─────────────────────────────────────────────────────────────────────────────
function startBackend() {
  const isDev = process.env.NODE_ENV === 'development';
  let backendPath;

  if (isDev) {
    backendPath = path.join(__dirname, '../../backend/dist/bookish-backend.exe');
  } else {
    backendPath = path.join(process.resourcesPath, 'bookish-backend.exe');
  }

  console.log('Starting backend at:', backendPath);

  backendProcess = spawn(backendPath, ['8000'], {
    stdio: 'ignore',
    detached: false
  });

  backendProcess.on('error', (err) => {
    console.error('Error starting backend:', err);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — Create the BrowserWindow (unchanged from your original)
// ─────────────────────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    title: 'Bookish',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6 — App lifecycle
// ─────────────────────────────────────────────────────────────────────────────
app.whenReady().then(() => {

  // Register the custom protocol handler AFTER app is ready
  // Intercepts app://covers/<filename> and reads from disk directly
  protocol.handle('app', (request) => {
    const url = new URL(request.url);

    // Only handle covers requests — everything else falls through
    if (url.hostname === 'covers') {
      const filename = url.pathname.replace(/^\//, '');
      const filePath = path.join(getCoversPath(), filename).replace(/\\/g, '/');
      return net.fetch(`file:///${filePath}`);
    }

    if (url.hostname === 'capturas') {
      const filename = url.pathname.replace(/^\//, '');
      const filePath = path.join(getCapturasPath(), filename).replace(/\\/g, '/');
      return net.fetch(`file:///${filePath}`);
    }

    // Fallback for any other app:// request
    return new Response('Not found', { status: 404 });
  });

  startBackend();

  waitForPort(8000, '127.0.0.1', 30, 1000)
    .then(() => createWindow())
    .catch((err) => {
      console.error('Backend failed to start:', err);
      app.quit();
    });
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
