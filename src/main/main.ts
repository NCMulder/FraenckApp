/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import ElectronGoogleOAuth2 from '@getstation/electron-google-oauth2';
import ElectronStore from 'electron-store';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import getOrders from './ordergetter';
import web from './google_keys.json';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate(arg));
});

ipcMain.handle('test-order', (event, arg) => {
  console.log('got get-orders');

  const store = new ElectronStore();
  const token: Credentials = store.get('token');

  // TODO: Check expiry date and get accordingly
  if (token === undefined || token.expiry_date < new Date()) {
    console.log('Token was expired or removed');
    const myApiOauth = new ElectronGoogleOAuth2(
      web.web.client_id,
      web.web.client_secret,
      ['https://www.googleapis.com/auth/gmail.readonly'],
      { successRedirectURL: 'https://fraenck.com' }
    );

    return myApiOauth
      .openAuthWindowAndGetTokens()
      .then(async (newToken) => {
        // use your token.access_token
        store.set('token', newToken);
        const orders = await getOrders(newToken);
        return orders;
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
  }

  const expiryDate = new Date(token.expiry_date!);
  console.log(expiryDate);
  return getOrders(token);
});

ipcMain.on('get-orders', async (event, arg) => {
  console.log('got get-orders');

  const store = new ElectronStore();
  const token: Credentials = store.get('token');

  // TODO: Check expiry date and get accordingly
  if (token === undefined || token.expiry_date < new Date()) {
    console.log('Token was expired or removed');
    const myApiOauth = new ElectronGoogleOAuth2(
      web.web.client_id,
      web.web.client_secret,
      ['https://www.googleapis.com/auth/gmail.readonly'],
      { successRedirectURL: 'https://fraenck.com' }
    );

    myApiOauth
      .openAuthWindowAndGetTokens()
      .then(async (newToken) => {
        // use your token.access_token
        store.set('token', newToken);
        const orders = await getOrders(newToken);
        event.reply('get-orders', orders);
      })
      .catch(console.log);
  } else {
    const expiryDate = new Date(token.expiry_date!);
    console.log(expiryDate);
    const orders = await getOrders(token);
    event.reply('get-orders', orders);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
