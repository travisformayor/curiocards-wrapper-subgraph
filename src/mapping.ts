import { Address, BigInt, log } from "@graphprotocol/graph-ts";

// Import helpers for interacting with smart contract
import {
  CurioERC1155Wrapper as WrapperContract,
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent,
  URI as URIEvent
} from "../generated/CurioERC1155Wrapper/CurioERC1155Wrapper";

// Import helpers for interacting with indexer node
import {
  Card, Holder, HolderCardBalance
} from "../generated/schema";

export function handleURI (event: URIEvent): void {
  // event: URI(string,indexed uint256)
  // Only called once per card at contract creation
  // Create new card entity
  let card: Card = new Card(event.params._id.toString());
  card.metadataIPFS = event.params._value.toString();
  card.wrappedBalance = 0;
  card.save();
  log.info('Log: Card entity created: ID {}, IPFS {}', [card.id, card.metadataIPFS]);
}

export function handleTransferSingle (event: TransferSingleEvent): void {
  // event: TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
  const burnAddr: string = "0x0000000000000000000000000000000000000000";
  const contractAddr: string = "0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313";
  const contractDeployer: string = "0x53f46BFBEcB075B4feb3BcE6828b9095e630d371";
  const contractDeployer_1: string = '0x53f46BFBEcB075B4feb3BcE6828b9095e630d371';
  const contractDeployer_2: string = "0x53f46BFBEcB075B4feb3BcE6828b9095e630d371".toString();

  // WrapperContract object used to access read-only state
  const wrapContract: WrapperContract = WrapperContract.bind(event.address);

  // Collect event information
  const operator: string = event.params._operator.toHexString(); // addr that executed transfer
  const sentFrom: string = event.params._from.toHexString();
  const sentTo: string = event.params._to.toHexString();
  const cardId: i32 = event.params._id.toI32();
  const quantity: i32 = event.params._value.toI32();

  // == What kind of transfer event is this? ==
  // Create: (emits TransferSingle w/quantity 0 to let explorers know token exists)
  //   _quantity = 0
  //   Ignore, no balance change
  // Wrap: (wrap & wrapBatch emit TransferSingle for each wrap)
  //   _operator = holder. same as _to
  //   _from = Burn Address (0x0) 
  //   _to = holder
  // Unwrapping: (unwrap & unwrapBatch emit TransferSingle for each unwrap)
  //   _operator = holder
  //   _from = Contract
  //   _to = Burn Address (0x0)
  // safeTransferFrom:
  //   _operator = holder (same as _from) or smart contract
  //   _from = holder
  //   _to = different holder
  // safeBatchTransferFrom: 
  //   This function is the only one that emits the TransferBatchEvent
  //   Ignore in if...else, handle separately in handleTransferBatch()

  // Testing conditionals in invalid if statement 
  if (event.block.number == new BigInt(12129118)) {
    log.info('Test: 1 - BigInt', []);
  } 
  else if (event.block.number.toString() == '12129118') {
    log.info('Test: 2 - string', []);
  }
  else if (event.block.number.toI32() == 12129118) {
    log.info('Test: 3 - I32', []);
  }
  else if (operator == contractDeployer) {
    log.info('Test: 4 - hex string/"string"', []);
  }
  else if (event.params._operator.toString() == contractDeployer) {
    log.info('Test: 5 - string/"string"', []);
  }
  else if (event.params._operator.toString() == contractDeployer_1) {
    log.info('Test: 6 - string/single quote string', []);
  }
  else if (event.params._operator.toString() == contractDeployer_2) {
    log.info('Test: 7 - string/"string".toString()', []);
  }

  if (quantity == 0 && operator == contractDeployer && event.block.number == new BigInt(12129118)) {
    // Create when contract was deployed, to initialize token for explorers. 0 cards sent.
    log.info('Log: Create Event for Card {}', [cardId.toString()]);
  }
  else if (quantity == 0 || cardId < 1 || cardId > 30) {
    // Empty or invalid send. No balance change, so ignore. Log for confirmation
    log.info('Log: Invalid. TransactionId: {}', [event.transaction.hash.toHexString()]);
    log.info('Log: Invalid. Debug Info: quantity: {}, op: {}, deployer: {}, block: {}',
      [quantity.toString(), operator, contractDeployer, event.block.number.toString()]);
  }
  else if (operator == sentTo && sentFrom == burnAddr) {
    // Wrap. Update sentTo balance
    updateBalance(sentTo, cardId, wrapContract);
    // Update Card's wrapped supply
    let card = Card.load(cardId.toString());
    if (card) {
      card.wrappedBalance += quantity;
      card.save();
    }
  }
  else if (sentFrom == contractAddr && sentTo == burnAddr) {
    // Unwrap. Update operator (holder) balance
    updateBalance(operator, cardId, wrapContract);
    // Update Card's wrapped supply
    let card = Card.load(cardId.toString());
    if (card) {
      card.wrappedBalance -= quantity;
      card.save();
    }
  }
  else if (operator == sentFrom && sentFrom == sentTo) {
    // Holder sent cards to themselves. No change, ignore
  }
  else if (sentFrom != sentTo) {
    // If operator != sentFrom, transfer was managed by a smart contract.
    // If operator == sentFrom, transfer was holder initiated.
    // Either way, card transfer. Update sentFrom and sentTo balances.
    updateBalance(sentFrom, cardId, wrapContract);
    updateBalance(sentTo, cardId, wrapContract);
  }
  else {
    // Unhandled transaction type
    log.warning('Unhandled Transaction Type. TransactionId: {}', [event.transaction.hash.toHexString()]);
  }
}

export function handleTransferBatch (event: TransferBatchEvent): void {
  //event: TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])
  // This event is only called by safeBatchTransferFrom

  // WrapperContract object used to access read-only state
  const wrapContract: WrapperContract = WrapperContract.bind(event.address);

  // Collect event information
  const operator: string = event.params._operator.toHexString();
  const sentFrom: string = event.params._from.toHexString();
  const sentTo: string = event.params._to.toHexString();
  const cardIds: BigInt[] = event.params._ids;
  const quantities: BigInt[] = event.params._values;

  // Loop the cards and update the holder's balance for each
  for (let i = 0; i < cardIds.length; i++) {
    // Check for expected transaction types
    if (quantities[i].toI32() == 0 || cardIds[i].toI32() < 1 || cardIds[i].toI32() > 30) {
      // Empty or invalid send. No balance change, so ignore. Log for confirmation
      log.info('Log: Invalid transfer. TransactionId: {}', [event.transaction.hash.toHexString()]);
    }
    else if (operator == sentFrom && sentFrom == sentTo) {
      // Holder sent cards to themselves. No change, ignore
    }
    else if (sentFrom != sentTo) {
      // If operator != sentFrom, transfer was managed by a smart contract.
      // If operator == sentFrom, transfer was holder initiated.
      // Either way, card transfer. Update sentFrom and sentTo balances.
      updateBalance(sentFrom, cardIds[i].toI32(), wrapContract);
      updateBalance(sentTo, cardIds[i].toI32(), wrapContract);
    }
    else {
      // Unhandled transaction type
      log.warning('Unhandled Transaction Type. TransactionId: {}', [event.transaction.hash.toHexString()]);
    }
  }
}

// == Helper Functions == //
function updateBalance (holderId: string, cardId: i32, wrapContract: WrapperContract): void {
  // Load/Create user
  let holder = Holder.load(holderId);
  if (!holder) {
    holder = new Holder(holderId);
    holder.save();
  }

  // Load/Create relationship between that user and card
  const relationshipId: string = `${holder.id.toString()}-${cardId.toString()}`;

  let holderCardInfo = HolderCardBalance.load(relationshipId);
  if (!holderCardInfo) {
    holderCardInfo = new HolderCardBalance(relationshipId);
    holderCardInfo.holder = holderId;
    holderCardInfo.card = cardId.toString();
  }
  // Fetch current user balance from the contract state
  holderCardInfo.balance = wrapContract.balanceOf(Address.fromString(holderId), BigInt.fromI32(cardId)).toI32();
  holderCardInfo.save();
}