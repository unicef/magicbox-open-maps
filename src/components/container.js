import React, { Component } from 'react';
import Geo from '../charts/geoChart';
import ColorByRadioGroup from './colorByRadioGroup';

class Container extends Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    return(
      <div>
        <ColorByRadioGroup colorBy={this.props.colorBy}/>
        <Geo countries={this.props.countries}/>
      </div>
    );
  }
}

export default Container
