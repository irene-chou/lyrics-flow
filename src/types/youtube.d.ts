/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerOptions {
    height?: string | number
    width?: string | number
    videoId?: string
    playerVars?: Record<string, any>
    events?: {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onError?: (event: OnErrorEvent) => void
    }
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent {
    data: PlayerState
    target: Player
  }

  interface OnErrorEvent {
    data: number
    target: Player
  }

  class Player {
    constructor(element: string | HTMLElement, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): PlayerState
    setVolume(volume: number): void
    getVolume(): number
    mute(): void
    unMute(): void
    isMuted(): boolean
    destroy(): void
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: (() => void) | undefined
}
