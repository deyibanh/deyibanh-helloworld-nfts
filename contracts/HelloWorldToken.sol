// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title The Dé Yi Banh Hello World's contract.
 *
 * @author Dé Yi Banh (@deyibanh)
 *
 * @notice This contract manages the NFT collection.
 */
contract HelloWorldToken is ERC721Enumerable, ERC721URIStorage, Ownable {
    /**
     * @dev The max supply.
     */
    uint public maxSupply = 5;
    
    /**
     * @dev A boolean to pause the minting.
     */
    bool public paused;

    /**
     * @dev The market contract address.
     */
    address public marketContractAddress;

    /**
     * @dev The base URI.
     */
    string private baseURI;

    /**
     * @dev Token minted event.
     */
    event TokenMinted (
        uint tokenId,
        address owner,
        string tokenURI
    );

    /**
     * @notice The constructor.
     *
     * @param _newBaseURI The base URI (Example: "ipfs://<CID>/").
     * @param _marketContractAddress The market contract address.
     */
    constructor(string memory _newBaseURI, address _marketContractAddress) ERC721("Hello World", "DBHW") {
        baseURI = _newBaseURI;
        marketContractAddress = _marketContractAddress;
    }

    /**
     * @notice Set the max supply.
     *
     * @param _maxSupply The new max supply.
     */
    function setMaxSupply(uint _maxSupply) external onlyOwner {
        maxSupply = _maxSupply;
    }

    /**
     * @notice Pause or unpause the minting.
     *
     * @param _paused The new pause value.
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    /**
     * @notice Set the market contract address.
     *
     * @param _marketContractAddress The new market contract address.
     */
    function setMarketContractAddress(address _marketContractAddress) external onlyOwner {
        require(_marketContractAddress != address(0), "Address not valid.");
        
        marketContractAddress = _marketContractAddress;
    }

    /**
     * @notice Get the base URI.
     *
     * @return The base URI.
     */
    function getBaseURI() external view onlyOwner returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Set the base URI.
     *
     * @param _newBaseURI The new base URI.
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
    }

    /**
     * @notice Mint all the Hello World collection.
     */
    function mintCollection() public onlyOwner {
        uint totalSupply = totalSupply();
        string[5] memory tokenMetadataURIs = [
            "helloworld-ch.json",
            "helloworld-en.json",
            "helloworld-fr.json",
            "helloworld-jp.json",
            "helloworld-vn.json"
        ];

        require(!paused, "Minting is paused.");
        require(totalSupply < maxSupply, "Sold out!");
        // require(totalSupply + tokenMetadataURIs.length <= maxSupply, "Exceeds the max supply.");

        for (uint i = 0; i < tokenMetadataURIs.length; i++) {
            totalSupply++;
            uint newTokenId = totalSupply;

            super._safeMint(msg.sender, newTokenId);
            super._setTokenURI(newTokenId, tokenMetadataURIs[i]);

            emit TokenMinted(newTokenId, msg.sender, tokenMetadataURIs[i]);
        }

        super.setApprovalForAll(marketContractAddress, true);
    }

    /**
     * @inheritdoc ERC721Enumerable
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ERC721URIStorage
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @inheritdoc ERC721
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    /**
     * @inheritdoc ERC721Enumerable
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @inheritdoc ERC721URIStorage
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
