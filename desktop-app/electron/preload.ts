import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  version: process.versions.electron,
  platform: process.platform,
  closeWindow: () => ipcRenderer.send("close-window"),
});
