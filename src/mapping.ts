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
  card.metadataIPFS = event.params._value;
  card.wrappedBalance = 0;
  card.save();
}

export function handleTransferSingle (event: TransferSingleEvent): void {
  // event: TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
  const burnAddr: string = "0x0000000000000000000000000000000000000000";
  const contractAddr: string = "0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313";

  // WrapperContract object used to access read-only state
  const wrapContract: WrapperContract = WrapperContract.bind(event.address);

  // Collect event information
  const operator: string = event.params._operator.toHexString(); // addr that executed transfer
  const sentFrom: string = event.params._from.toHexString();
  const sentTo: string = event.params._to.toHexString();
  const cardId: number = event.params._id.toI32();
  const quantity: number = event.params._value.toI32();

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
  //   _operator = holder. same as _from
  //   _from = holder
  //   _to = different holder
  // safeBatchTransferFrom: 
  //   This function is the only one that emits the TransferBatchEvent
  //   Ignore, this can be handled separately in handleTransferBatch()

  if (quantity == 0) {
    // Card's create event or an empty send. No balance change, ignore.
  }
  else if (operator == sentTo && sentFrom == burnAddr) {
    // Wrap. Update sentTo balance
    updateBalance(sentTo, cardId, wrapContract);
    // Update Card's wrapped supply
    let card: Card = Card.load(cardId.toString());
    card.wrappedBalance += quantity;
    card.save();
  }
  else if (sentFrom == contractAddr && sentTo == burnAddr) {
    // Unwrap. Update operator (holder) balance
    updateBalance(operator, cardId, wrapContract);
    // Update Card's wrapped supply
    let card: Card = Card.load(cardId.toString());
    card.wrappedBalance -= quantity;
    card.save();
  }
  else if (operator == sentFrom && sentFrom != sentTo) {
    // Single Transfer. Update sentFrom and sentTo balance
    updateBalance(sentFrom, cardId, wrapContract);
    updateBalance(sentTo, cardId, wrapContract);
  }
  else {
    // Unknown transaction type
    log.info('Unknown Transaction Type.', []);
    log.info('- operator: {} ', [operator]);
    log.info('- sentFrom: {} ', [sentFrom]);
    log.info('- sentTo: {} ', [sentTo]);
    log.info('- cardId: {} ', [cardId.toString()]);
    log.info('- quantity: {} ', [quantity.toString()]);
  }

}

export function handleTransferBatch (event: TransferBatchEvent): void {
  //event: TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])
  // This event is only called by safeBatchTransferFrom

  // WrapperContract object used to access read-only state
  const wrapContract: WrapperContract = WrapperContract.bind(event.address);

  // Collect event information
  const sentFrom: string = event.params._from.toHexString();
  const sentTo: string = event.params._to.toHexString();
  const cardIds: number[] = event.params._ids.map(x => x.toI32());
  // const quantities: number[] = event.params._values.map(x => x.toI32());

  // Loop the cards and update the holder's balance for each
  for (let i = 0; i < cardIds.length; i++) {
    // Update sentFrom and sentTo balance
    updateBalance(sentFrom, cardIds[i], wrapContract);
    updateBalance(sentTo, cardIds[i], wrapContract);
  }
}

// == Helper Functions == //
function updateBalance (holderId: string, cardId: number, wrapContract: WrapperContract): void {
  // Load/Create user
  let holder: Holder = Holder.load(holderId);
  if (!holder) {
    holder = new Holder(holderId);
    holder.save();
  }

  // Load/Create relationship between that user and card
  const relationshipId: string = `${holder.id.toString()}-${cardId.toString()}`;

  let holderCardInfo: HolderCardBalance = HolderCardBalance.load(relationshipId);
  if (!holderCardInfo) {
    holderCardInfo = new HolderCardBalance(relationshipId);
    holderCardInfo.holder = holderId;
    holderCardInfo.card = cardId.toString();
  }
  // Fetch current user balance from the contract state
  holderCardInfo.balance = wrapContract.balanceOf(Address.fromString(holderId), BigInt.fromI32(cardId)).toI32();
  holderCardInfo.save();
}