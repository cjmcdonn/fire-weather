import React, {Component} from 'react';
import Conditions from './components/Conditions';
import styled from 'styled-components';

const ShadedBackground = styled.div`
  background-color: rgba(201, 211, 184, .75);
  display: inline-block;
  padding: .15rem .5rem;
`;

class App extends Component {
    render() {
        return (
            <div
                style={{
                    'height': '100vh',
                }}>
                <div
                    className={'App d-flex flex-column justify-content-between'}
                    style={{
                        'background': 'url(img/firewatch-tower.webp) no-repeat center center fixed',
                        'backgroundSize': 'cover',
                        'height': '100%',
                        'overflow': 'hidden',
                    }}>
                    <h1 className={'text-center mt-5'}>FireWeather</h1>
                    <div className={'mt-4 mx-5'}>
                        <Conditions/>
                    </div>
                    <div className={'flex-grow-1'}>
                    </div>
                    <ShadedBackground>
                        <div className={'w-50 mx-auto'}>
                            <a href={'https://darksky.net/poweredby/'}>
                                <img
                                    className={'img-fluid'}
                                    src={'https://darksky.net/dev/img/attribution/poweredby.png'}/>
                            </a>
                        </div>
                    </ShadedBackground>
                </div>
            </div>
        );
    }
}

export default App;
