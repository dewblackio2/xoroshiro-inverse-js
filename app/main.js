const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const fs = require('fs-extra');
const storage = require('electron-json-storage');
const windowStateKeeper = require('electron-window-state');
const _ = require('lodash');
const Profile = require('./profile/Profile');
const DenLoader = require('./models/DenLoader');
const SearcherApp = require('./Seed Searcher/StaticMethods');

const path = require('path');
const url = require('url');

global.gMapping = require('./mapping');
global.appVersion = app.getVersion();
global.ActiveData = {
  f4ivs: [0, 0, 0, 0, 0, 0],
  is2v: false,
  f42NonFixed3: 0,
  f42NonFixed4: 0,
  consecutiveIvs: [],
  f5stars: 0,
  f5ivs: [0, 0, 0, 0, 0, 0],
  f6stars: 0,
  f6ivs: [0, 0, 0, 0, 0, 0],
  f4hidden: '',
  f4ability: '',
  f4gender: '',
  f4nature: '',
  f5hidden: '',
  f5ability: '',
  f5gender: '',
  f5nature: '',
  f6hidden: '',
  f6ability: '',
  f6gender: '',
  f6nature: '',
  econstant: 'ignore'
};

//let defaultFilePath = path.join(app.getAppPath(), `${app.getName()} Files`);
let defaultConfig = {
  Config: {
    App: { debug: false },
    Profile: { game: -1, den: -1 }
  }
};
let defaultConfigDetails = {
  App: {
    debug: { label: 'Show Debug Messages' }
  }
};

function createWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1250,
    defaultHeight: 950
  });

  global.win = new BrowserWindow({
    minWidth: 1250,
    minHeight: 950,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    acceptFirstMouse: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  global.mainWindowId = win.id;

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  mainWindowState.manage(win);

  win.webContents.on('new-window', (e, link, frameName) => {
    e.preventDefault();
    shell.openExternal(link);
  });

  win.webContents.on('did-fail-load', () => {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  });

  //win.webContents.openDevTools();
}

const profile = new Profile();
const denLoader = new DenLoader();
const searcherApp = new SearcherApp();

ipcMain.on('beginSearch', () => {
  searcherApp.startSearch(ActiveData);
});

ipcMain.on('stopSearch', () => {
  searcherApp.stopSearch();
});

ipcMain.on('logGetEntries', event => {
  event.returnValue = profile.getLogEntries();
});

ipcMain.on('loadGenderRatios', (event, data) => {
  denLoader.loadGenderRatios(data);
});

ipcMain.on('updateConfig', () => {
  storage.set('Config', config.Config, error => {
    if (error) throw error;
  });
});

ipcMain.on('validateFrame4', (event, data) => {
  win.webContents.send('validateFrame4', data);
});

ipcMain.on('validateFrame42', (event, data) => {
  win.webContents.send('validateFrame42', data);
});

ipcMain.on('validateFrame5', (event, data) => {
  win.webContents.send('validateFrame5', data);
});

ipcMain.on('validateFrame6', (event, data) => {
  win.webContents.send('validateFrame6', data);
});

ipcMain.on('ivsValidated', (event, data) => {
  win.webContents.send('ivsValidated', data);
});

ipcMain.on('finalizeDen', (event, data) => {
  denLoader.finalize(data);
});

ipcMain.on('updateDen', (event, data) => {
  denLoader.loadDen(data);
});

ipcMain.on('gameGetOptions', event => {
  event.returnValue = profile.getGameOptions();
});

ipcMain.on('getDenMapOptions', event => {
  event.returnValue = denLoader.getDenMapOptions();
});

ipcMain.on('getDenOptions', event => {
  event.returnValue = denLoader.getDenOptions();
});

ipcMain.on('getNatureOptions', event => {
  event.returnValue = profile.getNatureOptions();
});

ipcMain.on('getConfigLocation', event => {
  event.returnValue = {
    settings: app.getPath('userData')
  };
});

ipcMain.on('log', (event, data) => {
  profile.log(data);
});

function loadProfile() {
  config.Config.Profile = _.merge(profile.defaultConfig, config.Config.Profile);
}

app.on('ready', () => {
  storage.getAll((error, data) => {
    if (error) throw error;

    global.config = _.merge(defaultConfig, data);
    global.config.ConfigDetails = defaultConfigDetails;

    //fs.ensureDirSync(global.config.Config.App.filesPath);
    loadProfile();
    profile.log({ type: 'debug', source: 'App', message: 'App loaded successfully.' });
  });

  app.setAppUserModelId(process.execPath);
  createWindow();

  if (process.platform === 'darwin') {
    // Menu entries
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
          ]
        }
      ])
    );
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
