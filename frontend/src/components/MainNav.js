import React, { Component } from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import Routes  from '../Routes';
import {Link} from 'react-router-dom';
import { connect } from 'react-redux';

import { withRouter } from 'react-router-dom';
const MainNav = (props) => {
    return (
        <div>
            <Navbar inverse collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">YourGoGetter Coding Challenge</Link>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                {props.userData.loggedIn === true ? <Nav pullRight>Welcome, {props.userData.email}</Nav> : 
                    <Nav pullRight>
                        
                        
                        <LinkContainer to="/signup">
                            <NavItem>Signup</NavItem>
                        </LinkContainer>
                        <LinkContainer to="/login">
                            <NavItem>Login</NavItem>
                        </LinkContainer>
                        
                        
                    </Nav>
                }
                </Navbar.Collapse>
            </Navbar>
            <div>
                <Routes />
            </div>
        </div>
    ); 
}

const mapStateToProps = (state) => {
    return {
        userData: state.userData
    };
}


export default withRouter(connect(mapStateToProps, null)(MainNav));