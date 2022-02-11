// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const helloWorldMarketArtifact = await hre.ethers.getContractFactory("HelloWorldMarket");
    const helloWorldMarketContract = await helloWorldMarketArtifact.deploy();
    await helloWorldMarketContract.deployed();
    console.log("HelloWorldMarket contract deployed to:", helloWorldMarketContract.address);

    const helloWorldTokenArtifact = await hre.ethers.getContractFactory("HelloWorldToken");
    const helloWorldTokenContract = await helloWorldTokenArtifact.deploy(
        process.env.BASE_URI,
        helloWorldMarketContract.address
    );
    await helloWorldTokenContract.deployed();
    console.log("HelloWorldToken contract deployed to:", helloWorldTokenContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
