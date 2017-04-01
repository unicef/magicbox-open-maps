import React from 'react';
import { connect } from 'react-redux';
import { rescaleColorCountries } from '../actions/countryAction';
import L from 'leaflet';

window.zoom_level = 6;

function remove_layer(map, layer) {
  if (layer) {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer)
    }
  }
  return map;
}

function remove_layers(map, country) {
  var kinds = ['layer_population', 'layer_pop_density'];
  var scales = ['linear', 'logarithmic'];
  kinds.forEach(k => {
    if (country[k]) {
      scales.forEach(s => {
        var layer = country[k][s];
        map = remove_layer(map, layer);
      })
    }
  })
  return map;
}

class MyMap extends React.Component {
  constructor(params) {
     super(params)
     // initial gender state set from props
     this.state = {
       colorBy: this.props.country.colorBy,
       scaleColorBy: this.props.country.scaleColorBy,
     }
     this.setScaleColorBy = this.setScaleColorBy.bind(this)
  }

  setScaleColorBy(e) {
    this.setState({
      scaleColorBy: e.target.value
    })
    this.props.dispatch(rescaleColorCountries(e.target.value));
  }

  componentDidMount() {
    this.map();
  }

  map() {
    window.map = L.map('map').setView([51.505, -0.09], 3);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(window.map);
  }

  render() {
    var side_style = this.props.side_style;
    var centroid = this.props.country.centroid;
    var geojson = this.props.country.geojson;
    var scaleColorBy = this.props.country.scaleColorBy;
    var colorBy = this.props.country.colorBy;
    if (window.map) {

      // window.map.on('zoomend', function (e) {
      //   window.zoom_level = e.target._zoom;
      // });

            // if (window.map.hasLayer(window.geojson_layer)) {
      //   window.map.removeLayer(window.geojson_layer)
      // }
      // console.log(window.map.has)

      if (this.props.country.layer_population) {
        remove_layers(window.map, this.props.country);
        window.map.setView(centroid, window.zoom_level)
        if (colorBy.match(/population/)) {
          this.props.country.layer_population[scaleColorBy].addTo(window.map);
        } else {
          this.props.country.layer_pop_density[scaleColorBy].addTo(window.map);
        }
      }
    }
    return <div >
      <div >
        <p style={side_style}>
          <input type='radio' checked={scaleColorBy === "linear"} onChange={this.setScaleColorBy} value="linear" /> linear
        </p>
        <p style={side_style}>
          <input type='radio' checked={scaleColorBy === "logarithmic"} onChange={this.setScaleColorBy} value='logarithmic'  /> logarithmic
        </p>
      </div>
      <div id="map" />
    </div>
  }
}

export default connect(state => {
    return {};
  }
)(MyMap)
