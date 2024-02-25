import React from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import './NavBar.css';

function NavBar() {
  return (
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <a href="/">React-Bootstrap</a>
        </Navbar.Brand>
      </Navbar.Header>
      <Nav>
        <NavItem eventKey={1} href="/">Home</NavItem>
        <NavItem eventKey={2} href="/login">Login</NavItem>
      </Nav>
    </Navbar>
  );
}

export default NavBar;
