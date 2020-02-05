import React from 'react';

import { Header, Input, Form, Icon, Popup, Segment, Dropdown, Dimmer, Tab, Menu, Loader, Modal, Button } from 'semantic-ui-react';
import Frame from '../components/Frame';
import Searcher from '../components/Searcher';
const _ = require('lodash');
const { ipcRenderer, remote } = require('electron');

class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      activeDen: {},
      activeTab: 0,
      genderRatios: [],
      ivsValidated: false,
      fourthSecondValid: false,
      fifthValid: false,
      sixthValid: false,
      portalOpen: false,
      seedSearching: false
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', env => {
      if (this.state.portalOpen) {
        env.preventDefault();
      }
    });
    ipcRenderer.on('denupdating', (event, data) => {
      //console.log(data);
      this.setState({ activeTab: 0 });
      this.setState({ activeDen: data });
      ipcRenderer.send('loadGenderRatios', data);
    });
    ipcRenderer.on('resetGenderRatios', (event, data) => {
      this.setState({ genderRatios: data });
    });
    ipcRenderer.on('genderRatioAdded', (event, data) => {
      var newRatios = this.state.genderRatios;
      newRatios.push(data);
      this.setState({ genderRatios: newRatios });
    });
    ipcRenderer.on('genderRatiosLoaded', () => {
      this.appendGenderRatios();
    });
    ipcRenderer.on('denupdated', (event, data) => {
      if (_.isEmpty(data)) {
        ipcRenderer.send('log', { type: 'error', source: 'App', message: 'Error retrieving den information from serebii.net' });
      } else {
        this.setState({ activeDen: data });
        console.log(data);
      }
    });
    ipcRenderer.on('denloading', (event, data) => {
      this.setState({ loading: data });
    });

    ipcRenderer.on('validateFrame4', (event, data) => {
      this.setState({ ivsValidated: data[0] });
      if (data[0] == true) {
        //this.setState({ targetSecondIvs: data[1] });
        ipcRenderer.send('ivsValidated', [data[1], data[2], this.state.activeDen]);
      } else {
        this.setState({ fourthSecondValid: false, fifthValid: false, sixthValid: false });
      }
    });
    ipcRenderer.on('validateFrame42', (event, data) => {
      this.setState({ fourthSecondValid: data });
    });

    ipcRenderer.on('validateFrame5', (event, data) => {
      this.setState({ fifthValid: data });
    });

    ipcRenderer.on('validateFrame6', (event, data) => {
      this.setState({ sixthValid: data });
    });

    ipcRenderer.on('searchStarting', () => {
      this.setState({ seedSearching: true });
    });

    ipcRenderer.on('searchComplete', () => {
      this.setState({ seedSearching: false });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('denupdated');
    ipcRenderer.removeAllListeners('denloading');
    ipcRenderer.removeAllListeners('denupdating');
    ipcRenderer.removeAllListeners('resetGenderRatios');
    ipcRenderer.removeAllListeners('genderRatioAdded');
    ipcRenderer.removeAllListeners('genderRatiosLoaded');
    ipcRenderer.removeAllListeners('validateFrame4');
    ipcRenderer.removeAllListeners('validateFrame42');
    ipcRenderer.removeAllListeners('validateFrame5');
    ipcRenderer.removeAllListeners('validateFrame6');
    ipcRenderer.removeAllListeners('searchStarting');
    ipcRenderer.removeAllListeners('searchComplete');
    document.removeEventListener('keydown', env => {
      if (this.state.portalOpen) {
        env.preventDefault();
      }
    });
  }

  appendGenderRatios() {
    //console.log(this.state.genderRatios);
    //console.log(this.state.activeDen);

    var ret = this.state.activeDen;
    for (let i = 0; i < this.state.genderRatios.length; i++) {
      if (this.state.genderRatios[i] == 'Invalid') {
        ret = {};
        break;
      }
      ret[`P${i + 1}`].Gender = this.state.genderRatios[i];
    }
    //ret.P1.Gender = this.state.genderRatios[0];
    ipcRenderer.send('finalizeDen', ret);
  }

  closePortalCancel(e, element) {
    this.setState({ portalOpen: false });
  }

  closePortalReset(e, element) {
    this.setState({ portalOpen: false, activeTab: 0 });
  }

  tabChanged(e, element) {
    //console.log(element);
    if (element.activeIndex == 4) {
      ipcRenderer.send('toggleNavigation', true);
    } else if (this.state.activeTab == 4 && element.activeIndex != 4) {
      ipcRenderer.send('toggleNavigation', false);
    }
    if (this.state.ivsValidated && element.activeIndex == 0) {
      this.setState({ portalOpen: true });
    } else {
      this.setState({ activeTab: element.activeIndex });
    }
  }

  getTabPanes() {
    var ret = [
      { value: '4th Frame (1st)', index: 0, sub: "2 -> 3 Fixed IV's", minIv: 2, maxIv: 3, IVOnly: false },
      {
        value: '4th Frame (2nd)',
        index: 1,
        icon: this.state.fourthSecondValid ? 'check circle' : 'exclamation circle',
        iconColor: this.state.fourthSecondValid ? 'green' : 'red',
        sub: "3 -> 4 Fixed IV's",
        minIv: 3,
        maxIv: 4,
        IVOnly: true
      },
      {
        value: '5th Frame',
        index: 2,
        icon: this.state.fifthValid ? 'check circle' : 'exclamation circle',
        iconColor: this.state.fifthValid ? 'green' : 'red',
        sub: "1 -> 4 Fixed IV's",
        minIv: 1,
        maxIv: 4,
        IVOnly: false
      },
      {
        value: '6th Frame',
        index: 3,
        icon: this.state.sixthValid ? 'check circle' : 'exclamation circle',
        iconColor: this.state.sixthValid ? 'green' : 'red',
        sub: "1 -> 4 Fixed IV's",
        minIv: 1,
        maxIv: 4,
        IVOnly: false
      },
      {
        value: 'Search',
        index: 4,
        icon: 'search',
        iconColor: 'blue'
      }
    ];

    var panes = _.map(ret, val => {
      let mItemProps =
        val.index == 0 ? (
          <Menu.Item key={val.index} disabled={this.state.seedSearching} color="blue">
            {val.value}
          </Menu.Item>
        ) : val.index == 4 ? (
          //disabled={!this.state.ivsValidated || !this.state.fourthSecondValid || !this.state.fifthValid || !this.state.sixthValid}
          <Menu.Item
            key={val.index}
            disabled={!this.state.ivsValidated || !this.state.fourthSecondValid || !this.state.fifthValid || !this.state.sixthValid}
            color="blue"
          >
            <Icon name={val.icon} color={val.iconColor}></Icon>
            {val.value}
          </Menu.Item>
        ) : val.index == 1 ? (
          <Menu.Item disabled={!this.state.ivsValidated || this.state.seedSearching} key={val.index} color="blue">
            <Icon name={val.icon} color={val.iconColor}></Icon>
            {val.value}
          </Menu.Item>
        ) : (
          <Menu.Item disabled={!this.state.ivsValidated || !this.state.fourthSecondValid || this.state.seedSearching} key={val.index} color="blue">
            <Icon name={val.icon} color={val.iconColor}></Icon>
            {val.value}
          </Menu.Item>
        );
      let contentProps =
        val.index == 4 ? (
          <Searcher />
        ) : (
          <Frame index={val.index} title={val.value} subtitle={val.sub} min={val.minIv} max={val.maxIv} ivonly={val.IVOnly} Input={<Form />} />
        );
      return {
        menuItem: mItemProps,
        pane: {
          key: val.index,
          attached: false,
          style: {
            marginTop: 0,
            marginBottom: 0
          },
          content: contentProps
        }
      };
    });

    return panes;
  }

  render() {
    const panes = this.getTabPanes();
    return (
      <div>
        <Header as="h1" attached="top">
          Seed Searcher
        </Header>
        <Segment attached>
          <Dimmer page active={this.state.loading}>
            <Loader active={this.state.loading} inverted>
              <Header as="h2" inverted color="blue">
                Retrieving den information from Serebii.net...
              </Header>
            </Loader>
          </Dimmer>
          <Tab
            id="seedtab"
            activeIndex={this.state.activeTab}
            onTabChange={this.tabChanged.bind(this)}
            menu={{ fluid: true, vertical: true, tabular: true }}
            renderActiveOnly={false}
            panes={panes}
          />
          <Modal
            open={this.state.portalOpen}
            centered
            closeOnDimmerClick={false}
            closeOnDocumentClick={false}
            closeOnEscape={false}
            closeOnPortalMouseLeave={false}
          >
            <Modal.Header>Warning</Modal.Header>
            <Modal.Content>
              <p>Changing any values in the first 4th Frame will clear all other values in the seed searcher</p>
              <p>You will need to re-validate your IV's</p>
              <p></p>
              <p>Are you sure you want to continue?</p>

              <Button content="Cancel" positive onClick={this.closePortalCancel.bind(this)} />
              <Button content="Yes" negative onClick={this.closePortalReset.bind(this)} />
            </Modal.Content>
          </Modal>
        </Segment>
      </div>
    );
  }
}

module.exports = Main;
