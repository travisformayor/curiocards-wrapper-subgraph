// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Card extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("metadataIPFS", Value.fromString(""));
    this.set("wrappedBalance", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Card entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Card entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Card", id.toString(), this);
    }
  }

  static load(id: string): Card | null {
    return changetype<Card | null>(store.get("Card", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get metadataIPFS(): string {
    let value = this.get("metadataIPFS");
    return value!.toString();
  }

  set metadataIPFS(value: string) {
    this.set("metadataIPFS", Value.fromString(value));
  }

  get wrappedBalance(): BigInt {
    let value = this.get("wrappedBalance");
    return value!.toBigInt();
  }

  set wrappedBalance(value: BigInt) {
    this.set("wrappedBalance", Value.fromBigInt(value));
  }

  get holders(): Array<string> {
    let value = this.get("holders");
    return value!.toStringArray();
  }

  set holders(value: Array<string>) {
    this.set("holders", Value.fromStringArray(value));
  }
}

export class Holder extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Holder entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save Holder entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("Holder", id.toString(), this);
    }
  }

  static load(id: string): Holder | null {
    return changetype<Holder | null>(store.get("Holder", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get cards(): Array<string> | null {
    let value = this.get("cards");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set cards(value: Array<string> | null) {
    if (!value) {
      this.unset("cards");
    } else {
      this.set("cards", Value.fromStringArray(<Array<string>>value));
    }
  }
}

export class HolderCardBalance extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("holder", Value.fromString(""));
    this.set("card", Value.fromString(""));
    this.set("balance", Value.fromBigInt(BigInt.zero()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save HolderCardBalance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        "Cannot save HolderCardBalance entity with non-string ID. " +
          'Considering using .toHex() to convert the "id" to a string.'
      );
      store.set("HolderCardBalance", id.toString(), this);
    }
  }

  static load(id: string): HolderCardBalance | null {
    return changetype<HolderCardBalance | null>(
      store.get("HolderCardBalance", id)
    );
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get holder(): string {
    let value = this.get("holder");
    return value!.toString();
  }

  set holder(value: string) {
    this.set("holder", Value.fromString(value));
  }

  get card(): string {
    let value = this.get("card");
    return value!.toString();
  }

  set card(value: string) {
    this.set("card", Value.fromString(value));
  }

  get balance(): BigInt {
    let value = this.get("balance");
    return value!.toBigInt();
  }

  set balance(value: BigInt) {
    this.set("balance", Value.fromBigInt(value));
  }
}
