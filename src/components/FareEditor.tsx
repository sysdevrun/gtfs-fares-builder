import { useState } from 'react';
import type {
  FareStructure,
  Area,
  RiderCategory,
  FareMedia,
  FareMediaType,
  Timeframe,
  FareProduct,
  TransferRule,
} from '../types/fareStructure';

interface Props {
  fareStructure: FareStructure;
  onChange: (updated: FareStructure) => void;
}

type Tab = 'network' | 'areas' | 'riders' | 'media' | 'timeframes' | 'products' | 'transfers';

const TABS: { key: Tab; label: string }[] = [
  { key: 'network', label: 'Network' },
  { key: 'areas', label: 'Areas' },
  { key: 'riders', label: 'Riders' },
  { key: 'media', label: 'Media' },
  { key: 'timeframes', label: 'Timeframes' },
  { key: 'products', label: 'Fare Products' },
  { key: 'transfers', label: 'Transfers' },
];

export function FareEditor({ fareStructure, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  const update = (partial: Partial<FareStructure>) => {
    onChange({ ...fareStructure, ...partial });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.key === 'products' && (
              <span className="ml-1 text-xs text-gray-400">({fareStructure.fareProducts.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === 'network' && (
          <NetworkEditor fareStructure={fareStructure} onChange={update} />
        )}
        {activeTab === 'areas' && (
          <AreasEditor areas={fareStructure.areas} onChange={(areas) => update({ areas })} />
        )}
        {activeTab === 'riders' && (
          <RidersEditor riders={fareStructure.riderCategories} onChange={(riderCategories) => update({ riderCategories })} />
        )}
        {activeTab === 'media' && (
          <MediaEditor media={fareStructure.fareMedia} onChange={(fareMedia) => update({ fareMedia })} />
        )}
        {activeTab === 'timeframes' && (
          <TimeframesEditor timeframes={fareStructure.timeframes} onChange={(timeframes) => update({ timeframes })} />
        )}
        {activeTab === 'products' && (
          <ProductsEditor products={fareStructure.fareProducts} onChange={(fareProducts) => update({ fareProducts })} />
        )}
        {activeTab === 'transfers' && (
          <TransfersEditor rules={fareStructure.transferRules} onChange={(transferRules) => update({ transferRules })} />
        )}
      </div>
    </div>
  );
}

// --- Sub-editors ---

function NetworkEditor({ fareStructure, onChange }: { fareStructure: FareStructure; onChange: (p: Partial<FareStructure>) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 max-w-md">
      <Field label="Network ID" value={fareStructure.network.id} onChange={(id) => onChange({ network: { ...fareStructure.network, id } })} />
      <Field label="Network Name" value={fareStructure.network.name} onChange={(name) => onChange({ network: { ...fareStructure.network, name } })} />
      <Field label="Currency (ISO 4217)" value={fareStructure.currency} onChange={(currency) => onChange({ currency })} />
    </div>
  );
}

function AreasEditor({ areas, onChange }: { areas: Area[]; onChange: (a: Area[]) => void }) {
  const add = () => onChange([...areas, { id: '', name: '' }]);
  const remove = (i: number) => onChange(areas.filter((_, idx) => idx !== i));
  const set = (i: number, field: keyof Area, value: string) => {
    const updated = [...areas];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <TableEditor
      headers={['ID', 'Name', '']}
      rows={areas}
      onAdd={add}
      renderRow={(a, i) => (
        <tr key={i}>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={a.id} onChange={(e) => set(i, 'id', e.target.value)} /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={a.name} onChange={(e) => set(i, 'name', e.target.value)} /></td>
          <td className="p-1"><button className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(i)}>Remove</button></td>
        </tr>
      )}
      emptyMessage="No fare zones defined (flat fare)."
    />
  );
}

function RidersEditor({ riders, onChange }: { riders: RiderCategory[]; onChange: (r: RiderCategory[]) => void }) {
  const add = () => onChange([...riders, { id: '', name: '', isDefault: false }]);
  const remove = (i: number) => onChange(riders.filter((_, idx) => idx !== i));
  const set = (i: number, field: string, value: string | boolean) => {
    const updated = [...riders];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <TableEditor
      headers={['ID', 'Name', 'Default', '']}
      rows={riders}
      onAdd={add}
      renderRow={(r, i) => (
        <tr key={i}>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={r.id} onChange={(e) => set(i, 'id', e.target.value)} /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={r.name} onChange={(e) => set(i, 'name', e.target.value)} /></td>
          <td className="p-1 text-center"><input type="checkbox" checked={r.isDefault} onChange={(e) => set(i, 'isDefault', e.target.checked)} /></td>
          <td className="p-1"><button className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(i)}>Remove</button></td>
        </tr>
      )}
    />
  );
}

function MediaEditor({ media, onChange }: { media: FareMedia[]; onChange: (m: FareMedia[]) => void }) {
  const add = () => onChange([...media, { id: '', name: '', type: 0 }]);
  const remove = (i: number) => onChange(media.filter((_, idx) => idx !== i));
  const set = (i: number, field: string, value: string | number) => {
    const updated = [...media];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <TableEditor
      headers={['ID', 'Name', 'Type', '']}
      rows={media}
      onAdd={add}
      renderRow={(m, i) => (
        <tr key={i}>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={m.id} onChange={(e) => set(i, 'id', e.target.value)} /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={m.name} onChange={(e) => set(i, 'name', e.target.value)} /></td>
          <td className="p-1">
            <select className="px-2 py-1 border rounded text-sm" value={m.type} onChange={(e) => set(i, 'type', Number(e.target.value) as FareMediaType)}>
              <option value={0}>None / Cash</option>
              <option value={1}>Paper ticket</option>
              <option value={2}>Transit card</option>
              <option value={3}>Contactless (cEMV)</option>
              <option value={4}>Mobile app</option>
            </select>
          </td>
          <td className="p-1"><button className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(i)}>Remove</button></td>
        </tr>
      )}
    />
  );
}

function TimeframesEditor({ timeframes, onChange }: { timeframes: Timeframe[]; onChange: (t: Timeframe[]) => void }) {
  const add = () => onChange([...timeframes, { id: '', name: '', startTime: '00:00:00', endTime: '23:59:59' }]);
  const remove = (i: number) => onChange(timeframes.filter((_, idx) => idx !== i));
  const set = (i: number, field: keyof Timeframe, value: string) => {
    const updated = [...timeframes];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <TableEditor
      headers={['ID', 'Name', 'Start', 'End', '']}
      rows={timeframes}
      onAdd={add}
      renderRow={(t, i) => (
        <tr key={i}>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={t.id} onChange={(e) => set(i, 'id', e.target.value)} /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={t.name} onChange={(e) => set(i, 'name', e.target.value)} /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={t.startTime} onChange={(e) => set(i, 'startTime', e.target.value)} placeholder="HH:MM:SS" /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={t.endTime} onChange={(e) => set(i, 'endTime', e.target.value)} placeholder="HH:MM:SS" /></td>
          <td className="p-1"><button className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(i)}>Remove</button></td>
        </tr>
      )}
      emptyMessage="No timeframes (fares don't vary by time)."
    />
  );
}

function ProductsEditor({ products, onChange }: { products: FareProduct[]; onChange: (p: FareProduct[]) => void }) {
  const add = () =>
    onChange([
      ...products,
      { id: '', name: '', amount: 0, riderCategoryId: '', fareMediaId: '' },
    ]);
  const remove = (i: number) => onChange(products.filter((_, idx) => idx !== i));
  const set = (i: number, field: string, value: string | number) => {
    const updated = [...products];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div className="overflow-x-auto">
      <TableEditor
        headers={['ID', 'Name', 'Amount', 'Rider', 'Media', 'From Area', 'To Area', 'Timeframe', '']}
        rows={products}
        onAdd={add}
        renderRow={(p, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[140px]" value={p.id} onChange={(e) => set(i, 'id', e.target.value)} /></td>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[140px]" value={p.name} onChange={(e) => set(i, 'name', e.target.value)} /></td>
            <td className="p-1"><input type="number" step="0.01" className="w-20 px-2 py-1 border rounded text-sm" value={p.amount} onChange={(e) => set(i, 'amount', parseFloat(e.target.value) || 0)} /></td>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[80px]" value={p.riderCategoryId} onChange={(e) => set(i, 'riderCategoryId', e.target.value)} /></td>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[80px]" value={p.fareMediaId} onChange={(e) => set(i, 'fareMediaId', e.target.value)} /></td>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[80px]" value={p.fromAreaId ?? ''} onChange={(e) => set(i, 'fromAreaId', e.target.value)} /></td>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[80px]" value={p.toAreaId ?? ''} onChange={(e) => set(i, 'toAreaId', e.target.value)} /></td>
            <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm min-w-[80px]" value={p.timeframeId ?? ''} onChange={(e) => set(i, 'timeframeId', e.target.value)} /></td>
            <td className="p-1"><button className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(i)}>Remove</button></td>
          </tr>
        )}
      />
    </div>
  );
}

function TransfersEditor({ rules, onChange }: { rules: TransferRule[]; onChange: (r: TransferRule[]) => void }) {
  const add = () => onChange([...rules, { transferCount: 0, fareTransferType: 0 }]);
  const remove = (i: number) => onChange(rules.filter((_, idx) => idx !== i));
  const set = (i: number, field: string, value: string | number) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <TableEditor
      headers={['From Leg Group', 'To Leg Group', 'Transfer Count', 'Type', 'Fare Product', '']}
      rows={rules}
      onAdd={add}
      renderRow={(r, i) => (
        <tr key={i}>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={r.fromLegGroupId ?? ''} onChange={(e) => set(i, 'fromLegGroupId', e.target.value)} /></td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={r.toLegGroupId ?? ''} onChange={(e) => set(i, 'toLegGroupId', e.target.value)} /></td>
          <td className="p-1"><input type="number" className="w-20 px-2 py-1 border rounded text-sm" value={r.transferCount} onChange={(e) => set(i, 'transferCount', parseInt(e.target.value) || 0)} /></td>
          <td className="p-1">
            <select className="px-2 py-1 border rounded text-sm" value={r.fareTransferType} onChange={(e) => set(i, 'fareTransferType', Number(e.target.value))}>
              <option value={0}>Sum of legs</option>
              <option value={1}>Sum capped</option>
              <option value={2}>Free transfer</option>
            </select>
          </td>
          <td className="p-1"><input className="w-full px-2 py-1 border rounded text-sm" value={r.fareProductId ?? ''} onChange={(e) => set(i, 'fareProductId', e.target.value)} /></td>
          <td className="p-1"><button className="text-red-500 hover:text-red-700 text-sm" onClick={() => remove(i)}>Remove</button></td>
        </tr>
      )}
      emptyMessage="No transfer rules defined."
    />
  );
}

// --- Shared components ---

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TableEditor<T>({
  headers,
  rows,
  onAdd,
  renderRow,
  emptyMessage,
}: {
  headers: string[];
  rows: T[];
  onAdd: () => void;
  renderRow: (row: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}) {
  return (
    <div>
      {rows.length === 0 && emptyMessage ? (
        <p className="text-sm text-gray-400 italic mb-3">{emptyMessage}</p>
      ) : (
        <table className="w-full text-left text-sm mb-3">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} className="p-1 text-xs font-semibold text-gray-500 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows.map((row, i) => renderRow(row, i))}</tbody>
        </table>
      )}
      <button
        onClick={onAdd}
        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
      >
        + Add row
      </button>
    </div>
  );
}
