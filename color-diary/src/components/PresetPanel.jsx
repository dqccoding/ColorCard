import { useState, useCallback } from 'react';
import { useI18n } from '../i18nContext';
import { useCanvasState } from '../canvasStateContext';
import { loadPresets, savePreset, deletePreset } from '../utils/presets';

export default function PresetPanel() {
  const { t } = useI18n();
  const {
    split, fontSize, grainEnabled, grainIntensity,
    flipped, showDate, fontFamily, dateFormat,
    gradientEnabled, textColor, bgColor, bgColor2,
    onApplyPreset,
  } = useCanvasState();

  const [presets, setPresets] = useState(() => loadPresets());
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  const config = {
    split, fontSize, grainEnabled, grainIntensity,
    flipped, showDate, fontFamily, dateFormat,
    gradientEnabled, textColor, bgColor, bgColor2,
  };

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = savePreset(trimmed, config);
    setPresets(next);
    setName('');
    setSaving(false);
  }, [name, config]);

  const handleDelete = useCallback((id) => {
    const next = deletePreset(id);
    setPresets(next);
  }, []);

  const handleApply = useCallback((preset) => {
    onApplyPreset?.(preset.config);
  }, [onApplyPreset]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('preset')}</span>
        {!saving && (
          <button
            onClick={() => setSaving(true)}
            className="text-xs tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            + {t('savePreset')}
          </button>
        )}
      </div>

      {saving && (
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            placeholder={t('presetNamePlaceholder')}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setSaving(false); }}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="flex-shrink-0 px-3 py-1.5 text-xs tracking-wider rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-all cursor-pointer"
          >
            {t('confirm')}
          </button>
          <button
            onClick={() => setSaving(false)}
            className="flex-shrink-0 px-3 py-1.5 text-xs tracking-wider rounded border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>
        </div>
      )}

      {presets.length > 0 && (
        <div className="space-y-1.5">
          {presets.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 group"
            >
              <button
                onClick={() => handleApply(p)}
                className="flex-1 text-left px-3 py-1.5 text-xs tracking-wider rounded border border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer truncate"
              >
                {p.name}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="flex-shrink-0 text-[var(--text-subtle)] hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 text-sm"
                title={t('delete')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {presets.length === 0 && !saving && (
        <p className="text-[10px] text-[var(--text-subtle)] tracking-wider">{t('noPresets')}</p>
      )}
    </div>
  );
}
