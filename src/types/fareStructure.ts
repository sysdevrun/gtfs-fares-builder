export interface FareStructure {
  network: {
    id: string;
    name: string;
  };
  currency: string;
  areas: Area[];
  riderCategories: RiderCategory[];
  fareMedia: FareMedia[];
  timeframes: Timeframe[];
  fareProducts: FareProduct[];
  transferRules: TransferRule[];
}

export interface Area {
  id: string;
  name: string;
}

export interface RiderCategory {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface FareMedia {
  id: string;
  name: string;
  type: FareMediaType;
}

export type FareMediaType = 0 | 1 | 2 | 3 | 4;
// 0 = none, 1 = paper ticket, 2 = transit card, 3 = contactless (cEMV), 4 = mobile app

export interface Timeframe {
  id: string;
  name: string;
  startTime: string; // HH:MM:SS
  endTime: string;   // HH:MM:SS
}

export interface FareProduct {
  id: string;
  name: string;
  amount: number;
  riderCategoryId: string;
  fareMediaId: string;
  fromAreaId?: string;
  toAreaId?: string;
  timeframeId?: string;
}

export interface TransferRule {
  fromLegGroupId?: string;
  toLegGroupId?: string;
  transferCount: number; // -1 = unlimited
  fareTransferType: 0 | 1 | 2;
  // 0 = first leg + sum of remaining, 1 = first leg + capped sum, 2 = free transfer
  fareProductId?: string;
}

export function createEmptyFareStructure(): FareStructure {
  return {
    network: { id: '', name: '' },
    currency: 'USD',
    areas: [],
    riderCategories: [{ id: 'adult', name: 'Adult', isDefault: true }],
    fareMedia: [{ id: 'cash', name: 'Cash', type: 0 }],
    timeframes: [],
    fareProducts: [],
    transferRules: [],
  };
}
