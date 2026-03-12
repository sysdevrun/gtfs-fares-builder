import type { FareStructure } from '../types/fareStructure';

export function generateGTFS(fare: FareStructure): Record<string, string> {
  const files: Record<string, string> = {};

  // networks.txt
  files['networks.txt'] = toCsv(
    ['network_id', 'network_name'],
    [{ network_id: fare.network.id, network_name: fare.network.name }],
  );

  // areas.txt
  if (fare.areas.length > 0) {
    files['areas.txt'] = toCsv(
      ['area_id', 'area_name'],
      fare.areas.map((a) => ({ area_id: a.id, area_name: a.name })),
    );
  }

  // rider_categories.txt
  files['rider_categories.txt'] = toCsv(
    ['rider_category_id', 'rider_category_name', 'is_default_fare_category'],
    fare.riderCategories.map((r) => ({
      rider_category_id: r.id,
      rider_category_name: r.name,
      is_default_fare_category: r.isDefault ? '1' : '0',
    })),
  );

  // fare_media.txt
  files['fare_media.txt'] = toCsv(
    ['fare_media_id', 'fare_media_name', 'fare_media_type'],
    fare.fareMedia.map((m) => ({
      fare_media_id: m.id,
      fare_media_name: m.name,
      fare_media_type: String(m.type),
    })),
  );

  // timeframes.txt
  if (fare.timeframes.length > 0) {
    files['timeframes.txt'] = toCsv(
      ['timeframe_group_id', 'start_time', 'end_time', 'service_id'],
      fare.timeframes.map((t) => ({
        timeframe_group_id: t.id,
        start_time: t.startTime,
        end_time: t.endTime,
        service_id: 'all_days', // placeholder — user should map to their calendar
      })),
    );
  }

  // fare_products.txt
  files['fare_products.txt'] = toCsv(
    ['fare_product_id', 'fare_product_name', 'rider_category_id', 'fare_media_id', 'amount', 'currency'],
    fare.fareProducts.map((p) => ({
      fare_product_id: p.id,
      fare_product_name: p.name,
      rider_category_id: p.riderCategoryId,
      fare_media_id: p.fareMediaId,
      amount: String(p.amount),
      currency: fare.currency,
    })),
  );

  // fare_leg_rules.txt
  files['fare_leg_rules.txt'] = toCsv(
    ['leg_group_id', 'network_id', 'from_area_id', 'to_area_id', 'from_timeframe_group_id', 'to_timeframe_group_id', 'fare_product_id'],
    fare.fareProducts.map((p, i) => ({
      leg_group_id: `leg_${i}`,
      network_id: fare.network.id,
      from_area_id: p.fromAreaId ?? '',
      to_area_id: p.toAreaId ?? '',
      from_timeframe_group_id: p.timeframeId ?? '',
      to_timeframe_group_id: p.timeframeId ?? '',
      fare_product_id: p.id,
    })),
  );

  // fare_transfer_rules.txt
  if (fare.transferRules.length > 0) {
    files['fare_transfer_rules.txt'] = toCsv(
      ['from_leg_group_id', 'to_leg_group_id', 'transfer_count', 'fare_transfer_type', 'fare_product_id'],
      fare.transferRules.map((r) => ({
        from_leg_group_id: r.fromLegGroupId ?? '',
        to_leg_group_id: r.toLegGroupId ?? '',
        transfer_count: String(r.transferCount),
        fare_transfer_type: String(r.fareTransferType),
        fare_product_id: r.fareProductId ?? '',
      })),
    );
  }

  return files;
}

function toCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h] ?? '')).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
