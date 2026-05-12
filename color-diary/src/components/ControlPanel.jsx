import { useI18n } from '../i18nContext';
import Toggle from './Toggle';
import PalettePicker from './PalettePicker';
import PresetPanel from './PresetPanel';
import ExportPanel from './ExportPanel';
import { DATE_FORMATS, FONT_OPTIONS } from '../data/constants';
import { useCanvasState } from '../canvasStateContext';

function ControlPanel() {
  const { t } = useI18n();
  const {
    title,
    date,
    split,
    fontSize,
    grainEnabled,
    grainIntensity,
    flipped,
    showDate,
    fontFamily,
    dateFormat,
    onFileSelect,
    onTitleChange,
    onDateChange,
    onSplitChange,
    onFontSizeChange,
    onFontChange,
    onGrainToggle,
    onGrainIntensityChange,
    onFlipToggle,
    onShowDateToggle,
    onRandomTitle,
    onDateFormatChange,
  } = useCanvasState();

  return (
    <div className="w-[340px] flex-shrink-0 flex flex-col h-full bg-[var(--bg-app)] border-l border-[var(--border)]">
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-widest text-[var(--text-dim)]">{t('photo')}</span>
          <label className="text-xs tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer">
            + {t('upload')}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect?.(file);
              e.target.value = '';
            }} />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('flip')}</span>
          <Toggle checked={flipped} onChange={onFlipToggle} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('split')}</span>
            <span className="text-xs text-[var(--text-muted)]">{Math.round(split * 100)}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="75"
            value={Math.round(split * 100)}
            onChange={(e) => onSplitChange(Number(e.target.value) / 100)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('title')}</span>
            <button
              onClick={onRandomTitle}
              className="text-xs tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              ↻ {t('randomTitle')}
            </button>
          </div>
          <input
            type="text"
            value={title}
            placeholder={t('titlePlaceholder')}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('date')}</span>
            <Toggle checked={showDate} onChange={onShowDateToggle} />
          </div>
          {showDate && (
            <div className="space-y-2">
              <input
                type="text"
                value={date}
                placeholder={t('datePlaceholder')}
                onChange={(e) => onDateChange(e.target.value)}
              />
              <div className="flex gap-1">
                {DATE_FORMATS.map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => onDateFormatChange?.(fmt.value)}
                    className={`flex-1 py-1.5 text-[10px] tracking-wider rounded border transition-all cursor-pointer whitespace-nowrap ${
                      dateFormat === fmt.value
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--accent)]'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('fontFamily')}</span>
          </div>
          <div className="flex gap-1">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFontChange(opt.value)}
                className={`flex-1 py-1.5 text-xs tracking-wider rounded border transition-all cursor-pointer ${
                  fontFamily === opt.value
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--accent)]'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('fontSize')}</span>
            <span className="text-xs text-[var(--text-muted)]">{fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="72"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
          />
        </div>

        <PresetPanel />

        <PalettePicker />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('grain')}</span>
            <Toggle checked={grainEnabled} onChange={onGrainToggle} />
          </div>
          {grainEnabled && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--text-muted)]">{t('grainIntensity')}</span>
                <span className="text-xs text-[var(--text-muted)]">{grainIntensity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grainIntensity}
                onChange={(e) => onGrainIntensityChange(Number(e.target.value))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-[var(--border)]">
        <ExportPanel />
      </div>
    </div>
  );
}

export default ControlPanel;
