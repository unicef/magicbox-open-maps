import React, { Component } from 'react';
import Loader from 'react-loader';
import { connect } from 'react-redux';
import { fetchCountries } from './actions/countryAction';
import Geo from './charts/geoChart';
import MyMap from './components/MyMap';
import { Grid, Row, Col } from 'react-bootstrap';

import './App.css';

class App extends Component {
  componentWillMount() {
    this.props.dispatch(fetchCountries());
  }

  render() {
    var side_style = {
      textAlign: 'left',
      position: 'relative',
      height: '25px',
      zIndex: 2
    };
    var border = {
      border: 'solid green 1px'
    }
    return (
      <div className="App">
         <Loader loaded={this.props.country.is_loaded}/>
          <Grid >
            <Row className="show-grid">
              <Col md={12}>
                <Geo unit={this.props.country.unit} enrichment={this.props.country.enrichment} scale={this.props.country.scale} geoChart_data={this.props.country.geoChart_data}/>
              </Col>
            </Row>
            <Row className="show-grid">
              <Col xs={12} md={12}>
              <MyMap country={this.props.country} side_style={side_style} map={this.props.map}/>
              </Col>
            </Row>
          </Grid>

      </div>
    );
  }
}

// Providing redux a function that maps state to our target component
// It will return back a connected component depending on the passed mapper function
export default connect(state => (
  {
    country: state.country,
    map: state.map
  }
))(App)
