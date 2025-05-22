// Key for storing latest papers state in sessionStorage
const LATEST_PAPERS_STATE_KEY = 'papersite-latest-papers-state';

interface LatestPapersState {
  fromLatestPapers: boolean;
  timestamp: number;
}

// Function to set state when clicking "Latest Papers"
export function setLatestPapersState() {
  if (typeof window === 'undefined') return;
  
  const state: LatestPapersState = {
    fromLatestPapers: true,
    timestamp: Date.now()
  };
  
  sessionStorage.setItem(LATEST_PAPERS_STATE_KEY, JSON.stringify(state));
}

// Function to get and clear state (one-time use)
export function consumeLatestPapersState(): boolean {
  if (typeof window === 'undefined') return false;
  
  const stateStr = sessionStorage.getItem(LATEST_PAPERS_STATE_KEY);
  if (!stateStr) return false;
  
  try {
    const state: LatestPapersState = JSON.parse(stateStr);
    
    // Clear the state immediately
    sessionStorage.removeItem(LATEST_PAPERS_STATE_KEY);
    
    // Only return true if state is less than 5 seconds old
    // This prevents the state from being used if user manually navigates later
    return state.fromLatestPapers && (Date.now() - state.timestamp < 5000);
  } catch {
    return false;
  }
}