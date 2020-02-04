import React from 'react';

import { Menu, Button, Dimmer, Dropdown, Divider, Header, Segment, Icon, Modal, Grid, Image, List, Loader } from 'semantic-ui-react';
const _ = require('lodash');

const { ipcRenderer, remote } = require('electron');

let config = remote.getGlobal('config');

class Head extends React.Component {
  constructor() {
    super();
    this.state = {
      tempIndex: 0,
      denIndex: 0,
      game: -1,
      loading: false,
      link: '',
      activeDenMap: '',
      denMapData: {},
      maploading: false,
      seedSearching: false
    };
  }

  componentDidMount() {
    ipcRenderer.on('denloading', (event, data) => {
      this.setState({ loading: data });
    });

    ipcRenderer.on('denupdated', (event, data) => {
      if (!_.isEmpty(data)) {
        this.setState(
          {
            denIndex: this.state.tempIndex
          },
          () => {
            config.Config.Profile.den = this.state.denIndex;
            ipcRenderer.send('updateConfig');
            if (this.state.denIndex == 999) {
              this.setState({ link: data.Link });
            } else {
              this.setState({ link: `https://www.serebii.net/swordshield/maxraidbattles/den${this.state.tempIndex}.shtml` });
            }
          }
        );
      }
    });

    ipcRenderer.on('searchStarting', () => {
      this.setState({ seedSearching: true });
    });

    ipcRenderer.on('searchComplete', () => {
      this.setState({ seedSearching: false });
    });
    if (config.Config.Profile.game >= 0) {
      this.setState({ game: config.Config.Profile.game });
    }
    if (config.Config.Profile.den > 0) {
      ipcRenderer.send('updateDen', config.Config.Profile.den);
      this.setState({ tempIndex: config.Config.Profile.den });
    }
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('denloading');
    ipcRenderer.removeAllListeners('denupdated');
    ipcRenderer.removeAllListeners('searchStarting');
    ipcRenderer.removeAllListeners('searchComplete');
  }

  changeGame(e, element) {
    const game = element.value;
    this.setState({ game });
    config.Config.Profile.game = game;
    ipcRenderer.send('updateConfig');
    if (this.state.denIndex > 0) {
      ipcRenderer.send('updateDen', this.state.denIndex);
    }
  }

  changeDen(e, element) {
    const den = element.value;
    ipcRenderer.send('updateDen', den);
    this.setState({ tempIndex: den });
  }
  viewInBrowser(e, element) {
    if (this.state.link != '') {
      window.open(this.state.link, '_blank');
    }
  }

  selectDenMap(e, element) {
    if (this.state.maploading) return;
    this.setState({ maploading: true });
    this.setState({ activeDenMap: element.value, denMapData: element.data }, () => {
      this.updateDenMap();
    });
  }

  updateDenMap() {
    var img = document.getElementById('mapImg');
    var cnvs = document.getElementById('mapCanvas');
    if (cnvs === null) {
      cnvs = document.createElement('canvas');
      cnvs.id = 'mapCanvas';
      cnvs.width = 227;
      cnvs.height = 532;
      var seg = document.getElementById('mapForeground');
      //console.log('created');
      seg.appendChild(cnvs);
    }
    var ctx = cnvs.getContext('2d');
    ctx.clearRect(0, 0, cnvs.width, cnvs.height);

    if (this.state.activeDenMap != '') {
      ctx.beginPath();
      ctx.arc(this.state.denMapData.Location.x / 2, this.state.denMapData.Location.y / 2, 6, 0, 2 * Math.PI, false);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#FF0000';
      ctx.stroke();
    } else {
      ctx.lineWidth = 1.7;
      ctx.strokeStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.strokeText('Unknown Den Coordinates', 5, 300, 217);
    }

    this.setState({ maploading: false });
  }

  closeModal(e, element) {
    this.setState({ maploading: false, activeDenMap: '', denMapData: {} });
  }

  getHeadElement() {
    const gameOptions = ipcRenderer.sendSync('gameGetOptions').map((option, i) => ({
      key: i,
      text: option,
      value: i
    }));

    const denOptions = ipcRenderer.sendSync('getDenOptions').map((option, i) => ({
      key: i,
      text: option,
      value: option == 'Event Den' ? 999 : i + 1
    }));

    const gmaxIcon = <Image className="gmaxImage" ui centered floated="right" src="../assets/gmax_icon.png"></Image>;
    const denMapItems = ipcRenderer.sendSync('getDenMapOptions').map((option, i) => ({
      key: i,
      active: this.state.activeDenMap == (i + 1).toString(),
      header: `${i + 1}: ${option.Name}`,
      image: option.Gigantamax || false ? gmaxIcon : '',
      data: option,
      value: (i + 1).toString()
    }));
    const denLocationComment = this.state.denMapData.Comment || '';
    const denLocationModel =
      this.state.denMapData.ModelSword || '' != '' ? (
        <Image
          centered
          src={
            this.state.game == 0
              ? `../assets/3dModels/${this.state.denMapData.ModelSword}`
              : `../assets/3dModels/${this.state.denMapData.ModelShield}`
          }
        ></Image>
      ) : (
        ''
      );
    const denLocationData =
      this.state.activeDenMap == '' ? (
        ''
      ) : (
        <div>
          <Divider as="h4" horizontal>
            {this.state.denMapData.Name}
          </Divider>
          <Image src={this.state.denMapData.Image} />
          <Header sub>{denLocationComment}</Header>
          <Header as="h3" color="red" block>
            <Header.Content>Common Beam</Header.Content>
            <Header.Subheader>Den {this.state.denMapData.Common}</Header.Subheader>
          </Header>
          <Header as="h3" color="purple" block>
            <Header.Content>Rare Beam</Header.Content>
            <Header.Subheader>Den {this.state.denMapData.Rare}</Header.Subheader>
          </Header>
          {denLocationModel}
        </div>
      );

    return (
      <Menu className="main-menu" fixed="top">
        <Menu.Item header>Game Version</Menu.Item>
        <Menu.Item color="blue">
          <Dropdown
            disabled={this.state.loading || this.state.seedSearching}
            selection
            options={gameOptions}
            defaultValue={config.Config.Profile.game}
            onChange={this.changeGame.bind(this)}
            error={this.state.game < 0}
          />
        </Menu.Item>
        <Menu.Item header>Den</Menu.Item>
        <Menu.Item color="blue">
          <Dropdown
            disabled={this.state.loading || this.state.seedSearching || this.state.game < 0}
            selection
            options={denOptions}
            value={this.state.denIndex}
            onChange={this.changeDen.bind(this)}
            error={this.state.denIndex <= 0}
          />
        </Menu.Item>
        <Menu.Item>
          <Button color="blue" disabled={this.state.denIndex <= 0} icon labelPosition="left" onClick={this.viewInBrowser.bind(this)}>
            <Icon name="world" />
            View In Browser
          </Button>
        </Menu.Item>
        <Menu.Item>
          <Modal
            trigger={
              <Button icon labelPosition="left" disabled={this.state.game < 0}>
                <Icon name="map" />
                Den Map
              </Button>
            }
            onClose={this.closeModal.bind(this)}
            centered
            closeIcon
          >
            <Modal.Header>Den Map</Modal.Header>
            <Modal.Content>
              <Dimmer active={this.state.maploading}>
                <Loader active={this.state.maploading} inverted>
                  <Header as="h2" inverted color="blue">
                    Loading {this.state.denMapData.Name} Information...
                  </Header>
                </Loader>
              </Dimmer>
              <Grid columns={3} verticalAlign="top">
                <Grid.Column floated="left">
                  <Header as="h4" attached="top">
                    Locations:
                  </Header>
                  <Segment color="blue" attached textAlign="left" className="scrolling denmap-segment">
                    <List selection animated items={denMapItems} onItemClick={this.selectDenMap.bind(this)}></List>
                  </Segment>
                </Grid.Column>
                <Grid.Column>
                  <Header as="h4" attached="top">
                    Map:
                  </Header>
                  <Segment color="blue" className="scrolling denmap-segment-map" attached textAlign="center">
                    <div className="mapBlock">
                      <div className="mapBackground">
                        <img id="mapImg" src="../assets/map.png" width="227" height="532" />
                      </div>
                      <div id="mapForeground" className="mapForeground"></div>
                    </div>
                  </Segment>
                </Grid.Column>
                <Grid.Column floated="right">
                  <Header as="h4" attached="top">
                    Information:
                  </Header>
                  <Segment color="blue" className="scrolling denmap-segment" attached textAlign="center">
                    {denLocationData}
                  </Segment>
                </Grid.Column>
              </Grid>
            </Modal.Content>
          </Modal>
        </Menu.Item>
      </Menu>
    );
  }

  render() {
    const elementData = this.getHeadElement();
    return elementData;
  }
}

module.exports = Head;
