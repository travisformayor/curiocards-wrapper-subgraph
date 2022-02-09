# Curio Cards Wrapper Subgraph

The Graph subgraph for the [Curio Cards Wrapper smart contract](https://etherscan.io/address/0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313#code)

## Planned Features List
- This subgraph only supports wrapped cards
- Return all users who own a specific card
- Return all the card balances for a specific user
- Retrieve ipfs data with Graph's ipfs support

## Data Model
Unlike with erc721, erc1155 nfts can have multiple print holders. This creates a many-to-many relationship between cards and holders.

### Entities
- Card
    - metadata ipfs hash
    - wrapped balance
    - list of holders
- Holder
    - ethereum address
    - list of cards owned
        - Can be null if transferred away all previously owned cards
- HolderCardBalance
    - Many-to-many relationship mapping table
        - CardID can have many owners
        - HolderID can have many cards
    - Balance of each card the holder has

## Future Additions
- Number of unique cards a holder has
- SetBalances mapping and Sets indexing