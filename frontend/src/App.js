import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MainNav from './components/MainNav';
class App extends Component {
  render() {
    return (
      <div className="App">
        <MainNav />
      </div>
    );
  }
}

export default App;
