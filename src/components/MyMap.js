import React from 'react';
import L from 'leaflet';
import { render } from 'react-dom';

function get_max_min(geojson, kind) {
  var max;
  geojson.features.forEach(f => {
    var value = f.properties[kind];
    max = max ? (value > max ? value : max) : value;
    // min = min ? (value < min ? value : min) : value;
  });
  return max;
}

class MyMap extends React.Component {
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
    var centroid = this.props.country.centroid;
    var geojson = this.props.country.geojson;
    var colorBy = this.props.country.colorBy;
    if (window.map) {
      if (window.map.hasLayer(window.geojson_layer)) {
        window.map.removeLayer(window.geojson_layer)
      }
      // console.log(window.map.has)
      if (geojson) {
        var high = get_max_min(geojson, colorBy);
        window.map.setView(centroid, 6)
        window.geojson_layer = L.geoJSON(geojson, {
          style: (f) => {
            var log = high/4;
            var pop = f.properties[colorBy];
            var strength = pop >= log ? (pop/high) : (pop/log)

            return {
              fillColor: 'red',
              color: 'black',
              weight: 1,
              dashArray: '3',
              opacity: 0.65,
              fillOpacity: strength
            }
          }
        }).addTo(window.map);
      }
    }
    return <div >
      <div id="map" />
    </div>
  }
}
export default MyMap
