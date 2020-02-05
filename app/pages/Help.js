import React from 'react';
import { Image, Accordion, Icon, Table } from 'semantic-ui-react';

class Help extends React.Component {
  constructor() {
    super();
    this.state = { activeIndex: 0 };
  }

  handleAccordionClick(e, titleProps) {
    const { index } = titleProps;
    const newIndex = this.state.activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  }
  render() {
    const { activeIndex } = this.state;

    return (
      <div>
        <h1>Usage Instructions:</h1>
        <ol>
          <li>Select your game version</li>
          <li>Use the Den Map to find out what den number to use for search</li>
          <li>Select the den number the Den Map tells you to use depending on your beam color</li>
          <li>Allow the tool to retrieve all information for the selected den</li>
          <li>Input the information for the 1st 4th frame</li>
          <li>Validate your inputs using the validate button</li>
          <li>Select the 4th frame (2nd) tab and input the information required</li>
          <li>Validate your inputs using the validate button</li>
          <li>Select the 5th Frame tab and input the information required</li>
          <li>Select the 6th Frame tab and input the information required</li>
        </ol>
        <p>Enter the search tab, and begin searching.</p>
        <h1>What do I do with my den seed?</h1>
        <ul>
          <li>
            Use the{' '}
            <a href="https://github.com/Admiral-Fish/RaidFinder/releases" target="_blank">
              Raid Finder
            </a>{' '}
            to retrieve all the information about your den, and what pokemon will spawn on each frame.
          </li>
        </ul>
        <h1>FAQ:</h1>
        <Accordion>
          <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleAccordionClick.bind(this)}>
            <Icon name="dropdown" />
            Can I get banned for using this?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            The tool only calculates the den seed by brute forcing using the same random number generation the game uses to determine what dens
            contain certain information. This method of retrieving your den seed is largely undetectable and can only be detected if you are skipping
            your dates using the online ranked vs method. No reports of bans due to using this software have been reported.
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleAccordionClick.bind(this)}>
            <Icon name="dropdown" />
            What is a 'Frame' and how do I change it?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            A 'Frame' is a spawn inside your target den. Each frame can have different pokemon/ivs/abilities/shininess while only being limited to
            what the den is allowed to spawn. You can cycle your frames by using the Date Skip method. This works by clicking 'Invite Others' in the
            target den, pressing the home button, going into your system settings and changing the date 1 day forwards, then re-entering the game and
            cancelling the search. After doing that, you will have moved ahead 1 frame, and the den will contain either a different pokemon or maybe
            even the same pokemon but a different rarity, etc.
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleAccordionClick.bind(this)}>
            <Icon name="dropdown" />
            What if I find an issue?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            Please{' '}
            <a href="https://github.com/dewblackio2/xoroshiro-inverse-js" target="_blank">
              report it on <Icon name="github square" />
              Github
            </a>
            .
          </Accordion.Content>

          <Accordion.Title active={activeIndex === 3} index={3} onClick={this.handleAccordionClick.bind(this)}>
            <Icon name="dropdown" />
            How can I contribute?
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 3}>
            <p>
              If you can code, check out the repository on{' '}
              <a href="https://github.com/dewblackio2/xoroshiro-inverse-js" target="_blank">
                <Icon name="github square" />
                Github
              </a>{' '}
              and submit a pull request!
            </p>
          </Accordion.Content>
        </Accordion>
        <h1>Credit</h1>
        <p>A massive thank you to everyoine listed below</p>
        <Table celled inverted selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Credit</Table.HeaderCell>
              <Table.HeaderCell colSpan="2">Information</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Blaines</Table.Cell>
              <Table.Cell>
                Helped me out in a lot of ways. You can help him out by subscribing to his{' '}
                <a href="https://www.youtube.com/channel/UCO3HujUmguMy8Jawuq875Sg" target="_blank">
                  <Icon name="youtube square" />
                  Youtube Channel
                </a>{' '}
                or by joining his{' '}
                <a href="https://discord.gg/blaines" target="_blank">
                  <Icon name="discord" />
                  Discord Server
                </a>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Kioto</Table.Cell>
              <Table.Cell>For helping me keep motivation to finish this project, and testing very early builds of this project.</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Admiral-Fish</Table.Cell>
              <Table.Cell>
                For creating an amazing open-source tool to find den information and keeping it up to date.{' '}
                <a href="https://github.com/Admiral-Fish/RaidFinder" target="_blank">
                  <Icon name="github square" />
                  RaidFinder Github
                </a>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Serebii</Table.Cell>
              <Table.Cell>
                For all the information about every den and pokemon.{' '}
                <a href="https://www.serebii.net/pokedex-swsh/" target="_blank">
                  <Icon name="world" />
                  Serebii.net
                </a>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Pattirudon</Table.Cell>
              <Table.Cell>
                For the brains behind the tool, creating a java based seed searcher console app which allowed me to create this tool as a
                cross-platform representation.{' '}
                <a href="https://github.com/pattirudon/xoroshiro-inverse" target="_blank">
                  <Icon name="github square" />
                  Xoroshiro Inverse
                </a>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }
}

module.exports = Help;
