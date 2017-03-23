import React, { Component } from 'react';
import { connect } from 'react-redux';
import Container from './components/container';
import { fetchCountries } from './actions/countryAction';

// import logo from './logo.svg';
import './App.css';

class App extends Component {
  componentWillMount() {
    this.props.dispatch(fetchCountries());
  }
  render() {
    return (
      <div className="App">
          <Container countries={this.props.countries} colorBy={this.props.colorBy}/>
        <p className="App-intro">
        </p>
      </div>
    );
  }
}

// Providing redux a function that maps state to our target component
// It will return back a connected component depending on the passed mapper function
export default connect(state => (
  {
    colorBy: state.country.colorBy,
    countries: state.country.countries
  }
))(App)
