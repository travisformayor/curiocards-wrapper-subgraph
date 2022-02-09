// import { BigInt, Address } from "@graphprotocol/graph-ts";

// Import for interacting with smart contract
import {
  CurioERC1155Wrapper as WrapperContract,
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent
} from "../generated/CurioERC1155Wrapper/CurioERC1155Wrapper";

// Import for interacting with indexer node
import {
  Card, Holder, HolderCardBalance
} from "../generated/schema";


// event: TransferSingle(indexed address,indexed address,indexed address,uint256,uint256)
export function handleTransferSingle (event: TransferSingleEvent): void {

}

//event: TransferBatch(indexed address,indexed address,indexed address,uint256[],uint256[])
export function handleTransferBatch (event: TransferBatchEvent): void {

}
