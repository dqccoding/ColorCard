import { useState, useRef, useCallback } from 'react';
import { useI18n } from '../i18nContext';
import Toggle from './Toggle';
import PalettePicker from './PalettePicker';
import PresetPanel from './PresetPanel';
import ExportPanel from './ExportPanel';
import { DATE_FORMATS, FONT_OPTIONS } from '../data/constants';
import { useCanvasState } from '../canvasStateContext';

const tabs = ['photo', 'title', 'color', 'grain', 'export'];

const TabIcon = ({ tab }) => {
  const icons = {
    photo:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    title:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
    color:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    grain:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="1"/><circle cx="18" cy="6" r="1"/><circle cx="6" cy="18" r="1"/><circle cx="18" cy="18" r="1"/><circle cx="12" cy="12" r="1"/></svg>,
    export:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[tab] || null;
};

const SHEET_H = '40vh';

function MobileControls({ onSheetChange }) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState(null);
  const touchRef = useRef({ x: 0, y: 0 });

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

  const toggleTab = useCallback((tab) => {
    setActiveTab((prev) => {
      const next = prev === tab ? null : tab;
      onSheetChange?.(!!next);
      return next;
    });
  }, [onSheetChange]);

  const closeSheet = useCallback(() => {
    setActiveTab(null);
    onSheetChange?.(false);
  }, [onSheetChange]);

  const handleSheetTouchStart = useCallback((e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleSheetTouchEnd = useCallback((e) => {
    const { x: sx, y: sy } = touchRef.current;
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      const idx = tabs.indexOf(activeTab);
      if (dx < 0 && idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
      if (dx > 0 && idx > 0) setActiveTab(tabs[idx - 1]);
    } else if (dy > 50) {
      setActiveTab(null);
      onSheetChange?.(false);
    }
  }, [activeTab, onSheetChange]);

  const TAB_BAR_H = '52px';

  return (
    <>
      <div
        className={`absolute inset-0 z-20 bg-black/30 transition-opacity duration-200 ${activeTab ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ bottom: TAB_BAR_H }}
        onClick={closeSheet}
      />

      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col">
        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${activeTab ? 'max-h-[40vh]' : 'max-h-0'}`}
          onTouchStart={handleSheetTouchStart}
          onTouchEnd={handleSheetTouchEnd}
        >
          <div
            className="bg-[var(--bg-panel)]/98 backdrop-blur-xl border-t border-[var(--border)] rounded-t-2xl flex flex-col"
            style={{ height: SHEET_H }}
          >
            <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
              <div className="w-8 h-1 rounded-full bg-[var(--border-strong)]" />
            </div>

            <div
              className="flex-1 overflow-y-auto px-4 pb-3"
              style={{ overscrollBehavior: 'contain' }}
            >
              {activeTab === 'photo' && (
                <div className="space-y-3">
                  <label className="block w-full">
                    <button
                      onClick={() => document.getElementById('mobile-file-input')?.click()}
                      className="w-full py-3 border border-dashed border-[var(--border-strong)] rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer active:scale-[0.98]"
                    >
                      + {t('upload')}
                    </button>
                    <input
                      id="mobile-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileSelect?.(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('flip')}</span>
                    <Toggle checked={flipped} onChange={onFlipToggle} size="md" />
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
                </div>
              )}

              {activeTab === 'title' && (
                <div className="space-y-3">
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
                      <Toggle checked={showDate} onChange={onShowDateToggle} size="md" />
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
                              className={`flex-1 py-2 text-[10px] tracking-wider rounded border transition-all cursor-pointer whitespace-nowrap ${
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
                    <div className="flex gap-1.5">
                      {FONT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onFontChange(opt.value)}
                          className={`flex-1 py-2 text-xs tracking-wider rounded border transition-all cursor-pointer ${
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
                </div>
              )}

              {activeTab === 'color' && (
                <PalettePicker />
              )}

              {activeTab === 'grain' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('grain')}</span>
                    <Toggle checked={grainEnabled} onChange={onGrainToggle} size="md" />
                  </div>
                  {grainEnabled && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
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
              )}

              {activeTab === 'export' && (
                <div className="flex flex-col items-center pt-2 space-y-4">
                  <PresetPanel />
                  <ExportPanel isMobile={true} />
                  <p className="text-[10px] text-[var(--text-subtle)] tracking-wider text-center">
                    {t('longPressSave')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="flex bg-[var(--bg-app)] border-t border-[var(--border)]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => toggleTab(tab)}
              className={`flex-1 py-3 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer active:scale-[0.97] ${
                activeTab === tab
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              <TabIcon tab={tab} />
              <span className="text-[9px] tracking-wider leading-none">{t(tab)}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default MobileControls;
