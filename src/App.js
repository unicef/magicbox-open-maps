import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchCountries } from './actions/countryAction';
import Geo from './charts/geoChart';
import MyMap from './components/MyMap';
import ColorByRadioGroup from './components/colorByRadioGroup';
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
      top: '200px',
      height: '25px',
      zIndex: 2
    };
    return (
      <div className="App">
          <Grid>
            <Row className="show-grid">
              <Col md={12}>
                <ColorByRadioGroup country={this.props.country} side_style={side_style}/>
                <Geo country={this.props.country}/>
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
