import { useState } from 'react';

interface Props {
  files: Record<string, string>;
}

export function GtfsPreview({ files }: Props) {
  const fileNames = Object.keys(files).sort();
  const [expanded, setExpanded] = useState<string | null>(fileNames[0] ?? null);

  return (
    <div className="space-y-2">
      {fileNames.map((name) => (
        <div key={name} className="border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === name ? null : name)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="text-sm font-medium text-gray-700">{name}</span>
            <span className="text-xs text-gray-400">
              {files[name].split('\n').filter(Boolean).length} rows
            </span>
          </button>
          {expanded === name && (
            <pre className="px-4 py-3 text-xs font-mono text-gray-600 bg-white overflow-x-auto max-h-64">
              {files[name]}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
