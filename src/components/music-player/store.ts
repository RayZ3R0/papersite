const POSITION_KEY_PREFIX = "music-player-position-";

export function saveTrackPosition(trackId: string, position: number) {
  try {
    localStorage.setItem(
      `${POSITION_KEY_PREFIX}${trackId}`,
      position.toString()
    );
  } catch (error) {
    console.error('Failed to save track position:', error);
  }
}

export function getTrackPosition(trackId: string): number {
  try {
    const saved = localStorage.getItem(`${POSITION_KEY_PREFIX}${trackId}`);
    return saved ? parseFloat(saved) : 0;
  } catch (error) {
    console.error('Failed to get track position:', error);
    return 0;
  }
}

export function clearTrackPosition(trackId: string) {
  try {
    localStorage.removeItem(`${POSITION_KEY_PREFIX}${trackId}`);
  } catch (error) {
    console.error('Failed to clear track position:', error);
  }
}