import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchCountries } from './actions/countryAction';
import Geo from './charts/geoChart';
import MyMap from './components/MyMap';
import ColorByRadioGroup from './components/colorByRadioGroup';
import { Container, Grid, Row, Col } from 'react-bootstrap';
// var map_controller = new MapController({
//   focus: [-23.3, -46.3]   // São Paulo.
// });

import './App.css';

class App extends Component {
  componentWillMount() {
    this.props.dispatch(fetchCountries());
  }
  render() {
    return (
      <div className="App">
          <Grid>
            <Row className="show-grid">
              <Col md={12}>
                <ColorByRadioGroup country={this.props.country}/>
                <Geo country={this.props.country}/>
              </Col>
            </Row>
            <Row className="show-grid">
              <Col xs={12} md={12}>
              <MyMap country={this.props.country} />
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
    country: state.country
  }
))(App)
