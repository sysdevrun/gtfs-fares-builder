import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface Props {
  files: Record<string, string>;
}

export function DownloadButton({ files }: Props) {
  const handleDownload = async () => {
    const zip = new JSZip();
    for (const [name, content] of Object.entries(files)) {
      zip.file(name, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'gtfs-fares-v2.zip');
  };

  return (
    <button
      onClick={handleDownload}
      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
    >
      Download GTFS Fares v2 ZIP
    </button>
  );
}
