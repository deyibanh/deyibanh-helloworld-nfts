import React, { useState } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { CircleFill } from "react-bootstrap-icons";

function Content(props) {
    const state = props.state;
    // const helloWorldMarketSigner = props.helloWorldMarketSigner;
    // const helloWorldTokenSigner = props.helloWorldTokenSigner;
    // const [totalSupply, setTotalSupply] = useState(0);
    // let helloWorldTokenContractOwner;
    // console.log(helloWorldTokenSigner);
    console.log(state);

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const totalSupplyResult = await helloWorldTokenSigner.totalSupply();
    //             helloWorldTokenContractOwner = await helloWorldTokenSigner.owner();
    //             setTotalSupply(totalSupplyResult);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     })();
    // }, []);

    function mintCollection() {}
    function addItem() {}
    function buyItem() {}

    return (
        <div className="Content">
            <Container>
                {/* {totalSupply === 0 && helloWorldTokenContractOwner === state.accounts[0] && ( */}
                <Button onClick={mintCollection}>Mint Collection</Button>
                {/* )} */}
                <Button onClick={addItem}>Add Item</Button>
                <Button onClick={buyItem}>Buy Item</Button>
            </Container>
        </div>
    );
}

export default Content;
