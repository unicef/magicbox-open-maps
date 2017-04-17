import React from 'react';
import { connect } from 'react-redux';
import { recordZoom } from '../actions/mapAction';
import { setPanLocation } from '../actions/mapAction';
import ColorByRadioGroup from './colorByRadioGroup';
import L from 'leaflet';
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
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
  var units = ['aegypti', 'human']
  var enrichments = ['population', 'pop_density', 'prevalence', 'prev_density'];
  var scales = ['linear', 'logarithmic'];
  units.forEach(u => {
    enrichments.forEach(e => {
      scales.forEach(s => {
        var layer = country.layers[u + '-' + e + '-' + s];
        remove_layer(layer);
      })
    })
  })
  Object.keys(country.old_layers).forEach(k => {
    remove_layer(country.old_layers[k]);
  })
  // remove_layer(country.layer_population_old);
  // remove_layer(country.layer_pop_density_old);
}

class MyMap extends React.Component {
  constructor(params) {
     super(params)
     // initial gender state set from props
     this.state = {
      //  colorBy: this.props.country.colorBy,
      //  scaleColorBy: this.props.country.scaleColorBy,
     }
     this.setZoomLevel = this.setZoomLevel.bind(this)
     this.setMapCenter = this.setMapCenter.bind(this)
     this.download_geojson = this.download_geojson.bind(this)
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
    var dimension_style = Object.assign({display:'inline'}, side_style);
    var map_center = this.props.map.latLng;
    var zoom_level = this.props.map.zoom_level;
    var geojson = this.props.country.geojson;
    var scale = this.props.country.scale;
    var colorBy = this.props.country.colorBy;
    var enrichment = this.props.country.enrichment;
    var unit = this.props.country.unit;
    var grid_style = {width:'250px', textAlign: 'left'}
    var shape_loaded = {
      display: !!geojson ? 'inline' : 'none',
      fontSize: '14px',
    };

    if (window.map) {
      window.map.on('dragend', this.setMapCenter);
      window.map.on('zoomend', this.setZoomLevel);

      if (this.props.country.layers) {
        window.z = this.props.country;

        remove_layers(this.props.country);
        window.map.setView(map_center, zoom_level)
        this.props.country.layers[unit + '-' + enrichment + '-' + scale].addTo(window.map);
      }
    }
    return <div >
      <div id='floating-panel'>
        <ColorByRadioGroup country={this.props.country}/>
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
