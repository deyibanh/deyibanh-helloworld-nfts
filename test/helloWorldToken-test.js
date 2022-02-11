const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokenMetadataURIs = [
    "helloworld-ch.json",
    "helloworld-en.json",
    "helloworld-fr.json",
    "helloworld-jp.json",
    "helloworld-vn.json",
];
let helloWorldMarketContract;
let helloWorldTokenContract;
let owner;
let notOwner;

/**
 * @description Deploy contracts method.
 */
async function deploy() {
    [owner, notOwner] = await ethers.getSigners();

    const helloWorldMarketArtifact = await ethers.getContractFactory("HelloWorldMarket");
    helloWorldMarketContract = await helloWorldMarketArtifact.deploy();
    await helloWorldMarketContract.deployed();

    const helloWorldTokenArtifact = await ethers.getContractFactory("HelloWorldToken");
    helloWorldTokenContract = await helloWorldTokenArtifact.deploy(
        process.env.BASE_URI,
        helloWorldMarketContract.address
    );
    await helloWorldTokenContract.deployed();
}

describe("HelloWorldToken", function () {
    beforeEach(async () => {
        await deploy();
    });

    context("Getter / Setter", function () {
        it("should set the max supply", async function () {
            let result = await helloWorldTokenContract.maxSupply();
            expect(result).to.equal(5);
            const setMaxSupplyTx = await helloWorldTokenContract.setMaxSupply(10);
            await setMaxSupplyTx.wait();
            result = await helloWorldTokenContract.maxSupply();
            expect(result).to.equal(10);
        });

        it("should not set the max supply if it is not the owner", async function () {
            await expect(helloWorldTokenContract.connect(notOwner).setMaxSupply(10)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("should set the pause value", async function () {
            let result = await helloWorldTokenContract.paused();
            expect(result).to.equal(false);
            const setPausedTx = await helloWorldTokenContract.setPaused(true);
            await setPausedTx.wait();
            result = await helloWorldTokenContract.paused();
            expect(result).to.equal(true);
        });

        it("should not set the pause value if it is not the owner", async function () {
            await expect(helloWorldTokenContract.connect(notOwner).setPaused(true)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("should set the market contract address", async function () {
            let result = await helloWorldTokenContract.marketContractAddress();
            expect(result).to.equal(helloWorldMarketContract.address);
            const setMarketContractAddressTx = await helloWorldTokenContract.setMarketContractAddress(
                helloWorldTokenContract.address
            );
            await setMarketContractAddressTx.wait();
            result = await helloWorldTokenContract.marketContractAddress();
            expect(result).to.equal(helloWorldTokenContract.address);
        });

        it("should not set the market contract address if it is not the owner", async function () {
            await expect(
                helloWorldTokenContract.connect(notOwner).setMarketContractAddress(helloWorldTokenContract.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should not set the market contract address if the contract address is zero", async function () {
            await expect(
                helloWorldTokenContract.setMarketContractAddress(ethers.constants.AddressZero)
            ).to.be.revertedWith("Address not valid.");
        });

        it("should set the new base URI", async function () {
            let result = await helloWorldTokenContract.getBaseURI();
            expect(result).to.equal(process.env.BASE_URI);
            const setBaseURITx = await helloWorldTokenContract.setBaseURI("New Base");
            await setBaseURITx.wait();
            result = await helloWorldTokenContract.getBaseURI();
            expect(result).to.equal("New Base");
        });

        it("should not set the new base URI if it is not the owner", async function () {
            await expect(helloWorldTokenContract.connect(notOwner).setBaseURI("New Base")).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("should not support interface", async function () {
            let result = await helloWorldTokenContract.getBaseURI();
            expect(result).to.equal(process.env.BASE_URI);
            const setBaseURITx = await helloWorldTokenContract.setBaseURI("New Base");
            await setBaseURITx.wait();
            result = await helloWorldTokenContract.getBaseURI();
            expect(result).to.equal("New Base");
        });
    });

    context("Mint", function () {
        it("should mint the collection", async function () {
            let result = await helloWorldTokenContract.totalSupply();
            let ownerBalanceResult = await helloWorldTokenContract.balanceOf(owner.address);
            let approvedResult = await helloWorldTokenContract.isApprovedForAll(
                owner.address,
                helloWorldMarketContract.address
            );
            let balanceOfResult = await helloWorldTokenContract.balanceOf(owner.address);

            expect(result).to.equal(0);
            expect(ownerBalanceResult).to.equal(0);
            expect(approvedResult).to.equal(false);
            expect(balanceOfResult).to.equal(0);

            for (let i = 0; i < tokenMetadataURIs.length; i++) {
                await expect(helloWorldTokenContract.tokenURI(i + 1)).to.be.revertedWith(
                    "ERC721URIStorage: URI query for nonexistent token"
                );
            }

            const mintCollectionTx = await helloWorldTokenContract.mintCollection();
            await mintCollectionTx.wait();
            await expect(mintCollectionTx).to.emit(helloWorldTokenContract, "TokenMinted");

            result = await helloWorldTokenContract.totalSupply();
            ownerBalanceResult = await helloWorldTokenContract.balanceOf(owner.address);
            approvedResult = await helloWorldTokenContract.isApprovedForAll(
                owner.address,
                helloWorldMarketContract.address
            );
            balanceOfResult = await helloWorldTokenContract.balanceOf(owner.address);

            expect(result).to.equal(tokenMetadataURIs.length);
            expect(ownerBalanceResult).to.equal(tokenMetadataURIs.length);
            expect(approvedResult).to.equal(true);
            expect(balanceOfResult).to.equal(tokenMetadataURIs.length);

            for (let i = 0; i < tokenMetadataURIs.length; i++) {
                const tokenURIResult = await helloWorldTokenContract.tokenURI(i + 1);
                expect(tokenURIResult).to.be.equal(process.env.BASE_URI + tokenMetadataURIs[i]);
            }
        });

        it("should not mint the collection if it is not the owner", async function () {
            await expect(helloWorldTokenContract.connect(notOwner).mintCollection()).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("should not mint the collection if minting is paused", async function () {
            const setPausedTx = await helloWorldTokenContract.setPaused(true);
            await setPausedTx.wait();
            await expect(helloWorldTokenContract.mintCollection()).to.be.revertedWith("Minting is paused.");
        });

        it("should not mint the collection if it is sold out", async function () {
            const mintCollectionTx = await helloWorldTokenContract.mintCollection();
            await mintCollectionTx.wait();

            await expect(helloWorldTokenContract.mintCollection()).to.be.revertedWith("Sold out!");
        });
    });
});
