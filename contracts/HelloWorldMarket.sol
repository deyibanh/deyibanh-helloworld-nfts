// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title The Dé Yi Banh Hello World's contract.
 *
 * @author Dé Yi Banh (@deyibanh)
 *
 * @notice This contract manages the NFT collection.
 */
contract HelloWorldMarket is ERC721Holder, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    /**
     * @dev A map of an item id and an item.
     */
    mapping(uint => Item) private idItemMap;

    /**
     * @notice A counter for item's id.
     */
    Counters.Counter private itemIdCounter;

    /**
     * @notice A counter for items sold.
     */
    Counters.Counter private itemSoldCounter;

    /**
     * @dev Item struct.
     */
    struct Item {
        uint itemId;
        uint tokenId;
        uint price;
        address tokenContractAddress;
        address payable seller;
        address payable owner;
    }

    /**
     * @dev Item created event.
     */
    event ItemCreated (
        uint itemId,
        uint tokenId,
        uint price,
        address tokenContractAddress,
        address seller,
        address owner
    );

    /**
     * @notice Add a new item into idItemMap and transfer the token.
     *
     * @param _tokenContractAddress The token contract address.
     * @param _tokenId The token id.
     * @param _price The price.
     */
    function addItem(address _tokenContractAddress, uint _tokenId, uint _price)
        external
        payable
        onlyOwner
        nonReentrant
    {
        require(_price > 0, "Price must be at least 1 wei.");

        itemIdCounter.increment();
        uint itemId = itemIdCounter.current();
        idItemMap[itemId] = Item(
            itemId,
            _tokenId,
            _price,
            _tokenContractAddress,
            payable(msg.sender),
            payable(address(0))
        );
        IERC721(_tokenContractAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        emit ItemCreated(
            itemId,
            _tokenId,
            _price,
            _tokenContractAddress,
            msg.sender,
            address(0)
        );
    }

    /**
     * @notice Buy the item and transfer the ownership.
     */
    function buyItem(address _tokenContractAddress, uint _itemId) external payable nonReentrant {
        uint price = idItemMap[_itemId].price;
        uint tokenId = idItemMap[_itemId].tokenId;
        
        require(msg.value == price, "Please purchase the correct price.");

        itemSoldCounter.increment();
        idItemMap[_itemId].owner = payable(msg.sender);
        idItemMap[_itemId].seller.transfer(msg.value);

        IERC721(_tokenContractAddress).transferFrom(address(this), msg.sender, tokenId);

        // payable(Ownable.owner()).transfer(listingCost);
    }

    /**
     * @notice Get owner's items.
     *
     * @return The owner item list.
     */
    function getSenderItems() external view returns (Item[] memory) {
        uint totalItem = itemIdCounter.current();
        uint totalSenderItem = 0;
        uint senderItemsIndex = 0;

        for (uint i = 0; i < totalItem; i++) {
            if (idItemMap[i + 1].owner == msg.sender) {
                totalSenderItem++;
            }
        }
        
        Item[] memory senderItems = new Item[](totalSenderItem);

        for (uint i = 0; i < totalItem; i++) {
            if (idItemMap[i + 1].owner == msg.sender) {
                Item memory currentItem = idItemMap[i + 1];
                senderItems[senderItemsIndex] = currentItem;
                senderItemsIndex++;
            }
        }

        return senderItems;
    }

    /**
     * @notice Get unsold items.
     *
     * @return The unsold item list.
     */
    function getUnsoldItems() external view returns (Item[] memory) {
        uint totalItem = itemIdCounter.current();
        uint totalUnsoldItem = totalItem - itemSoldCounter.current();
        uint unsoldItemsIndex = 0;

        Item[] memory unsoldItems = new Item[](totalUnsoldItem);

        for (uint i = 0; i < totalItem; i++) {
            if (idItemMap[i + 1].owner == address(0)) {
                Item memory currentItem = idItemMap[i + 1];
                unsoldItems[unsoldItemsIndex] = currentItem;
                unsoldItemsIndex++;
            }
        }
    
        return unsoldItems;
    }

    /**
     * @notice Get item by id.
     *
     * @param _itemId The item id.
     *
     * @return The item.
     */
    function getItemById(uint _itemId) external view returns (Item memory) {
        Item memory item = idItemMap[_itemId];

        return item;
    }
}
