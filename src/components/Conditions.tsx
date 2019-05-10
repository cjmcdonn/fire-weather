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

        this.pollNWS = this.pollNWS.bind(this);
    }

    componentDidMount() {
        this.pollNWS();
        this.pollingInterval = setInterval(this.pollNWS, 60000);

        navigator.geolocation.getCurrentPosition(location => {
            this.setState({
                curr_lat: (Math.round(location.coords.latitude * 10000)) / 10000,
                curr_lon: (Math.round(location.coords.longitude * 10000)) / 10000,
            })
        });
    }

    componentWillUnmount(): void {
        clearInterval(this.pollingInterval);
        this.pollingInterval = 0;
    }

    pollNWS() {
        fetch(`https://api.weather.gov/points/${this.state.curr_lat},${this.state.curr_lon}`)
            .then(resp => resp.json()) // transform the data into json
            .then(data => {
                this.setState({
                    curr_base: data.properties,
                });
                return data.properties.observationStations;
            })
            .then(url => {
                return fetch(url)
            })
            .then(resp => resp.json()) // transform the data into json
            .then(data => {
                const curr_sta = `${data.observationStations[0]}/observations/current`;
                const currSignPcs = data.observationStations[0].split('/');

                this.setState({
                    curr_sta: curr_sta,
                    curr_sign: currSignPcs[currSignPcs.length - 1],
                });

                return curr_sta;
            })
            .then(url => {
                return fetch(url)
            })
            .then(resp => resp.json()) // transform the data into json
            .then(data => {
                const temp = this.convertCtoF(data.properties.temperature.value);
                const wind = this.convertMsToMph(data.properties.windSpeed.value);
                const rh = Math.round(data.properties.relativeHumidity.value);
                const gust = 0;
                const danger = this.calcDanger(temp, wind, gust, rh);

                this.setState({
                    temp: temp,
                    wind: wind,
                    gust: gust,
                    rh: rh,
                    time: moment(data.properties.timestamp).calendar(),
                    danger: danger,
                    loading: false,
                });
            })
            .catch(() => {
                this.setState({
                    error: true,
                    loading: false,
                });
            });
    }

    convertCtoF(celcius: number) {
        return Math.round(celcius * (9 / 5) + 32);
    }

    convertMsToMph(meter: number) {
        return Math.round(meter * 2.23694);
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
        const {error, loading, temp, wind, rh, time, danger} = this.state;

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
                            <span className={'d-inline-block'}>RH: {rh}%</span>
                        </ShadedBackground>
                    </div>

                </div>

                <div className={'mt-4'}>
                    <ShadedBackground className={'w-100'}>
                        <div className={' d-flex justify-content-between align-items-baseline'}>
                            <h6 className={'my-1'}>
                                Updated: {time}
                            </h6>
                            <h6 className={'small form-text text-muted'}>
                                <a href={ this.state.curr_sta } target={'_blank'}>{this.state.curr_sign}</a>
                            </h6>
                        </div>
                    </ShadedBackground>
                </div>

            </div>
        );
    }
}

export default Conditions;