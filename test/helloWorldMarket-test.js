const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokenMetadataURIs = [
    "helloworld-ch.json",
    "helloworld-en.json",
    "helloworld-fr.json",
    "helloworld-jp.json",
    "helloworld-vn.json",
];
const price = ethers.utils.parseEther("0.1");
let helloWorldMarketContract;
let helloWorldTokenContract;
let owner;
let notOwner;
let buyer;

/**
 * @description Deploy contracts method.
 */
async function deploy() {
    [owner, notOwner, buyer] = await ethers.getSigners();

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

describe("HelloWorldMarket", function () {
    beforeEach(async () => {
        await deploy();
        await helloWorldTokenContract.mintCollection();
    });

    context("Add Item", function () {
        it("should add item", async function () {
            let ownerBalanceOfResult = await helloWorldTokenContract.balanceOf(owner.address);
            expect(ownerBalanceOfResult).to.equal(tokenMetadataURIs.length);

            for (let i = 0; i < tokenMetadataURIs.length; i++) {
                const itemId = i + 1;
                const addItemTx = await helloWorldMarketContract.addItem(
                    helloWorldTokenContract.address,
                    itemId,
                    price
                );
                await addItemTx.wait();

                const result = await helloWorldMarketContract.getItemById(itemId);
                expect(result.itemId).to.equal(itemId);
                expect(result.tokenId).to.equal(itemId);
                expect(result.price).to.equal(price);
                expect(result.tokenContractAddress).to.equal(helloWorldTokenContract.address);
                expect(result.seller).to.equal(owner.address);
                expect(result.owner).to.equal(ethers.constants.AddressZero);

                ownerBalanceOfResult = await helloWorldTokenContract.balanceOf(owner.address);
                expect(ownerBalanceOfResult).to.equal(tokenMetadataURIs.length - i - 1);

                const contractBalanceOfResult = await helloWorldTokenContract.balanceOf(
                    helloWorldMarketContract.address
                );
                expect(contractBalanceOfResult).to.equal(itemId);

                await expect(addItemTx).to.emit(helloWorldMarketContract, "ItemCreated");
            }
        });

        it("should not add item if it is not the owner", async function () {
            await expect(
                helloWorldMarketContract.connect(notOwner).addItem(helloWorldTokenContract.address, 1, price)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should not add item if price is zero", async function () {
            await expect(helloWorldMarketContract.addItem(helloWorldTokenContract.address, 1, 0)).to.be.revertedWith(
                "Price must be at least 1 wei."
            );
        });
    });

    context("Buy Item", function () {
        beforeEach(async () => {
            for (let i = 0; i < tokenMetadataURIs.length; i++) {
                const itemId = i + 1;
                const addItemTx = await helloWorldMarketContract.addItem(
                    helloWorldTokenContract.address,
                    itemId,
                    price
                );
                await addItemTx.wait();
            }
        });

        it("should buy item", async function () {
            // Check initial value for first item.
            const itemId1 = 1;
            let result = await helloWorldMarketContract.getItemById(itemId1);
            expect(result.itemId).to.equal(itemId1);
            expect(result.tokenId).to.equal(itemId1);
            expect(result.seller).to.equal(owner.address);
            expect(result.owner).to.equal(ethers.constants.AddressZero);

            let contractBalanceOfResult = await helloWorldTokenContract.balanceOf(helloWorldMarketContract.address);
            expect(contractBalanceOfResult).to.equal(tokenMetadataURIs.length);
            let buyerBalanceOfResult = await helloWorldTokenContract.balanceOf(buyer.address);
            expect(buyerBalanceOfResult).to.equal(0);

            // Buy the first item.
            let buyItemTx = await helloWorldMarketContract
                .connect(buyer)
                .buyItem(helloWorldTokenContract.address, itemId1, {
                    value: price,
                });
            await buyItemTx.wait();

            // Check value after buy first item.
            result = await helloWorldMarketContract.getItemById(itemId1);
            expect(result.itemId).to.equal(itemId1);
            expect(result.tokenId).to.equal(itemId1);
            expect(result.seller).to.equal(owner.address);
            expect(result.owner).to.equal(buyer.address);

            contractBalanceOfResult = await helloWorldTokenContract.balanceOf(helloWorldMarketContract.address);
            expect(contractBalanceOfResult).to.equal(tokenMetadataURIs.length - 1);
            buyerBalanceOfResult = await helloWorldTokenContract.balanceOf(buyer.address);
            expect(buyerBalanceOfResult).to.equal(1);

            // Check initial value for second item.
            const itemId4 = 4;
            result = await helloWorldMarketContract.getItemById(itemId4);
            expect(result.itemId).to.equal(itemId4);
            expect(result.tokenId).to.equal(itemId4);
            expect(result.seller).to.equal(owner.address);
            expect(result.owner).to.equal(ethers.constants.AddressZero);

            // Buy the second item.
            buyItemTx = await helloWorldMarketContract
                .connect(buyer)
                .buyItem(helloWorldTokenContract.address, itemId4, {
                    value: price,
                });
            await buyItemTx.wait();

            // Check value after buy second item.
            result = await helloWorldMarketContract.getItemById(itemId4);
            expect(result.itemId).to.equal(itemId4);
            expect(result.tokenId).to.equal(itemId4);
            expect(result.seller).to.equal(owner.address);
            expect(result.owner).to.equal(buyer.address);

            contractBalanceOfResult = await helloWorldTokenContract.balanceOf(helloWorldMarketContract.address);
            expect(contractBalanceOfResult).to.equal(tokenMetadataURIs.length - 2);
            buyerBalanceOfResult = await helloWorldTokenContract.balanceOf(buyer.address);
            expect(buyerBalanceOfResult).to.equal(2);
        });

        it("should not buy item if it is not the correct price", async function () {
            await expect(
                helloWorldMarketContract.connect(buyer).buyItem(helloWorldTokenContract.address, 1)
            ).to.be.revertedWith("Please purchase the correct price.");

            await expect(
                helloWorldMarketContract.connect(buyer).buyItem(helloWorldTokenContract.address, 1, {
                    value: ethers.utils.parseEther("0.00001"),
                })
            ).to.be.revertedWith("Please purchase the correct price.");
        });
    });

    context("Get Items", function () {
        beforeEach(async () => {
            for (let i = 0; i < tokenMetadataURIs.length; i++) {
                const itemId = i + 1;
                const addItemTx = await helloWorldMarketContract.addItem(
                    helloWorldTokenContract.address,
                    itemId,
                    price
                );
                await addItemTx.wait();
            }
        });

        it("should get sender items", async function () {
            let ownerItems = await helloWorldMarketContract.connect(buyer).getSenderItems();
            expect(ownerItems.length).to.equal(0);

            const buyItemTx = await helloWorldMarketContract
                .connect(buyer)
                .buyItem(helloWorldTokenContract.address, 4, {
                    value: price,
                });
            await buyItemTx.wait();

            ownerItems = await helloWorldMarketContract.connect(buyer).getSenderItems();
            expect(ownerItems.length).to.equal(1);
            expect(ownerItems[0].itemId).to.equal(4);
            expect(ownerItems[0].tokenId).to.equal(4);
            expect(ownerItems[0].owner).to.equal(buyer.address);
        });

        it("should get unsold items", async function () {
            let unsoldItems = await helloWorldMarketContract.connect(buyer).getUnsoldItems();
            expect(unsoldItems.length).to.equal(5);
            expect(unsoldItems[0].itemId).to.equal(1);
            expect(unsoldItems[0].tokenId).to.equal(1);
            expect(unsoldItems[1].itemId).to.equal(2);
            expect(unsoldItems[1].tokenId).to.equal(2);
            expect(unsoldItems[2].itemId).to.equal(3);
            expect(unsoldItems[2].tokenId).to.equal(3);
            expect(unsoldItems[3].itemId).to.equal(4);
            expect(unsoldItems[3].tokenId).to.equal(4);
            expect(unsoldItems[4].itemId).to.equal(5);
            expect(unsoldItems[4].tokenId).to.equal(5);

            const buyItemTx = await helloWorldMarketContract
                .connect(buyer)
                .buyItem(helloWorldTokenContract.address, 4, {
                    value: price,
                });
            await buyItemTx.wait();

            unsoldItems = await helloWorldMarketContract.connect(buyer).getUnsoldItems();
            expect(unsoldItems.length).to.equal(4);
            expect(unsoldItems[0].itemId).to.equal(1);
            expect(unsoldItems[0].tokenId).to.equal(1);
            expect(unsoldItems[1].itemId).to.equal(2);
            expect(unsoldItems[1].tokenId).to.equal(2);
            expect(unsoldItems[2].itemId).to.equal(3);
            expect(unsoldItems[2].tokenId).to.equal(3);
            expect(unsoldItems[3].itemId).to.equal(5);
            expect(unsoldItems[3].tokenId).to.equal(5);
        });
    });
});
