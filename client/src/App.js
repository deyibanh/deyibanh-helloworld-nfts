import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { CircleFill } from "react-bootstrap-icons";

import HelloWorldMarketArtifact from "./artifacts/contracts/HelloWorldMarket.sol/HelloWorldMarket.json";
import HelloWorldTokenArtifact from "./artifacts/contracts/HelloWorldToken.sol/HelloWorldToken.json";
import Content from "./components/Content";
import Header from "./components/Header";
import getEthersProvider from "./utils/getEthers";
import "./App.css";

const contractAddresses = require("./contractAddresses.json");
const helloWorldMarketContractAddress = contractAddresses.HelloWorldMarket;
const helloWorldTokenContractAddress = contractAddresses.HelloWorldToken;

function App() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        accounts: null,
    });
    const [helloWorldMarketProvider, setHelloWorldMarketProvider] = useState();
    const [helloWorldMarketSigner, setHelloWorldMarketSigner] = useState();
    const [helloWorldTokenProvider, setHelloWorldTokenProvider] = useState();
    const [helloWorldTokenSigner, setHelloWorldTokenSigner] = useState();
    const [unsoldItems, setUnsoldItems] = useState();

    useEffect(() => {
        (async () => {
            try {
                const provider = await getEthersProvider();
                const signer = provider.getSigner();
                const accounts = await provider.listAccounts();

                const helloWorldMarketProviderInstance = new ethers.Contract(
                    helloWorldMarketContractAddress,
                    HelloWorldMarketArtifact.abi,
                    provider
                );
                const helloWorldMarketSignerInstance = new ethers.Contract(
                    helloWorldMarketContractAddress,
                    HelloWorldMarketArtifact.abi,
                    signer
                );
                const helloWorldTokenProviderInstance = new ethers.Contract(
                    helloWorldTokenContractAddress,
                    HelloWorldTokenArtifact.abi,
                    provider
                );
                const helloWorldTokenSignerInstance = new ethers.Contract(
                    helloWorldTokenContractAddress,
                    HelloWorldTokenArtifact.abi,
                    signer
                );

                const totalSupply = await helloWorldTokenSignerInstance.totalSupply();

                const unsoldItemsResult = await helloWorldMarketSignerInstance.getUnsoldItems();
                console.log(unsoldItemsResult);
                const senderItems = await helloWorldMarketSignerInstance.getSenderItems();
                console.log(senderItems);

                setHelloWorldMarketProvider(helloWorldMarketProviderInstance);
                setHelloWorldMarketSigner(helloWorldMarketSignerInstance);
                setHelloWorldTokenProvider(helloWorldTokenProviderInstance);
                setHelloWorldTokenSigner(helloWorldTokenSignerInstance);
                setUnsoldItems(unsoldItemsResult);

                setState({
                    provider,
                    signer,
                    accounts,
                });
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    async function requestAccount() {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

        setState({
            accounts: accounts,
        });
    }

    async function mintCollection() {
        const mintCollectionTx = await helloWorldTokenSigner.mintCollection();
        await mintCollectionTx.wait();
    }

    async function addItem() {
        for (let i = 0; i < 5; i++) {
            const tokenId = i + 1;
            const price = ethers.utils.parseEther("0.1");
            const addItemTx = await helloWorldMarketSigner.addItem(helloWorldTokenContractAddress, tokenId, price);
            await addItemTx.wait();
        }
    }

    async function buyItem(index) {
        const unsoldItem = unsoldItems[index];
        console.log(unsoldItem);
        const buyItemTx = await helloWorldMarketSigner.buyItem(helloWorldTokenContractAddress, unsoldItem.itemId, {
            value: unsoldItem.price,
        });
        await buyItemTx.wait();
    }

    return (
        <div className="App">
            <Header state={state} onRequestAccount={requestAccount} />
            {/* <Content
                state={state}
                helloWorldMarketSigner={helloWorldMarketProvider}
                helloWorldTokenSigner={helloWorldTokenProvider}
            /> */}

            <Button onClick={mintCollection}>Mint Collection</Button>
            <Button onClick={addItem}>Add Item</Button>

            {unsoldItems &&
                unsoldItems.map((unsoldItem, index) => (
                    <div key={unsoldItem}>
                        <Button onClick={() => buyItem(index)}>Buy Item</Button>
                    </div>
                ))}
        </div>
    );
}

export default App;
