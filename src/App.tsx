import { useAppState } from './hooks/useAppState';
import { ApiKeyInput } from './components/ApiKeyInput';
import { FileUpload } from './components/FileUpload';
import { ExtractionProgress } from './components/ExtractionProgress';
import { FareEditor } from './components/FareEditor';
import { GtfsPreview } from './components/GtfsPreview';
import { DownloadButton } from './components/DownloadButton';
import { extractFares } from './services/claudeExtractor';
import { generateGTFS } from './services/gtfsGenerator';

function App() {
  const { state, dispatch } = useAppState();

  const handleExtract = async () => {
    if (!state.apiKey || !state.file) return;
    dispatch({ type: 'START_EXTRACTION' });
    try {
      const fareStructure = await extractFares(state.apiKey, state.file);
      dispatch({ type: 'EXTRACTION_SUCCESS', fareStructure });
    } catch (err) {
      dispatch({
        type: 'EXTRACTION_ERROR',
        error: err instanceof Error ? err.message : 'Extraction failed',
      });
    }
  };

  const handleGenerate = () => {
    if (!state.fareStructure) return;
    const gtfsFiles = generateGTFS(state.fareStructure);
    dispatch({ type: 'SET_GTFS_FILES', gtfsFiles });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">GTFS Fares Builder</h1>
          <div className="w-96">
            <ApiKeyInput
              apiKey={state.apiKey}
              onSave={(apiKey) => dispatch({ type: 'SET_API_KEY', apiKey })}
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {['Upload', 'Extract', 'Review', 'Download'].map((label, i) => {
            const stepMap = ['upload', 'extracting', 'review', 'preview'] as const;
            const currentIdx = stepMap.indexOf(state.step);
            const isActive = i === currentIdx;
            const isDone = i < currentIdx;
            return (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <div className={`w-8 h-px ${isDone ? 'bg-blue-400' : 'bg-gray-300'}`} />}
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : isDone
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <strong>Error:</strong> {state.error}
          </div>
        )}

        {/* Upload step */}
        {state.step === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Upload Fare Document
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload a PDF or image of a bus/transit fare table. Claude will extract all fare
                combinations and convert them to GTFS Fares v2 format.
              </p>
              <FileUpload
                currentFile={state.file}
                onFileSelected={(file) => dispatch({ type: 'SET_FILE', file })}
              />
            </div>
            <button
              onClick={handleExtract}
              disabled={!state.apiKey || !state.file}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Extract Fares
            </button>
            {!state.apiKey && (
              <p className="text-sm text-amber-600">Enter your Anthropic API key above to continue.</p>
            )}
          </div>
        )}

        {/* Extracting step */}
        {state.step === 'extracting' && <ExtractionProgress />}

        {/* Review step */}
        {state.step === 'review' && state.fareStructure && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Review Extracted Fares
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'upload' })}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                  >
                    Re-upload
                  </button>
                  <button
                    onClick={handleExtract}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md"
                  >
                    Re-extract
                  </button>
                </div>
              </div>
              <FareEditor
                fareStructure={state.fareStructure}
                onChange={(fareStructure) =>
                  dispatch({ type: 'UPDATE_FARE_STRUCTURE', fareStructure })
                }
              />
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Generate GTFS Files
            </button>
          </div>
        )}

        {/* Preview step */}
        {state.step === 'preview' && state.gtfsFiles && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Generated GTFS Fares v2 Files
                </h2>
                <button
                  onClick={() => dispatch({ type: 'GO_TO_STEP', step: 'review' })}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
                >
                  Back to Editor
                </button>
              </div>
              <GtfsPreview files={state.gtfsFiles} />
            </div>
            <div className="flex gap-4">
              <DownloadButton files={state.gtfsFiles} />
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
