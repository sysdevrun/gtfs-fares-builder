import { useReducer, useEffect } from 'react';
import type { FareStructure } from '../types/fareStructure';

export type AppStep = 'upload' | 'extracting' | 'review' | 'preview';

export interface AppState {
  step: AppStep;
  apiKey: string;
  file: File | null;
  fareStructure: FareStructure | null;
  gtfsFiles: Record<string, string> | null;
  error: string | null;
}

type Action =
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'SET_FILE'; file: File }
  | { type: 'START_EXTRACTION' }
  | { type: 'EXTRACTION_SUCCESS'; fareStructure: FareStructure }
  | { type: 'EXTRACTION_ERROR'; error: string }
  | { type: 'UPDATE_FARE_STRUCTURE'; fareStructure: FareStructure }
  | { type: 'SET_GTFS_FILES'; gtfsFiles: Record<string, string> }
  | { type: 'GO_TO_STEP'; step: AppStep }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.apiKey };
    case 'SET_FILE':
      return { ...state, file: action.file, error: null };
    case 'START_EXTRACTION':
      return { ...state, step: 'extracting', error: null };
    case 'EXTRACTION_SUCCESS':
      return { ...state, step: 'review', fareStructure: action.fareStructure, error: null };
    case 'EXTRACTION_ERROR':
      return { ...state, step: 'upload', error: action.error };
    case 'UPDATE_FARE_STRUCTURE':
      return { ...state, fareStructure: action.fareStructure, gtfsFiles: null };
    case 'SET_GTFS_FILES':
      return { ...state, step: 'preview', gtfsFiles: action.gtfsFiles };
    case 'GO_TO_STEP':
      return { ...state, step: action.step };
    case 'RESET':
      return { ...initialState(), apiKey: state.apiKey };
    default:
      return state;
  }
}

function initialState(): AppState {
  return {
    step: 'upload',
    apiKey: localStorage.getItem('anthropic_api_key') ?? '',
    file: null,
    fareStructure: null,
    gtfsFiles: null,
    error: null,
  };
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Persist API key to localStorage
  useEffect(() => {
    if (state.apiKey) {
      localStorage.setItem('anthropic_api_key', state.apiKey);
    }
  }, [state.apiKey]);

  return { state, dispatch };
}
