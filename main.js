const { app, BrowserWindow, ipcMain, Menu, globalShortcut, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');

const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

// Resolve python command: try python3 first, fall back to python
function pythonCommand() {
    const { spawnSync } = require('child_process');
    for (const cmd of ['python3', 'python', 'py']) {
        const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
        if (r.status === 0) return cmd;
    }
    return 'python3';
}

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

// ── Python capture ────────────────────────────────────────
function startCapture() {
    const py = spawn(pythonCommand(), [path.join(__dirname, 'capture.py')]);

    py.stdout.on('data', data => {
        data.toString().trim().split('\n').forEach(line => {
            try { win?.webContents.send('input-event', JSON.parse(line)); } catch (_) {}
        });
    });

    py.stderr.on('data', d => console.error('Python:', d.toString()));

    // Restart on crash
    py.on('close', code => {
        if (code !== 0) {
            console.warn('Python exited with code', code, '— restarting in 2s');
            setTimeout(startCapture, 2000);
        }
    });
}

// ── Context menu ──────────────────────────────────────────
function showContextMenu(sender) {
    Menu.buildFromTemplate([
        {
            label: 'Always on Top',
            type: 'checkbox', checked: settings.alwaysOnTop,
            click: () => { settings.alwaysOnTop = !settings.alwaysOnTop; saveSettings(); applySettings(); },
        },
        {
            label: 'Position Lock',
            type: 'checkbox', checked: settings.positionLock,
            click: () => { settings.positionLock = !settings.positionLock; saveSettings(); win.webContents.send('settings-update', settings); },
        },
        {
            label: IS_MAC ? 'Click Through  ⌘⇧T' : 'Click Through  Ctrl+Shift+T',
            type: 'checkbox', checked: settings.clickThrough,
            click: () => { settings.clickThrough = !settings.clickThrough; saveSettings(); applySettings(); },
        },
        { type: 'separator' },
        { label: 'Check for Updates', click: () => autoUpdater.checkForUpdatesAndNotify() },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() },
    ]).popup({ window: BrowserWindow.fromWebContents(sender) });
}

// ── App lifecycle ─────────────────────────────────────────
app.whenReady().then(() => {
    SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');
    loadSettings();

    if (settings.firstLaunch) createOnboarding();
    createOverlay();
    startCapture();

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
