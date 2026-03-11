import { isPositiveInteger } from '../common/utils';
import db, { PenguinData, PlayerPuffle, Stampbook, RainbowPuffleStage, Mail, Igloo, parseJsonSet, parseJsonRows, parseJsonMap, dumpJsonSet, dumpJsonRows, dumpJsonMap, isRainbowStage, Databases } from './database';
import { CardJitsuProgress } from './game-logic/ninja-progress';
import { PUFFLE_ITEMS } from './game-logic/puffle-item';

export type PenguinEquipped = {
  color: number
  head: number
  face: number
  neck: number
  body: number
  hand: number
  feet: number
  pin: number
  background: number
}

export type PenguinEquipmentSlot = keyof PenguinEquipped;

export type DefaultPenguinParams = Partial<Pick<PenguinData, 'is_member' | 'virtualRegistrationTimestamp'>>;

export class Penguin {
  private _id: number;
  private _name: string;
  private _isMember: boolean;
  private _isAgent: boolean;
  private _mascot: number;
  private _equipped: PenguinEquipped;
  private _coins: number;
  private _registrationTimestamp: number;
  private _virtualRegistrationTimestamp: number;
  private _minutesPlayed: number;
  private _inventory: Set<number>;
  private _stamps: Set<number>;
  private _stampbook: Stampbook;
  private _puffleSeq: number;
  private _puffles: Map<number, PlayerPuffle>;
  private _backyard: Set<number>;
  private _puffleItems: Map<number, number>;
  private _hasDug: boolean;
  private _treasureFinds: number[];
  private _rainbow: {
    adoptability: boolean;
    currentTask: number;
    latestTaskCompletionTime?: number;
    coinsCollected: Set<RainbowPuffleStage>;
  }
  private _furnitureInventory: Map<number, number>;
  private _iglooTypes: Set<number>;
  private _iglooLocations: Set<number>;
  private _iglooFloorings: Set<number>;
  private _buddies: Set<number>;
  private _mailSeq: number;
  private _puffleLaunchGameData: Buffer;
  private _mail: Array<Mail>;
  private _igloos: Map<number, Igloo>;
  private _igloo: number;
  private _iglooSeq: number;
  private _ownedMedals: number;
  private _careerMedals: number;
  private _nuggets: number;
  private _cards: Map<number, number>;
  private _cardProgress: CardJitsuProgress;
  private _cardWins: number;
  private _battleOfDoom: boolean;
  private _medieval2012Message: number;
  private _noSave: boolean;
  private _safeChat: boolean;

  private _isFireNinja: boolean;
  private _isWaterNinja: boolean;
  private _isSnowNinja: boolean;

  constructor(id: number, data: PenguinData) {
    this._id = id;
    this._name = data.name;
    this._isMember = data.is_member;
    this._isAgent = data.is_agent;
    this._mascot = data.mascot;
    this._equipped = {
      color: data.color,
      head: data.head,
      face: data.face,
      neck: data.neck,
      body: data.body,
      hand: data.hand,
      feet: data.feet,
      pin: data.pin,
      background: data.background
    };
    this._coins = data.coins;
    this._registrationTimestamp = data.registration_date;
    this._minutesPlayed = data.minutes_played;
    this._inventory = parseJsonSet(data.inventory);
    this._stamps = parseJsonSet(data.stamps);
    this._stampbook = data.stampbook;
    this._puffleSeq = data.puffleSeq;
    this._puffles = parseJsonRows(data.puffles);
    this._backyard = parseJsonSet(data.backyard);
    this._puffleItems = parseJsonMap(data.puffleItems, true);
    this._hasDug = data.hasDug;
    this._treasureFinds = data.treasureFinds;
    this._rainbow = {
      adoptability: data.rainbow.adoptability,
      currentTask: data.rainbow.currentTask,
      latestTaskCompletionTime: data.rainbow.latestTaskCompletionTime,
      coinsCollected: parseJsonSet(data.rainbow.coinsCollected.filter<RainbowPuffleStage>(((value): value is RainbowPuffleStage => {
        return isRainbowStage(value);
      })))
    },
      this._furnitureInventory = parseJsonMap(data.furniture, true);
    this._iglooTypes = parseJsonSet(data.iglooTypes);
    this._iglooLocations = parseJsonSet(data.iglooLocations);
    this._iglooFloorings = parseJsonSet(data.iglooFloorings);
    this._buddies = new Set<number>((data.buddies ?? []).map((id) => Number(id)));
    this._mailSeq = data.mailSeq;
    this._puffleLaunchGameData = Buffer.from(data.puffleLaunchGameData ?? '', 'base64');
    this._mail = data.mail;
    this._igloo = data.igloo;
    this._igloos = parseJsonRows(data.igloos);
    this._iglooSeq = data.iglooSeq;
    this._ownedMedals = data.ownedMedals;
    this._careerMedals = data.careerMedals;
    this._nuggets = data.nuggets;
    this._cards = parseJsonMap(data.cards, true);
    this._cardProgress = new CardJitsuProgress(data.cardProgress, data.senseiAttempts, data.isNinja);
    this._cardWins = data.cardWins;
    this._battleOfDoom = data.battleOfDoom;
    this._virtualRegistrationTimestamp = data.virtualRegistrationTimestamp;
    this._medieval2012Message = data.medieval2012Message ?? 0;
    this._noSave = data.noSave ?? false;
    this._safeChat = data.safeChat ?? false;
    this._isFireNinja = data.fireNinja ?? false;
    this._isWaterNinja = data.waterNinja ?? false;
    this._isSnowNinja = data.snowNinja ?? false;
  }

  serialize(): PenguinData {
    return {
      name: this._name,
      is_member: this._isMember,
      is_agent: this._isAgent,
      mascot: this._mascot,
      color: this._equipped.color,
      head: this._equipped.head,
      face: this._equipped.face,
      neck: this._equipped.neck,
      body: this._equipped.body,
      hand: this._equipped.hand,
      feet: this._equipped.feet,
      pin: this._equipped.pin,
      background: this._equipped.background,
      coins: this._coins,
      registration_date: this._registrationTimestamp,
      minutes_played: this._minutesPlayed,
      inventory: dumpJsonSet(this._inventory),
      stamps: dumpJsonSet(this._stamps),
      stampbook: this._stampbook,
      puffleSeq: this._puffleSeq,
      puffles: dumpJsonRows(this._puffles),
      backyard: dumpJsonSet(this._backyard),
      puffleItems: dumpJsonMap(this._puffleItems),
      hasDug: this._hasDug,
      treasureFinds: this._treasureFinds,
      rainbow: {
        adoptability: this._rainbow.adoptability,
        currentTask: this._rainbow.currentTask,
        latestTaskCompletionTime: this._rainbow.latestTaskCompletionTime,
        coinsCollected: dumpJsonSet(this._rainbow.coinsCollected)
      },
      furniture: dumpJsonMap(this._furnitureInventory),
      iglooFloorings: dumpJsonSet(this._iglooFloorings),
      iglooLocations: dumpJsonSet(this._iglooLocations),
      iglooTypes: dumpJsonSet(this._iglooTypes),
      buddies: Array.from(this._buddies.values()),
      mailSeq: this._mailSeq,
      puffleLaunchGameData: this._puffleLaunchGameData.toString('base64'),
      igloo: this._igloo,
      igloos: dumpJsonRows(this._igloos),
      iglooSeq: this._iglooSeq,
      mail: this._mail,
      ownedMedals: this._ownedMedals,
      careerMedals: this._careerMedals,
      nuggets: this._nuggets,
      cards: dumpJsonMap(this._cards),
      cardProgress: this._cardProgress.xp,
      senseiAttempts: this._cardProgress.senseiAttempts,
      isNinja: this._cardProgress.isNinja,
      cardWins: this._cardWins,
      battleOfDoom: this._battleOfDoom,
      virtualRegistrationTimestamp: this._virtualRegistrationTimestamp,
      medieval2012Message: this._medieval2012Message,
      noSave: this._noSave,
      safeChat: this._safeChat,
      fireNinja: this._isFireNinja,
      waterNinja: this._isWaterNinja,
      snowNinja: this._isSnowNinja
    }
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get color() {
    return this._equipped.color;
  }

  get head() {
    return this._equipped.head;
  }

  get face() {
    return this._equipped.face;
  }

  get neck() {
    return this._equipped.neck;
  }

  get body() {
    return this._equipped.body;
  }

  get hand() {
    return this._equipped.hand;
  }

  get feet() {
    return this._equipped.feet;
  }

  get pin() {
    return this._equipped.pin;
  }

  get background() {
    return this._equipped.background;
  }

  get isMember() {
    return this._isMember;
  }

  get coins() {
    return this._coins;
  }

  set color(id: number) {
    this._equipped.color = id;
  }

  set head(id: number) {
    this._equipped.head = id;
  }

  set face(id: number) {
    this._equipped.face = id;
  }

  set neck(id: number) {
    this._equipped.neck = id;
  }

  set body(id: number) {
    this._equipped.body = id;
  }

  set hand(id: number) {
    this._equipped.hand = id;
  }

  set feet(id: number) {
    this._equipped.feet = id;
  }

  set pin(id: number) {
    this._equipped.pin = id;
  }

  set background(id: number) {
    this._equipped.background = id;
  }

  get stampbook() {
    return this._stampbook;
  }

  get mascot() {
    return this._mascot;
  }

  get isAgent() {
    return this._isAgent;
  }

  get hasDug() {
    return this._hasDug;
  }

  get rainbowQuestInfo() {
    return this._rainbow;
  }

  changeName(name: string): void {
    this._name = name;
  }

  swapMember(): void {
    this._isMember = !this._isMember;
  }

  getItems(): number[] {
    return Array.from(this._inventory.values());
  }

  getStamps(): number[] {
    return Array.from(this._stamps.values());
  }

  hasStamp(stamp: number): boolean {
    return this._stamps.has(stamp);
  }

  addStamp(stamp: number): void {
    this._stamps.add(stamp);
  }

  addItem(item: number): void {
    this._inventory.add(item);
  }

  hasItem(item: number): boolean {
    return this._inventory.has(item);
  }

  addCoins (amount: number): void {
    this._coins += amount;
  }

  addIgloo(type: number): void {
    this._iglooTypes.add(type);
  }

  removeCoins (amount: number): void {
    this._coins -= amount
  }

  addPuffle(name: string, puffleType: number): PlayerPuffle {
    this._puffleSeq += 1;
    const id = this._puffleSeq;
    const puffle = {
      id,
      name,
      type: puffleType,
      clean: 100,
      rest: 100,
      food: 100
    }
    this._puffles.set(id, puffle);

    return puffle;
  }

  addToBackyard(puffle: number) {
    this._backyard.add(puffle);
  }

  removeFromBackyard(puffle: number) {
    this._backyard.delete(puffle);
  }

  isInBackyard(puffle: number): boolean {
    return this._backyard.has(puffle);
  }

  makeAgent (): void {
    this._isAgent = true;
  }

  getPuffles(): PlayerPuffle[] {
    return Array.from(this._puffles.values());
  }

  get minutesPlayed() {
    return this._minutesPlayed;
  }

  get isSafeChat() {
    return this._safeChat;
  }

  enableSafeChat() {
    this._safeChat = true;
  }

  disableSafeChat() {
    this._safeChat = false;
  }

  receivePostcard(postcard: number, info: {
    senderId?: number
    senderName?: string
    details?: string
  }): Mail {
    this._mailSeq += 1;
    const uid = this._mailSeq;
    const senderName = info.senderName ?? 'sys';
    const senderId = info.senderId ?? 0;
    const details = info.details ?? '';
    const timestamp = Date.now();
    const mail = {
      sender: {
        name: senderName,
        id: senderId
      },
      postcard: {
        postcardId: postcard,
        uid,
        details,
        timestamp,
        read: false
      }
    };
    this._mail.push(mail);
    return mail;
  }

  setAllMailAsRead(): void {
    this._mail = this._mail.map((mail) => {
      const postcard = { ...mail.postcard, read: true };
      return { ...mail, postcard: postcard }
    })
  }

  getUnreadMailTotal(): number {
    return this._mail.filter((mail) => !mail.postcard.read).length;
  }

  getMailTotal(): number {
    return this._mail.length;
  }

  getAllMail(): Mail[] {
    return this._mail;
  }

  addFurniture(furniture: number, amount: number): boolean {
    if (amount < 0 || isNaN(amount) || !Number.isInteger(amount)) {
      throw new Error(`Invalid amount of furniture being added: ${amount}`);
    }
    let amountOwned = this._furnitureInventory.get(furniture);
    if (amountOwned === undefined) {
      amountOwned = 0;
    }

    const newAmount = amountOwned + amount;
    if (newAmount > 99) {
      return false;
    }

    this._furnitureInventory.set(furniture, newAmount);
    return true;
  }

  addFlooring(flooring: number): void {
    this._iglooFloorings.add(flooring);
  }

  addIglooLocation(location: number): void {
    this._iglooLocations.add(location);
  }

  getAllFurniture(): Array<[number, number]> {
    return Array.from(this._furnitureInventory.entries());
  }

  getFurnitureOwnedAmount(furniture: number): number {
    return this._furnitureInventory.get(furniture) ?? 0;
  }

  getIglooFloorings(): number[] {
    return Array.from(this._iglooFloorings.values());
  }

  getIglooTypes(): number[] {
    return Array.from(this._iglooTypes.values());
  }

  getBuddies(): number[] {
    return Array.from(this._buddies.values());
  }

  hasBuddy(id: number | string): boolean {
    const numericId = Number(id);
    return !Number.isNaN(numericId) && this._buddies.has(numericId);
  }

  addBuddy(id: number | string): void {
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      this._buddies.add(numericId);
    }
  }

  removeBuddy(id: number | string): void {
    const numericId = Number(id);
    if (!Number.isNaN(numericId)) {
      this._buddies.delete(numericId);
    }
  }

  getIglooLocations(): number[] {
    return Array.from(this._iglooLocations.values());
  }

  incrementPlayTime(minutes: number) {
    if (minutes < 0) {
      throw new Error(`Invalid play time increment: ${minutes} minutes`);
    }

    this._minutesPlayed += minutes;
  }

  getGameData(): Buffer {
    return this._puffleLaunchGameData;
  }

  setGameData(data: Buffer): void {
    this._puffleLaunchGameData = data;
  }

  addPuffleItem(itemId: number, amount: number): number {
    const item = PUFFLE_ITEMS.get(itemId);
    if (item === undefined) {
      throw new Error(`Tried to add puffle item that doesn't exist: ${itemId}`);
    }
    const parentItem = PUFFLE_ITEMS.get(item.parentId);
    if (parentItem === undefined) {
      throw new Error(`Puffle item ${item} doesn't have a valid parent ID (${item.parentId})`);
    }

    if (amount < 0 || !Number.isInteger(amount)) {
      throw new Error(`Invalid amount of puffle items added: ${amount}`);
    }

    const totalAmount = amount * item.quantity;

    const ownedAmount = this._puffleItems.get(parentItem.id) ?? 0;
    const newAmount = ownedAmount + totalAmount;
    this._puffleItems.set(parentItem.id, newAmount);

    return newAmount;
  }

  addTreasureFind(): void {
    const now = Date.now();
    this._treasureFinds.push(now);
    // only track times you found a treasure in the last 24 hrs
    this._treasureFinds = this._treasureFinds.filter((timestamp) => {
      return now - timestamp < 24 * 60 * 60 * 1000;
    })
  }

  getTreasureFindsInLastDay(): number {
    return this._treasureFinds.length;
  }

  clearTreasureFinds(): void {
    this._treasureFinds = [];
  }

  setHaveDug(): void {
    this._hasDug = true;
  }

  getPuffleItemOwnedAmount(itemId: number): number {
    return this._puffleItems.get(itemId) ?? 0;
  }

  getAllPuffleItems(): Array<[number, number]> {
    return Array.from(this._puffleItems.entries());
  }

  getPuffle(id: number): PlayerPuffle {
    const puffle = this._puffles.get(id);
    if (puffle === undefined) {
      throw new Error(`Puffle not found in player: ${id}`);
    }
    return puffle;
  }

  resetRainbowQuest(): void {
    this._rainbow = {
      adoptability: false,
      currentTask: 0,
      coinsCollected: new Set<RainbowPuffleStage>(),
    };
  }

  get careerMedals(): number {
    return this._careerMedals;
  }

  get ownedMedals(): number {
    return this._ownedMedals;
  }

  addEpfMedals(amount: number): void {
    if (amount < 0 || !Number.isInteger(amount) || isNaN(amount)) {
      throw new Error(`Incorrect amount of EPF medals added: ${amount}`);
    }

    this._ownedMedals += amount;
    this._careerMedals += amount;
  }

  removeEpfMedals(amount: number): void {
    if (amount < 0 || !Number.isInteger(amount) || isNaN(amount)) {
      throw new Error (`Incorrect amount of EPF medals removed: ${amount}`);
    }

    this._ownedMedals -= amount;
    if (this._ownedMedals < 0) {
      this._ownedMedals = 0;
    }
  }

  get activeIgloo(): Igloo {
    return this.getIglooLayout(this._igloo);
  }

  setActiveIgloo(id: number): void {
    this._igloo = id;
  }

  updateIgloo(features: Partial<Igloo>): void {
    const igloo = this.activeIgloo;
    this._igloos.set(this._igloo, { ...igloo, ...features });
  }

  getIglooLayout(id: number): Igloo {
    const igloo = this._igloos.get(id);
    if (igloo === undefined) {
      throw new Error(`Unexistent igloo ID: ${id}`);
    }
    return igloo;
  }

  getAllIglooLayouts(): Igloo[] {
    return Array.from(this._igloos.values());
  }

  addIglooLayout(): Igloo {
    this._iglooSeq++;
    const id = this._iglooSeq;
    const igloo = Penguin.getDefaultIgloo(id)
    this._igloos.set(id, igloo);
    return igloo;
  }

  get nuggets(): number {
    return this._nuggets;
  }

  addNuggets(amount: number): void {
    if (!isPositiveInteger(amount)) {
      throw new Error(`Invalid nugget amount: ${amount}`);
    }

    this._nuggets += amount;
  }

  removeGoldPuffleNuggets(): void {
    // Only way to lose nuggets is the price of the golden puffle
    this._nuggets -= 15;
  }

  /** Adds card to the deck */
  addCard(id: number, amount: number): void {
    this._cards.set(id, (this._cards.get(id) ?? 0) + amount);
  }

  /** Gets all owned cards */
  getCards(): Array<[number, number]> {
    return Array.from(this._cards.entries());
  }

  /**
   * Get an array where each element is a card ID, with duplicates being allowed
   */
  getDeck(): number[] {
    const deck: number[] = [];
    for (const card of this._cards.entries()) {
      for (let i = 0; i < card[1]; i++) {
        deck.push(card[0]);
      }
    }

    return deck;
  }

  get ninjaProgress() {
    return this._cardProgress;
  }

  addCardJitsuWin() {
    this._cardWins++;
  }

  get cardJitsuWins() {
    return this._cardWins;
  }

  get completedBattleOfDoom() {
    return this._battleOfDoom;
  }

  get virtualRegistration() {
    return this._virtualRegistrationTimestamp;
  }

  get medieval2012Message() {
    return this._medieval2012Message;
  }

  set medieval2012Message(value: number) {
    this._medieval2012Message = value;
  }

  setVirtualRegistration(value: number) {
    this._virtualRegistrationTimestamp = value;
  }

  setBattleOfDoomCompleted() {
    this._battleOfDoom = true;
  }

  get isFireNinja() {
    return this._isFireNinja;
  }

  set isFireNinja(value: boolean) {
    this._isFireNinja = value;
  }

  get isWaterNinja() {
    return this._isWaterNinja;
  }

  set isWaterNinja(value: boolean) {
    this._isWaterNinja = value;
  }

  get isSnowNinja() {
    return this._isSnowNinja;
  }

  set isSnowNinja(value: boolean) {
    this._isSnowNinja = value;
  }

  static getDefaultData(name: string, defaultParams: DefaultPenguinParams = {}): PenguinData {
    return {
      name,
      is_member: defaultParams.is_member ?? true,
      is_agent: true,
      mascot: 0,
      color: 1,
      head: 0,
      face: 0,
      neck: 0,
      body: 0,
      hand: 0,
      feet: 0,
      pin: 0,
      background: 0,
      coins: 100000,
      registration_date: Date.now(),
      virtualRegistrationTimestamp: defaultParams.virtualRegistrationTimestamp ?? (new Date(2005, 9, 24)).getTime(),
      minutes_played: 0,
      inventory: [661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,701,702,711,712,713,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,778,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,848,849,850,851,852,853,854,6095,6096,6097,6098,6100,6101,6102,6103,6104,6105,6106,6107,6108,6109,6110,6111,6112,6113,6115,6116,6117,6118,6119,6120,6121,6123,6124,6126,6134,6135,6136,6137,6138,6139,6140,6141,6142,6143,6144,6145,6146,6147,6148,6149,6150,6151,6152,6153,6154,6155,6156,6157,6158,6159,6160,6161,6162,6163,6164,6166,6167,6168,6169,6170,6171,6172,6173,6174,6175,6176,6177,6179,6180,6181,6182,6183,6184,6185,6186,6191,6192,6193,6194,6196,6197,6200,6201,6202,6203,6204,6207,6208,6209,6210,6211,6212,6213,6216,6217,6218,6219,6220,6221,6222,6223,6224,6225,6226,6227,6228,6229,6230,6231,6232,6233,6234,6235,6236,6237,6238,6239,6240,6241,6242,6243,6244,6245,6246,6247,6248,6249,6250,6251,6252,6253,6255,6256,6257,6258,6259,6260,6261,6262,6263,6264,6265,6266,6267,6268,6269,6270,6271,6272,6273,6274,6275,6276,6277,6278,6279,5388,5389,5390,5391,5392,5393,5394,5395,5396,5397,5398,5399,5400,5401,5402,5403,5404,5405,5406,5407,5414,5415,5416,5417,5418,5419,5420,5421,5422,5423,5424,5425,5427,5428,5429,5430,5431,5432,5433,5434,5435,5436,5438,5439,5440,5441,5442,5443,5445,5446,5447,5448,5449,5450,5451,5452,5453,5454,5455,5456,5457,5458,5460,5461,5462,5463,5465,5466,5467,5468,5469,5471,5472,5473,5474,5475,5476,5477,5478,5479,5480,5481,5482,5483,5484,5485,5486,5487,5488,5489,5490,5491,5495,5496,5497,5498,5499,5500,5501,5502,5503,5504,5506,5507,5508,5509,5510,5511,5512,5513,5514,5515,5516,5517,5518,5519,5520,5521,5522,5523,5524,5525,5526,5527,5528,5529,5530,5531,5535,5536,5537,5538,5539,5540,5542,5543,5544,5545,5546,5547,5548,5549,5550,5551,5552,5553,5554,5555,5556,5557,5558,5559,6000,6001,6002,6003,6004,6005,6006,6007,6008,6009,6010,6011,6012,6013,6015,6016,6017,6019,6020,6021,6022,6024,6025,6026,6029,6030,6031,6032,6033,6034,6035,6036,6037,6038,6039,6040,6042,6043,6044,6045,6047,6048,6049,6050,6052,6053,6054,6057,6058,6059,6060,6063,6064,6065,6067,6068,6069,6072,6073,6074,6075,6076,6079,6080,6081,6082,6083,6084,6085,6086,6087,6088,6089,6090,6091,6092,6093,6094,5039,5040,5042,5043,5044,5045,5046,5047,5048,5049,5050,5051,5052,5053,5054,5055,5056,5057,5058,5059,5060,5061,5062,5063,5064,5065,5066,5067,5068,5069,5070,5071,5072,5073,5074,5075,5076,5077,5079,5080,5081,5082,5083,5084,5087,5088,5089,5090,5091,5092,5093,5094,5095,5096,5097,5098,5099,5100,5101,5102,5103,5104,5105,5106,5107,5108,5109,5110,5111,5112,5113,5114,5115,5116,5117,5118,5119,5120,5121,5122,5123,5126,5127,5128,5129,5130,5131,5132,5133,5135,5136,5137,5138,5139,5140,5141,5144,5145,5146,5147,5148,5150,5151,5153,5154,5155,5156,5157,5158,5159,5160,5161,5162,5163,5164,5166,5167,5176,5177,5179,5180,5181,5183,5184,5185,5186,5187,5188,5189,5190,5191,5192,5193,5194,5195,5196,5197,5198,5199,5201,5202,5203,5204,5205,5206,5207,5208,5209,5210,5211,5212,5214,5216,5217,5218,5219,5220,5221,5222,5223,5224,5225,5226,5227,5228,5229,5230,5240,5241,5242,5243,5244,5245,5246,5247,5248,5249,5250,5251,5252,5332,5334,5335,5336,5337,5338,5339,5340,5341,5342,5343,5344,5345,5346,5349,5350,5351,5352,5353,5354,5356,5357,5358,5359,5360,5361,5362,5367,5368,5369,5370,5371,5372,5373,5374,5376,5377,5378,5379,5380,5381,5382,5384,5385,5386,5387,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,4838,4839,4840,4841,4842,4844,4845,4846,4847,4848,4849,4850,4851,4852,4853,4854,4855,4856,4857,4858,4859,4860,4861,4862,4863,4864,4865,4866,4867,4868,4869,4870,4871,4872,4873,4874,4875,4876,4877,4878,4879,4880,4881,4882,4883,4884,4885,4886,4887,4888,4889,4890,4891,4892,4893,4894,4895,4896,4897,4898,4899,4900,4902,4903,4905,4906,4907,4908,4909,4910,4912,4913,4914,4915,4916,4917,4918,4919,4920,4921,4922,4923,4938,4939,4940,4941,4942,4943,4944,4945,4946,4947,4948,4949,4950,4951,4952,4955,4956,4958,4959,4960,4961,4962,4963,4964,4965,4966,4967,4969,4970,4971,4972,4973,4974,4975,4976,4977,4978,4981,4982,4983,4986,4987,4988,4989,4990,4991,4992,4993,4994,4995,4996,4997,4998,5000,5001,5002,5003,5004,5005,5006,5007,5008,5009,5010,5011,5012,5013,5014,5015,5016,5018,5019,5020,5021,5022,5023,5024,5025,5027,5028,5029,5030,5031,5032,5033,5034,5035,5036,5037,5038,465,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,4644,4645,4646,4647,4648,4649,4660,4661,4662,4663,4664,4665,4666,4667,4668,4669,4670,4671,4672,4673,4674,4675,4676,4677,4686,4688,4689,4715,4716,4717,4718,4719,4720,4721,4722,4723,4724,4725,4726,4727,4732,4733,4734,4735,4738,4739,4740,4741,4742,4743,4744,4745,4746,4747,4749,4751,4753,4754,4755,4756,4757,4758,4759,4760,4761,4762,4763,4764,4765,4769,4770,4771,4772,4773,4774,4775,4777,4778,4779,4780,4781,4782,4783,4785,4786,4787,4788,4789,4790,4791,4792,4793,4794,4795,4796,4797,4798,4799,4800,4801,4802,4803,4804,4805,4806,4807,4808,4809,4810,4811,4812,4814,4815,4816,4817,4818,4819,4820,4821,4822,4823,4824,4825,4826,4827,4828,4829,4830,4831,4832,4833,4834,4835,4836,4837,447,448,449,450,451,452,453,454,455,456,457,458,460,461,462,463,464,4463,4464,4465,4466,4467,4468,4469,4470,4471,4472,4473,4474,4475,4476,4477,4478,4479,4480,4481,4482,4483,4484,4487,4488,4489,4490,4491,4492,4493,4494,4495,4496,4497,4498,4499,4500,4501,4502,4503,4504,4505,4506,4507,4508,4509,4510,4511,4512,4513,4514,4515,4516,4517,4518,4532,4533,4534,4535,4536,4537,4538,4539,4540,4542,4543,4544,4545,4546,4547,4548,4549,4550,4551,4552,4553,4556,4557,4558,4559,4560,4561,4572,4573,4575,4576,4577,4578,4579,4580,4582,4583,4584,4585,4586,4587,4588,4589,4590,4591,4592,4593,4594,4595,4596,4597,4598,4599,4600,4601,4602,4603,4604,4606,4607,4611,4612,4613,4614,4615,4616,4617,4618,4619,4620,4621,4622,4623,4624,4625,4626,4627,4628,4629,4630,4631,4632,4633,4634,4635,4636,4637,4638,4639,4640,4641,4642,4643,430,431,432,433,434,435,436,437,438,439,440,441,443,444,445,446,4294,4295,4296,4297,4298,4299,4300,4301,4302,4303,4304,4305,4306,4307,4308,4309,4310,4311,4312,4315,4316,4317,4318,4319,4321,4322,4323,4324,4325,4326,4327,4328,4329,4330,4331,4332,4333,4334,4335,4336,4337,4338,4339,4340,4341,4342,4343,4344,4345,4346,4347,4348,4349,4350,4353,4354,4355,4357,4358,4359,4360,4361,4362,4365,4366,4367,4368,4369,4370,4371,4372,4373,4374,4375,4376,4377,4381,4382,4383,4384,4385,4386,4387,4388,4389,4390,4391,4392,4393,4394,4395,4396,4397,4398,4399,4400,4401,4402,4403,4404,4405,4406,4407,4408,4409,4410,4411,4412,4413,4414,4415,4416,4417,4418,4419,4420,4421,4422,4423,4424,4425,4426,4427,4428,4429,4430,4431,4432,4433,4434,4435,4447,4448,4449,4450,4451,4452,4453,4454,4455,4456,4457,4458,4459,4460,4461,4462,411,412,413,414,415,417,418,419,420,421,422,423,424,425,426,427,428,429,4101,4102,4103,4106,4107,4108,4109,4110,4111,4112,4113,4114,4115,4116,4117,4118,4119,4120,4121,4123,4126,4127,4128,4129,4130,4131,4132,4133,4134,4135,4136,4137,4138,4139,4140,4141,4142,4143,4144,4145,4146,4147,4149,4154,4155,4156,4157,4158,4159,4160,4161,4162,4163,4164,4165,4166,4167,4168,4169,4170,4171,4172,4173,4174,4175,4176,4177,4178,4179,4180,4181,4186,4187,4188,4189,4190,4191,4192,4193,4194,4195,4196,4197,4198,4199,4200,4204,4205,4206,4207,4208,4209,4210,4211,4215,4216,4217,4218,4219,4220,4221,4222,4223,4224,4225,4226,4227,4228,4229,4230,4231,4232,4233,4234,4235,4236,4237,4238,4241,4242,4243,4244,4245,4246,4247,4248,4249,4250,4251,4252,4253,4254,4255,4256,4257,4258,4259,4260,4261,4262,4263,4264,4265,4266,4269,4270,4271,4272,4273,4274,4275,4276,4277,4280,4282,4283,4284,4285,4286,4287,4288,4289,4290,4291,4292,4293,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,357,358,359,360,361,362,363,364,365,366,367,368,369,370,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,401,402,403,404,405,406,407,408,409,410,3201,3202,3203,3205,3206,3207,3208,3209,3210,3211,3212,3213,3214,3215,3216,3217,3218,3219,3221,3222,3224,3225,3226,3227,3228,3229,3230,3231,3232,3234,3235,3236,3238,3239,3241,4000,4001,4002,4003,4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4020,4021,4022,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036,4037,4038,4039,4040,4041,4042,4043,4044,4045,4046,4047,4048,4049,4050,4053,4054,4055,4056,4057,4058,4059,4060,4061,4062,4063,4064,4065,4066,4067,4068,4069,4070,4071,4072,4075,4076,4077,4078,4079,4080,4081,4082,4083,4084,4085,4086,4087,4088,4089,4090,4091,4092,4093,4094,4095,4096,4097,4098,4099,4100,34043,34052,34102,34135,34144,34145,34158,34174,34175,34206,295,296,297,298,299,301,302,303,304,305,306,307,308,309,310,312,313,314,315,316,317,3000,3001,3002,3003,3004,3005,3006,3007,3008,3009,3011,3012,3013,3014,3015,3016,3018,3019,3020,3021,3022,3023,3024,3025,3026,3027,3028,3029,3030,3031,3032,3033,3034,3035,3036,3037,3038,3039,3040,3041,3043,3044,3046,3047,3048,3049,3050,3052,3053,3054,3055,3056,3058,3061,3062,3063,3064,3065,3066,3067,3068,3069,3070,3071,3073,3074,3075,3076,3077,3078,3079,3080,3081,3082,3083,3084,3085,3086,3087,3088,3089,3090,3091,3092,3093,3094,3095,3096,3097,3098,3099,3100,3101,3102,3103,3104,3105,3106,3107,3108,3109,3110,3111,3112,3113,3114,3115,3116,3117,3118,3119,3120,3121,3122,3123,3124,3125,3126,3127,3128,3133,3135,3136,3138,3139,3140,3141,3144,3145,3146,3147,3148,3150,3151,3152,3153,3154,3155,3156,3157,3158,3159,3160,3161,3162,3163,3164,3166,3167,3168,3169,3170,3171,3172,3173,3174,3175,3176,3177,3178,3179,3180,3181,3183,3184,3185,3186,3187,3189,3190,3191,3192,3193,3195,3197,3198,3199,3200,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,24216,24217,24218,24219,24220,24221,24222,24223,24224,24225,24226,24227,24228,24229,24230,24231,24232,24233,24234,24235,24236,24237,24238,24239,24240,24241,24243,24244,24245,24246,24247,24248,24249,24250,24251,24252,24253,24254,24255,24256,24257,24258,24259,24260,24261,24262,24263,24264,24265,24266,24267,24268,24270,24271,24274,24275,24276,24277,24278,24279,24280,24281,24282,24283,24284,24285,24286,24287,24288,24289,24290,24291,24292,24293,24294,24295,24296,24297,24298,24299,24300,24302,24303,24304,24306,24307,24308,24309,24310,24311,24312,24313,24314,24315,24316,24317,24318,24319,24320,24321,24322,24323,24324,24325,24326,24327,24328,24329,24330,24331,24332,24333,24334,24335,24336,24337,24338,24355,241,242,24034,24036,24037,24038,24039,24040,24041,24042,24043,24044,24045,24046,24047,24048,24049,24050,24051,24053,24054,24055,24056,24057,24058,24059,24060,24061,24062,24063,24064,24065,24067,24068,24069,24070,24071,24072,24073,24074,24075,24076,24077,24078,24079,24080,24081,24082,24083,24084,24085,24086,24087,24088,24089,24090,24091,24092,24093,24094,24095,24096,24097,24098,24099,24100,24102,24103,24104,24105,24106,24107,24108,24109,24110,24111,24112,24113,24114,24115,24116,24117,24118,24119,24120,24121,24122,24123,24124,24125,24126,24127,24128,24129,24130,24131,24132,24133,24134,24137,24138,24139,24140,24141,24142,24143,24146,24147,24148,24149,24150,24151,24153,24154,24155,24156,24157,24159,24173,24174,24175,24176,24177,24178,24179,24180,24181,24182,24183,24184,24185,24186,24187,24188,24189,24190,24191,24192,24193,24194,24195,24196,24198,24199,24200,24201,24202,24203,24204,24207,24208,24209,24210,24211,24212,24213,24214,24215,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,231,232,233,234,235,236,237,238,239,240,2101,2102,2103,2104,2105,2106,2107,2108,2109,2110,2111,2112,2113,2114,2115,2116,2117,2119,2120,2121,2122,2124,2125,2126,2128,2129,2130,2131,2132,2134,2135,2136,2137,2138,2139,2141,2142,2143,2144,2145,2146,2147,2148,2149,2150,2151,2152,2153,2154,2155,2156,2157,2158,2159,2160,2161,2162,2163,2164,2165,2166,2167,2168,2169,2170,2171,2172,2173,2174,2176,2177,2178,2179,2180,2181,2182,2183,21009,21010,21011,21012,21013,21014,21015,21016,21017,21019,21020,21021,21022,21023,21024,21025,21026,21027,21029,21030,21031,21032,21033,21034,21035,21036,21037,21038,21039,21040,21041,21042,21043,21044,21045,21046,21047,21048,21049,21050,21051,21052,21053,21054,21055,21056,21057,21058,21059,21060,21061,21062,21063,21064,21065,21066,21067,21068,24000,24001,24002,24003,24004,24005,24006,24008,24011,24012,24013,24014,24015,24017,24018,24019,24020,24021,24022,24023,24024,24025,24026,24027,24028,24029,24030,24031,24032,24033,191,192,193,194,195,196,197,198,199,201,202,203,204,205,206,207,208,209,210,1903,1904,1905,1906,1907,1908,1910,1911,1912,1913,1914,1915,1916,1917,1919,1920,1921,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1941,1943,1944,1945,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1975,1976,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1995,1996,1997,1998,2001,2002,2003,2004,2007,2009,2010,2011,2012,2013,2014,2016,2017,2018,2019,2020,2021,2022,2023,2025,2026,2027,2028,2029,2030,2031,2032,2034,2035,2036,2037,2038,2039,2040,2043,2044,2045,2046,2047,2048,2049,2050,2051,2052,2053,2054,2057,2059,2060,2061,2062,2063,2064,2065,2066,2068,2069,2070,2071,2072,2073,2074,2075,2080,2081,2082,2083,2084,2085,2086,2087,2088,2089,2090,2091,2092,2093,2094,2095,2096,2097,2100,21000,21001,21002,21003,21004,21005,21006,21007,21008,170,171,172,173,174,175,176,177,178,179,180,181,182,184,185,186,187,188,189,190,1698,1701,1702,1704,1705,1706,1707,1710,1711,1712,1713,1714,1715,1716,1717,1718,1720,1721,1722,1723,1724,1725,1726,1727,1730,1731,1732,1733,1734,1735,1736,1737,1738,1739,1740,1741,1745,1748,1749,1750,1751,1752,1753,1754,1755,1756,1757,1758,1759,1760,1761,1762,1763,1764,1765,1766,1767,1768,1769,1770,1771,1772,1774,1775,1776,1777,1778,1779,1780,1781,1782,1783,1784,1785,1786,1787,1788,1789,1790,1791,1792,1793,1795,1796,1797,1798,1799,1800,1801,1802,1803,1804,1806,1807,1808,1809,1810,1811,1812,1813,1814,1815,1816,1817,1818,1819,1820,1821,1822,1823,1824,1825,1826,1827,1828,1829,1830,1831,1832,1834,1835,1836,1837,1838,1839,1840,1841,1842,1843,1844,1845,1846,1847,1848,1849,1850,1851,1852,1853,1855,1856,1857,1858,1859,1861,1862,1863,1864,1865,1866,1867,1868,1869,1870,1871,1872,1873,1874,1875,1876,1877,1879,1880,1881,1884,1885,1886,1887,1888,1889,1890,1891,1894,1895,1896,1897,1898,1899,1900,1901,1902,161,162,166,167,168,169,1520,1521,1522,1523,1524,1525,1526,1527,1528,1529,1530,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,1543,1544,1545,1546,1547,1548,1549,1551,1552,1553,1554,1555,1556,1557,1558,1559,1560,1562,1563,1564,1565,1566,1567,1568,1569,1570,1571,1572,1573,1574,1575,1576,1577,1578,1579,1580,1581,1582,1583,1584,1585,1586,1587,1588,1589,1590,1591,1592,1593,1594,1595,1596,1597,1598,1599,1600,1601,1602,1603,1604,1605,1606,1607,1608,1609,1610,1611,1612,1613,1614,1615,1616,1617,1618,1619,1620,1621,1622,1623,1624,1625,1626,1627,1629,1630,1631,1632,1633,1634,1635,1636,1637,1638,1639,1640,1641,1642,1643,1644,1645,1646,1647,1648,1650,1652,1653,1655,1656,1657,1658,1660,1661,1662,1663,1664,1665,1666,1667,1668,1669,1670,1671,1672,1682,1683,1684,1685,1686,1687,1688,1689,1690,1691,1692,1693,1695,1696,1697,15200,15215,15250,15333,15363,15364,15365,15366,15367,15373,15383,15459,16008,16009,16011,16013,16015,16018,16023,16028,16029,16035,16036,16037,16038,16041,16046,16051,16055,16056,16061,16066,16069,16070,16071,16099,16114,16125,16131,16132,16143,16187,16188,16189,16190,16198,16199,152,1448,1449,1450,1451,1452,1453,1454,1476,1478,1480,1481,1482,1483,1484,1485,1486,1487,1488,1492,1493,1494,1495,1496,1497,1498,1499,1500,1501,1502,1504,1505,1506,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,14485,14486,14519,14520,14521,14522,14523,14524,14525,14526,14527,14528,14529,14530,14531,14541,14554,14562,14563,14564,14565,14566,14567,14568,14569,14570,14571,14574,14581,14605,14608,14609,14650,14651,14652,14653,14654,14655,14656,14657,14658,14659,14678,14679,14680,14681,14682,14683,14684,14685,14687,14703,14704,14705,14706,14707,14708,14709,14710,14713,14714,14728,14729,14730,14737,14748,14750,14776,14784,14813,14843,14844,14901,14904,14907,14911,14926,14927,14928,14929,14930,14931,14932,14933,14934,14935,14936,14937,14953,14954,14968,14969,15005,15007,15008,15017,15026,15031,15032,15036,15040,15041,15045,15046,15048,15049,15053,15056,15058,15061,15066,15079,15085,15086,15112,15116,15120,15124,15125,15134,15142,15143,15149,15159,15165,15193,15194,15199,134,135,136,137,138,139,1333,1334,1335,1336,1337,1338,1339,1340,1341,1342,1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364,1365,1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376,1377,1378,1379,1380,1381,1382,1383,1384,1385,1386,1387,1388,1389,1394,1395,1396,1397,1398,1399,1400,1401,1402,1404,1405,1406,1407,1408,1409,1410,1411,1412,1413,1414,1415,1416,1417,1418,1419,1420,1421,1422,1424,1425,1426,1427,1428,1429,1430,1431,1432,1433,1437,1438,1439,1440,1441,1442,1443,1444,1445,1446,1447,14004,14016,14017,14018,14035,14040,14041,14046,14051,14052,14063,14065,14073,14074,14075,14080,14082,14084,14088,14091,14102,14104,14105,14111,14116,14119,14123,14124,14125,14126,14128,14129,14138,14141,14142,14143,14145,14147,14150,14151,14152,14153,14191,14199,14201,14202,14203,14204,14205,14206,14207,14209,14212,14213,14214,14216,14219,14220,14222,14227,14228,14239,14240,14259,14264,14267,14268,14278,14279,14313,14314,14332,14351,14352,14361,14363,14364,14436,14437,14438,14439,14440,14441,14442,14443,14444,14445,14446,14465,118,119,120,121,122,123,124,125,126,127,128,130,131,132,133,1174,1175,1176,1177,1178,1179,1180,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1199,1201,1202,1203,1204,1205,1206,1207,1208,1210,1211,1212,1213,1214,1215,1217,1218,1219,1220,1221,1222,1225,1226,1227,1228,1229,1230,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1245,1246,1247,1248,1249,1250,1251,1252,1253,1256,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1315,1316,1317,1318,1319,1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330,1331,1332,11730,11751,11833,11854,11860,11878,11882,11883,11922,12003,12005,12006,12008,12012,12018,12019,12024,12041,12042,12055,12056,12058,12060,12076,12078,12079,12099,12127,13002,13003,13006,13007,13010,13017,13020,13028,13033,13045,13051,13054,13057,13059,13060,13072,13117,13132,13142,13143,108,109,110,111,112,113,114,116,117,1079,1080,1081,1082,1083,1084,1085,1086,1087,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1109,1110,1111,1112,1113,1114,1115,1116,1117,1119,1120,1121,1122,1123,1124,1125,1126,1127,1129,1131,1133,1134,1135,1136,1137,1138,1139,1142,1143,1144,1145,1146,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1167,1168,1169,1170,1171,1172,1173,10782,10785,10787,10788,10789,10791,10792,10793,10794,10795,10799,10830,10836,10837,10839,10840,10842,10845,11010,11013,11014,11015,11017,11018,11020,11026,11031,11040,11042,11053,11070,11071,11075,11083,11089,11090,11091,11093,11094,11105,11108,11115,11125,11128,11133,11134,11137,11139,11140,11141,11143,11146,11153,11154,11165,11166,11172,11181,11182,11191,11197,11198,11203,11223,11224,11225,11230,11234,11243,11244,11254,11255,11302,11303,11310,11311,11312,11313,11314,11331,11334,11335,11343,11344,11345,11346,11347,11348,11349,11390,11391,11392,11393,11403,11423,11434,11435,11436,11455,11456,11473,11474,11475,11477,11503,11507,11534,11550,11561,11586,11659,11673,11674,11675,11676,11677,11678,11679,11680,11681,11699,11700,11719,102,103,104,105,106,107,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1069,1072,1073,1074,1075,1076,1077,1078,10101,10105,10106,10107,10110,10113,10120,10121,10123,10124,10125,10132,10133,10134,10136,10162,10180,10181,10182,10186,10194,10195,10205,10207,10210,10213,10214,10217,10220,10227,10228,10233,10236,10237,10239,10244,10245,10246,10247,10254,10255,10256,10259,10260,10261,10262,10263,10265,10266,10267,10268,10276,10277,10278,10282,10284,10286,10289,10291,10295,10296,10297,10298,10299,10301,10302,10306,10307,10308,10309,10310,10313,10315,10316,10323,10327,10330,10331,10332,10333,10334,10335,10338,10340,10344,10346,10347,10352,10353,10357,10358,10364,10366,10367,10368,10370,10372,10373,10374,10376,10380,10385,10387,10401,10403,10404,10407,10409,10412,10414,10424,10425,10429,10432,10435,10436,10439,10446,10449,10452,10458,10460,10461,10462,10463,10464,10465,10471,10472,10473,10476,10477,10478,10481,10482,10487,10488,10493,10494,10495,10498,10499,10651,10653,10655,10656,10658,10660,10662,10666,10667,10668,10670,10671,10715,10717,10718,10719,10720,10721,10722,10724,10726,10727,10728,10729,10761,10762,10763,10765,10766,10767,10768,10770,10773,10775,10778,101,1004,1005,1006,1007,1008,1009,650,651,652,653,654,655,656,657,658,659,660,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,9000,9001,9002,9003,9004,9005,9006,9007,9008,9009,9010,9011,9013,9014,9015,9016,9017,9018,9019,9020,9021,9022,9023,9024,9025,9026,9027,9028,9029,9030,9031,9032,9033,9034,9035,9036,9037,9038,9039,9040,9041,9042,9043,9044,9045,9046,9047,9048,9049,9050,9051,9052,9053,9054,9055,9056,9057,9058,9059,9060,9061,9062,9063,9064,9065,9066,9067,9068,9074,9075,9076,9077,9078,9079,9080,9081,9082,9083,9084,9085,9086,9087,9088,9089,9090,9091,9092,9093,9094,9095,9098,9099,9100,9101,9102,9103,9104,9105,9106,9107,9108,9109,9110,9111,9112,9113,9114,9115,9116,9117,9118,9119,9120,9121,9122,9123,9124,9125,9126,9127,9128,9129,9130,9131,9132,9134,9135,9136,9137,9138,9139,9140,9141,9142,9143,9144,9145,9146,9147,9148,9149,9150,9155,9156,9157,9158,9160,9167,9168,9169,9170,9171,9172,9173,9174,9175,9176,9177,9178,9179,9180,9181,9182,9183,9184,9185,9186,9187,9188,9189,9190,9191,9192,9193,9194,9195,9196,9197,9198,9199,9200,9201,9202,9203,9204,9205,9206,9207,9208,9209,9210,9211,9212,9213,9214,9215,9216,9217,9233,9234,9235,9236,9237,9238,9239,9240,9242,9243,9244,9245,9246,9247,9248,9249,9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265,9266,9267,9268,9269,9270,9271,9272,9273,9274,9275,9276,9277,9278,9279,9281,9282,9283,9284,9285,9286,9287,9288,9289,9290,9291,9292,9293,9294,9295,9296,9297,9298,9299,9300,9301,9302,9303,9304,9305,9306,9307,9308,9309,19069,19070,19071,19072,19126,19151,19152,19153,19154,14,16,101,102,103,104,105,106,107,108,109,110,111,112,113,114,116,117,118,119,120,121,122,123,124,125,126,127,128,131,132,133,134,135,136,137,138,139,162,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,301,302,303,304,305,306,307,308,309,310,312,313,314,315,316,317,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,357,358,359,360,361,362,363,364,365,366,367,368,369,370,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,460,461,462,463,464,465,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,701,702,711,712,713,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,778,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,807,812,821,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,848,849,850,851,852,853,854,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1069,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1109,1110,1111,1112,1113,1114,1115,1116,1117,1119,1120,1121,1122,1123,1124,1125,1126,1127,1129,1131,1133,1134,1135,1136,1137,1138,1139,1142,1143,1144,1145,1146,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1177,1178,1179,1180,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1199,1201,1202,1203,1204,1205,1206,1207,1208,1210,1211,1212,1213,1214,1215,1217,1218,1219,1220,1221,1222,1225,1226,1227,1228,1229,1230,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1245,1246,1247,1248,1249,1250,1251,1252,1253,1256,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1315,1316,1317,1318,1319,1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330,1331,1332,1333,1334,1335,1336,1337,1338,1339,1340,1341,1342,1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364,1365,1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376,1377,1378,1379,1380,1381,1382,1383,1384,1385,1386,1387,1388,1389,1394,1395,1396,1397,1398,1399,1400,1401,1402,1404,1405,1406,1407,1408,1409,1410,1411,1412,1413,1414,1415,1416,1417,1418,1419,1420,1421,1422,1424,1425,1426,1427,1428,1429,1430,1431,1432,1433,1437,1438,1439,1440,1441,1442,1443,1444,1445,1446,1447,1448,1449,1450,1451,1452,1453,1454,1476,1478,1480,1481,1482,1483,1484,1485,1486,1487,1488,1492,1493,1494,1495,1496,1497,1498,1499,1500,1501,1502,1504,1505,1506,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1522,1523,1524,1525,1526,1527,1528,1529,1530,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,1543,1544,1545,1546,1547,1548,1549,1551,1552,1553,1554,1555,1556,1557,1558,1559,1560,1562,1563,1564,1565,1566,1567,1568,1569,1570,1571,1572,1573,1574,1575,1576,1577,1578,1579,1580,1581,1582,1583,1584,1585,1586,1587,1588,1589,1590,1591,1592,1593,1594,1595,1596,1597,1598,1599,1600,1601,1602,1603,1604,1605,1606,1607,1608,1609,1610,1611,1612,1613,1614,1615,1616,1617,1618,1619,1620,1621,1622,1623,1624,1625,1626,1627,1629,1630,1631,1632,1633,1634,1635,1636,1637,1638,1639,1640,1641,1642,1643,1644,1645,1646,1647,1648,1650,1652,1653,1655,1656,1657,1658,1660,1661,1662,1663,1664,1665,1666,1667,1668,1669,1670,1671,1672,1682,1683,1684,1685,1686,1687,1688,1689,1690,1691,1692,1693,1695,1696,1697,1698,1701,1702,1704,1705,1706,1707,1710,1711,1712,1713,1714,1715,1716,1717,1718,1720,1721,1722,1723,1724,1725,1726,1727,1730,1731,1732,1733,1734,1735,1738,1739,1740,1741,1745,1748,1749,1750,1751,1752,1753,1754,1755,1756,1757,1758,1759,1760,1761,1762,1763,1764,1765,1766,1767,1768,1769,1771,1772,1774,1775,1776,1777,1778,1779,1780,1781,1782,1784,1785,1786,1787,1788,1789,1790,1791,1792,1793,1795,1796,1797,1798,1799,1800,1801,1802,1803,1804,1806,1807,1808,1809,1810,1811,1812,1813,1814,1815,1816,1817,1818,1819,1820,1821,1822,1823,1824,1825,1826,1827,1828,1829,1830,1831,1832,1834,1835,1836,1837,1838,1839,1840,1841,1842,1843,1844,1845,1846,1847,1848,1849,1850,1851,1852,1853,1855,1856,1857,1858,1859,1861,1862,1863,1864,1865,1866,1867,1868,1869,1870,1871,1872,1873,1874,1876,1877,1879,1880,1881,1884,1885,1886,1887,1888,1889,1890,1891,1894,1895,1896,1897,1898,1899,1900,1901,1902,1903,1904,1905,1906,1907,1908,1910,1911,1912,1913,1914,1915,1916,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1965,1966,1967,1968,1969,1970,1971,1972,1973,1975,1976,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1995,1996,1997,1998,1999,2001,2002,2003,2004,2010,2011,2012,2013,2014,2016,2017,2018,2019,2020,2021,2022,2023,2025,2026,2027,2028,2029,2031,2032,2034,2035,2036,2037,2038,2039,2040,2043,2044,2045,2046,2047,2048,2049,2050,2051,2052,2053,2054,2057,2059,2060,2061,2062,2063,2064,2065,2066,2068,2069,2070,2071,2072,2073,2074,2075,2080,2081,2082,2083,2084,2085,2086,2088,2089,2090,2091,2092,2093,2094,2095,2096,2097,2100,2101,2102,2103,2104,2105,2106,2107,2108,2109,2110,2111,2112,2113,2114,2115,2116,2117,2119,2120,2121,2122,2124,2125,2126,2129,2130,2131,2132,2134,2135,2136,2137,2138,2139,2141,2142,2143,2144,2145,2146,2147,2148,2149,2150,2151,2152,2153,2154,2155,2156,2157,2158,2159,2160,2161,2162,2163,2164,2165,2166,2167,2168,2169,2170,2171,2172,2173,2174,2176,2177,2178,2179,2180,2181,2182,2183,2999,3000,3001,3002,3003,3004,3005,3006,3007,3008,3009,3012,3013,3014,3015,3016,3018,3019,3020,3021,3022,3023,3024,3025,3026,3027,3028,3029,3030,3031,3032,3033,3034,3035,3036,3037,3038,3039,3040,3041,3043,3044,3046,3047,3048,3049,3050,3052,3053,3054,3055,3056,3058,3061,3062,3063,3064,3065,3066,3067,3068,3069,3070,3071,3073,3074,3075,3076,3077,3078,3079,3080,3081,3082,3083,3084,3085,3086,3087,3088,3089,3090,3091,3092,3093,3094,3095,3096,3097,3098,3099,3100,3101,3102,3103,3104,3105,3106,3107,3108,3109,3110,3111,3112,3113,3114,3115,3116,3117,3118,3119,3120,3121,3122,3123,3124,3125,3126,3127,3128,3133,3135,3136,3138,3139,3140,3141,3144,3145,3146,3147,3148,3150,3151,3152,3153,3154,3155,3156,3157,3158,3159,3160,3161,3162,3163,3164,3166,3167,3168,3169,3170,3171,3172,3173,3174,3175,3176,3177,3178,3179,3180,3181,3183,3184,3185,3186,3187,3189,3190,3191,3192,3193,3195,3197,3198,3199,3200,3201,3202,3203,3205,3206,3207,3208,3209,3210,3211,3212,3213,3214,3215,3216,3217,3218,3219,3221,3222,3224,3225,3226,3227,3228,3229,3230,3231,3232,3233,3234,3235,3236,3238,3239,3240,3241,3999,4000,4001,4002,4003,4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4020,4021,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036,4037,4038,4039,4040,4041,4042,4043,4044,4045,4046,4047,4048,4049,4050,4053,4054,4055,4056,4057,4058,4059,4060,4061,4062,4063,4064,4065,4066,4067,4068,4069,4070,4071,4072,4075,4076,4077,4078,4079,4080,4081,4082,4083,4084,4085,4086,4087,4088,4089,4090,4091,4092,4093,4094,4095,4096,4097,4098,4099,4100,4101,4102,4103,4106,4107,4108,4109,4110,4111,4112,4113,4114,4115,4116,4117,4118,4119,4120,4121,4123,4126,4127,4128,4129,4130,4131,4132,4133,4134,4135,4136,4137,4138,4139,4140,4141,4142,4143,4144,4145,4146,4147,4149,4154,4155,4156,4157,4158,4159,4160,4161,4162,4163,4164,4165,4166,4167,4168,4169,4170,4171,4172,4173,4174,4175,4176,4177,4178,4179,4180,4181,4186,4187,4188,4189,4190,4191,4192,4193,4194,4195,4196,4197,4198,4199,4200,4204,4205,4206,4207,4208,4209,4210,4211,4215,4216,4217,4218,4219,4220,4221,4222,4223,4224,4225,4226,4227,4228,4229,4230,4231,4232,4233,4234,4235,4236,4237,4238,4241,4242,4243,4244,4245,4246,4247,4248,4249,4250,4251,4252,4253,4254,4255,4256,4257,4258,4259,4260,4261,4262,4263,4264,4265,4266,4269,4270,4271,4272,4273,4274,4275,4276,4277,4280,4282,4283,4284,4285,4286,4287,4288,4289,4290,4291,4292,4293,4294,4295,4296,4297,4298,4299,4300,4301,4302,4303,4304,4305,4306,4307,4308,4309,4310,4311,4312,4315,4316,4317,4318,4319,4321,4322,4323,4324,4325,4326,4327,4328,4329,4330,4331,4332,4333,4334,4335,4336,4337,4338,4339,4340,4341,4342,4343,4344,4345,4346,4347,4348,4349,4350,4353,4354,4355,4357,4358,4359,4360,4361,4362,4366,4367,4368,4369,4370,4371,4372,4373,4374,4375,4376,4377,4381,4382,4383,4384,4385,4386,4387,4388,4389,4390,4391,4392,4393,4394,4395,4396,4397,4398,4399,4400,4401,4402,4403,4404,4405,4406,4407,4408,4409,4410,4411,4412,4413,4414,4415,4416,4417,4418,4419,4420,4421,4422,4423,4424,4425,4426,4427,4428,4429,4430,4431,4432,4433,4434,4435,4447,4448,4449,4450,4451,4452,4453,4454,4455,4456,4457,4458,4459,4460,4461,4462,4463,4464,4465,4466,4467,4468,4469,4470,4471,4472,4473,4474,4475,4476,4477,4478,4479,4480,4481,4482,4483,4484,4487,4488,4489,4490,4491,4492,4493,4494,4495,4496,4497,4498,4499,4500,4501,4502,4503,4504,4505,4506,4507,4508,4509,4510,4511,4512,4513,4514,4515,4516,4517,4518,4532,4533,4534,4535,4536,4537,4538,4539,4540,4542,4543,4544,4545,4546,4547,4548,4549,4550,4551,4552,4553,4556,4557,4558,4559,4560,4561,4572,4573,4575,4576,4577,4578,4579,4580,4582,4583,4584,4585,4586,4587,4588,4589,4590,4591,4592,4593,4594,4595,4596,4597,4598,4599,4600,4601,4602,4603,4604,4606,4607,4611,4612,4613,4614,4615,4616,4617,4618,4619,4620,4621,4622,4623,4624,4625,4626,4627,4628,4629,4630,4631,4632,4633,4634,4635,4636,4637,4638,4639,4640,4641,4642,4643,4644,4645,4646,4647,4648,4649,4660,4661,4662,4663,4664,4665,4666,4667,4668,4669,4670,4671,4672,4673,4674,4675,4676,4677,4686,4688,4689,4715,4716,4717,4718,4719,4720,4721,4722,4723,4724,4725,4726,4727,4732,4733,4734,4735,4738,4739,4740,4741,4742,4743,4744,4745,4746,4747,4749,4751,4753,4754,4755,4756,4757,4758,4759,4760,4761,4762,4763,4764,4765,4769,4770,4771,4772,4773,4774,4775,4777,4778,4779,4780,4781,4782,4783,4785,4786,4787,4788,4789,4790,4791,4792,4793,4794,4795,4796,4797,4798,4799,4800,4801,4802,4803,4804,4805,4806,4807,4808,4809,4810,4811,4812,4814,4815,4816,4817,4818,4819,4820,4821,4822,4823,4824,4825,4826,4827,4828,4829,4830,4831,4832,4833,4834,4835,4836,4837,4838,4839,4840,4841,4842,4844,4845,4846,4847,4848,4849,4850,4851,4852,4853,4854,4855,4856,4857,4858,4859,4860,4861,4862,4863,4864,4865,4866,4867,4868,4869,4870,4871,4872,4873,4874,4875,4876,4877,4878,4879,4880,4881,4882,4883,4884,4886,4887,4888,4889,4890,4891,4892,4893,4894,4895,4896,4897,4898,4899,4900,4902,4903,4905,4906,4907,4908,4909,4910,4912,4913,4914,4915,4916,4917,4918,4919,4920,4921,4922,4923,4938,4939,4940,4941,4942,4943,4944,4945,4947,4948,4949,4950,4951,4952,4955,4956,4958,4959,4960,4961,4962,4963,4964,4965,4966,4967,4970,4971,4972,4973,4974,4975,4976,4977,4978,4981,4982,4983,4986,4987,4988,4989,4990,4991,4992,4993,4994,4995,4996,4997,4998,4999,5000,5001,5002,5003,5004,5005,5006,5007,5008,5009,5010,5011,5012,5013,5014,5015,5016,5018,5019,5020,5021,5022,5023,5024,5025,5027,5028,5029,5030,5031,5032,5033,5034,5035,5036,5037,5038,5039,5040,5042,5043,5044,5045,5046,5047,5048,5049,5050,5051,5052,5053,5054,5055,5056,5057,5058,5059,5060,5061,5062,5063,5064,5065,5066,5067,5068,5069,5070,5071,5072,5073,5074,5075,5076,5077,5079,5080,5081,5082,5083,5084,5087,5088,5089,5090,5091,5092,5093,5094,5095,5096,5097,5098,5099,5100,5101,5102,5103,5104,5105,5106,5107,5108,5109,5110,5111,5112,5113,5114,5115,5116,5117,5118,5119,5120,5121,5122,5123,5126,5127,5128,5129,5130,5131,5132,5133,5135,5136,5137,5138,5139,5140,5141,5144,5145,5146,5147,5148,5150,5151,5153,5154,5155,5156,5157,5158,5159,5160,5161,5162,5163,5164,5166,5167,5176,5177,5179,5180,5181,5183,5184,5185,5186,5187,5188,5189,5190,5191,5192,5193,5194,5195,5196,5197,5198,5199,5201,5202,5203,5204,5205,5206,5207,5208,5209,5210,5211,5212,5214,5216,5217,5218,5219,5220,5221,5222,5223,5224,5225,5226,5227,5228,5229,5240,5241,5242,5243,5244,5245,5246,5247,5248,5249,5250,5251,5252,5332,5334,5335,5336,5337,5338,5339,5340,5341,5342,5343,5344,5345,5346,5349,5350,5351,5352,5353,5354,5356,5357,5358,5359,5360,5361,5362,5367,5368,5369,5370,5371,5372,5373,5374,5376,5377,5378,5379,5380,5381,5382,5384,5385,5386,5387,5388,5389,5390,5391,5392,5393,5394,5395,5396,5397,5398,5399,5400,5401,5402,5403,5404,5405,5406,5407,5414,5415,5416,5417,5418,5419,5420,5421,5422,5423,5424,5425,5427,5428,5429,5430,5431,5432,5433,5434,5435,5436,5438,5439,5440,5441,5442,5443,5445,5446,5447,5448,5449,5450,5451,5452,5453,5454,5455,5456,5457,5458,5460,5461,5462,5463,5465,5466,5467,5468,5469,5471,5472,5473,5474,5475,5476,5477,5478,5479,5480,5481,5482,5483,5484,5485,5486,5487,5488,5489,5490,5491,5495,5496,5497,5498,5499,5500,5501,5502,5503,5504,5505,5506,5507,5508,5509,5510,5511,5512,5513,5514,5515,5516,5517,5518,5519,5520,5521,5522,5523,5524,5525,5526,5527,5528,5529,5530,5531,5535,5536,5537,5538,5539,5540,5542,5543,5544,5545,5546,5547,5548,5549,5550,5551,5552,5553,5554,5555,5556,5557,5558,5559,5999,6001,6002,6003,6004,6005,6006,6007,6008,6009,6010,6011,6012,6013,6015,6016,6017,6019,6020,6021,6022,6024,6025,6026,6029,6030,6031,6032,6033,6034,6035,6036,6037,6038,6039,6040,6042,6043,6044,6045,6047,6048,6049,6050,6052,6053,6054,6057,6058,6059,6060,6063,6064,6065,6067,6068,6069,6072,6073,6074,6075,6076,6079,6080,6081,6082,6083,6084,6085,6086,6087,6088,6089,6090,6091,6092,6093,6094,6095,6096,6097,6098,6100,6101,6102,6103,6104,6105,6106,6107,6108,6109,6110,6111,6112,6113,6115,6116,6117,6118,6119,6120,6121,6123,6124,6126,6134,6135,6136,6137,6138,6139,6140,6141,6142,6143,6144,6145,6146,6147,6148,6149,6150,6151,6152,6153,6154,6155,6156,6157,6158,6159,6160,6161,6162,6163,6164,6166,6167,6168,6169,6170,6171,6172,6173,6174,6175,6176,6179,6180,6181,6182,6183,6184,6185,6186,6191,6192,6193,6194,6196,6197,6200,6201,6202,6203,6204,6207,6208,6209,6210,6211,6212,6213,6216,6217,6218,6219,6220,6221,6222,6223,6224,6225,6226,6227,6228,6229,6230,6231,6232,6233,6234,6235,6236,6237,6238,6239,6240,6241,6242,6243,6244,6245,6246,6247,6248,6249,6250,6251,6252,6253,6255,6256,6257,6258,6259,6260,6261,6262,6263,6264,6265,6266,6267,6268,6269,6270,6271,6272,6273,6274,6275,6276,6277,6278,6279,6999,7000,7001,7002,7003,7004,7005,7006,7007,7008,7009,7010,7011,7012,7013,7014,7015,7016,7017,7018,7019,7020,7021,7022,7023,7024,7025,7026,7027,7028,7029,7030,7031,7032,7033,7034,7035,7036,7037,7038,7039,7040,7041,7042,7043,7044,7045,7046,7047,7048,7049,7050,7051,7052,7053,7054,7055,7056,7057,7058,7059,7060,7061,7062,7063,7064,7066,7067,7068,7069,7070,7071,7072,7073,7074,7075,7076,7077,7078,7079,7080,7081,7083,7084,7085,7086,7087,7088,7089,7090,7091,7092,7093,7094,7095,7096,7097,7098,7099,7100,7101,7102,7103,7104,7105,7106,7107,7108,7109,7110,7111,7112,7113,7114,7115,7116,7117,7118,7119,7120,7121,7124,7125,7126,7127,7128,7129,7130,7131,7132,7133,7134,7135,7136,7137,7138,7139,7140,7141,7142,7143,7144,7146,7147,7148,7149,7150,7151,7152,7153,7154,7155,7156,7157,7158,7159,7160,7161,7162,7163,7164,7165,7166,7167,7168,7169,7170,7171,7172,7173,7174,7175,7176,7177,7178,7179,7180,7181,7182,7183,7184,7185,7186,7187,7188,7189,7190,7191,7192,7193,7194,7195,7196,7197,7198,7199,7200,7201,7202,7203,7204,7205,7206,7207,7208,7209,7210,7211,7212,7213,7214,7215,7216,7217,7218,7219,7220,7221,7222,7223,7224,7225,7226,7227,7228,7229,7230,7231,7232,7233,7234,7235,7236,7237,7238,7239,7240,7241,7242,7243,7244,7245,7246,7247,7248,7249,7250,7251,7252,7253,7254,7255,7258,8000,8001,8002,8003,8004,8005,8006,8009,8010,8011,9000,9001,9002,9003,9004,9005,9006,9007,9008,9009,9010,9011,9013,9014,9015,9016,9017,9018,9019,9020,9021,9022,9023,9024,9025,9026,9027,9028,9029,9030,9031,9032,9033,9034,9035,9036,9037,9038,9039,9040,9041,9042,9043,9044,9045,9046,9047,9048,9049,9050,9051,9052,9053,9054,9055,9056,9057,9058,9059,9060,9061,9062,9063,9064,9065,9066,9067,9068,9074,9075,9076,9077,9078,9079,9080,9081,9082,9083,9084,9085,9086,9087,9088,9089,9090,9091,9092,9093,9094,9095,9098,9099,9100,9101,9102,9103,9104,9105,9106,9107,9108,9109,9110,9111,9112,9113,9114,9115,9116,9117,9118,9119,9120,9121,9122,9123,9124,9125,9126,9127,9128,9129,9130,9131,9132,9134,9135,9136,9137,9138,9139,9140,9141,9142,9143,9144,9145,9146,9147,9148,9149,9150,9155,9156,9157,9158,9160,9167,9168,9169,9170,9171,9172,9173,9174,9175,9176,9177,9178,9179,9180,9181,9182,9183,9184,9185,9186,9187,9188,9189,9190,9191,9192,9193,9194,9195,9196,9197,9198,9199,9200,9201,9202,9203,9204,9205,9206,9207,9208,9209,9210,9211,9212,9213,9214,9215,9216,9217,9233,9234,9235,9236,9237,9238,9239,9240,9242,9243,9244,9245,9246,9247,9248,9249,9250,9251,9252,9253,9254,9255,9256,9257,9258,9259,9260,9261,9262,9263,9264,9265,9266,9267,9268,9269,9270,9271,9272,9273,9274,9275,9276,9277,9278,9279,9281,9282,9283,9284,9285,9286,9287,9288,9289,9290,9291,9292,9293,9294,9295,9296,9297,9298,9299,9300,9301,9302,9303,9304,9305,9306,9307,9308,9309,10101,10105,10106,10107,10110,10113,10120,10121,10123,10124,10125,10132,10133,10134,10136,10162,10180,10181,10182,10186,10194,10195,10205,10207,10210,10213,10214,10217,10220,10227,10228,10233,10236,10237,10239,10244,10245,10246,10247,10254,10255,10256,10259,10260,10261,10262,10263,10265,10266,10267,10268,10276,10277,10278,10282,10284,10286,10289,10291,10295,10296,10297,10298,10299,10301,10302,10306,10307,10308,10309,10310,10313,10315,10316,10323,10327,10330,10331,10332,10333,10334,10335,10338,10340,10344,10346,10347,10352,10353,10357,10358,10364,10366,10367,10368,10370,10372,10373,10374,10376,10380,10385,10387,10401,10403,10404,10407,10409,10412,10414,10424,10425,10429,10432,10435,10436,10439,10446,10449,10452,10458,10460,10461,10462,10463,10464,10465,10471,10472,10473,10476,10477,10478,10481,10482,10487,10488,10493,10494,10495,10498,10499,10651,10653,10655,10656,10658,10660,10662,10666,10667,10668,10670,10671,10715,10717,10718,10719,10720,10721,10722,10724,10726,10727,10728,10729,10761,10762,10763,10765,10766,10767,10768,10770,10773,10775,10778,10782,10785,10787,10788,10789,10791,10792,10793,10794,10795,10799,10830,10836,10837,10839,10840,10842,10845,11010,11013,11014,11015,11017,11018,11020,11026,11031,11040,11042,11053,11070,11071,11075,11083,11089,11090,11091,11093,11094,11105,11108,11115,11125,11128,11133,11134,11137,11139,11140,11141,11143,11146,11153,11154,11165,11166,11172,11181,11182,11191,11197,11198,11203,11223,11224,11225,11230,11234,11243,11244,11254,11255,11302,11303,11310,11311,11312,11313,11314,11331,11334,11335,11343,11344,11345,11346,11347,11348,11349,11390,11391,11392,11393,11403,11423,11434,11435,11436,11455,11456,11473,11474,11475,11477,11503,11507,11534,11550,11561,11586,11659,11673,11674,11675,11676,11677,11678,11679,11680,11681,11699,11700,11719,11730,11751,11833,11854,11860,11878,11882,11883,11922,12003,12005,12006,12008,12012,12018,12019,12024,12041,12042,12055,12056,12058,12060,12076,12078,12079,12099,12127,13002,13003,13006,13007,13010,13017,13020,13028,13033,13045,13051,13054,13057,13059,13060,13072,13117,13132,13142,13143,14004,14016,14017,14018,14035,14040,14041,14046,14051,14052,14063,14065,14073,14074,14075,14080,14082,14084,14088,14091,14102,14104,14105,14111,14116,14119,14123,14124,14125,14126,14128,14129,14138,14141,14142,14143,14145,14147,14150,14151,14152,14153,14191,14199,14201,14202,14203,14204,14205,14206,14207,14209,14212,14213,14214,14216,14219,14220,14222,14227,14228,14239,14240,14259,14264,14267,14268,14278,14279,14313,14314,14332,14351,14352,14361,14363,14364,14436,14437,14438,14439,14440,14441,14442,14443,14444,14445,14446,14465,14485,14486,14519,14520,14521,14522,14523,14524,14525,14526,14527,14528,14529,14530,14531,14541,14554,14562,14563,14564,14565,14566,14567,14568,14569,14570,14571,14574,14581,14605,14608,14609,14650,14651,14652,14653,14654,14655,14656,14657,14658,14659,14678,14679,14680,14681,14682,14683,14684,14685,14687,14703,14704,14705,14706,14707,14708,14709,14710,14713,14714,14728,14729,14730,14737,14748,14750,14776,14784,14813,14843,14844,14901,14904,14907,14911,14926,14927,14928,14929,14930,14931,14932,14933,14934,14935,14936,14937,14953,14954,14968,14969,15005,15007,15008,15017,15026,15031,15032,15036,15040,15041,15045,15046,15048,15049,15053,15056,15058,15061,15066,15079,15085,15086,15112,15116,15120,15124,15125,15134,15142,15143,15149,15159,15165,15193,15194,15199,15200,15215,15250,15333,15363,15364,15365,15366,15367,15373,15383,15459,16008,16009,16011,16013,16015,16018,16023,16028,16029,16035,16036,16037,16038,16041,16046,16051,16055,16056,16061,16066,16069,16070,16071,16099,16114,16125,16131,16132,16143,16187,16188,16189,16190,16198,16199,19069,19070,19071,19072,19126,19151,19152,19153,19154,21000,21001,21002,21003,21004,21005,21006,21007,21008,21009,21010,21011,21012,21013,21014,21015,21016,21017,21019,21020,21021,21022,21023,21024,21025,21026,21027,21029,21030,21031,21032,21033,21034,21035,21036,21037,21038,21039,21040,21041,21042,21043,21044,21045,21046,21047,21048,21049,21050,21051,21052,21053,21054,21055,21056,21057,21058,21059,21060,21061,21062,21063,21064,21065,21066,21067,21068,24000,24001,24002,24003,24004,24005,24006,24008,24011,24012,24013,24014,24015,24017,24018,24019,24020,24021,24022,24023,24024,24025,24026,24027,24028,24029,24030,24031,24032,24033,24034,24036,24037,24038,24039,24040,24041,24042,24043,24044,24045,24046,24047,24048,24049,24050,24051,24053,24054,24055,24056,24057,24058,24059,24060,24061,24062,24063,24064,24065,24067,24068,24069,24070,24071,24072,24073,24074,24075,24076,24077,24078,24079,24080,24081,24082,24083,24084,24085,24086,24087,24088,24089,24090,24091,24092,24093,24094,24095,24096,24097,24098,24099,24100,24102,24103,24104,24105,24106,24107,24108,24109,24110,24111,24112,24113,24114,24115,24116,24117,24118,24119,24120,24121,24122,24123,24124,24125,24126,24127,24128,24129,24130,24131,24132,24133,24134,24137,24138,24139,24140,24141,24142,24143,24146,24147,24148,24149,24150,24151,24153,24154,24155,24156,24157,24159,24173,24174,24175,24176,24177,24178,24179,24180,24181,24182,24183,24184,24185,24186,24187,24188,24189,24190,24191,24192,24193,24194,24195,24196,24198,24199,24200,24201,24202,24203,24204,24207,24208,24209,24210,24211,24212,24213,24214,24215,24216,24217,24218,24219,24220,24221,24222,24223,24224,24225,24226,24227,24228,24229,24230,24231,24232,24233,24234,24235,24236,24237,24238,24239,24240,24241,24243,24244,24245,24246,24247,24248,24249,24250,24251,24252,24253,24254,24255,24256,24257,24258,24259,24260,24261,24262,24263,24264,24265,24266,24267,24268,24270,24271,24274,24275,24276,24277,24278,24279,24280,24281,24282,24283,24284,24285,24286,24287,24288,24289,24290,24291,24292,24293,24294,24295,24296,24297,24298,24299,24300,24302,24303,24304,24306,24307,24308,24309,24310,24311,24312,24313,24314,24316,24317,24318,24319,24320,24321,24322,24323,24324,24325,24326,24327,24328,24329,24330,24331,24332,24333,24334,24335,24336,24337,24338,24355,34043,34052,34102,34135,34144,34145,34158,34174,34175,34206],
      stamps: [],
      stampbook: { // TODO: enums for the options
        color: 1,
        highlight: 1,
        pattern: 0,
        icon: 1,
        stamps: [],
        recent_stamps: []
      },
      puffleSeq: 0,
      puffles: [],
      backyard: [],
      puffleItems: {},
      hasDug: false,
      treasureFinds: [],
      rainbow: {
        adoptability: false,
        currentTask: 0,
        coinsCollected: []
      },
      igloo: 1,
      igloos: [Penguin.getDefaultIgloo(1)],
      furniture: {
        "1": 10,
        "2": 10,
        "3": 10,
        "4": 10,
        "5": 10,
        "6": 10,
        "10": 10,
        "11": 10,
        "12": 10,
        "13": 10,
        "14": 10,
        "21": 10,
        "22": 10,
        "23": 10,
        "24": 10,
        "25": 10,
        "26": 10,
        "31": 10,
        "32": 10,
        "33": 10,
        "34": 10,
        "41": 10,
        "42": 10,
        "43": 10,
        "46": 10,
        "47": 10,
        "51": 10,
        "52": 10,
        "53": 10,
        "54": 10,
        "55": 10,
        "56": 10,
        "57": 10,
        "58": 10,
        "59": 10,
        "61": 10,
        "62": 10,
        "63": 10,
        "65": 10,
        "66": 10,
        "67": 10,
        "71": 10,
        "72": 10,
        "73": 10,
        "74": 10,
        "75": 10,
        "76": 10,
        "77": 10,
        "78": 10,
        "79": 10,
        "80": 10,
        "81": 10,
        "82": 10,
        "83": 10,
        "84": 10,
        "85": 10,
        "91": 10,
        "92": 10,
        "93": 10,
        "94": 10,
        "95": 10,
        "96": 10,
        "97": 10,
        "99": 10,
        "100": 10,
        "101": 10,
        "102": 10,
        "103": 10,
        "104": 10,
        "105": 10,
        "106": 10,
        "107": 10,
        "108": 10,
        "109": 10,
        "110": 10,
        "111": 10,
        "112": 10,
        "113": 10,
        "114": 10,
        "115": 10,
        "116": 10,
        "117": 10,
        "118": 10,
        "119": 10,
        "120": 10,
        "130": 10,
        "131": 10,
        "132": 10,
        "133": 10,
        "134": 10,
        "135": 10,
        "136": 10,
        "137": 10,
        "138": 10,
        "139": 10,
        "140": 10,
        "143": 10,
        "144": 10,
        "145": 10,
        "146": 10,
        "147": 10,
        "148": 10,
        "149": 10,
        "150": 10,
        "151": 10,
        "152": 10,
        "153": 10,
        "154": 10,
        "155": 10,
        "156": 10,
        "157": 10,
        "158": 10,
        "159": 10,
        "160": 10,
        "161": 10,
        "162": 10,
        "163": 10,
        "164": 10,
        "165": 10,
        "166": 10,
        "167": 10,
        "168": 10,
        "169": 10,
        "170": 10,
        "171": 10,
        "172": 10,
        "173": 10,
        "174": 10,
        "175": 10,
        "176": 10,
        "177": 10,
        "178": 10,
        "180": 10,
        "181": 10,
        "182": 10,
        "183": 10,
        "184": 10,
        "185": 10,
        "186": 10,
        "187": 10,
        "200": 10,
        "201": 10,
        "202": 10,
        "203": 10,
        "204": 10,
        "205": 10,
        "206": 10,
        "207": 10,
        "208": 10,
        "209": 10,
        "210": 10,
        "211": 10,
        "212": 10,
        "213": 10,
        "214": 10,
        "215": 10,
        "216": 10,
        "217": 10,
        "218": 10,
        "219": 10,
        "220": 10,
        "221": 10,
        "222": 10,
        "223": 10,
        "224": 10,
        "225": 10,
        "226": 10,
        "227": 10,
        "228": 10,
        "229": 10,
        "230": 10,
        "231": 10,
        "232": 10,
        "233": 10,
        "250": 10,
        "251": 10,
        "252": 10,
        "253": 10,
        "254": 10,
        "260": 10,
        "261": 10,
        "270": 10,
        "271": 10,
        "272": 10,
        "273": 10,
        "274": 10,
        "275": 10,
        "280": 10,
        "281": 10,
        "282": 10,
        "283": 10,
        "284": 10,
        "285": 10,
        "286": 10,
        "287": 10,
        "288": 10,
        "289": 10,
        "290": 10,
        "291": 10,
        "292": 10,
        "293": 10,
        "294": 10,
        "295": 10,
        "296": 10,
        "297": 10,
        "298": 10,
        "299": 10,
        "300": 10,
        "301": 10,
        "302": 10,
        "303": 10,
        "304": 10,
        "305": 10,
        "306": 10,
        "307": 10,
        "308": 10,
        "309": 10,
        "310": 10,
        "311": 10,
        "312": 10,
        "313": 10,
        "314": 10,
        "315": 10,
        "316": 10,
        "317": 10,
        "330": 10,
        "331": 10,
        "332": 10,
        "333": 10,
        "334": 10,
        "335": 10,
        "336": 10,
        "337": 10,
        "338": 10,
        "339": 10,
        "340": 10,
        "341": 10,
        "342": 10,
        "343": 10,
        "344": 10,
        "345": 10,
        "346": 10,
        "347": 10,
        "348": 10,
        "349": 10,
        "350": 10,
        "351": 10,
        "352": 10,
        "353": 10,
        "354": 10,
        "355": 10,
        "356": 10,
        "357": 10,
        "358": 10,
        "359": 10,
        "360": 10,
        "361": 10,
        "362": 10,
        "363": 10,
        "364": 10,
        "365": 10,
        "366": 10,
        "367": 10,
        "368": 10,
        "369": 10,
        "370": 10,
        "371": 10,
        "372": 10,
        "373": 10,
        "374": 10,
        "375": 10,
        "376": 10,
        "377": 10,
        "378": 10,
        "390": 10,
        "391": 10,
        "392": 10,
        "393": 10,
        "394": 10,
        "400": 10,
        "401": 10,
        "402": 10,
        "403": 10,
        "410": 10,
        "411": 10,
        "412": 10,
        "413": 10,
        "414": 10,
        "415": 10,
        "416": 10,
        "417": 10,
        "418": 10,
        "420": 10,
        "421": 10,
        "422": 10,
        "423": 10,
        "424": 10,
        "425": 10,
        "426": 10,
        "430": 10,
        "431": 10,
        "432": 10,
        "433": 10,
        "434": 10,
        "435": 10,
        "440": 10,
        "441": 10,
        "442": 10,
        "443": 10,
        "444": 10,
        "450": 10,
        "451": 10,
        "452": 10,
        "453": 10,
        "454": 10,
        "455": 10,
        "460": 10,
        "461": 10,
        "470": 10,
        "471": 10,
        "472": 10,
        "473": 10,
        "474": 10,
        "475": 10,
        "480": 10,
        "481": 10,
        "482": 10,
        "483": 10,
        "484": 10,
        "485": 10,
        "486": 10,
        "487": 10,
        "488": 10,
        "489": 10,
        "490": 10,
        "491": 10,
        "492": 10,
        "493": 10,
        "494": 10,
        "495": 10,
        "496": 10,
        "497": 10,
        "500": 10,
        "501": 10,
        "502": 10,
        "503": 10,
        "504": 10,
        "505": 10,
        "506": 10,
        "507": 10,
        "511": 10,
        "512": 10,
        "513": 10,
        "514": 10,
        "515": 10,
        "516": 10,
        "517": 10,
        "520": 10,
        "521": 10,
        "522": 10,
        "525": 11,
        "526": 10,
        "527": 10,
        "528": 10,
        "529": 10,
        "530": 10,
        "531": 10,
        "532": 10,
        "533": 10,
        "535": 10,
        "536": 10,
        "537": 10,
        "538": 10,
        "539": 10,
        "540": 10,
        "541": 10,
        "542": 10,
        "544": 10,
        "545": 10,
        "546": 10,
        "547": 10,
        "548": 10,
        "549": 10,
        "550": 10,
        "551": 10,
        "552": 10,
        "553": 10,
        "560": 11,
        "561": 10,
        "562": 10,
        "563": 10,
        "564": 10,
        "565": 10,
        "566": 10,
        "567": 10,
        "570": 10,
        "571": 10,
        "572": 10,
        "573": 10,
        "574": 10,
        "575": 10,
        "576": 10,
        "577": 10,
        "578": 10,
        "579": 10,
        "580": 10,
        "581": 10,
        "582": 10,
        "583": 10,
        "584": 10,
        "585": 10,
        "586": 10,
        "587": 10,
        "588": 10,
        "589": 10,
        "590": 10,
        "591": 10,
        "592": 10,
        "593": 10,
        "594": 10,
        "595": 10,
        "596": 10,
        "597": 10,
        "598": 10,
        "599": 10,
        "600": 10,
        "601": 10,
        "602": 10,
        "603": 10,
        "604": 10,
        "605": 10,
        "606": 10,
        "607": 10,
        "608": 10,
        "609": 10,
        "611": 10,
        "612": 10,
        "613": 10,
        "614": 10,
        "615": 10,
        "616": 10,
        "617": 10,
        "618": 10,
        "619": 10,
        "620": 10,
        "621": 10,
        "622": 10,
        "623": 10,
        "624": 10,
        "625": 10,
        "626": 10,
        "627": 10,
        "628": 10,
        "629": 10,
        "630": 10,
        "632": 10,
        "633": 10,
        "634": 10,
        "635": 10,
        "636": 10,
        "637": 10,
        "638": 10,
        "639": 10,
        "640": 10,
        "641": 10,
        "642": 10,
        "643": 10,
        "644": 10,
        "646": 10,
        "647": 10,
        "648": 10,
        "649": 10,
        "650": 10,
        "651": 10,
        "652": 10,
        "653": 10,
        "654": 10,
        "655": 10,
        "656": 10,
        "657": 10,
        "658": 10,
        "659": 10,
        "660": 10,
        "661": 10,
        "662": 10,
        "663": 10,
        "664": 10,
        "665": 10,
        "666": 10,
        "667": 10,
        "668": 10,
        "669": 10,
        "670": 10,
        "671": 10,
        "672": 10,
        "673": 10,
        "674": 10,
        "675": 10,
        "676": 10,
        "677": 10,
        "678": 10,
        "679": 10,
        "680": 10,
        "681": 10,
        "682": 10,
        "683": 10,
        "684": 10,
        "685": 10,
        "686": 10,
        "687": 10,
        "688": 10,
        "690": 10,
        "691": 10,
        "692": 10,
        "693": 10,
        "694": 10,
        "695": 10,
        "696": 10,
        "697": 10,
        "698": 10,
        "699": 10,
        "700": 10,
        "701": 10,
        "702": 10,
        "703": 10,
        "704": 10,
        "705": 10,
        "706": 10,
        "707": 10,
        "708": 10,
        "710": 10,
        "711": 10,
        "712": 10,
        "713": 10,
        "714": 10,
        "715": 10,
        "716": 10,
        "717": 10,
        "718": 10,
        "719": 10,
        "720": 10,
        "721": 10,
        "722": 10,
        "723": 10,
        "724": 10,
        "725": 10,
        "726": 10,
        "727": 10,
        "728": 10,
        "729": 10,
        "730": 10,
        "731": 10,
        "732": 10,
        "733": 10,
        "734": 10,
        "735": 10,
        "736": 10,
        "737": 10,
        "739": 10,
        "740": 10,
        "741": 10,
        "743": 10,
        "745": 10,
        "746": 10,
        "747": 10,
        "748": 10,
        "749": 10,
        "750": 10,
        "751": 10,
        "752": 10,
        "753": 10,
        "754": 10,
        "755": 10,
        "756": 10,
        "757": 10,
        "758": 10,
        "760": 10,
        "761": 10,
        "762": 10,
        "763": 10,
        "764": 10,
        "765": 10,
        "766": 10,
        "767": 10,
        "768": 10,
        "769": 10,
        "770": 10,
        "771": 10,
        "772": 10,
        "773": 10,
        "774": 10,
        "775": 10,
        "776": 10,
        "777": 10,
        "778": 10,
        "779": 10,
        "780": 10,
        "781": 10,
        "782": 10,
        "783": 10,
        "784": 10,
        "785": 10,
        "786": 10,
        "787": 10,
        "788": 10,
        "790": 10,
        "792": 10,
        "793": 10,
        "794": 10,
        "795": 10,
        "796": 10,
        "797": 10,
        "798": 10,
        "799": 10,
        "800": 10,
        "801": 10,
        "802": 10,
        "803": 10,
        "804": 10,
        "805": 10,
        "806": 10,
        "807": 10,
        "808": 10,
        "809": 10,
        "810": 10,
        "811": 10,
        "812": 10,
        "813": 10,
        "814": 10,
        "815": 10,
        "816": 10,
        "817": 10,
        "818": 10,
        "819": 10,
        "820": 10,
        "821": 10,
        "822": 10,
        "823": 10,
        "824": 10,
        "825": 10,
        "826": 10,
        "827": 10,
        "828": 10,
        "829": 10,
        "830": 10,
        "831": 10,
        "832": 10,
        "833": 10,
        "834": 10,
        "835": 10,
        "836": 10,
        "837": 10,
        "838": 10,
        "839": 10,
        "840": 10,
        "841": 10,
        "842": 10,
        "843": 10,
        "844": 10,
        "845": 10,
        "846": 10,
        "847": 10,
        "848": 10,
        "849": 10,
        "850": 10,
        "851": 10,
        "852": 10,
        "853": 10,
        "854": 10,
        "855": 10,
        "856": 10,
        "857": 10,
        "858": 10,
        "859": 10,
        "860": 10,
        "861": 10,
        "862": 10,
        "863": 10,
        "864": 10,
        "865": 10,
        "866": 10,
        "867": 10,
        "868": 10,
        "869": 10,
        "870": 10,
        "871": 10,
        "872": 10,
        "873": 10,
        "874": 10,
        "875": 10,
        "876": 10,
        "877": 10,
        "878": 10,
        "879": 10,
        "880": 10,
        "881": 10,
        "882": 10,
        "883": 10,
        "884": 10,
        "885": 10,
        "886": 10,
        "887": 10,
        "888": 10,
        "889": 10,
        "890": 10,
        "891": 10,
        "892": 10,
        "893": 10,
        "894": 10,
        "902": 10,
        "903": 10,
        "904": 10,
        "905": 10,
        "906": 10,
        "907": 10,
        "908": 10,
        "909": 10,
        "910": 10,
        "911": 10,
        "912": 10,
        "913": 10,
        "914": 10,
        "915": 10,
        "916": 10,
        "917": 10,
        "918": 10,
        "919": 10,
        "920": 10,
        "921": 10,
        "922": 10,
        "923": 10,
        "924": 10,
        "925": 10,
        "926": 10,
        "927": 10,
        "928": 10,
        "929": 10,
        "930": 10,
        "931": 10,
        "932": 10,
        "933": 10,
        "934": 10,
        "935": 10,
        "936": 10,
        "937": 10,
        "938": 10,
        "939": 10,
        "940": 10,
        "941": 10,
        "942": 10,
        "943": 10,
        "944": 10,
        "945": 10,
        "946": 10,
        "947": 10,
        "948": 10,
        "949": 10,
        "950": 10,
        "951": 10,
        "952": 10,
        "953": 10,
        "954": 10,
        "955": 10,
        "956": 10,
        "957": 10,
        "958": 10,
        "959": 10,
        "960": 10,
        "961": 10,
        "962": 10,
        "963": 10,
        "964": 10,
        "965": 10,
        "966": 10,
        "967": 10,
        "968": 10,
        "969": 10,
        "970": 10,
        "971": 10,
        "972": 10,
        "973": 10,
        "974": 10,
        "975": 10,
        "976": 10,
        "977": 10,
        "978": 10,
        "979": 10,
        "980": 10,
        "981": 10,
        "982": 10,
        "983": 10,
        "984": 10,
        "985": 10,
        "986": 10,
        "987": 10,
        "988": 10,
        "989": 10,
        "990": 10,
        "991": 10,
        "992": 10,
        "993": 10,
        "994": 10,
        "995": 10,
        "996": 10,
        "997": 10,
        "998": 10,
        "999": 10,
        "1001": 10,
        "1002": 10,
        "1003": 10,
        "1004": 10,
        "1005": 10,
        "1006": 10,
        "1007": 10,
        "1008": 10,
        "1009": 10,
        "1010": 10,
        "1011": 10,
        "1012": 10,
        "1013": 10,
        "1014": 10,
        "1015": 10,
        "1016": 10,
        "1017": 10,
        "1018": 10,
        "1019": 10,
        "1020": 10,
        "1021": 10,
        "1022": 10,
        "1023": 10,
        "1024": 10,
        "1025": 10,
        "1026": 10,
        "1027": 10,
        "1028": 10,
        "1029": 10,
        "1030": 10,
        "1031": 10,
        "1032": 10,
        "1033": 10,
        "1034": 10,
        "1035": 10,
        "1036": 10,
        "1037": 10,
        "1038": 10,
        "1039": 10,
        "1040": 10,
        "1041": 10,
        "1042": 10,
        "1043": 10,
        "1044": 10,
        "1045": 10,
        "1050": 10,
        "1051": 10,
        "1052": 10,
        "1053": 10,
        "1054": 10,
        "1055": 10,
        "1056": 10,
        "1057": 10,
        "1058": 10,
        "1059": 10,
        "1060": 10,
        "1061": 10,
        "1062": 10,
        "1063": 10,
        "1064": 10,
        "1065": 10,
        "1066": 10,
        "1067": 10,
        "1068": 10,
        "1069": 10,
        "1070": 10,
        "1071": 10,
        "1072": 10,
        "1073": 10,
        "1074": 10,
        "1075": 10,
        "1076": 10,
        "1077": 10,
        "1078": 10,
        "1079": 10,
        "1080": 10,
        "1081": 10,
        "1082": 10,
        "1083": 10,
        "1084": 10,
        "1085": 10,
        "1086": 10,
        "1087": 10,
        "1088": 10,
        "1089": 10,
        "1090": 10,
        "1091": 10,
        "1092": 10,
        "1093": 10,
        "1094": 10,
        "1100": 10,
        "1101": 10,
        "1102": 10,
        "1103": 10,
        "1104": 10,
        "1105": 10,
        "1106": 10,
        "1107": 10,
        "1108": 10,
        "1109": 10,
        "1110": 10,
        "1111": 10,
        "1112": 10,
        "1113": 10,
        "1114": 10,
        "1115": 10,
        "1116": 10,
        "1117": 10,
        "1118": 10,
        "1119": 10,
        "1120": 10,
        "1121": 10,
        "1122": 10,
        "1123": 10,
        "1124": 10,
        "1125": 10,
        "1126": 10,
        "1127": 10,
        "1128": 10,
        "1129": 10,
        "1130": 10,
        "1131": 10,
        "1132": 10,
        "1133": 10,
        "1134": 10,
        "1135": 10,
        "1136": 10,
        "1137": 10,
        "1138": 10,
        "1139": 10,
        "1140": 10,
        "1141": 10,
        "1142": 10,
        "1143": 10,
        "1144": 10,
        "1150": 10,
        "1151": 10,
        "1152": 10,
        "1153": 10,
        "1154": 10,
        "1155": 10,
        "1156": 10,
        "1157": 10,
        "1158": 10,
        "1159": 10,
        "1160": 10,
        "1161": 10,
        "1162": 10,
        "1163": 10,
        "1164": 10,
        "1165": 10,
        "1166": 10,
        "1167": 10,
        "1168": 10,
        "1169": 10,
        "1170": 10,
        "1171": 10,
        "1172": 10,
        "1173": 10,
        "1174": 10,
        "1175": 10,
        "1176": 10,
        "1177": 10,
        "1178": 10,
        "1179": 10,
        "1181": 10,
        "1182": 10,
        "1183": 10,
        "1184": 10,
        "1185": 10,
        "1186": 10,
        "1187": 10,
        "1188": 10,
        "1189": 10,
        "1190": 10,
        "1191": 10,
        "1192": 10,
        "1193": 10,
        "1194": 10,
        "1195": 10,
        "2000": 10,
        "2001": 10,
        "2002": 10,
        "2003": 10,
        "2004": 10,
        "2005": 10,
        "2006": 10,
        "2007": 10,
        "2008": 10,
        "2009": 10,
        "2010": 10,
        "2011": 10,
        "2012": 10,
        "2013": 10,
        "2014": 10,
        "2015": 10,
        "2016": 10,
        "2017": 10,
        "2018": 10,
        "2019": 10,
        "2020": 10,
        "2021": 10,
        "2022": 10,
        "2023": 10,
        "2024": 10,
        "2025": 10,
        "2026": 10,
        "2027": 10,
        "2028": 10,
        "2029": 10,
        "2030": 10,
        "2031": 10,
        "2032": 10,
        "2033": 10,
        "2034": 10,
        "2035": 10,
        "2036": 10,
        "2037": 10,
        "2038": 10,
        "2039": 10,
        "2040": 10,
        "2041": 10,
        "2042": 10,
        "2043": 10,
        "2044": 10,
        "2045": 10,
        "2046": 10,
        "2047": 10,
        "2048": 10,
        "2049": 10,
        "2050": 10,
        "2051": 10,
        "2052": 10,
        "2053": 10,
        "2054": 10,
        "2055": 10,
        "2056": 10,
        "2057": 10,
        "2058": 10,
        "2059": 10,
        "2060": 10,
        "2061": 10,
        "2062": 10,
        "2063": 10,
        "2064": 10,
        "2065": 10,
        "2066": 10,
        "2067": 10,
        "2068": 10,
        "2069": 10,
        "2070": 10,
        "2071": 10,
        "2072": 10,
        "2073": 10,
        "2074": 10,
        "2075": 10,
        "2076": 10,
        "2077": 10,
        "2078": 10,
        "2079": 10,
        "2080": 10,
        "2081": 10,
        "2082": 10,
        "2083": 10,
        "2084": 10,
        "2085": 10,
        "2086": 10,
        "2087": 10,
        "2088": 10,
        "2089": 10,
        "2090": 10,
        "2091": 10,
        "2092": 10,
        "2093": 10,
        "2094": 10,
        "2095": 10,
        "2096": 10,
        "2097": 10,
        "2098": 10,
        "2099": 10,
        "2100": 10,
        "2101": 10,
        "2102": 10,
        "2103": 10,
        "2104": 10,
        "2105": 10,
        "2106": 10,
        "2107": 10,
        "2108": 10,
        "2109": 10,
        "2110": 10,
        "2111": 10,
        "2112": 10,
        "2113": 10,
        "2114": 10,
        "2115": 10,
        "2116": 10,
        "2117": 10,
        "2118": 10,
        "2119": 10,
        "2120": 10,
        "2121": 10,
        "2122": 10,
        "2123": 10,
        "2124": 10,
        "2125": 10,
        "2126": 10,
        "2129": 10,
        "2130": 10,
        "2131": 10,
        "2132": 10,
        "2133": 10,
        "2134": 10,
        "2135": 10,
        "2136": 10,
        "2137": 10,
        "2138": 10,
        "2139": 10,
        "2140": 10,
        "2141": 10,
        "2142": 10,
        "2143": 10,
        "2144": 10,
        "2145": 10,
        "2146": 10,
        "2147": 10,
        "2148": 10,
        "2149": 10,
        "2150": 10,
        "2151": 10,
        "2152": 10,
        "2153": 10,
        "2154": 10,
        "2155": 10,
        "2156": 10,
        "2157": 10,
        "2158": 10,
        "2159": 10,
        "2160": 10,
        "2161": 10,
        "2162": 10,
        "2163": 10,
        "2164": 10,
        "2165": 10,
        "2166": 10,
        "2167": 10,
        "2168": 10,
        "2169": 10,
        "2170": 10,
        "2171": 10,
        "2172": 10,
        "2173": 10,
        "2174": 10,
        "2175": 10,
        "2176": 10,
        "2177": 10,
        "2178": 10,
        "2179": 10,
        "2180": 10,
        "2182": 10,
        "2183": 10,
        "2184": 10,
        "2185": 10,
        "2186": 10,
        "2187": 10,
        "2188": 10,
        "2189": 10,
        "2190": 10,
        "2191": 10,
        "2192": 10,
        "2193": 10,
        "2194": 10,
        "2195": 10,
        "2196": 10,
        "2197": 10,
        "2198": 10,
        "2199": 10,
        "2200": 10,
        "2201": 10,
        "2202": 10,
        "2203": 10,
        "2204": 10,
        "2205": 10,
        "2206": 10,
        "2207": 10,
        "2208": 10,
        "2209": 10,
        "2210": 10,
        "2211": 10,
        "2212": 10,
        "2213": 10,
        "2214": 10,
        "2215": 10,
        "2216": 10,
        "2217": 10,
        "2218": 10,
        "2219": 10,
        "2220": 10,
        "2221": 10,
        "2222": 10,
        "2223": 10,
        "2224": 10,
        "2225": 10,
        "2226": 10,
        "2227": 10,
        "2228": 10,
        "2229": 10,
        "2230": 10,
        "2231": 10,
        "2232": 10,
        "2233": 10,
        "2234": 10,
        "2235": 10,
        "2236": 10,
        "2237": 10,
        "2238": 10,
        "2239": 10,
        "2240": 10,
        "2241": 10,
        "2242": 10,
        "2243": 10,
        "2244": 10,
        "2245": 10,
        "2246": 10,
        "2247": 10,
        "2248": 10,
        "2249": 10,
        "2250": 10,
        "2251": 10,
        "2252": 10,
        "2253": 10,
        "2254": 10,
        "2255": 10,
        "2256": 10,
        "2257": 10,
        "2258": 10,
        "2259": 10,
        "2260": 10,
        "2261": 10,
        "2262": 10,
        "2263": 10,
        "2264": 10,
        "2265": 10,
        "2266": 10,
        "2267": 10,
        "2268": 10,
        "2269": 10,
        "2270": 10,
        "2271": 10,
        "2272": 10,
        "2273": 10,
        "2274": 10,
        "2275": 10,
        "2276": 10,
        "2277": 10,
        "2278": 10,
        "2279": 10,
        "2280": 10,
        "2281": 10,
        "2282": 10,
        "2283": 10,
        "2284": 10,
        "2285": 10,
        "2286": 10,
        "2287": 10,
        "2288": 10,
        "2289": 10,
        "2290": 10,
        "2291": 10,
        "2292": 10,
        "2293": 10,
        "2294": 10,
        "2295": 10,
        "2296": 10,
        "2297": 10,
        "2298": 10,
        "2299": 10,
        "2300": 10,
        "2301": 10,
        "2302": 10,
        "2303": 10,
        "2304": 10,
        "2305": 10,
        "2306": 10,
        "2307": 10,
        "2308": 10,
        "2309": 10,
        "2310": 10,
        "2311": 10,
        "2312": 10,
        "2313": 10,
        "2314": 10,
        "2315": 10,
        "2316": 10,
        "2317": 10,
        "2318": 10,
        "2319": 10,
        "2320": 10,
        "2321": 10,
        "2322": 10,
        "2323": 10,
        "2324": 10,
        "2325": 10,
        "2326": 10,
        "2327": 10,
        "2328": 10,
        "2329": 10,
        "2330": 10,
        "2331": 10,
        "2332": 10,
        "2333": 10,
        "2334": 10,
        "2335": 10,
        "2336": 10,
        "2337": 10,
        "2338": 10,
        "2339": 10,
        "2340": 10,
        "2341": 10,
        "2342": 10,
        "2343": 10,
        "2344": 10,
        "2345": 10,
        "2346": 10,
        "2347": 10,
        "2348": 10,
        "2349": 10,
        "2350": 10,
        "2351": 10,
        "2352": 10,
        "2353": 10,
        "2354": 10,
        "2355": 10,
        "2356": 10,
        "2357": 10,
        "2358": 10,
        "2359": 10,
        "2360": 10,
        "2361": 10,
        "10076": 10,
        "10077": 10,
        "10079": 10,
        "10156": 10,
        "10157": 10,
        "10185": 10,
        "10187": 10,
        "10214": 10,
        "10219": 10,
        "10220": 10,
        "10229": 10,
        "10293": 10,
        "10304": 10,
        "10425": 10,
        "10540": 10,
        "10544": 10,
        "10545": 10,
        "10573": 10,
        "10656": 10,
        "10701": 10,
        "10737": 10,
        "10774": 10,
        "10778": 10,
        "10781": 10,
        "10832": 10,
        "10915": 10,
        "10941": 10,
        "10982": 10,
        "12035": 10,
        "12062": 10,
        "12114": 10,
        "12123": 10,
        "12127": 10,
        "12128": 10,
        "12129": 10,
        "12156": 10
      },
      iglooFloorings: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23
      ], // floorings inventory is a modern feature
      iglooTypes: [
        85,
        86,
        87,
        88,
        89,
        90,
        91,
        92,
        93,
        94,
        95,
        96,
        97,
        98,
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        32,
        33,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        64,
        65,
        66,
        67,
        68,
        69,
        70,
        71,
        72,
        73,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        82,
        83,
        84
      ],
      iglooLocations: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8
      ],
      iglooSeq: 1,
      mail: [],
      mailSeq: 0,
      ownedMedals: 0,
      careerMedals: 0,
      nuggets: 0,
      cards: {
        "1": 1,
        "2": 1,
        "3": 1,
        "4": 1,
        "5": 1,
        "6": 1,
        "7": 1,
        "8": 1,
        "9": 1,
        "10": 1,
        "11": 1,
        "12": 1,
        "13": 1,
        "14": 1,
        "15": 1,
        "16": 1,
        "17": 1,
        "18": 1,
        "19": 1,
        "20": 1,
        "21": 1,
        "22": 1,
        "23": 1,
        "24": 1,
        "25": 1,
        "26": 1,
        "27": 1,
        "28": 1,
        "29": 1,
        "30": 1,
        "31": 1,
        "32": 1,
        "33": 1,
        "34": 1,
        "35": 1,
        "36": 1,
        "37": 1,
        "38": 1,
        "39": 1,
        "40": 1,
        "41": 1,
        "42": 1,
        "43": 1,
        "44": 1,
        "45": 1,
        "46": 1,
        "47": 1,
        "48": 1,
        "49": 1,
        "50": 1,
        "51": 1,
        "52": 1,
        "53": 1,
        "54": 1,
        "55": 1,
        "56": 1,
        "57": 1,
        "58": 1,
        "59": 1,
        "60": 1,
        "61": 1,
        "62": 1,
        "63": 1,
        "64": 1,
        "65": 1,
        "66": 1,
        "67": 1,
        "68": 1,
        "69": 1,
        "70": 1,
        "71": 1,
        "72": 1,
        "73": 1,
        "74": 1,
        "75": 1,
        "76": 1,
        "77": 1,
        "78": 1,
        "79": 1,
        "80": 1,
        "81": 1,
        "82": 1,
        "83": 1,
        "84": 1,
        "85": 1,
        "86": 1,
        "87": 1,
        "88": 1,
        "89": 1,
        "90": 1,
        "91": 1,
        "92": 1,
        "93": 1,
        "94": 1,
        "95": 1,
        "96": 1,
        "97": 1,
        "98": 1,
        "99": 1,
        "100": 1,
        "101": 1,
        "102": 1,
        "103": 1,
        "104": 1,
        "105": 1,
        "106": 1,
        "107": 1,
        "108": 1,
        "109": 1,
        "110": 1,
        "111": 1,
        "112": 1,
        "113": 1,
        "201": 1,
        "202": 1,
        "203": 1,
        "204": 1,
        "205": 1,
        "206": 1,
        "207": 1,
        "208": 1,
        "209": 1,
        "210": 1,
        "211": 1,
        "212": 1,
        "213": 1,
        "214": 1,
        "215": 1,
        "216": 1,
        "217": 1,
        "218": 1,
        "219": 1,
        "220": 1,
        "221": 1,
        "222": 1,
        "223": 1,
        "224": 1,
        "225": 1,
        "226": 1,
        "227": 1,
        "228": 1,
        "229": 1,
        "230": 1,
        "231": 1,
        "232": 1,
        "233": 1,
        "234": 1,
        "235": 1,
        "236": 1,
        "237": 1,
        "238": 1,
        "239": 1,
        "240": 1,
        "241": 1,
        "242": 1,
        "243": 1,
        "244": 1,
        "245": 1,
        "246": 1,
        "247": 1,
        "248": 1,
        "249": 1,
        "250": 1,
        "251": 1,
        "252": 1,
        "253": 1,
        "254": 1,
        "255": 1,
        "256": 1,
        "257": 1,
        "258": 1,
        "259": 1,
        "260": 1,
        "301": 1,
        "302": 1,
        "303": 1,
        "304": 1,
        "305": 1,
        "306": 1,
        "307": 1,
        "308": 1,
        "309": 1,
        "310": 1,
        "311": 1,
        "312": 1,
        "313": 1,
        "314": 1,
        "315": 1,
        "316": 1,
        "317": 1,
        "318": 1,
        "319": 1,
        "320": 1,
        "321": 1,
        "322": 1,
        "323": 1,
        "324": 1,
        "325": 1,
        "326": 1,
        "327": 1,
        "328": 1,
        "329": 1,
        "330": 1,
        "331": 1,
        "332": 1,
        "333": 1,
        "334": 1,
        "335": 1,
        "336": 1,
        "337": 1,
        "338": 1,
        "339": 1,
        "340": 1,
        "341": 1,
        "342": 1,
        "343": 1,
        "344": 1,
        "345": 1,
        "346": 1,
        "347": 1,
        "348": 1,
        "349": 1,
        "350": 1,
        "351": 1,
        "352": 1,
        "353": 1,
        "354": 1,
        "355": 1,
        "356": 1,
        "357": 1,
        "358": 1,
        "359": 1,
        "360": 1,
        "401": 1,
        "402": 1,
        "403": 1,
        "404": 1,
        "405": 1,
        "406": 1,
        "407": 1,
        "408": 1,
        "409": 1,
        "410": 1,
        "411": 1,
        "412": 1,
        "413": 1,
        "414": 1,
        "415": 1,
        "416": 1,
        "417": 1,
        "418": 1,
        "419": 1,
        "420": 1,
        "421": 1,
        "422": 1,
        "423": 1,
        "424": 1,
        "425": 1,
        "426": 1,
        "427": 1,
        "501": 1,
        "502": 1,
        "503": 1,
        "504": 1,
        "505": 1,
        "506": 1,
        "507": 1,
        "508": 1,
        "509": 1,
        "510": 1,
        "511": 1,
        "512": 1,
        "513": 1,
        "514": 1,
        "515": 1,
        "516": 1,
        "517": 1,
        "518": 1,
        "519": 1,
        "520": 1,
        "521": 1,
        "522": 1,
        "523": 1,
        "524": 1,
        "525": 1,
        "526": 1,
        "527": 1,
        "528": 1,
        "529": 1,
        "530": 1,
        "531": 1,
        "532": 1,
        "533": 1,
        "534": 1,
        "535": 1,
        "536": 1,
        "537": 1,
        "538": 1,
        "539": 1,
        "540": 1,
        "541": 1,
        "542": 1,
        "543": 1,
        "544": 1,
        "545": 1,
        "546": 1,
        "547": 1,
        "548": 1,
        "549": 1,
        "550": 1,
        "551": 1,
        "552": 1,
        "553": 1,
        "554": 1,
        "555": 1,
        "556": 1,
        "557": 1,
        "558": 1,
        "559": 1,
        "560": 1,
        "561": 1,
        "562": 1,
        "563": 1,
        "564": 1,
        "565": 1,
        "566": 1,
        "567": 1,
        "568": 1,
        "569": 1,
        "570": 1,
        "571": 1,
        "572": 1,
        "573": 1,
        "574": 1,
        "575": 1,
        "576": 1,
        "577": 1,
        "578": 1,
        "579": 1,
        "580": 1,
        "581": 1,
        "582": 1,
        "583": 1,
        "584": 1,
        "585": 1,
        "586": 1,
        "587": 1,
        "588": 1,
        "589": 1,
        "590": 1,
        "591": 1,
        "592": 1,
        "593": 1,
        "594": 1,
        "595": 1,
        "601": 1,
        "602": 1,
        "603": 1,
        "604": 1,
        "605": 1,
        "606": 1,
        "607": 1,
        "608": 1,
        "609": 1,
        "610": 1,
        "611": 1,
        "612": 1,
        "613": 1,
        "614": 1,
        "615": 1,
        "616": 1,
        "617": 1,
        "618": 1,
        "619": 1,
        "620": 1,
        "621": 1,
        "622": 1,
        "623": 1,
        "624": 1,
        "625": 1,
        "626": 1,
        "627": 1,
        "628": 1,
        "629": 1,
        "630": 1,
        "631": 1,
        "632": 1,
        "633": 1,
        "634": 1,
        "635": 1,
        "636": 1,
        "637": 1,
        "638": 1,
        "639": 1,
        "640": 1,
        "641": 1,
        "642": 1,
        "643": 1,
        "644": 1,
        "645": 1,
        "646": 1,
        "647": 1,
        "648": 1,
        "649": 1,
        "650": 1,
        "651": 1,
        "652": 1,
        "653": 1,
        "654": 1,
        "655": 1,
        "656": 1,
        "657": 1,
        "658": 1,
        "659": 1,
        "660": 1,
        "661": 1,
        "662": 1,
        "663": 1,
        "664": 1,
        "665": 1,
        "666": 1,
        "667": 1,
        "668": 1,
        "669": 1,
        "670": 1,
        "671": 1,
        "672": 1,
        "673": 1,
        "674": 1,
        "675": 1,
        "676": 1,
        "677": 1,
        "678": 1,
        "679": 1,
        "680": 1,
        "681": 1,
        "682": 1,
        "683": 1,
        "684": 1,
        "685": 1,
        "686": 1,
        "687": 1,
        "688": 1,
        "689": 1,
        "690": 1,
        "691": 1,
        "692": 1,
        "693": 1,
        "694": 1,
        "695": 1,
        "696": 1,
        "697": 1,
        "698": 1,
        "699": 1,
        "700": 1,
        "701": 1,
        "702": 1,
        "703": 1,
        "704": 1,
        "705": 1,
        "706": 1,
        "707": 1,
        "708": 1,
        "709": 1,
        "710": 1,
        "711": 1,
        "712": 1,
        "713": 1,
        "714": 1,
        "715": 1,
        "716": 1,
        "717": 1,
        "718": 1,
        "719": 1,
        "720": 1,
        "721": 1,
        "722": 1,
        "723": 1,
        "724": 1,
        "725": 1,
        "726": 1,
        "727": 1,
        "728": 1,
        "729": 1,
        "730": 1,
        "731": 1,
        "732": 1,
        "733": 1,
        "734": 1,
        "735": 1,
        "736": 1,
        "737": 1,
        "738": 1,
        "739": 1,
        "740": 1,
        "741": 1,
        "742": 1,
        "743": 1,
        "744": 1,
        "745": 1,
        "746": 1,
        "747": 1,
        "748": 1,
        "749": 1,
        "750": 1,
        "801": 1,
        "802": 1,
        "803": 1,
        "804": 1
      },
      cardProgress: 0,
      isNinja: false,
      senseiAttempts: 0,
      cardWins: 0,
      battleOfDoom: false
    }
  }

  static getDefault(id: number, name: string, defaultParams: DefaultPenguinParams = {}): Penguin {
    return new Penguin(id, Penguin.getDefaultData(name, defaultParams));
  }

  static getDefaultIgloo(id: number): Igloo {
    return {
      type: 1,
      music: 0,
      flooring: 0,
      furniture: [],
      locked: true,
      location: 1,
      id
    };
  }

  static getById(id: number): Penguin | undefined {
    const data = db.getById<PenguinData>(Databases.Penguins, id);
    if (data === undefined) {
      return undefined;
    }
    return new Penguin(id, data);
  }

  static add(id: number, penguin: PenguinData) {
    db.update<PenguinData>(Databases.Penguins, id, penguin);
    return new Penguin(id, penguin);
  }

  allowSave() {
    this._noSave = false;
  }

  disableSave() {
    this._noSave = true;
  }

  update(forceSave?: boolean) {
    if (forceSave === true || !this._noSave) {
      db.update<PenguinData>(Databases.Penguins, this.id, this.serialize());
    }
  }
}
