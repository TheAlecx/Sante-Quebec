import { app, BrowserWindow, shell, Menu, ipcMain } from "electron";

const WEB_URL = "https://sante-quebec.vercel.app";

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
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

  Menu.setApplicationMenu(null);
  win.loadURL(WEB_URL);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://sante-quebec.vercel.app")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
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

app.whenReady().then(() => {
  ipcMain.on("close-window", () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
