import { useI18n } from '../i18nContext';
import { getContrastColor } from '../utils';

function PalettePicker({ palette, bgColor, bgColor2, textColor, gradientEnabled, onBgColor, onBgColor2, onTextColor, onGradientToggle, onRandom }) {
  const { t } = useI18n();
  const colors = palette && palette.length >= 5 ? palette : null;
  const autoTextColor = bgColor ? getContrastColor(bgColor) : '#ffffff';
  const isAuto = textColor === 'auto';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('bgColor')}</span>
        <button
          onClick={onRandom}
          className="text-xs tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          ↻ {t('random')}
        </button>
      </div>

      {colors && (
        <div className="flex gap-2 flex-wrap">
          {colors.map((color, i) => (
            <button
              key={i}
              onClick={() => onBgColor(color)}
              className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: color,
                borderColor: bgColor === color ? '#fff' : 'transparent',
                boxShadow: bgColor === color ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={bgColor || '#000000'}
          onChange={(e) => onBgColor(e.target.value)}
          className="w-8 h-8"
        />
        <span className="text-xs text-[var(--text-muted)] uppercase">{bgColor}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('gradient')}</span>
        <button
          onClick={onGradientToggle}
          className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
            gradientEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
              gradientEnabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {gradientEnabled && (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={bgColor2 || '#000000'}
            onChange={(e) => onBgColor2(e.target.value)}
            className="w-8 h-8"
          />
          <span className="text-xs text-[var(--text-muted)] uppercase">{bgColor2}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('textColor')}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTextColor(isAuto ? autoTextColor : 'auto')}
            className={`text-xs tracking-wider cursor-pointer transition-colors ${
              isAuto ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--accent)]'
            }`}
          >
            {t('auto')}
          </button>
          {isAuto ? (
            <div
              className="w-5 h-5 rounded-full border border-[var(--swatch-border)] cursor-pointer"
              style={{ background: autoTextColor }}
              onClick={() => onTextColor(autoTextColor)}
            />
          ) : (
            <input
              type="color"
              value={textColor || '#ffffff'}
              onChange={(e) => onTextColor(e.target.value)}
              className="w-5 h-5"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PalettePicker;
