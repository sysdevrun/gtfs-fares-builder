export function ExtractionProgress() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-600 font-medium">Extracting fare information...</p>
      <p className="text-sm text-gray-400">Claude is analyzing your document. This may take 10–30 seconds.</p>
    </div>
  );
}
