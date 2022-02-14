import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import axios from "axios";

import HelloWorldMarketArtifact from "./artifacts/contracts/HelloWorldMarket.sol/HelloWorldMarket.json";
import HelloWorldTokenArtifact from "./artifacts/contracts/HelloWorldToken.sol/HelloWorldToken.json";
import Content from "./components/Content";
import Footer from "./components/Footer";
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
        owner: null,
        accounts: null,
    });
    const [helloWorldMarketContractState, setHelloWorldMarketContractState] = useState();
    const [helloWorldTokenContractState, setHelloWorldTokenContractState] = useState();
    const [unsoldItemsState, setUnsoldItemsState] = useState([]);
    const [senderItemsState, setSenderItemsState] = useState([]);
    const [totalSupplyState, setTotalSupplyState] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                const provider = await getEthersProvider();
                const signer = provider.getSigner();
                const accounts = await provider.listAccounts();
                const helloWorldMarketContractStateInstance = new ethers.Contract(
                    helloWorldMarketContractAddress,
                    HelloWorldMarketArtifact.abi,
                    signer
                );
                const helloWorldTokenContractStateInstance = new ethers.Contract(
                    helloWorldTokenContractAddress,
                    HelloWorldTokenArtifact.abi,
                    signer
                );
                const totalSupply = await helloWorldTokenContractStateInstance.totalSupply();
                const owner = await helloWorldTokenContractStateInstance.owner();

                setState({
                    provider,
                    signer,
                    owner,
                    accounts,
                });
                setHelloWorldMarketContractState(helloWorldMarketContractStateInstance);
                setHelloWorldTokenContractState(helloWorldTokenContractStateInstance);
                setTotalSupplyState(totalSupply);

                getUnsoldItems(helloWorldMarketContractStateInstance, helloWorldTokenContractStateInstance);
                getSenderItems(helloWorldMarketContractStateInstance, helloWorldTokenContractStateInstance);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    async function getItemInfoFromIPFS(item, itemTokenURI) {
        const ipfsLoadImageURI = "https://ipfs.io/ipfs/";
        const ipfsMetadataURI = "ipfs://";
        const itemTokenURISliced = itemTokenURI.slice(ipfsMetadataURI.length);
        const data = await axios.get(ipfsLoadImageURI + itemTokenURISliced);
        const meta = data.data;
        const imageName = meta.image.slice(ipfsMetadataURI.length);
        const itemInfo = {
            name: meta.name,
            description: meta.description,
            itemId: item.itemId,
            tokenId: item.tokenId,
            price: item.price,
            priceString: ethers.utils.formatEther(item.price),
            sourceURI: ipfsLoadImageURI + imageName,
        };

        return itemInfo;
    }

    async function getUnsoldItems(helloWorldMarketContract, helloWorldTokenContract) {
        const unsoldItems = await helloWorldMarketContract.getUnsoldItems();

        if (unsoldItems) {
            unsoldItems.map(async (unsoldItem) => {
                const itemTokenURI = await helloWorldTokenContract.tokenURI(unsoldItem.tokenId);
                const itemInfo = await getItemInfoFromIPFS(unsoldItem, itemTokenURI);
                setUnsoldItemsState((unsoldItemsState) => [...unsoldItemsState, itemInfo]);
            });
        }
    }

    async function getSenderItems(helloWorldMarketContract, helloWorldTokenContract) {
        const senderItems = await helloWorldMarketContract.getSenderItems();

        if (senderItems) {
            senderItems.map(async (unsoldItem) => {
                const itemTokenURI = await helloWorldTokenContract.tokenURI(unsoldItem.tokenId);
                const itemInfo = await getItemInfoFromIPFS(unsoldItem, itemTokenURI);
                setSenderItemsState((senderItemsState) => [...senderItemsState, itemInfo]);
            });
        }
    }

    async function requestAccount() {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

        setState({
            accounts: accounts,
        });
    }

    async function mintCollection() {
        const mintCollectionTx = await helloWorldTokenContractState.mintCollection();
        await mintCollectionTx.wait();
        await addItem();

        window.location.reload(false);
    }

    async function addItem() {
        for (let i = 0; i < 5; i++) {
            const tokenId = i + 1;
            const price = ethers.utils.parseEther("0.1");
            const addItemTx = await helloWorldMarketContractState.addItem(
                helloWorldTokenContractAddress,
                tokenId,
                price
            );
            await addItemTx.wait();
        }

        await getUnsoldItems(helloWorldMarketContractState, helloWorldTokenContractState);
    }

    async function buyItem(index) {
        const unsoldItem = unsoldItemsState[index];
        const buyItemTx = await helloWorldMarketContractState.buyItem(
            helloWorldTokenContractAddress,
            unsoldItem.tokenId,
            {
                value: unsoldItem.price,
            }
        );
        await buyItemTx.wait();

        window.location.reload(false);
    }

    return (
        <div className="App">
            <Header state={state} onRequestAccount={requestAccount} />
            <Content
                state={state}
                unsoldItemsState={unsoldItemsState}
                senderItemsState={senderItemsState}
                totalSupplyState={totalSupplyState}
                onMintCollection={mintCollection}
                onAddItem={addItem}
                onBuyItem={buyItem}
            />
            <Footer></Footer>
        </div>
    );
}

export default App;
