import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function NavBar() {
    const [username, setUsername] = useState('')
    const navigate = useNavigate();

    useEffect(() => {
            const loggedInUser = sessionStorage.getItem('username')
            if(loggedInUser != undefined){
                setUsername(loggedInUser);
            }
        }, []);
        

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Navbar.Brand className="p-2">Group app</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link onClick={() => navigate("/groups")}>Groups</Nav.Link>
                    <Nav.Link onClick={() => navigate("/")}>Add user/Change current user</Nav.Link>
                </Nav>
            </Navbar.Collapse>
            <h5 className="me-5">Current user: {username}</h5>
        </Navbar>
        
        
    );
}

export default NavBar;
