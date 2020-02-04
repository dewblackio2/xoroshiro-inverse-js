import React from 'react';
const _ = require('lodash');

import { Form, Segment, Menu, Tab, Image, Checkbox, Label, TabPane, Message, Header, Divider, Portal, Button, Modal } from 'semantic-ui-react';

const { ipcRenderer, remote } = require('electron');

let activeData = remote.getGlobal('ActiveData');

class Frame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pokemon: [],
      stars: [],
      isValidated: false,
      hiddenAvilable: false,
      checkGender: false,
      hpiv: -1,
      atkiv: -1,
      defiv: -1,
      spatkiv: -1,
      spdefiv: -1,
      spdiv: -1,
      starsValue: -1,
      pokemonValue: -1,
      natureValue: '',
      abilityValue: '',
      // portalOpen: false,
      // validated: false,
      // validateElement: '',
      index: this.props.index,
      title: this.props.title,
      subtitle: this.props.subtitle,
      minIv: this.props.min,
      maxIv: this.props.max,
      onlyIVs: this.props.ivonly
    };

    this.Input = this.props.Input;
  }

  printState(e, element) {
    console.log(this.state);
  }

  validateGroup(e, element) {
    if (
      this.state.hpiv < 0 ||
      this.state.atkiv < 0 ||
      this.state.defiv < 0 ||
      this.state.spatkiv < 0 ||
      this.state.spdefiv < 0 ||
      this.state.spdiv < 0 ||
      this.state.pokemonValue < 0 ||
      this.state.starsValue < 0 ||
      (!this.state.onlyIVs && (this.state.natureValue == '' || this.state.abilityValue == ''))
    ) {
      ipcRenderer.send('log', {
        type: 'warning',
        source: `${this.state.title}`,
        name: 'Missing Inputs',
        message: 'Please fill out the missing inputs before attempting to validate.'
      });
    } else {
      if (this.state.index == 0) {
        var ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
        var is2v = false;
        var passing = true;
        var message = '';
        var p1Fixed = [255, 255, 255, 255, 255, 255];
        var p1FixedBackup = [255, 255, 255, 255, 255, 255];
        var p1NonFixed = [];
        var flags = [false, false];
        var fixedCount = 0;
        for (var j = 0; j < 6; j++) {
          if (ivs[j] == 31) {
            fixedCount++;
            p1Fixed[j] = 31;
            p1FixedBackup[j] = 31;
          } else {
            p1NonFixed.push(ivs[j]);
          }
        }
        switch (fixedCount) {
          case 3:
            is2v = false;
            //Check next frame allows for 4 Fixed Iv's
            var nextNonFixedCount = 0;
            var nextFixedCount = 3;
            for (var j = 0; j < 3; j++) {
              if (nextFixedCount >= 4) {
                break;
              }
              if (p1NonFixed[j] % 8 > 5 || p1Fixed[p1NonFixed[j] % 8] == 31) {
                nextNonFixedCount++;
              } else {
                p1Fixed[p1NonFixed[j] % 8] = 31;
                nextFixedCount++;
              }
            }

            if (nextNonFixedCount == 2 && nextFixedCount == 4) {
              flags[1] = true;
              //console.log('Next -> 4 Fixed Ivs');
              message = "Next -> 4 Fixed Iv's";
              //activeData.f4ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
              //activeData.is2v = is2v;
            } else {
              passing = false;
              //console.log('No Good');
              //activeData.f4ivs = [];
            }
            break;
          case 2:
            is2v = true;
            //Check next frame allows for 4 Fixed Iv's
            var nextNonFixedCount4 = 0;
            var nextFixedCount = 2;
            for (var j = 0; j < 4; j++) {
              if (nextFixedCount >= 4) {
                break;
              }
              if (p1NonFixed[j] % 8 > 5 || p1Fixed[p1NonFixed[j] % 8] == 31) {
                nextNonFixedCount4++;
              } else {
                p1Fixed[p1NonFixed[j] % 8] = 31;
                nextFixedCount++;
              }
            }

            if (nextFixedCount == 4 && (nextNonFixedCount4 == 1 || nextNonFixedCount4 == 2)) {
              flags[1] = true;
            }

            activeData.f42NonFixed4 = nextNonFixedCount4;

            //Check next frame allows for 3 Fixed Iv's
            var nextNonFixedCount3 = 0;
            nextFixedCount = 2;
            for (var j = 0; j < 4; j++) {
              if (nextFixedCount >= 3) {
                break;
              }
              if (p1NonFixed[j] % 8 > 5 || p1FixedBackup[p1NonFixed[j] % 8] == 31) {
                nextNonFixedCount3++;
              } else {
                p1FixedBackup[p1NonFixed[j] % 8] = 31;
                nextFixedCount++;
              }
            }
            if (nextFixedCount == 3 && nextNonFixedCount3 >= 1 && nextNonFixedCount3 <= 3) {
              flags[0] = true;
            }

            activeData.f42NonFixed3 = nextNonFixedCount3;

            if (flags[0] && flags[1]) {
              //console.log('Next -> 3 or 4 Fixed Ivs');
              message = "Next -> 3 or 4 Fixed Iv's";
              //activeData.f4ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
              //activeData.is2v = is2v;
            } else if (flags[1]) {
              //console.log('Next -> 4 Fixed Ivs');
              message = "Next -> 4 Fixed Iv's";
              //activeData.f4ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
              //activeData.is2v = is2v;
            } else if (flags[0]) {
              //console.log('Next -> 3 Fixed Ivs');
              message = "Next -> 3 Fixed Iv's";
              //activeData.f4ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
              //activeData.is2v = is2v;
            } else {
              //console.log('No Good!');
              passing = false;
              //activeData.f4ivs = [];
            }
            /*
          P2 3 Fixed Ivs: 
            switch num4
              1: [P1-NonFixed1st, P1-NonFixed2nd, P1-NonFixed3rd, P1-NonFixed4th, P2-NonFixed3rd]
              2: [P1-NonFixed1st, P1-NonFixed2nd, P1-NonFixed3rd, P1-NonFixed4th, P2-NonFixed2nd]
              3: [P1-NonFixed1st, P1-NonFixed2nd, P1-NonFixed3rd, P1-NonFixed4th, P2-NonFixed1st]
          P2 4 Fixed Ivs:
            switch num3
              1: [P1-NonFixed1st, P1-NonFixed2nd, P1-NonFixed3rd, P1-NonFixed4th, P2-NonFixed2nd]
              2: [P1-NonFixed1st, P1-NonFixed2nd, P1-NonFixed3rd, P1-NonFixed4th, P2-NonFixed1st]
          */

            break;
          default:
            passing = false;
            break;
        }

        if (passing) {
          activeData.f4ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
          activeData.is2v = is2v;
          activeData.f4hidden = this.state.hiddenAvilable ? 'y' : 'n';
          activeData.f4ability = this.state.abilityValue;
          activeData.f4gender = this.state.checkGender ? 'y' : 'n';
          activeData.f4nature = this.state.natureValue;
          ipcRenderer.send('log', {
            type: 'success',
            source: '4th frame (1st)',
            name: 'IV Validation',
            message: `IV's are valid! ${message}`
          });
          var targetMin = 3;
          var targetMax = 4;
          if (flags[0] && flags[1]) {
            targetMin = 3;
            targetMax = 4;
          } else if (flags[1]) {
            targetMin = 4;
            targetMax = 4;
          } else if (flags[0]) {
            targetMin = 3;
            targetMax = 3;
          }
          ipcRenderer.send('validateFrame4', [true, targetMin, targetMax]);
          this.setState({ isValidated: true });
          //console.log(activeData);
        } else {
          activeData.f4ivs = [];
          ipcRenderer.send('log', {
            type: 'error',
            source: '4th frame (1st)',
            name: 'IV Validation',
            message: "IV's are no good. Please refresh the den and try again!"
          });
          ipcRenderer.send('validateFrame4', [false, 3, 4]);
          this.setState({ isValidated: false });
        }
      } else if (this.state.index == 1) {
        var ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
        var passing = true;
        var p2NonFixed = [];
        var fixedCount = 0;
        for (var j = 0; j < 6; j++) {
          if (ivs[j] == 31) {
            fixedCount++;
          } else {
            p2NonFixed.push(ivs[j]);
          }
        }

        if (activeData.is2v) {
          if (fixedCount == 3) {
            if (activeData.f42NonFixed3 == 1) {
              activeData.consecutiveIvs = [p2NonFixed[2]];
            } else if (activeData.f42NonFixed3 == 2) {
              activeData.consecutiveIvs = [p2NonFixed[1]];
            } else if (activeData.f42NonFixed3 == 3) {
              activeData.consecutiveIvs = [p2NonFixed[0]];
            } else {
              passing = false;
              activeData.consecutiveIvs = [];
            }
          } else if (fixedCount == 4) {
            if (activeData.f42NonFixed4 == 1) {
              activeData.consecutiveIvs = [p2NonFixed[1]];
            } else if (activeData.f42NonFixed4 == 2) {
              activeData.consecutiveIvs = [p2NonFixed[0]];
            } else {
              passing = false;
              activeData.consecutiveIvs = [];
            }
          } else {
            passing = false;
            activeData.consecutiveIvs = [];
          }
        } else {
          if (fixedCount == 4) {
            activeData.consecutiveIvs = [p2NonFixed[0], p2NonFixed[1]];
          } else {
            passing = false;
            activeData.consecutiveIvs = [];
          }
        }

        if (passing) {
          ipcRenderer.send('log', {
            type: 'success',
            source: '4th frame (2nd)',
            name: 'Consecutive IV Validation',
            message: "Consecutive IV's are valid!"
          });
          ipcRenderer.send('validateFrame42', true);
          this.setState({ isValidated: true });
        } else {
          ipcRenderer.send('log', {
            type: 'error',
            source: '4th frame (2nd)',
            name: 'Consecutive IV Validation',
            message: "Consecutive IV's are not valid. Please ensure you entered everything correctly!"
          });
          ipcRenderer.send('validateFrame42', false);
          this.setState({ isValidated: false });
        }
      }
    }
  }

  componentDidMount() {
    ipcRenderer.on('denupdated', (event, data) => {
      if (!_.isEmpty(data)) {
        this.setState({
          hiddenAvilable: false,
          checkGender: false,
          pokemonValue: -1,
          natureValue: '',
          abilityValue: '',
          hpiv: -1,
          atkiv: -1,
          defiv: -1,
          spatkiv: -1,
          spdefiv: -1,
          spdiv: -1,
          starsValue: -1
        });
        document.getElementById(`hpiv${this.state.index}`).value = '';
        document.getElementById(`atkiv${this.state.index}`).value = '';
        document.getElementById(`defiv${this.state.index}`).value = '';
        document.getElementById(`spatkiv${this.state.index}`).value = '';
        document.getElementById(`spdefiv${this.state.index}`).value = '';
        document.getElementById(`spdiv${this.state.index}`).value = '';
        ipcRenderer.send('validateFrame4', [false, 3, 4]);
        this.setState({ isValidated: false });
        this.updatePokemon(data);
      }
    });
    ipcRenderer.on('ivsValidated', (event, data) => {
      if (this.state.index > 0 && this.state.index < 4) {
        //console.log('reached');
        this.setState({
          hiddenAvilable: false,
          checkGender: false,
          pokemonValue: -1,
          natureValue: '',
          abilityValue: '',
          hpiv: -1,
          atkiv: -1,
          defiv: -1,
          spatkiv: -1,
          spdefiv: -1,
          spdiv: -1,
          starsValue: -1
        });
        if (this.state.index == 1) {
          this.setState({ minIv: data[0], maxIv: data[1] });
          //subtitle: `${data[0]} Fixed IV's`
          if (data[0] != data[1]) {
            this.setState({ subtitle: `${data[0]} -> ${data[1]} Fixed IV's` });
          } else {
            this.setState({ subtitle: `${data[0]} Fixed IV's` });
          }
        }
        document.getElementById(`hpiv${this.state.index}`).value = '';
        document.getElementById(`atkiv${this.state.index}`).value = '';
        document.getElementById(`defiv${this.state.index}`).value = '';
        document.getElementById(`spatkiv${this.state.index}`).value = '';
        document.getElementById(`spdefiv${this.state.index}`).value = '';
        document.getElementById(`spdiv${this.state.index}`).value = '';
        //console.log(this.state.minIv);
        //console.log(this.state.maxIv);
        this.updatePokemon(data[2]);
      }
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('denupdated');
    ipcRenderer.removeAllListeners('ivsValidated');
  }

  updatePokemon(data) {
    var pkmn = [];
    var counter = 0;
    for (var item in data) {
      counter++;
    }
    //console.log(counter);
    for (let i = 0; i < counter - 2; i++) {
      if (data[`P${i + 1}`].Fixed < this.state.minIv || data[`P${i + 1}`].Fixed > this.state.maxIv) {
        continue;
      }
      var stars = [];
      var rarity = '';
      var rarityLength = data[`P${i + 1}`].Rarity.length;
      //console.log(rarityLength);
      for (let j = 0; j < rarityLength; j++) {
        rarity += data[`P${i + 1}`].Rarity[j].Stars + ': ' + data[`P${i + 1}`].Rarity[j].Rate;

        stars.push({
          Name: data[`P${i + 1}`].Rarity[j].Stars,
          Count: data[`P${i + 1}`].Rarity[j].Stars.length
        });
        if (j + 1 != rarityLength) {
          rarity += ' | ';
        }
      }

      stars = stars.map((val, i) => ({
        key: i,
        value: val.Count,
        text: val.Name
      }));

      var ivString = data[`P${i + 1}`].Fixed > 1 ? " Fixed IV's" : ' Fixed IV';

      var addition = {
        Name: data[`P${i + 1}`].Name,
        Fixed: data[`P${i + 1}`].Fixed + ivString,
        Stars: stars,
        Rarity: rarity,
        Ability: data[`P${i + 1}`].Ability,
        Gender: data[`P${i + 1}`].Gender
      };

      var shouldAdd = true;
      for (var pkm in pkmn) {
        if (
          pkmn[pkm].Name == addition.Name &&
          pkmn[pkm].Fixed == addition.Fixed &&
          pkmn[pkm].Ability == addition.Ability &&
          pkmn[pkm].Gender == addition.Gender
        ) {
          if (pkmn[pkm].Rarity == addition.Rarity) {
            shouldAdd = false;
            break;
          } else if (counter > 14 && addition.Stars.length == 1 && pkmn[pkm].Stars.length == 1) {
            var parsedRateCheck = Number(pkmn[pkm].Rarity.replace(/\D/g, ''));
            var parsedRateCurrent = Number(addition.Rarity.replace(/\D/g, ''));
            if (parsedRateCheck > parsedRateCurrent) {
              pkmn[pkm].Name = '[G-MAX] ' + pkmn[pkm].Name;
            } else if (parsedRateCheck < parsedRateCurrent) {
              addition.Name = '[G-MAX] ' + addition.Name;
            }
          }
        }
      }
      if (shouldAdd) {
        pkmn.push(addition);
      }
    }
    if (!_.isEmpty(pkmn)) {
      pkmn = pkmn.map((val, i) => ({
        key: i,
        ability: val.Ability,
        gender: val.Gender,
        stars: val.Stars,
        text: val.Name + ' (' + val.Fixed + ')',
        description: val.Rarity,
        value: i
      }));
      this.setState({ pokemon: pkmn }, () => {
        this.setState({ starsValue: -1 });
        if (this.state.pokemonValue != -1) {
          this.setState({ hiddenAvilable: this.state.pokemon[this.state.pokemonValue].ability == 1 });
          this.setState({ checkGender: this.state.pokemon[this.state.pokemonValue].gender == 'Both' });
          this.setState({ stars: this.state.pokemon[this.state.pokemonValue].stars });
        } else {
          this.setState({ stars: [] });
        }
      });
    }
  }

  changePokemon(e, element) {
    if (this.state.index == 0) {
      ipcRenderer.send('validateFrame4', [false, 3, 4]);
      this.setState({ isValidated: false });
    }
    var available = this.state.pokemon[element.value].ability;
    var check = this.state.pokemon[element.value].gender;
    this.setState({ hiddenAvilable: available == 1 }, () => {
      if (this.state.hiddenAvilable) {
        if (this.state.abilityValue == 'ignore') {
          this.setState({ abilityValue: 'ordinary' });
        }
      } else if (!this.state.hiddenAvilable) {
        if (this.state.abilityValue == 'ordinary') {
          this.setState({ abilityValue: 'ignore' });
        } else if (this.state.abilityValue == 'hidden') {
          this.setState({ abilityValue: '' });
        }
      }
    });
    this.setState({ checkGender: check == 'Both' });
    this.setState({ pokemonValue: element.value }, () => {
      this.setState({ starsValue: -1, stars: this.state.pokemon[this.state.pokemonValue].stars });
      this.changeValidity();
    });
  }

  changeNature(e, element) {
    if (this.state.index == 0) {
      ipcRenderer.send('validateFrame4', [false, 3, 4]);
      this.setState({ isValidated: false });
    }
    this.setState({ natureValue: element.value }, () => {
      this.changeValidity();
    });
  }

  changeStars(e, element) {
    if (this.state.index == 0) {
      ipcRenderer.send('validateFrame4', [false, 3, 4]);
      this.setState({ isValidated: false });
    }
    this.setState({ starsValue: element.value }, () => {
      this.changeValidity();
    });
  }

  changeAbility(e, element) {
    var val = element.value;
    if (this.state.index == 0) {
      ipcRenderer.send('validateFrame4', [false, 3, 4]);
      this.setState({ isValidated: false });
    }
    if (this.state.hiddenAvilable) {
      if (element.value == 'ignore') {
        val = 'ordinary';
      }
    }
    this.setState({ abilityValue: val }, () => {
      this.changeValidity();
    });
  }

  onNumberKeyDown(e) {
    if (
      !(
        (e.keyCode > 95 && e.keyCode < 106) ||
        (e.keyCode > 47 && e.keyCode < 58) ||
        e.keyCode == 8 ||
        (e.keyCode > 36 && e.keyCode < 41) ||
        e.keyCode == 9
      )
    ) {
      e.preventDefault();
    }
  }

  parseIV(val) {
    if (val == '') {
      val = 0;
    } else {
      val = _.round(val, 0);
      if (val > 31) {
        val = 31;
      } else if (val < 0) {
        val = 0;
      }
    }
    return _.toString(val);
  }

  setIv(val, id) {
    var newVal = parseInt(this.parseIV(val), 10);
    document.getElementById(id).value = newVal;
    var parsedId = id.replace(/[0-9]/g, '');
    switch (parsedId) {
      case 'hpiv':
        this.setState({ hpiv: newVal }, () => {
          this.changeValidity();
        });
        break;
      case 'atkiv':
        this.setState({ atkiv: newVal }, () => {
          this.changeValidity();
        });
        break;
      case 'defiv':
        this.setState({ defiv: newVal }, () => {
          this.changeValidity();
        });
        break;
      case 'spatkiv':
        this.setState({ spatkiv: newVal }, () => {
          this.changeValidity();
        });
        break;
      case 'spdefiv':
        this.setState({ spdefiv: newVal }, () => {
          this.changeValidity();
        });
        break;
      case 'spdiv':
        this.setState({ spdiv: newVal }, () => {
          this.changeValidity();
        });
        break;
    }
  }

  changeIV(e, element) {
    if (this.state.index == 0) {
      ipcRenderer.send('validateFrame4', [false, 3, 4]);
      this.setState({ isValidated: false });
    }
    this.setIv(element.value, element.id);
  }

  changeValidity() {
    if (this.state.index > 0 && this.state.index < 4) {
      var event = 'validateFrame';
      switch (this.state.index) {
        case 1:
          event += '42';
          break;
        case 2:
          event += '5';
          break;
        case 3:
          event += '6';
          break;
      }
      if (
        this.state.pokemonValue != -1 &&
        this.state.hpiv != -1 &&
        this.state.atkiv != -1 &&
        this.state.defiv != -1 &&
        this.state.spatkiv != -1 &&
        this.state.spdefiv != -1 &&
        this.state.spdiv != -1 &&
        this.state.starsValue != -1
      ) {
        if (this.state.onlyIVs) {
          ipcRenderer.send(event, false);
          this.setState({ isValidated: false });
        } else {
          if (this.state.natureValue != '' && this.state.abilityValue != '') {
            ipcRenderer.send(event, true);
            if (this.state.index == 2) {
              activeData.f5stars = this.state.starsValue;
              activeData.f5ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
              activeData.f5hidden = this.state.hiddenAvilable ? 'y' : 'n';
              activeData.f5ability = this.state.abilityValue;
              activeData.f5gender = this.state.checkGender ? 'y' : 'n';
              activeData.f5nature = this.state.natureValue;
            } else if (this.state.index == 3) {
              activeData.f6stars = this.state.starsValue;
              activeData.f6ivs = [this.state.hpiv, this.state.atkiv, this.state.defiv, this.state.spatkiv, this.state.spdefiv, this.state.spdiv];
              activeData.f6hidden = this.state.hiddenAvilable ? 'y' : 'n';
              activeData.f6ability = this.state.abilityValue;
              activeData.f6gender = this.state.checkGender ? 'y' : 'n';
              activeData.f6nature = this.state.natureValue;
            }
          } else {
            ipcRenderer.send(event, false);
          }
        }
      } else {
        ipcRenderer.send(event, false);
        if (this.state.index == 1) {
          this.setState({ isValidated: false });
        }
      }
    }
  }

  getInputElement() {
    const natures = ipcRenderer.sendSync('getNatureOptions').map((option, i) => ({
      key: i,
      text: option,
      value: option
    }));

    const abilities = [
      {
        key: 0,
        text: 'Ability 1',
        value: '0'
      },
      {
        key: 1,
        text: 'Ability 2',
        value: '1'
      },
      {
        key: 2,
        text: 'Can only have 1 ability',
        value: 'ignore'
      }
    ];

    if (this.state.hiddenAvilable) {
      abilities.push({
        key: 3,
        text: 'Hidden Ability',
        value: 'hidden'
      });
      abilities[2].value = 'ordinary';
    }

    switch (this.Input.type.name) {
      case 'Form':
        let subcontent = this.state.onlyIVs ? (
          ''
        ) : (
          <Form.Field>
            <Form.Dropdown
              fluid
              label="Nature"
              selection
              options={natures}
              value={this.state.natureValue}
              onChange={this.changeNature.bind(this)}
              error={this.state.natureValue == ''}
            />
            <Form.Dropdown
              fluid
              label="Ability"
              error={this.state.abilityValue == ''}
              selection
              options={abilities}
              value={this.state.abilityValue}
              onChange={this.changeAbility.bind(this)}
            />
            <Segment>
              <Form.Group widths={2}>
                <Form.Checkbox label="Can Have HA" disabled checked={this.state.hiddenAvilable} />
                <Form.Checkbox label="Check Gender" disabled checked={this.state.checkGender} />
              </Form.Group>
            </Segment>
          </Form.Field>
        );

        let validateButton =
          this.state.index <= 1 ? (
            <Button disabled={this.state.isValidated} floated="right" color="green" onClick={this.validateGroup.bind(this)}>
              Validate
            </Button>
          ) : (
            ''
          );

        return (
          <Form {...this.Input.props}>
            <Header as="h4" attached="top">
              {this.state.title}
            </Header>
            <Segment attached>
              <Label size="large" color="blue" ribbon>
                {this.state.subtitle}
              </Label>
              {validateButton}
              {/* <Button compact floated="right" label="print state" onClick={this.printState.bind(this)} /> */}
              <Divider horizontal />
              <Form.Field>
                <Header as="h4" attached="top">
                  Individual Values
                </Header>
                <Segment attached>
                  <Form.Group widths={3}>
                    <Form.Input
                      label="HP"
                      id={'hpiv' + this.state.index}
                      error={this.state.hpiv < 0}
                      min={0}
                      max={31}
                      type="number"
                      placeholder="0-31"
                      onChange={this.changeIV.bind(this)}
                      onKeyDown={this.onNumberKeyDown.bind(this)}
                    />
                    <Form.Input
                      label="Attack"
                      id={'atkiv' + this.state.index}
                      error={this.state.atkiv < 0}
                      min={0}
                      max={31}
                      type="number"
                      placeholder="0-31"
                      onChange={this.changeIV.bind(this)}
                      onKeyDown={this.onNumberKeyDown.bind(this)}
                    />
                    <Form.Input
                      label="Defense"
                      id={'defiv' + this.state.index}
                      error={this.state.defiv < 0}
                      min={0}
                      max={31}
                      type="number"
                      placeholder="0-31"
                      onChange={this.changeIV.bind(this)}
                      onKeyDown={this.onNumberKeyDown.bind(this)}
                    />
                  </Form.Group>
                  <Form.Group widths={3}>
                    <Form.Input
                      label="Sp. Attack"
                      id={'spatkiv' + this.state.index}
                      error={this.state.spatkiv < 0}
                      min={0}
                      max={31}
                      type="number"
                      placeholder="0-31"
                      onChange={this.changeIV.bind(this)}
                      onKeyDown={this.onNumberKeyDown.bind(this)}
                    />
                    <Form.Input
                      label="Sp. Defense"
                      id={'spdefiv' + this.state.index}
                      error={this.state.spdefiv < 0}
                      min={0}
                      max={31}
                      type="number"
                      placeholder="0-31"
                      onChange={this.changeIV.bind(this)}
                      onKeyDown={this.onNumberKeyDown.bind(this)}
                    />
                    <Form.Input
                      label="Speed"
                      id={'spdiv' + this.state.index}
                      error={this.state.spdiv < 0}
                      min={0}
                      max={31}
                      type="number"
                      placeholder="0-31"
                      onChange={this.changeIV.bind(this)}
                      onKeyDown={this.onNumberKeyDown.bind(this)}
                    />
                  </Form.Group>
                </Segment>
                <Header as="h4" attached="top">
                  Parameters
                </Header>
                <Segment attached>
                  <Form.Group>
                    <Form.Dropdown
                      id={'pokemon' + this.state.index}
                      width={12}
                      fluid
                      label="Pokemon"
                      error={this.state.pokemonValue < 0}
                      selection
                      value={this.state.pokemonValue}
                      options={this.state.pokemon}
                      onChange={this.changePokemon.bind(this)}
                    />
                    <Form.Dropdown
                      id={'stars' + this.state.index}
                      width={4}
                      fluid
                      label="Stars"
                      error={this.state.starsValue < 0}
                      selection
                      value={this.state.starsValue}
                      options={this.state.stars}
                      onChange={this.changeStars.bind(this)}
                    />
                  </Form.Group>
                  {subcontent}
                </Segment>
              </Form.Field>
            </Segment>
          </Form>
        );
    }
  }

  render() {
    const element = this.getInputElement();
    return element;
  }
}

module.exports = Frame;
