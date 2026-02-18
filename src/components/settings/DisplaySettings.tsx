import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { FontSizeControl } from './FontSizeControl'
import { LineHeightControl } from './LineHeightControl'
import { ColorPicker } from './ColorPicker'
import { VisibleRangeControl } from './VisibleRangeControl'
import { RotateCcw } from 'lucide-react'

const groupLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--lf-text-dim)',
}

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'var(--lf-border)',
  margin: '2px 0',
}

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
      className="flex flex-col border border-lf-border"
      style={{
        borderRadius: 'var(--lf-radius)',
        padding: '16px',
        gap: '10px',
      }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2
          className="text-lf-text-dim"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          顯示設定
        </h2>
        <button
          onClick={resetAll}
          className="border border-lf-border bg-lf-bg-input text-lf-text-secondary"
          style={{
            padding: '4px 10px',
            fontSize: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Group: 字體 */}
      <span style={groupLabelStyle}>字體</span>
      <div className="flex flex-col" style={{ gap: '6px' }}>
        <FontSizeControl
          label="歌名"
          value={titleFontSize}
          min={10}
          max={40}
          step={2}
          onChange={setTitleFontSize}
        />
        <FontSizeControl
          label="當前行"
          value={activeFontSize}
          min={14}
          max={60}
          step={2}
          onChange={setActiveFontSize}
        />
        <FontSizeControl
          label="其他行"
          value={otherFontSize}
          min={14}
          max={60}
          step={2}
          onChange={setOtherFontSize}
        />
        <LineHeightControl value={baseLineHeight} onChange={setBaseLineHeight} />
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Group: 顏色 */}
      <span style={groupLabelStyle}>顏色</span>
      <div className="flex flex-col" style={{ gap: '8px' }}>
        <ColorPicker label="當前行" value={activeColor} onChange={setActiveColor} />
        <ColorPicker label="其他行" value={otherColor} onChange={setOtherColor} />
        <ColorPicker label="背景" value={lyricsBgColor} onChange={setLyricsBgColor} />
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Group: OBS */}
      <span style={groupLabelStyle}>OBS</span>
      <VisibleRangeControl
        before={visibleBefore}
        after={visibleAfter}
        onBeforeChange={setVisibleBefore}
        onAfterChange={setVisibleAfter}
      />
    </section>
  )
}
