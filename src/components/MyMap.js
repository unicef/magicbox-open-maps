import React from 'react';
import { connect } from 'react-redux';
import { rescaleColorCountries } from '../actions/countryAction';
import L from 'leaflet';
function get_max(geojson, kind) {
  var max;
  geojson.features.forEach(f => {
    var value = f.properties[kind];
    max = max ? (value > max ? value : max) : value;
    // min = min ? (value < min ? value : min) : value;
  });
  return max;
}

function get_strength(feature, high, colorBy, scaleColorBy) {
  var pop = feature.properties[colorBy];
  if (scaleColorBy.match(/linear/)) {
    return pop/high;
  } else {
    var log = high/4;
    return pop >= log ? (pop/high) : (pop/log)
  }
}
window.zoom_level = 8;
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
      window.map.on('zoomend', function (e) {
        window.zoom_level = e.target._zoom;
     });
      if (window.map.hasLayer(window.geojson_layer)) {
        window.map.removeLayer(window.geojson_layer)
      }
      // console.log(window.map.has)
      if (geojson) {
        var high = get_max(geojson, colorBy);
        window.map.setView(centroid, window.zoom_level)
        window.geojson_layer = L.geoJSON(geojson, {
          style: (f) => {
            var strength = get_strength(f, high, colorBy, scaleColorBy)
            return {
              fillColor: 'red',
              color: 'black',
              weight: 0.1,
              dashArray: '3',
              opacity: 0.65,
              fillOpacity: strength
            }
          }
        }).addTo(window.map);
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
