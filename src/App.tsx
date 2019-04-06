import React, { Component } from 'react';
import Forecast from './components/Forecast';

class App extends Component {
  render() {
    return (
      <div
        style={ {
          'height': '100vh',
        } }>
        <div
          className="App"
          style={ {
            'background': 'url(img/firewatch-tower.jpg) no-repeat center center fixed',
            'backgroundSize': 'cover',
            'height': '100%',
            'overflow': 'hidden',
          } }>
          <h1 className={'text-center mt-5'}>FireWeather</h1>
          <div className={'mt-4 mx-5'}>
            <Forecast/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
