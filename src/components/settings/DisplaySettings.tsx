import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { FontSizeControl } from './FontSizeControl'
import { LineHeightControl } from './LineHeightControl'
import { ColorPicker } from './ColorPicker'
import { VisibleRangeControl } from './VisibleRangeControl'

export function DisplaySettings() {
  const {
    activeFontSize,
    otherFontSize,
    titleFontSize,
    baseLineHeight,
    visibleBefore,
    visibleAfter,
    activeColor,
    otherColor,
    lyricsBgColor,
    setActiveFontSize,
    setOtherFontSize,
    setTitleFontSize,
    setBaseLineHeight,
    setVisibleBefore,
    setVisibleAfter,
    setActiveColor,
    setOtherColor,
    setLyricsBgColor,
    resetAll,
  } = useUISettingsStore()

  return (
    <section
      className="flex flex-col"
      style={{
        border: '1px solid var(--lf-border)',
        borderRadius: 'var(--lf-radius)',
        padding: '16px',
        gap: '12px',
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--lf-text-dim)',
          }}
        >
          顯示設定
        </h2>
        <button
          onClick={resetAll}
          style={{
            padding: '4px 10px',
            fontSize: '10px',
            borderRadius: '4px',
            border: '1px solid var(--lf-border)',
            background: 'var(--lf-bg-input)',
            color: 'var(--lf-text-secondary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          重置
        </button>
      </div>

      <FontSizeControl
        label="歌名字體大小"
        value={titleFontSize}
        min={10}
        max={40}
        step={2}
        onChange={setTitleFontSize}
      />

      <FontSizeControl
        label="當前行字體大小"
        value={activeFontSize}
        min={14}
        max={60}
        step={2}
        onChange={setActiveFontSize}
      />

      <FontSizeControl
        label="其他行字體大小"
        value={otherFontSize}
        min={14}
        max={60}
        step={2}
        onChange={setOtherFontSize}
      />

      <LineHeightControl value={baseLineHeight} onChange={setBaseLineHeight} />

      <ColorPicker label="當前行顏色" value={activeColor} onChange={setActiveColor} />

      <ColorPicker label="其他行顏色" value={otherColor} onChange={setOtherColor} />

      <ColorPicker label="歌詞背景色" value={lyricsBgColor} onChange={setLyricsBgColor} />

      <VisibleRangeControl
        before={visibleBefore}
        after={visibleAfter}
        onBeforeChange={setVisibleBefore}
        onAfterChange={setVisibleAfter}
      />
    </section>
  )
}
