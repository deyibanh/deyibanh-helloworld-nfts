# The Hello World Collection by Dé Yi Banh 

## <u>Presentation</u>

This is a sample project to create a buy a simple NFT Collection.

<img src="./metadata/images/helloworld-ch.png" width="100" height="100" />
<img src="./metadata/images/helloworld-en.png" width="100" height="100" />
<img src="./metadata/images/helloworld-fr.png" width="100" height="100" />
<img src="./metadata/images/helloworld-jp.png" width="100" height="100" />
<img src="./metadata/images/helloworld-vn.png" width="100" height="100" />

Dapp preview (deployed on Polygon Mumbai testnet) is available here :
https://deyibanh.github.io/deyibanh-helloworld-nfts/ <br />
Contracts addresses are available:
- HelloWorldMarket: "0x9a00A1eA4dCf5D1a693Fa897a4792fdb059dcF8A"
- HelloWorldToken: "0x573fa6c246a794c1C43263F0bbF9a7cf9E64cb60"

# <u>Setup</u>

## 1. Install

To install the project, open a terminal at the root folder and execute :<br />
`$> npm install && npx hardhat compile && cd client && npm install`

## 2.Configuration

Create your own `.env` file and add your parameters (there is a .env-example file that you can copy):

- `INFURA_ROPSTEN_URL`: Replace`<YOUR INFURA ID>` by your Infura ID.
- `PRIVATE_KEY`: Your private key.
- `OPTIMISM_API_KEY`: Paste your Etherscan API key.

## 3. Deployment

We use Hardhat to deploy the smart contracts.

### 3.1 Compile smart contracts:<br />

`$> npx hardhat compile`

### 3.2 Deploy smart contracts :

On local, open a terminal and run: <br />
`$> npx hardhat node`<br />

Open another terminal and run : <br />
`$> npx hardhat run scripts/deploy.js --network <YOUR NETWORK NAME>`

> **Replace `<YOUR NETWORK NAME>` by the network (mainnet, polygon or localhost)**

## 4. Start client

Once contracts are deployed, you can start the client :<br/>
`$> cd client; npm run start`

## 5. Tests commands

-   Launch test with Hardhat:
    `$> npx hardhat test`

-   Launch test to a specific folder/file with Hardhat:
    `$> npx hardhat test <FOLDER_PATH/FILE_PATH>`


## 6. Docs

Developers documentation:
-   [Natspec](./docs/natspec/)

## Copyright & License

License MIT<br />

Copyright (C) 2022
