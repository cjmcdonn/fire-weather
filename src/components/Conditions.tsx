import React, {Component} from 'react';
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
    gust: number,
    rh: number,
    time: string,
    danger: string,
    home_lat: number,
    home_lon: number,
    curr_lat: number,
    curr_lon: number,
    curr_base: object,
    curr_sta: string,
    curr_sign: string,
}

export class Conditions extends Component<any, State> {
    pollingInterval = 0;

    constructor(props: State) {
        super(props);

        this.state = {
            error: false,
            loading: true,
            temp: -999,
            wind: -999,
            gust: -999,
            rh: -999,
            time: '',
            danger: 'Invalid',
            home_lat: 47.3126,
            home_lon: -119.5352,
            curr_lat: 47.3126,
            curr_lon: -119.5352,
            curr_base: {},
            curr_sta: '',
            curr_sign: '',
        };
    }

    componentDidMount() {
        this.setLocation();
        this.pollDarkSky();

        this.pollingInterval = setInterval(() => {
            this.setLocation();
            this.pollDarkSky();
        }, 300000);
    }

    componentWillUnmount(): void {
        clearInterval(this.pollingInterval);
        this.pollingInterval = 0;
    }

    pollDarkSky() {
        const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/bd610bdcefedaf54a0a095c8eba04bf5/${this.state.curr_lat},${this.state.curr_lon}`;
        fetch (url)
            .then(resp => resp.json()) // transform the data into json
            .then(data => {
                console.log(data.currently, moment(data.currently.time * 1000).calendar());
                const danger = this.calcDanger(
                    data.currently.temperature,
                    data.currently.windSpeed,
                    data.currently.windGust,
                    data.currently.dewPoint
                );

                this.setState({
                    temp: Math.round(data.currently.temperature),
                    wind: Math.round(data.currently.windSpeed),
                    gust: Math.round(data.currently.windGust),
                    rh: Math.round(data.currently.dewPoint),
                    time: moment(data.currently.time * 1000).calendar(),
                    danger: danger,
                    loading: false,
                });

            })
    }

    setLocation() {
        navigator.geolocation.getCurrentPosition(location => {
            this.setState({
                curr_lat: (Math.round(location.coords.latitude * 10000)) / 10000,
                curr_lon: (Math.round(location.coords.longitude * 10000)) / 10000,
            })
        });
    }

    calcDanger(temp: number, wind: number, gust: number, rh: number) {
        if (temp < 70) {
            if ((wind > 20 || gust > 20) && rh < 20) {
                return 'moderate';
            }

            return 'low';
        }

        if (temp < 90) {
            if ((wind > 20 || gust > 20) && rh < 20) {
                return 'high';
            }

            if ((wind > 20 || gust > 20) || rh < 20) {
                return 'moderate';
            }

            return 'low';
        }

        if ((wind > 20 || gust > 20) && rh < 20) {
            return 'extreme';
        }

        if ((wind > 20 || gust > 20) || rh < 20) {
            return 'high';
        }

        return 'moderate';
    }

    poll() {
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
        const {error, loading, temp, wind, gust, rh, time, danger, curr_lat, curr_lon} = this.state;

        if (error) {
            return <Error/>
        }

        if (loading) {
            return <Loading/>
        }

        return (
            <div>

                <ShadedBackground>
                    <h3 className={'my-1'}>Danger: {danger}</h3>
                </ShadedBackground>

                <div className={'mt-4'}>
                    <div className={'my-2'}>
                        <ShadedBackground>
                            <span>Temp: {temp}&deg;F</span>
                        </ShadedBackground>
                    </div>

                    <div className={'my-3'}>
                        <ShadedBackground>
                            <span>Wind: {wind} MPH</span>
                        </ShadedBackground>
                    </div>

                    <div className={'my-3'}>
                        <ShadedBackground>
                            <span>Gust: {gust} MPH</span>
                        </ShadedBackground>
                    </div>

                    <div className={'my-3'}>
                        <ShadedBackground>
                            <span className={'d-inline-block'}>RH: {rh}%</span>
                        </ShadedBackground>
                    </div>

                </div>

                <div className={'mt-4'}>
                    <ShadedBackground className={'w-100'}>
                            <h6 className={'my-1'}>
                                Updated: {time}
                            </h6>
                            <h6 className={'small form-text text-muted text-right'}>
                                {curr_lat},{curr_lon}
                            </h6>
                    </ShadedBackground>
                </div>

            </div>
        );
    }
}

export default Conditions;