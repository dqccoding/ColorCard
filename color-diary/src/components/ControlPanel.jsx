import { useI18n } from '../i18nContext';
import PalettePicker from './PalettePicker';
import ExportPanel from './ExportPanel';

const FONT_OPTIONS = [
  { value: 'courier', labelKey: 'fontCourier' },
  { value: 'serif', labelKey: 'fontSerif' },
  { value: 'sans', labelKey: 'fontSans' },
];

function ControlPanel(props) {
  const { t } = useI18n();
  const {
    imageUrl,
    title,
    date,
    split,
    fontSize,
    grainEnabled,
    grainIntensity,
    flipped,
    showDate,
    fontFamily,
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
  } = props;

  return (
    <div className="w-72 flex-shrink-0 flex flex-col h-full bg-[var(--bg-app)] border-l border-[var(--border)]">
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-widest text-[var(--text-dim)]">{t('photo')}</span>
          <label className="text-xs tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer">
            + {t('upload')}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) props.onFileSelect?.(file);
              e.target.value = '';
            }} />
          </label>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('flip')}</span>
          <button
            onClick={onFlipToggle}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
              flipped ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
                flipped ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
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
            <button
              onClick={onShowDateToggle}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                showDate ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
                  showDate ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          {showDate && (
            <input
              type="text"
              value={date}
              placeholder={t('datePlaceholder')}
              onChange={(e) => onDateChange(e.target.value)}
            />
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

        <PalettePicker {...props} />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('grain')}</span>
            <button
              onClick={onGrainToggle}
              className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                grainEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
                  grainEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
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
        <ExportPanel {...props} />
      </div>
    </div>
  );
}

export default ControlPanel;
