import React from 'react';
import { withRouter } from 'react-router-dom';

import { Segment, Menu, Icon, Button, Header } from 'semantic-ui-react';

import Head from '../components/Head';
import Logs from './Logs';
const { ipcRenderer, remote } = require('electron');
const appVersion = require('electron').remote.app.getVersion();

class Layout extends React.Component {
  constructor() {
    super();
    this.state = { activeItem: 'main', loading: false, compactMode: false, compactLogs: false, seedSearching: false };
    this.toggleCompactLogs = this.toggleCompactLogs.bind(this);
  }

  componentDidMount() {
    ipcRenderer.on('denloading', (event, data) => {
      this.setState({ loading: data });
    });

    ipcRenderer.on('searchStarting', () => {
      this.setState({ seedSearching: true });
    });

    ipcRenderer.on('searchComplete', () => {
      this.setState({ seedSearching: false });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('denloading');
    ipcRenderer.removeAllListeners('searchStarting');
    ipcRenderer.removeAllListeners('searchComplete');
  }

  navigate(path, name) {
    this.props.history.push(path);
    this.setState({ activeItem: name });
    if (name == 'main') {
      this.setState({ compactMode: false });
    } else {
      this.setState({ compactMode: true });
    }
  }

  navigateFromElement(e, element) {
    this.navigate(element['data-path'], element.name);
  }

  toggleCompactLogs() {
    this.setState({ compactLogs: !this.state.compactLogs });
  }

  render() {
    return (
      <div>
        {this.state.compactMode ? null : <Head />}

        <Menu fixed="left" vertical inverted width="thin" className={this.state.compactMode ? 'expanded side-menu' : 'side-menu'}>
          <Menu.Item
            disabled={this.state.loading || this.state.seedSearching}
            color="blue"
            name="main"
            link
            active={this.state.activeItem === 'main' || this.state.loading}
            data-path="/"
            onClick={this.navigateFromElement.bind(this)}
          >
            <Icon name="search" />
            Seed Searcher
          </Menu.Item>
          {/* <Menu.Item
            disabled={this.state.loading || this.state.seedSearching}
            name="settings"
            color="blue"
            link
            active={this.state.activeItem === 'settings' || this.state.loading}
            data-path="settings"
            onClick={this.navigateFromElement.bind(this)}
          >
            <Icon name="settings" />
            Settings
          </Menu.Item> */}
          <Menu.Item
            disabled={this.state.loading || this.state.seedSearching}
            color="blue"
            name="help"
            link
            active={this.state.activeItem === 'help' || this.state.loading}
            data-path="help"
            onClick={this.navigateFromElement.bind(this)}
          >
            <Icon name="help circle" />
            Help
          </Menu.Item>
          <span id="version" className={this.state.compactMode ? 'expanded' : ''}>
            v{appVersion}-alpha
          </span>
        </Menu>
        <div className={this.state.compactMode ? 'compacted Container' : 'Container'}>
          <Segment attached className="main-content">
            {this.props.children}
          </Segment>
          <Segment attached inverted className="bottom-logs-header">
            <Button compact inverted floated="right" icon={this.state.compactLogs ? 'caret up' : 'caret down'} onClick={this.toggleCompactLogs} />
            <div>
              <Header as="h2" inverted>
                Logs
              </Header>
            </div>
          </Segment>
          <Segment basic attached className={this.state.compactLogs ? 'compacted bottom-logs' : 'bottom-logs'}>
            <Logs />
          </Segment>
        </div>
      </div>
    );
  }
}

module.exports = withRouter(Layout);
