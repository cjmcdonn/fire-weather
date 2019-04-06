import React, { Component } from 'react';
import moment from 'moment';
import Error from './Error';
import Loading from './Loading';


interface State {
  error: boolean,
  loading: boolean,
  temp: number,
  wind: number,
  rh: number,
  time: string,
  danger: string,
}

export class Forecast extends Component<any, State> {
  constructor(props: State) {
    super(props);

    this.state = {
      error: false,
      loading: true,
      temp: -999,
      wind: -999,
      rh: -999,
      time: '',
      danger: 'Invalid',
    }

  }

  componentDidMount() {
    fetch(`https://api.redsage.io/weather`)
      .then(res => {
        if (res.status !== 200) {
          this.setState({
            error: true,
            loading: false,
          });
          return;
        }

        res.json().then(data => this.setState({
          error: false,
          loading: false,
          temp: data.data.tempF,
          wind: data.data.windMPH,
          rh: data.data.rh,
          time: moment(data.data.observationTime).calendar(),
          danger: data.data.danger,
        }));
      });
  }

  render(): React.ReactNode {
    const { error, loading, temp, wind, rh, time, danger } = this.state;

    if (error) {
      return <Error/>
    }

    if (loading) {
      return <Loading/>
    }

    return (
      <div>
        <h3>Danger: { danger }</h3>

        <p className={'mt-4'}>Temp: { temp } &deg;F</p>
        <p>Wind: { wind } MPH</p>
        <p>RH: { rh }%</p>

        <h6 className={'mt-4'}>Last updated:<br></br>{ time }</h6>
      </div>
    );
  }
}

export default Forecast;