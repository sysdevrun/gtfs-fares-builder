import { useCallback, useState } from 'react';

interface Props {
  onFileSelected: (file: File) => void;
  currentFile: File | null;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_SIZE = 32 * 1024 * 1024; // 32MB

export function FileUpload({ onFileSelected, currentFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Please upload a PDF or image file (JPEG, PNG, GIF, WebP).');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('File must be under 32MB.');
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect],
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = ACCEPTED_TYPES.join(',');
          input.onchange = () => {
            const file = input.files?.[0];
            if (file) validateAndSelect(file);
          };
          input.click();
        }}
      >
        <div className="text-gray-500">
          <p className="text-lg font-medium">Drop a fare document here</p>
          <p className="text-sm mt-1">or click to browse (PDF, JPEG, PNG, GIF, WebP — max 32MB)</p>
        </div>
      </div>

      {currentFile && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-2">
          <span className="font-medium">{currentFile.name}</span>
          <span className="text-gray-400">
            ({(currentFile.size / 1024).toFixed(0)} KB)
          </span>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
