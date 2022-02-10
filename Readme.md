# Curio Cards Wrapper Subgraph

The Graph subgraph for the [Curio Cards Wrapper smart contract](https://etherscan.io/address/0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313#code)

## Features List
- This subgraph only supports wrapped cards
- Index all users who hold a specific card
- Index user balance for each card they hold
- (To Do) Retrieve ipfs data with Graph's ipfs support
- (Optional To Do) Index number of unique cards each holder has
- (Optional To Do) Index Sets balances same as Card balances

## Data Model
Unlike with erc721, erc1155 nfts can have multiple print holders. This creates a many-to-many relationship between cards and holders.

### Entities
- Card
    - Card token ID number
    - metadata ipfs hash
    - wrapped balance
    - list of holders
- Holder
    - ethereum address
    - list of cards owned
        - Can be null if transferred away all previously owned cards
- HolderCardBalance
    - Many-to-many relationship mapping table
        - Cards can have many holders
        - Holders can have many cards
    - Balance of the holder's card
