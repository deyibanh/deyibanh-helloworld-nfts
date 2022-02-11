import React from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { CircleFill } from "react-bootstrap-icons";
import "./Header.css";

function Header(props) {
    const state = props.state;

    async function requestAccount() {
        props.onRequestAccount();
    }

    return (
        <header>
            <Navbar>
                <Container>
                    <Navbar.Brand>Dé Yi Banh says Hello World!</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            {typeof window.ethereum !== "undefined" && state.accounts ? (
                                <div className="walletInfo">
                                    <CircleFill color="green" />
                                    <span className="walletInfoLabel">
                                        {state.accounts[0].substring(0, 5) + "..." + state.accounts[0].slice(-4)}
                                    </span>
                                </div>
                            ) : (
                                <Button variant="outline-primary" size="sm" onClick={requestAccount}>
                                    Connect your wallet
                                </Button>
                            )}
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            {/* <div className="AppHeader">
                <h4>Dé Yi Banh</h4>
                <h4>says</h4>
                <h1>Hello World!</h1>
            </div> */}
        </header>
    );
}

export default Header;
