import React, { Component } from 'react';
import Geo from '../charts/geoChart';

class Container extends Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    return(
      <Geo countries={this.props.countries}/>
    );
  }
}

export default Container
