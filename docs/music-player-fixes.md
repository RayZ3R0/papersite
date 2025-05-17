# Music Player Navigation Fixes

## Current Issues

1. **Random vs Sequential Playback**

   - Currently using `getRandomTrack` for next track selection
   - User wants sequential playback
   - `getNextTrack` function exists but isn't being used

2. **Track Skipping Visual Issue**
   - Track history management causing rapid visual updates
   - State updates not properly batched
   - Track changes appear jumpy

## Proposed Solution

```mermaid
sequenceDiagram
    participant U as User
    participant P as Player Controls
    participant S as State Management
    participant T as Track List

    Note over U,T: Current Flow (Problems)
    U->>P: Clicks Next
    P->>S: Triggers nextTrack()
    S->>T: Calls getRandomTrack()
    T-->>S: Returns random track
    S->>P: Updates state (causes visual jump)

    Note over U,T: Proposed Flow (Fixed)
    U->>P: Clicks Next
    P->>S: Triggers nextTrack()
    S->>T: Calls getNextTrack()
    T-->>S: Returns next sequential track
    S->>P: Updates state (single update)
```

## Implementation Plan

1. **Update MusicPlayerProvider.tsx**

   - Replace `getRandomTrack` with `getNextTrack` in the `nextTrack` function

   ```typescript
   const nextTrack = () => {
     if (state.currentTrack) {
       const nextTrack = getNextTrack(state.currentTrack);
       playTrack(nextTrack);
     }
   };
   ```

2. **Optimize Track Management**

   - Use existing `getNextTrack` function from trackList.ts
   - Refactor track history management to prevent unnecessary state updates
   - Consider removing track history for simpler state management

3. **Potential Future Improvements**
   - Add playback mode toggle (random/sequential)
   - Add transition animations for smoother track changes
   - Implement loading state during track transitions

## Benefits

- Predictable sequential playback
- Smoother visual transitions
- Better user experience with clear track progression
