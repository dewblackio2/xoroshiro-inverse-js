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
        <p>~ Work in progress ~</p>
        <h1>FAQ:</h1>
        <p>~ Work in progress ~</p>
      </div>
    );
  }
}

module.exports = Help;
