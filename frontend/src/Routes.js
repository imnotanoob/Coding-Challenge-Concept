import React from "react";
import { Route, Switch } from "react-router-dom";
import Register from './components/Register';
import Authenticate from './components/Authenticate';
export default () =>
  <Switch>
    <Route path="/signup" component={Register} />
    <Route path="/login" component={Authenticate} />
  </Switch>;