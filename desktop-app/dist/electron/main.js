"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const WEB_URL = "https://sante-quebec.vercel.app";
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: "Santé Québec",
        backgroundColor: "#f8fafc",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
        },
    });
    electron_1.Menu.setApplicationMenu(null);
    win.loadURL(WEB_URL);
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("https://sante-quebec.vercel.app")) {
            return { action: "allow" };
        }
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
    win.webContents.on("before-input-event", (_event, input) => {
        if (input.key === "F12" && input.type === "keyDown") {
            win.webContents.toggleDevTools();
        }
        if (input.key === "r" && input.control && input.type === "keyDown") {
            win.webContents.reload();
        }
    });
    win.once("ready-to-show", () => win.show());
    return win;
}
electron_1.app.whenReady().then(() => {
    electron_1.ipcMain.on("close-window", () => {
        electron_1.BrowserWindow.getFocusedWindow()?.close();
    });
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
