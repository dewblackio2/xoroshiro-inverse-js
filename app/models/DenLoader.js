const { app } = require('electron');
const EventEmitter = require('events');
const request = require('request');
const rp = require('request-promise-native');
const cheerio = require('cheerio');
class DenLoader extends EventEmitter {
  constructor() {
    super();
    this.dens = [];
    this.mapDens = [];
  }

  getDenOptions() {
    this.dens = [];
    const denList = gMapping.den;
    for (const k in denList) {
      const den = denList[k];
      this.dens.push(den);
    }
    return this.dens;
  }

  getDenMapOptions() {
    this.mapDens = [];
    const mapDenList = gMapping.mapDen;
    for (const k in mapDenList) {
      const mapDen = mapDenList[k];
      this.mapDens.push(mapDen);
    }
    return this.mapDens;
  }

  async loadDen(den) {
    win.webContents.send('denloading', true);
    var retData = {};
    const targetRoot = config.Config.Profile.game == 0 ? 2 : 14;
    //console.log(den);
    if (den != 999) {
      const testurl = `https://www.serebii.net/swordshield/maxraidbattles/den${den}.shtml`;
      request(testurl, (error, response, body) => {
        if (!error) {
          const $ = cheerio.load(body);
          const $table = $('#content > main > table.trainer > tbody');
          const title = $table.find(`tr:nth-child(${targetRoot}) > td > h2`).text();

          const $pokemonNames1 = $table.find(`tr:nth-child(${targetRoot + 2})`);
          const p1 = $pokemonNames1.find('td:nth-child(1) > a').text();
          const p2 = $pokemonNames1.find('td:nth-child(2) > a').text();
          const p3 = $pokemonNames1.find('td:nth-child(3) > a').text();
          const p4 = $pokemonNames1.find('td:nth-child(4) > a').text();
          const p5 = $pokemonNames1.find('td:nth-child(5) > a').text();
          const p6 = $pokemonNames1.find('td:nth-child(6) > a').text();
          const $pokemonNames2 = $table.find(`tr:nth-child(${targetRoot + 8})`);
          const p7 = $pokemonNames2.find('td:nth-child(1) > a').text();
          const p8 = $pokemonNames2.find('td:nth-child(2) > a').text();
          const p9 = $pokemonNames2.find('td:nth-child(3) > a').text();
          const p10 = $pokemonNames2.find('td:nth-child(4) > a').text();
          const p11 = $pokemonNames2.find('td:nth-child(5) > a').text();
          const p12 = $pokemonNames2.find('td:nth-child(6) > a').text();

          retData = {
            Title: title,
            Locations: [],
            P1: {
              Name: p1,
              Rarity: []
            },
            P2: {
              Name: p2,
              Rarity: []
            },
            P3: {
              Name: p3,
              Rarity: []
            },
            P4: {
              Name: p4,
              Rarity: []
            },
            P5: {
              Name: p5,
              Rarity: []
            },
            P6: {
              Name: p6,
              Rarity: []
            },
            P7: {
              Name: p7,
              Rarity: []
            },
            P8: {
              Name: p8,
              Rarity: []
            },
            P9: {
              Name: p9,
              Rarity: []
            },
            P10: {
              Name: p10,
              Rarity: []
            },
            P11: {
              Name: p11,
              Rarity: []
            },
            P12: {
              Name: p12,
              Rarity: []
            }
          };

          const $denLocations = $('#content > main > table.tab > tbody');
          for (let i = 1; i <= $denLocations.children().length; i++) {
            var $row = $(`#content > main > table.tab > tbody > tr:nth-child(${i})`);
            for (let j = 1; j <= $row.children().length; j++) {
              var $item = $(
                `#content > main > table.tab > tbody > tr:nth-child(${i}) > td:nth-child(${j}) > table > tbody > tr:nth-child(1) > td > a`
              );
              var $itemLoc = $(
                `#content > main > table.tab > tbody > tr:nth-child(${i}) > td:nth-child(${j}) > table > tbody > tr:nth-child(2) > td > a > img`
              ).attr('src');
              var parsedLoc = Number($itemLoc.replace(/\D/g, ''));
              $item.each(function(k, elem) {
                elem.children.forEach((child, k) => {
                  if (child.type == 'text') {
                    var cData = child.data;
                    cData.trim();
                    var $item2 = $item.find('i').text();
                    var beam = $item2 == 'Common (Red Beam)' ? 0 : 1;
                    retData.Locations.push({ Name: cData, Index: parsedLoc, Beam: beam });
                  }
                });
              });
            }
          }

          for (let i = 1; i < 13; i++) {
            const r =
              i < 7
                ? $table.find(`tr:nth-child(${targetRoot + 3}) > td:nth-child(${i}) > b`)
                : $table.find(`tr:nth-child(${targetRoot + 9}) > td:nth-child(${i - 6}) > b`);
            var elem = r.toArray()[0];
            var mainelem = elem.parent;
            mainelem.children.forEach((child, k) => {
              if (child.type == 'text') {
                var cData = child.data;
                cData.trim();
                var starCount = cData
                  .match(/☆/g)
                  .toString()
                  .replace(/,/g, '');
                if (starCount.length > 0) {
                  var percent = String(cData.replace(/\D/g, '') + '%');
                  retData[`P${i}`].Rarity.push({ Rate: percent, Stars: starCount });
                }
                //console.log(cData);
              }
            });
          }

          for (let i = 1; i < 13; i++) {
            var r =
              i < 7
                ? $table.find(`tr:nth-child(${targetRoot + 4}) > td:nth-child(${i}) > b`)
                : $table.find(`tr:nth-child(${targetRoot + 10}) > td:nth-child(${i - 6}) > b`);
            var elem = r.toArray()[0];
            var mainelem = elem.parent;
            mainelem.children.forEach((child, k) => {
              if (child.type == 'text') {
                var cData = child.data;
                cData.trim();
                if (!cData.includes('☆')) {
                  retData[`P${i}`].Ability = cData == 'Standard' ? 0 : 1;
                }
              }
            });
          }

          for (let i = 1; i < 13; i++) {
            if (i < 7) {
              var r = $table.find(`tr:nth-child(${targetRoot + 5}) > td:nth-child(${i}) > b`);
              var elem = r.toArray()[0];
              var mainelem = elem.parent;
              mainelem.children.forEach((child, k) => {
                if (child.type == 'text') {
                  var cData = child.data;
                  cData.trim();
                  var fixedIVs = cData.replace(/\D/g, '');
                  //console.log(fixedIVs);
                  retData[`P${i}`].Fixed = Number(fixedIVs);
                }
              });
            } else {
              var fixedAmount = 1;
              for (var rar in retData[`P${i}`].Rarity) {
                if (retData[`P${i}`].Rarity[rar].Stars.length > 4 && fixedAmount < 4) {
                  fixedAmount = 4;
                } else if (retData[`P${i}`].Rarity[rar].Stars.length > 3 && fixedAmount < 3) {
                  fixedAmount = 3;
                } else if (retData[`P${i}`].Rarity[rar].Stars.length > 2 && fixedAmount < 2) {
                  fixedAmount = 2;
                }
              }
              retData[`P${i}`].Fixed = fixedAmount;
            }
            // } else if (i == 7) {
            //   retData[`P${i}`].Fixed = 3;
            // } else {
            //   retData[`P${i}`].Fixed = 4;
            // }
          }
          win.webContents.send('denupdating', retData);
        } else {
          win.webContents.send('denupdated', {});
          win.webContents.send('denloading', false);
        }
      });
    } else {
      const testurl = 'https://www.serebii.net/swordshield/maxraidbattles/eventden-november2019.shtml';
      let eventLink = '';
      await rp(testurl, (error, response, body) => {
        if (!error) {
          //#content > main > div > form > div > select > option:nth-child(2)
          const $ = cheerio.load(body);
          const $denSelect = $('#content > main > div > form > div > select');
          eventLink = $denSelect.find(`option:nth-child(2)`).val();
          //console.log(eventLink);
        } else {
          win.webContents.send('denupdated', {});
          win.webContents.send('denloading', false);
        }
      }).then(() => {
        if (eventLink != '') {
          const eventUrl = `https://www.serebii.net${eventLink}`;
          request(eventUrl, (error, response, body) => {
            if (!error) {
              const $ = cheerio.load(body);
              //#content > main > table > tbody > tr:nth-child(1) > td > h1
              // const $denTitle = $('#content > main > table > tbody > tr:nth-child(1) > td').text();
              // console.log($denTitle);

              //#content > main > table > tbody > tr:nth-child(6) > td:nth-child(1) > b

              //#content > main > table > tbody > tr:nth-child(2) > td > h2
              //#content > main > table > tbody > tr:nth-child(28) > td > h2
              const $table = $('#content > main > table.trainer > tbody');
              const rowScale =
                $table
                  .find(`tr:nth-child(6) > td:nth-child(1) > b`)
                  .text()
                  .trim() == 'Level'
                  ? 0
                  : 1;
              const eventTargetRoot = targetRoot == 2 ? 2 : 28 + rowScale * 5;
              //#content > main > table > tbody > tr:nth-child(33) > td > h2
              const title = $table.find(`tr:nth-child(${eventTargetRoot}) > td > h2`).text();

              //#content > main > table > tbody > tr:nth-child(4) > td:nth-child(1) > a
              //#content > main > table > tbody > tr:nth-child(30) > td:nth-child(1) > a
              const $pokemonNames1 = $table.find(`tr:nth-child(${eventTargetRoot + 2})`);
              const p1 = $pokemonNames1.find('td:nth-child(1) > a').text();
              const p2 = $pokemonNames1.find('td:nth-child(2) > a').text();
              const p3 = $pokemonNames1.find('td:nth-child(3) > a').text();
              const p4 = $pokemonNames1.find('td:nth-child(4) > a').text();
              const p5 = $pokemonNames1.find('td:nth-child(5) > a').text();
              const p6 = $pokemonNames1.find('td:nth-child(6) > a').text();
              //#content > main > table > tbody > tr:nth-child(9) > td:nth-child(1) > a
              const $pokemonNames2 = $table.find(`tr:nth-child(${eventTargetRoot + 7 + rowScale})`);
              const p7 = $pokemonNames2.find('td:nth-child(1) > a').text();
              const p8 = $pokemonNames2.find('td:nth-child(2) > a').text();
              const p9 = $pokemonNames2.find('td:nth-child(3) > a').text();
              const p10 = $pokemonNames2.find('td:nth-child(4) > a').text();
              const p11 = $pokemonNames2.find('td:nth-child(5) > a').text();
              const p12 = $pokemonNames2.find('td:nth-child(6) > a').text();
              //#content > main > table > tbody > tr:nth-child(14) > td:nth-child(1) > a
              const $pokemonNames3 = $table.find(`tr:nth-child(${eventTargetRoot + 12 + rowScale * 2})`);
              const p13 = $pokemonNames3.find('td:nth-child(1) > a').text();
              const p14 = $pokemonNames3.find('td:nth-child(2) > a').text();
              const p15 = $pokemonNames3.find('td:nth-child(3) > a').text();
              const p16 = $pokemonNames3.find('td:nth-child(4) > a').text();
              const p17 = $pokemonNames3.find('td:nth-child(5) > a').text();
              const p18 = $pokemonNames3.find('td:nth-child(6) > a').text();
              //#content > main > table > tbody > tr:nth-child(19) > td:nth-child(1) > a
              const $pokemonNames4 = $table.find(`tr:nth-child(${eventTargetRoot + 17 + rowScale * 3})`);
              const p19 = $pokemonNames4.find('td:nth-child(1) > a').text();
              const p20 = $pokemonNames4.find('td:nth-child(2) > a').text();
              const p21 = $pokemonNames4.find('td:nth-child(3) > a').text();
              const p22 = $pokemonNames4.find('td:nth-child(4) > a').text();
              const p23 = $pokemonNames4.find('td:nth-child(5) > a').text();
              const p24 = $pokemonNames4.find('td:nth-child(6) > a').text();
              //#content > main > table > tbody > tr:nth-child(24) > td:nth-child(1) > a
              const $pokemonNames5 = $table.find(`tr:nth-child(${eventTargetRoot + 22 + rowScale * 4})`);
              const p25 = $pokemonNames5.find('td:nth-child(1) > a').text();
              const p26 = $pokemonNames5.find('td:nth-child(2) > a').text();
              const p27 = $pokemonNames5.find('td:nth-child(3) > a').text();
              const p28 = $pokemonNames5.find('td:nth-child(4) > a').text();
              const p29 = $pokemonNames5.find('td:nth-child(5) > a').text();
              const p30 = $pokemonNames5.find('td:nth-child(6) > a').text();

              retData = {
                Title: title,
                Link: eventUrl,
                P1: {
                  Name: p1,
                  Rarity: []
                },
                P2: {
                  Name: p2,
                  Rarity: []
                },
                P3: {
                  Name: p3,
                  Rarity: []
                },
                P4: {
                  Name: p4,
                  Rarity: []
                },
                P5: {
                  Name: p5,
                  Rarity: []
                },
                P6: {
                  Name: p6,
                  Rarity: []
                },
                P7: {
                  Name: p7,
                  Rarity: []
                },
                P8: {
                  Name: p8,
                  Rarity: []
                },
                P9: {
                  Name: p9,
                  Rarity: []
                },
                P10: {
                  Name: p10,
                  Rarity: []
                },
                P11: {
                  Name: p11,
                  Rarity: []
                },
                P12: {
                  Name: p12,
                  Rarity: []
                },
                P13: {
                  Name: p13,
                  Rarity: []
                },
                P14: {
                  Name: p14,
                  Rarity: []
                },
                P15: {
                  Name: p15,
                  Rarity: []
                },
                P16: {
                  Name: p16,
                  Rarity: []
                },
                P17: {
                  Name: p17,
                  Rarity: []
                },
                P18: {
                  Name: p18,
                  Rarity: []
                },
                P19: {
                  Name: p19,
                  Rarity: []
                },
                P20: {
                  Name: p20,
                  Rarity: []
                },
                P21: {
                  Name: p21,
                  Rarity: []
                },
                P22: {
                  Name: p22,
                  Rarity: []
                },
                P23: {
                  Name: p23,
                  Rarity: []
                },
                P24: {
                  Name: p24,
                  Rarity: []
                },
                P25: {
                  Name: p25,
                  Rarity: []
                },
                P26: {
                  Name: p26,
                  Rarity: []
                },
                P27: {
                  Name: p27,
                  Rarity: []
                },
                P28: {
                  Name: p28,
                  Rarity: []
                },
                P29: {
                  Name: p29,
                  Rarity: []
                },
                P30: {
                  Name: p30,
                  Rarity: []
                }
              };

              for (let i = 1; i < 6; i++) {
                //#content > main > table > tbody > tr:nth-child(5) > td:nth-child(1) > b
                //#content > main > table > tbody > tr:nth-child(31) > td:nth-child(1) > b
                //#content > main > table > tbody > tr:nth-child(10) > td:nth-child(1) > b
                //#content > main > table > tbody > tr:nth-child(15) > td:nth-child(1) > b
                var scale = eventTargetRoot + (i * 5 - 2);
                if (i != 1) {
                  scale += rowScale * (i - 1);
                }
                for (let j = 1; j < 7; j++) {
                  const r = $table.find(`tr:nth-child(${scale}) > td:nth-child(${j}) > b`);
                  var elem = r.toArray()[0];
                  var mainelem = elem.parent;
                  mainelem.children.forEach((child, k) => {
                    if (child.type == 'text') {
                      var cData = child.data;
                      cData.trim();
                      var starCount = cData
                        .match(/☆/g)
                        .toString()
                        .replace(/,/g, '');
                      if (starCount.length > 0) {
                        var percent = String(cData.replace(/\D/g, '') + '%');
                        var pkmnnum = (i - 1) * 6 + j;
                        retData[`P${pkmnnum}`].Rarity.push({ Rate: percent, Stars: starCount });
                        retData[`P${pkmnnum}`].Fixed = starCount.length;
                        retData[`P${pkmnnum}`].Ability = 1;
                      }
                      //console.log(cData);
                    }
                  });
                }
              }

              //console.log(retData);
              //TEMPORARY (change to denupdating with retData return)
              win.webContents.send('denupdating', retData);
            } else {
              win.webContents.send('denupdated', {});
              win.webContents.send('denloading', false);
            }
          });
        }
      });
    }
    //console.log(this.activeDen);
  }

  async loadGenderRatios(data) {
    var ret = '';
    win.webContents.send('resetGenderRatios', []);
    var counter = 0;
    for (var item in data) {
      counter++;
    }
    for (let i = 0; i < counter - 2; i++) {
      const pUrl = `https://www.serebii.net/pokedex-swsh/${data[`P${i + 1}`].Name.toLowerCase().replace(' ', '')}/`;
      await rp(pUrl, (error2, response2, body2) => {
        if (!error2) {
          const $2 = cheerio.load(body2);
          const $table2 = $2('#content > main > div:nth-child(2)');
          const numSearch = $table2.find('table:nth-child(4) > tbody > tr:nth-child(1) > td:nth-child(1)');
          var testNum = numSearch.text();
          var num = 4;
          if (testNum != 'Name') {
            num = 5;
          }
          // #content > main > div:nth-child(2) > table:nth-child(6)
          // #content > main > div:nth-child(2) > table:nth-child(6) > tbody > tr:nth-child(1) > td > b
          // let numConst = num + 1;
          // const testAbilities = $table2.find(`table:nth-child(${numConst}) > tbody > tr:nth-child(1) > td`).text();
          // console.log(testAbilities);
          // var cleaned1 = testAbilities
          //   .replace('Abilities: ', '')
          //   .trim()
          //   .split('-');

          // //var startIndex = 0;
          // var abilityLength = 0;
          // var scalar = 1;
          // var hasGalar = false;
          // var lastitem = -1;
          // var hasUniqueSpecification = false;
          // for (var item in cleaned1) {
          //   var itemNum = Number(item);
          //   var hold = cleaned1[item].toLowerCase();
          //   if (hold.includes('(galar')) {
          //     hasGalar = true;
          //   }
          //   if (
          //     hold.includes('(normal') ||
          //     hold.includes('(alola') ||
          //     hold.includes('(galar') ||
          //     hold.includes('(female)') ||
          //     hold.includes('(male)')
          //   ) {
          //     if (lastitem == -1) {
          //       lastitem = itemNum;
          //     }

          //     if (abilityLength == 0) {
          //       abilityLength = itemNum + 1;
          //       console.log('ability length updated' + ' ' + abilityLength);
          //     } else if (abilityLength != 0 && itemNum + 1 != abilityLength * scalar) {
          //       if (itemNum - lastitem < abilityLength) {
          //         hasUniqueSpecification = true;
          //         console.log('ability unique specifier detected');
          //       } else {
          //         console.log('error in calculating ability length');
          //       }
          //       //console.log('error in calculating ability length');
          //     }
          //     scalar++;
          //   }
          // }
          // var cleaned2 = [];
          // if (abilityLength > 0) {
          //   if (hasUniqueSpecification) {
          //     for (var i = 0; i < abilityLength; i++) {
          //       if (i < abilityLength - 1) {
          //         cleaned2.push(cleaned1[i]);
          //       } else {
          //         var hold = cleaned1[i].toLowerCase();
          //         var checkMethod = hasGalar ? hold.includes('(galar') : hold.includes('(normal');
          //         if (checkMethod) {
          //           cleaned2.push(cleaned1[i]);
          //         } else {
          //           cleaned2.push(cleaned1[i + 1]);
          //         }
          //       }
          //     }
          //   } else {
          //     for (var item in cleaned1) {
          //       var hold = cleaned1[item].toLowerCase();
          //       var checkMethod = hasGalar ? hold.includes('(galar') : hold.includes('(normal');
          //       if (checkMethod) {
          //         var start = Number(item) + 1 - abilityLength;
          //         for (var i = 0; i < abilityLength; i++) {
          //           cleaned2.push(cleaned1[start + i]);
          //         }
          //         break;
          //       } else if (hold.includes('(female)') || hold.includes('(male)')) {
          //         var start = Number(item) + 1 - abilityLength;
          //         var append = cleaned2.length > 0;
          //         for (var i = 0; i < abilityLength; i++) {
          //           if (append) {
          //             if (cleaned2[i] != cleaned1[start + i]) {
          //               cleaned2[i] = cleaned2[i] + ' / ' + cleaned1[start + i];
          //             }
          //           } else {
          //             cleaned2.push(cleaned1[start + i]);
          //           }
          //         }
          //         if (append) {
          //           break;
          //         }
          //       }
          //     }
          //   }
          // } else {
          //   for (var item in cleaned1) {
          //     cleaned2.push(cleaned1[item]);
          //   }
          // }

          // if (cleaned2[0].includes('(Red')) {
          //   cleaned2[0] = cleaned2[0] + cleaned2[1];
          //   cleaned2[2] = cleaned2[2] + cleaned2[3];
          //   cleaned2 = [cleaned2[0], cleaned2[2], cleaned2[4], cleaned2[5]];
          // } else if (cleaned2[2].includes('Psychic Surge')) {
          //   cleaned2[2] = 'Psychic Surge (Hidden Ability)';
          // }
          // var testoutput = '';
          // for (var item in cleaned2) {
          //   testoutput += cleaned2[item] + ' | ';
          // }
          // console.log(testoutput);

          const $pData = $table2.find(`table:nth-child(${num}) > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody`);
          const children = $pData.children().length;
          if (children == 0) {
            ret = 'None';
          } else {
            const maleRatio = $pData
              .find('tr:nth-child(1) > td:nth-child(2)')
              .text()
              .trim();
            const femaleRatio = $pData
              .find('tr:nth-child(2) > td:nth-child(2)')
              .text()
              .trim();
            if (maleRatio == '100%') {
              ret = 'Male';
            } else if (femaleRatio == '100%') {
              ret = 'Female';
            } else {
              ret = 'Both';
            }
          }
        } else {
          ret = 'Invalid';
        }

        win.webContents.send('genderRatioAdded', ret);
      });
    }
    win.webContents.send('genderRatiosLoaded');
  }

  finalize(data) {
    win.webContents.send('denupdated', data);
    win.webContents.send('denloading', false);
  }
}

module.exports = DenLoader;
