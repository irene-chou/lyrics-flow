import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UISettings } from '@/types'
import { DEFAULT_UI_SETTINGS } from '@/lib/constants'

interface UISettingsState extends UISettings {
  setActiveFontSize: (size: number) => void
  setOtherFontSize: (size: number) => void
  setTitleFontSize: (size: number) => void
  setBaseLineHeight: (height: number) => void
  setVisibleBefore: (count: number) => void
  setVisibleAfter: (count: number) => void
  setActiveColor: (color: string) => void
  setOtherColor: (color: string) => void
  setLyricsBgColor: (color: string) => void
  resetAll: () => void
}

export const useUISettingsStore = create<UISettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_UI_SETTINGS,

      setActiveFontSize: (size: number) => set({ activeFontSize: size }),
      setOtherFontSize: (size: number) => set({ otherFontSize: size }),
      setTitleFontSize: (size: number) => set({ titleFontSize: size }),
      setBaseLineHeight: (height: number) => set({ baseLineHeight: height }),
      setVisibleBefore: (count: number) => set({ visibleBefore: count }),
      setVisibleAfter: (count: number) => set({ visibleAfter: count }),
      setActiveColor: (color: string) => set({ activeColor: color }),
      setOtherColor: (color: string) => set({ otherColor: color }),
      setLyricsBgColor: (color: string) => set({ lyricsBgColor: color }),
      resetAll: () => set({ ...DEFAULT_UI_SETTINGS }),
    }),
    {
      name: 'lf-ui-settings',
    },
  ),
)
