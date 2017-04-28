import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';
import { NavItem } from 'react-bootstrap';
import { MenuItem } from 'react-bootstrap';

class NavBarInstance extends React.Component {
  render() {
    return <div>
    <Navbar>
      <Navbar.Header>
      </Navbar.Header>
      <Nav pullRight>
        <NavItem href='https://medium.com/@mikefabrikant/mapping-the-worlds-population-with-worldpop-org-uk-f71a336befef'>Explanation</NavItem>

      </Nav>
    </Navbar>
    </div>
  }
}

export default NavBarInstance;
