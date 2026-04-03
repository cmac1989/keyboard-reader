const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onInputEvent:       (cb) => ipcRenderer.on('input-event',    (_e, d) => cb(d)),
    onSettingsUpdate:   (cb) => ipcRenderer.on('settings-update', (_e, s) => cb(s)),
    resizeWindow:       (size) => ipcRenderer.send('resize-window', size),
    showContextMenu:    ()     => ipcRenderer.send('show-context-menu'),
    openAccessibility:  ()     => ipcRenderer.send('open-accessibility'),
    openInputMonitoring:()     => ipcRenderer.send('open-input-monitoring'),
    quit:               ()     => ipcRenderer.send('quit'),
    platform:           ()     => ipcRenderer.invoke('platform'),
    openUrl:            (url)  => ipcRenderer.send('open-url', url),
});
