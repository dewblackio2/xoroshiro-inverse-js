import React from 'react';

import { Button, Checkbox, Grid, Header, Input, Form, Icon, Popup, Segment } from 'semantic-ui-react';

const { ipcRenderer, remote } = require('electron');

const { dialog } = remote;
let config = remote.getGlobal('config');

class Settings extends React.Component {
  constructor() {
    super();
    this.state = {
      filesPath: config.Config.App.filesPath
    };
  }

  openDialog(e) {
    e.preventDefault();
    dialog.showOpenDialog(
      {
        properties: ['openDirectory']
      },
      dirName => {
        if (dirName) {
          this.setState({ filesPath: dirName.toString() });
          config.Config.App.filesPath = dirName.toString();
          ipcRenderer.send('updateConfig');
        }
      }
    );
  }

  render() {
    const folderLocations = ipcRenderer.sendSync('getConfigLocation');
    return (
      <div>
        <Header as="h1">Settings</Header>
        <Header as="h4" attached="top">
          App
        </Header>
        <Segment attached>
          <Form>
            <Form.Input
              label="Files Path"
              action={<Button content="Change" onClick={this.openDialog.bind(this)} />}
              value={this.state.filesPath}
              readOnly
              fluid
            />
            <Form.Input label="Settings Path" defaultValue={folderLocations.settings} fluid readOnly />
          </Form>
        </Segment>
      </div>
    );
  }
}

module.exports = Settings;
