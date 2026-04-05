const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, globalShortcut, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs   = require('fs');

const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

// ── Settings ──────────────────────────────────────────────
const DEFAULTS = { alwaysOnTop: true, positionLock: false, clickThrough: false, firstLaunch: true };
let SETTINGS_PATH;
let settings = { ...DEFAULTS };

function loadSettings() {
    try { settings = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')) }; }
    catch { settings = { ...DEFAULTS }; }
}

function saveSettings() {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}

// ── Windows ───────────────────────────────────────────────
let win;
let tray;

function buildTrayMenu() {
    return Menu.buildFromTemplate([
        {
            label: 'Always on Top',
            type: 'checkbox', checked: settings.alwaysOnTop,
            click: () => { settings.alwaysOnTop = !settings.alwaysOnTop; saveSettings(); applySettings(); buildTray(); },
        },
        {
            label: 'Position Lock',
            type: 'checkbox', checked: settings.positionLock,
            click: () => { settings.positionLock = !settings.positionLock; saveSettings(); win?.webContents.send('settings-update', settings); buildTray(); },
        },
        {
            label: IS_MAC ? 'Click Through  ⌘⇧T' : 'Click Through  Ctrl+Shift+T',
            type: 'checkbox', checked: settings.clickThrough,
            click: () => { settings.clickThrough = !settings.clickThrough; saveSettings(); applySettings(); buildTray(); },
        },
        { type: 'separator' },
        { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() },
    ]);
}

function buildTray() {
    if (!tray) {
        // 1x1 transparent PNG as placeholder — tray title does the visual work on macOS
        const img = nativeImage.createFromDataURL(
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII='
        );
        tray = new Tray(img);
        tray.setTitle('✦');
        tray.setToolTip('Keyboard Overlay');
    }
    tray.setContextMenu(buildTrayMenu());
}

function applySettings() {
    if (!win) return;
    win.setAlwaysOnTop(settings.alwaysOnTop, IS_MAC ? 'floating' : 'normal');
    win.setIgnoreMouseEvents(settings.clickThrough, { forward: true });
    win.webContents.send('settings-update', settings);
}

function createOverlay() {
    win = new BrowserWindow({
        width: 440, height: 240,
        transparent: true,
        frame: false,
        alwaysOnTop: settings.alwaysOnTop,
        hasShadow: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    win.loadFile('public/index.html');
    applySettings();
}

function createOnboarding() {
    const ob = new BrowserWindow({
        width: 520, height: 420,
        frame: true,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        },
    });
    ob.setMenuBarVisibility(false);
    ob.loadFile('onboarding/index.html');
    ob.on('closed', () => {
        settings.firstLaunch = false;
        saveSettings();
    });
}

// ── Logging ───────────────────────────────────────────────
let logPath;
function log(...args) {
    const line = `[${new Date().toISOString()}] ${args.join(' ')}\n`;
    console.log(...args);
    try { fs.appendFileSync(logPath, line); } catch (_) {}
}

// ── Input capture (uiohook-napi, runs in-process) ─────────
function startCapture() {
    const { uIOhook, UiohookKey } = require('uiohook-napi');

    const KEY_MAP = {
        [UiohookKey.ArrowUp]:    'UP',
        [UiohookKey.ArrowDown]:  'DOWN',
        [UiohookKey.ArrowLeft]:  'LEFT',
        [UiohookKey.ArrowRight]: 'RIGHT',
        [UiohookKey.W]: 'W', [UiohookKey.A]: 'A',
        [UiohookKey.S]: 'S', [UiohookKey.D]: 'D',
        [UiohookKey.Z]: 'Z', [UiohookKey.X]: 'X',
        [UiohookKey.C]: 'C', [UiohookKey.E]: 'E',
        [UiohookKey.R]: 'R', [UiohookKey.F]: 'F',
        [UiohookKey.Space]:      'SPACE',
        [UiohookKey.Shift]:      'SHIFT',
        [UiohookKey.ShiftRight]: 'SHIFT',
        [UiohookKey.Ctrl]:       'CTRL',
        [UiohookKey.CtrlRight]:  'CTRL',
    };

    uIOhook.on('keydown', e => {
        const key = KEY_MAP[e.keycode];
        if (key) win?.webContents.send('input-event', { type: 'keyDown', key });
    });

    uIOhook.on('keyup', e => {
        const key = KEY_MAP[e.keycode];
        if (key) win?.webContents.send('input-event', { type: 'keyUp', key });
    });

    try {
        uIOhook.start();
        log('uiohook started');
    } catch (e) {
        log('uiohook error:', e.message);
    }
}

// ── Context menu ──────────────────────────────────────────
function showContextMenu(sender) {
    buildTrayMenu().popup({ window: BrowserWindow.fromWebContents(sender) });
}

// ── App lifecycle ─────────────────────────────────────────
app.whenReady().then(() => {
    SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');
    logPath = path.join(app.getPath('userData'), 'debug.log');
    log('App started, packaged:', app.isPackaged);
    loadSettings();

    if (settings.firstLaunch) createOnboarding();
    createOverlay();
    startCapture();
    buildTray();

    // Global shortcut — toggle click-through even when window is non-interactive
    globalShortcut.register('CommandOrControl+Shift+T', () => {
        settings.clickThrough = !settings.clickThrough;
        saveSettings();
        applySettings();
    });

    autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => globalShortcut.unregisterAll());

// ── IPC ───────────────────────────────────────────────────
ipcMain.on('resize-window',    (_e, { width, height }) => win.setSize(width, height));
ipcMain.on('quit',             () => app.quit());
ipcMain.on('show-context-menu', (e) => showContextMenu(e.sender));
ipcMain.on('open-accessibility', () => {
    if (IS_MAC) shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
    else if (IS_WIN) shell.openExternal('ms-settings:privacy-generalizations');
});
ipcMain.on('open-input-monitoring', () => {
    if (IS_MAC) shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent');
});
ipcMain.handle('platform', () => process.platform);
ipcMain.on('open-url', (_e, url) => shell.openExternal(url));
