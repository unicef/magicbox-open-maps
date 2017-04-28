import React from 'react';
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';

class NavBarInstance extends React.Component {
  render() {
    var style = {
      width: '100%',
      position: 'absolute',
      top: '20px',
      zIndex: 2
    }
    return <div>
    <Grid style={style}>
      <Row className="show-grid">
        <Col xs={8} md={8} ></Col>
        <Col xs={2} md={2}> <a href='https://medium.com/@mikefabrikant/mapping-the-worlds-population-with-worldpop-org-uk-f71a336befef'> Explanation</a></Col>
      </Row>
    </Grid>
    </div>
  }
}

export default NavBarInstance;
