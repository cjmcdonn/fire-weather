import React, { Component } from 'react';
import moment from 'moment';
import Error from './Error';
import Loading from './Loading';
import styled from 'styled-components';

const ShadedBackground = styled.div`
  background-color: rgba(201, 211, 184, .75);
  display: inline-block;
  padding: .15rem .5rem;
`;

interface State {
  error: boolean,
  loading: boolean,
  temp: number,
  wind: number,
  rh: number,
  time: string,
  danger: string,
}

export class Conditions extends Component<any, State> {
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

        <ShadedBackground>
          <h3 className={'my-1'}>Danger: { danger }</h3>
        </ShadedBackground>

        <div className={ 'mt-4' }>
          <div className={ 'my-2' }>
            <ShadedBackground>
              <span>Temp: { temp }&deg;F</span>
            </ShadedBackground>
          </div>

          <div className={ 'my-3' }>
            <ShadedBackground>
              <span>Wind: { wind } MPH</span>
            </ShadedBackground>
          </div>

          <div className={ 'my-3' }>
            <ShadedBackground>
              <span className={ 'd-inline-block' }>RH: { rh }%</span>
            </ShadedBackground>
          </div>

        </div>

        <div className={ 'mt-4' }>
          <ShadedBackground>

          <h6 className={'my-1'}>Last updated: { time }</h6>
          </ShadedBackground>
        </div>
      </div>
    );
  }
}

export default Conditions;