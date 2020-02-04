const { app } = require('electron');
const EventEmitter = require('events');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const { spawn } = require('child_process');

class StaticMethods extends EventEmitter {
  constructor() {
    super();

    this.alwaysPrintBuffer = false;
    this.delayData = false;
    this.contentData = '';
    this.worker = null;
    this.stdout = [];
  }

  resolveAfterDuration(duration) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, duration);
    });
  }

  async tryWrite(data) {
    if (!this.worker.killed) {
      try {
        var newCleaned = this.contentData.split('\n');
        for (var i = 0; i < newCleaned.length - 1; i++) {
          this.print({ message: newCleaned[i] });
        }
        this.contentData = '';
        this.worker.stdin.write(`${data}\n`);
        this.print({ message: data });
        await this.resolveAfterDuration(1000);
        if (!this.worker.killed) {
          newCleaned = this.contentData.split('\n');
          for (var i = 0; i < newCleaned.length - 1; i++) {
            this.print({ message: newCleaned[i] });
          }
        }
        this.contentData = '';
      } catch (err) {}
    }
  }

  async startSearch(searchData) {
    this.clearStdout();
    this.contentData = '';
    this.alwaysPrintBuffer = false;
    this.delayData = false;
    this.worker = spawn('java', ['-jar', '.\\extraResources\\xoroshiroinverse.jar', '-o true', '-nojline'], {});
    this.worker.on('exit', code => {
      this.print({ message: 'Closed Operation' });
      this.worker.removeAllListeners('exit');
      this.worker.stdout.removeAllListeners('data');
    });
    this.worker.stdout.on('data', data => {
      var cleaned = _.toString(data);
      if (this.alwaysPrintBuffer && !this.delayData) {
        this.delayData = true;
        setTimeout(() => {
          var newCleaned = this.contentData.split('\n');
          if (newCleaned[0].includes('seed(s)')) {
            this.print({ message: 'Search complete!' });
            if (!this.worker.killed) {
              this.worker.kill();
            }
            win.webContents.send('searchComplete');
          } else {
            var checkString = newCleaned[0].includes('0x');
            if (checkString) {
              win.webContents.send('seedFound', newCleaned[0]);
            }
            for (var i = 0; i < newCleaned.length - 1; i++) {
              this.print({ message: newCleaned[i] });
            }
          }
          this.contentData = '';
          this.delayData = false;
        }, 2000);
      }
      this.contentData += cleaned;
    });

    win.webContents.send('searchStarting');

    var sendString = '';
    await this.resolveAfterDuration(500);
    sendString = `${searchData.f4ivs[0]} ${searchData.f4ivs[1]} ${searchData.f4ivs[2]} ${searchData.f4ivs[3]} ${searchData.f4ivs[4]} ${
      searchData.f4ivs[5]
    }`;
    await this.tryWrite(sendString);
    sendString = '';
    for (var i = 0; i < searchData.consecutiveIvs.length; i++) {
      sendString += searchData.consecutiveIvs[i];
      if (i + 1 != searchData.consecutiveIvs.length) {
        sendString += ' ';
      }
    }
    await this.tryWrite(sendString);
    sendString = `${searchData.f5stars}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f5ivs[0]} ${searchData.f5ivs[1]} ${searchData.f5ivs[2]} ${searchData.f5ivs[3]} ${searchData.f5ivs[4]} ${
      searchData.f5ivs[5]
    }`;
    await this.tryWrite(sendString);
    await this.tryWrite(sendString);
    sendString = `${searchData.f6stars}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f6ivs[0]} ${searchData.f6ivs[1]} ${searchData.f6ivs[2]} ${searchData.f6ivs[3]} ${searchData.f6ivs[4]} ${
      searchData.f6ivs[5]
    }`;
    await this.tryWrite(sendString);
    await this.tryWrite(sendString);

    sendString = `${searchData.f4hidden}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f4ability}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f4gender}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f4nature}`;
    await this.tryWrite(sendString);

    sendString = `${searchData.f5hidden}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f5ability}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f5gender}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f5nature}`;
    await this.tryWrite(sendString);

    sendString = `${searchData.f6hidden}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f6ability}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f6gender}`;
    await this.tryWrite(sendString);
    sendString = `${searchData.f6nature}`;
    await this.tryWrite(sendString);

    sendString = searchData.econstant;
    await this.tryWrite(sendString);
    this.alwaysPrintBuffer = true;
  }

  stopSearch() {
    if (this.worker != null) {
      if (!this.worker.killed) {
        this.worker.kill();
      }
      win.webContents.send('searchComplete');
    }
  }

  print(entry) {
    if (!entry) {
      return;
    }

    // add unique id for performance reasons
    entry.id = uuidv4();

    entry.date = new Date().toLocaleTimeString();
    this.stdout = [entry, ...this.stdout];

    win.webContents.send('searchupdated', this.stdout);
  }

  clearStdout() {
    this.stdout = [];
    win.webContents.send('searchupdated', this.stdout);
  }
}

module.exports = StaticMethods;
