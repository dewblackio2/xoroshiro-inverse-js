const { app } = require('electron');
const EventEmitter = require('events');
const uuidv4 = require('uuid/v4');

class Profile extends EventEmitter {
  constructor() {
    super();
    this.games = [];
    this.natures = [];
    this.logEntries = [];
    this.defaultConfig = {
      game: 0
    };
  }
  getGameOptions() {
    this.games = [];
    const games = gMapping.game;
    for (const k in games) {
      const version = games[k];
      this.games.push(version);
    }
    return this.games;
  }

  getNatureOptions() {
    this.natures = [];
    const natures = gMapping.nature;
    for (const k in natures) {
      const nature = natures[k];
      this.natures.push(nature);
    }
    return this.natures;
  }

  log(entry) {
    if (!entry) {
      return;
    }

    // add unique id for performance reasons
    entry.id = uuidv4();

    entry.date = new Date().toLocaleTimeString();
    this.logEntries = [entry, ...this.logEntries];

    // const maxLogEntries = parseInt(config.Config.App.maxLogEntries) || 0;
    // if (this.logEntries.length > maxLogEntries && maxLogEntries !== 0) {
    //   this.logEntries.pop();
    // }

    win.webContents.send('logupdated', this.logEntries);
  }

  getLogEntries() {
    return this.logEntries;
  }

  clearLogs() {
    this.logEntries = [];
    win.webContents.send('logupdated', this.logEntries);
  }
}

module.exports = Profile;
