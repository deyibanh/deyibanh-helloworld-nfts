import React from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { CircleFill } from "react-bootstrap-icons";

function Header(props) {
    const state = props.state;

    async function requestAccount() {
        props.onRequestAccount();
    }

    return (
        <header>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>The Hello World Collection by Dé Yi Banh</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            {typeof window.ethereum !== "undefined" && state.accounts ? (
                                <div className="walletInfo">
                                    <CircleFill color="green" />
                                    <span className="walletInfoLabel">
                                        {state.accounts[0].substring(0, 5) + "..." + state.accounts[0].slice(-4)}
                                    </span>
                                    {state.accounts[0] === state.owner && <span> (Owner)</span>}
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
