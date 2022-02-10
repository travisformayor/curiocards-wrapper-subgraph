import { Address } from "@graphprotocol/graph-ts";

// Import helpers for interacting with smart contract
import {
  CurioERC1155Wrapper as WrapperContract,
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent
} from "../generated/CurioERC1155Wrapper/CurioERC1155Wrapper";

// Import helpers for interacting with indexer node
import {
  Card, Holder, HolderCardBalance
} from "../generated/schema";

export function handleTransferSingle (event: TransferSingleEvent): void {
  // event: TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
  // Collect event information
  const operator: Address = event.params._operator; // addr that executed transfer
  const sentFrom: Address = event.params._from;
  const sentTo: Address = event.params._to;
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
  const burnAddr: string = "0x0000000000000000000000000000000000000000";
  const contractAddr: string = "0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313";

  if (quantity == 0) {
    // Create
  }
  else if (operator.toHex() == sentTo.toHex() && sentFrom.toHex() == burnAddr) {
    // Wrap
  }
  else if (sentFrom.toHex() == contractAddr && sentTo.toHex() == burnAddr) {
    // Unwrap
  }
  else if (operator.toHex() == sentFrom.toHex() && sentFrom.toHex() != sentTo.toHex()) {
    // Single Transfer
  }
  else {
    // Unknown
  }

}

export function handleTransferBatch (event: TransferBatchEvent): void {
  //event: TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])

}
