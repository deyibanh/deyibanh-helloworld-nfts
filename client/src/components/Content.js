import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import "./Content.css";

function Content(props) {
    const state = props.state;
    const unsoldItemsState = props.unsoldItemsState;
    const senderItemsState = props.senderItemsState;
    const totalSupplyState = props.totalSupplyState;
    console.log(state);

    function mintCollection() {
        props.onMintCollection();
    }

    function addItem() {
        props.onAddItem();
    }

    function buyItem(index) {
        props.onBuyItem(index);
    }

    return (
        <div className="Content">
            {totalSupplyState == 0 ? (
                <div>
                    {window.ethereum !== "undefined" && state.accounts && state.accounts[0] === state.owner ? (
                        <Button onClick={mintCollection}>Mint Collection</Button>
                    ) : (
                        <div>The collection has not been minted yet by the owner.</div>
                    )}
                </div>
            ) : (
                <div>
                    <Container className="ItemsContainer">
                        <h1>Unsold items</h1>
                        {unsoldItemsState.length == 0 ? (
                            <div className="ItemsContainerEmpty">Collection sold out!</div>
                        ) : (
                            <div>
                                {unsoldItemsState && (
                                    <Row xs={4}>
                                        {unsoldItemsState.map((unsoldItem, index) => (
                                            <div key={index}>
                                                <Card style={{ width: "18rem", marginTop: "18px" }}>
                                                    <Card.Img variant="top" src={unsoldItem.sourceURI} />
                                                    <Card.Body>
                                                        <Card.Title>{unsoldItem.name}</Card.Title>
                                                        <Card.Text style={{ fontSize: "smaller", fontStyle: "italic" }}>
                                                            {unsoldItem.description}
                                                        </Card.Text>
                                                        <Row xs={12}>
                                                            <Col>
                                                                <Card.Text style={{ fontSize: "x-large" }}>
                                                                    {unsoldItem.priceString} ETH
                                                                </Card.Text>
                                                            </Col>
                                                            <Col>
                                                                <Button variant="dark" onClick={() => buyItem(index)}>
                                                                    Buy Item
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        ))}
                                    </Row>
                                )}
                            </div>
                        )}
                    </Container>

                    <Container className="ItemsContainer">
                        <h1>Your items</h1>
                        {senderItemsState.length == 0 ? (
                            <div className="ItemsContainerEmpty">You have no items yet.</div>
                        ) : (
                            <div>
                                {senderItemsState && (
                                    <Row xs={4}>
                                        {senderItemsState.map((senderItem, index) => (
                                            <div key={index}>
                                                <Card style={{ width: "18rem", marginTop: "18px" }}>
                                                    <Card.Img variant="top" src={senderItem.sourceURI} />
                                                    <Card.Body>
                                                        <Card.Title>{senderItem.name}</Card.Title>
                                                        <Card.Text style={{ fontSize: "smaller", fontStyle: "italic" }}>
                                                            {senderItem.description}
                                                        </Card.Text>
                                                        <Row xs={12}>
                                                            <Col>
                                                                <Card.Text style={{ fontSize: "x-large" }}>
                                                                    {senderItem.priceString} ETH
                                                                </Card.Text>
                                                            </Col>
                                                            <Col></Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        ))}
                                    </Row>
                                )}
                            </div>
                        )}
                    </Container>
                </div>
            )}
        </div>
    );
}

export default Content;
