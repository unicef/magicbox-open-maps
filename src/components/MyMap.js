import React from 'react';
import { connect } from 'react-redux';
import { rescaleColorCountries } from '../actions/countryAction';
import { recordZoom } from '../actions/mapAction';
import { setPanLocation } from '../actions/mapAction';
import ColorByRadioGroup from './colorByRadioGroup';
import L from 'leaflet';
var FileSaver = require('file-saver');

require('../css/overlay-controls-box.css');

function remove_layer(layer) {
  if (layer) {

    if (window.map.hasLayer(layer)) {
      window.map.removeLayer(layer)
    }
  }
}

function remove_layers(country) {
  var kinds = ['layer_population_old', 'layer_pop_density_old'];
  var scales = ['linear', 'logarithmic'];
  kinds.forEach(k => {
    if (country[k]) {
      scales.forEach(s => {
        var layer = country[k][s];
        // console.log(k, s, country[k][s])
        remove_layer(layer);
      })
    }
  })
  // return map;
}

class MyMap extends React.Component {
  constructor(params) {
     super(params)
     // initial gender state set from props
     this.state = {
      //  colorBy: this.props.country.colorBy,
      //  scaleColorBy: this.props.country.scaleColorBy,
     }
     this.setScaleColorBy = this.setScaleColorBy.bind(this)
     this.setZoomLevel = this.setZoomLevel.bind(this)
     this.setMapCenter = this.setMapCenter.bind(this)
     this.download_geojson = this.download_geojson.bind(this)
  }

  setScaleColorBy(e) {
    this.setState({
      scaleColorBy: e.target.value
    })
    this.props.dispatch(rescaleColorCountries(e.target.value));
  }
  download_geojson(e) {
    var blob = new Blob([JSON.stringify(this.props.country.geojson)], {type: "data:text/json;charset=utf-8"});
    FileSaver.saveAs(blob, this.props.country.country + '.json');
  }
  setZoomLevel(e) {
    this.props.dispatch(recordZoom(e.target._zoom, window.map.getCenter()));
  }

  setMapCenter(e) {
    this.props.dispatch(setPanLocation(window.map.getCenter()));
  }

  componentDidMount() {
    this.map();
  }

  map() {

    window.map = L.map('map').setView(this.props.map.latLng, this.props.map.zoom_level);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(window.map);
  }

  render() {
    var side_style = this.props.side_style;
    var map_center = this.props.map.latLng;
    var zoom_level = this.props.map.zoom_level;
    var geojson = this.props.country.geojson;
    var scaleColorBy = this.props.country.scaleColorBy;
    var colorBy = this.props.country.colorBy;

    var shape_loaded = {
      display: !!geojson ? 'inline' : 'none',
      fontSize: '14px',
    };

    if (window.map) {
      window.map.on('dragend', this.setMapCenter);
      window.map.on('zoomend', this.setZoomLevel);

      if (this.props.country.layer_population) {
        remove_layers(this.props.country);
        window.map.setView(map_center, zoom_level)
        if (colorBy.match(/population/)) {
          this.props.country.layer_population[scaleColorBy].addTo(window.map);
        } else {
          this.props.country.layer_pop_density[scaleColorBy].addTo(window.map);
        }
      }
    }
    return <div >

      <div id='floating-panel'>
        <ColorByRadioGroup country={this.props.country} side_style={this.props.side_style}/>
        <hr/>
        <p style={side_style}>
          <input type='radio' checked={scaleColorBy === "linear"} onChange={this.setScaleColorBy} value="linear" /> linear
        </p>
        <p style={side_style}>
          <input type='radio' checked={scaleColorBy === "logarithmic"} onChange={this.setScaleColorBy} value='logarithmic'  /> logarithmic
        </p>
        <hr/>
        <div style={shape_loaded}>
          <p style={side_style}>
            {this.props.country.country_name}
            <br/>
            admin level: {this.props.country.admin_level}
            <br/>
            <button type="button" className="btn btn-primary" onClick={this.download_geojson}>download</button>
          </p>
        </div>
      </div>
      <div id="map" />
    </div>
  }
}

export default connect(state => {
    return {};
  }
)(MyMap)
