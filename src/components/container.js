import React, { Component } from 'react';
import Geo from '../charts/geoChart';
import MyMap from './MyMap';
import ColorByRadioGroup from './colorByRadioGroup';

class Container extends Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    return(
      <div>
        <ColorByRadioGroup colorBy={this.props.colorBy}/>
        <Geo country={this.props.country}/>
          <MyMap centroid={this.props.country.centroid} geojson={this.props.country.geojson} />

      </div>
    );
  }
}

export default Container
