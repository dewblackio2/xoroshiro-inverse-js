import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Layout from './pages/Layout';
//import Settings from './pages/Settings';
import Help from './pages/Help';
import Main from './pages/Main';

ReactDOM.render(
  <BrowserRouter>
    <Layout>
      <Switch>
        <Route exact path="/" component={Main} />
        {/* <Route exact path="/settings" component={Settings} /> */}
        <Route exact path="/help" component={Help} />
        <Redirect to="/" exact />
      </Switch>
    </Layout>
  </BrowserRouter>,
  document.getElementById('app')
);
