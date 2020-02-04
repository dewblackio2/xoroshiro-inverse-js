import React from 'react';
import { Form, Segment, Label, Header, Loader, Button, Feed } from 'semantic-ui-react';
const { ipcRenderer, remote } = require('electron');

class Searcher extends React.Component {
  constructor() {
    super();
    this.state = { entries: [], searching: false, loading: false, seeds: [] };
  }

  componentDidMount() {
    ipcRenderer.on('searchupdated', (event, message) => {
      this.update(message);
    });
    ipcRenderer.on('searchComplete', () => {
      this.setState({ searching: false, loading: false });
    });

    ipcRenderer.on('searchStarting', () => {
      this.setState({ searching: true, loading: false, seeds: [] });
    });

    ipcRenderer.on('seedFound', (event, data) => {
      var seedArr = this.state.seeds;
      seedArr.push(data);
      this.setState({ seeds: seedArr });
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('searchupdated');
    ipcRenderer.removeAllListeners('searchComplete');
    ipcRenderer.removeAllListeners('searchStarting');
    ipcRenderer.removeAllListeners('seedFound');
  }

  update(entries) {
    this.setState({ entries }, () => {
      this.updateScroll();
    });
  }

  updateScroll() {
    var element = document.getElementById('searchScrollSeg');
    element.scrollTop = element.scrollHeight;
  }

  startSearch(e, element) {
    this.setState({ loading: true }, () => {
      if (!this.state.searching) {
        ipcRenderer.send('beginSearch');
      } else {
        ipcRenderer.send('stopSearch');
      }
    });
  }

  render() {
    const stdoutEntries = this.state.entries
      .map(entry => {
        return (
          <Feed key={entry.id} className="log" size="large">
            <Feed.Event>
              <Feed.Content>
                <div dangerouslySetInnerHTML={{ __html: entry.message }} />
              </Feed.Content>
            </Feed.Event>
          </Feed>
        );
      })
      .reverse();

    const buttonContent = this.state.searching ? 'Stop Search' : 'Begin Search';

    const seedLabels = this.state.seeds.map((seed, i) => {
      return (
        <Label key={i} color="blue" pointing="left" horizontal={true}>
          {seed}
        </Label>
      );
    });
    return (
      <Form>
        <Header as="h4" attached="top">
          Search
        </Header>
        <Segment attached>
          <Button color={this.state.searching ? 'red' : 'green'} disabled={this.state.loading} onClick={this.startSearch.bind(this)}>
            {buttonContent}
          </Button>
          <Loader indeterminate inline size="small" active={this.state.searching}></Loader>
          <Header as="h5" block={true}>
            Found Seeds: <Header.Content>{seedLabels}</Header.Content>
          </Header>
        </Segment>
        <Header as="h4" attached="top">
          Output
        </Header>
        <Segment id="searchScrollSeg" attached className="search-output">
          <div>{stdoutEntries}</div>
        </Segment>
      </Form>
    );
  }
}

module.exports = Searcher;
