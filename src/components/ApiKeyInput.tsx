import { useState } from 'react';

interface Props {
  apiKey: string;
  onSave: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onSave }: Props) {
  const [value, setValue] = useState(apiKey);
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
        API Key
      </label>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        placeholder="sk-ant-..."
        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
