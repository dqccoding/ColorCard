import { useState } from 'react';
import { useI18n } from '../i18nContext';
import PalettePicker from './PalettePicker';
import ExportPanel from './ExportPanel';

const tabs = ['photo', 'title', 'color', 'grain', 'export'];

const FONT_OPTIONS = [
  { value: 'courier', labelKey: 'fontCourier' },
  { value: 'serif', labelKey: 'fontSerif' },
  { value: 'sans', labelKey: 'fontSans' },
];

function MobileControls(props) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('photo');
  const { imageUrl } = props;

  return (
    <div className="flex flex-col bg-[var(--bg-app)] border-t border-[var(--border)]">
      {activeTab !== 'export' && (
        <div className="px-4 py-2 border-b border-[var(--border)]">
          <ExportPanel isMobile={true} {...props} />
        </div>
      )}

      <div className="flex border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs tracking-wider transition-colors cursor-pointer ${
              activeTab === tab ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {tab === 'photo' && (imageUrl ? '📷' : '⊕')}
            {tab === 'title' && 'T'}
            {tab === 'color' && '🎨'}
            {tab === 'grain' && '■'}
            {tab === 'export' && '↑'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'photo' && (
          <div className="space-y-4">
            <label className="block w-full">
              <div className="text-xs tracking-wider text-[var(--text-dim)] mb-2">{t('photo')}</div>
              <button
                onClick={() => document.getElementById('mobile-file-input')?.click()}
                className="w-full py-3 border border-dashed border-[var(--border-strong)] rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                + {t('upload')}
              </button>
              <input
                id="mobile-file-input"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) props.onFileSelect?.(file);
                  e.target.value = '';
                }}
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('flip')}</span>
              <button
                onClick={props.onFlipToggle}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                  props.flipped ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
                    props.flipped ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'title' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('title')}</span>
                <button
                  onClick={props.onRandomTitle}
                  className="text-xs tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                >
                  ↻ {t('randomTitle')}
                </button>
              </div>
              <input
                type="text"
                value={props.title}
                placeholder={t('titlePlaceholder')}
                onChange={(e) => props.onTitleChange(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('date')}</span>
                <button
                  onClick={props.onShowDateToggle}
                  className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                    props.showDate ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
                      props.showDate ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              {props.showDate && (
                <input
                  type="text"
                  value={props.date}
                  placeholder={t('datePlaceholder')}
                  onChange={(e) => props.onDateChange(e.target.value)}
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
                    onClick={() => props.onFontChange(opt.value)}
                    className={`flex-1 py-1.5 text-xs tracking-wider rounded border transition-all cursor-pointer ${
                      props.fontFamily === opt.value
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
                <span className="text-xs text-[var(--text-muted)]">{Math.round(props.split * 100)}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="75"
                value={Math.round(props.split * 100)}
                onChange={(e) => props.onSplitChange(Number(e.target.value) / 100)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('fontSize')}</span>
                <span className="text-xs text-[var(--text-muted)]">{props.fontSize}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="72"
                value={props.fontSize}
                onChange={(e) => props.onFontSizeChange(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <PalettePicker {...props} />
        )}

        {activeTab === 'grain' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wider text-[var(--text-dim)]">{t('grain')}</span>
              <button
                onClick={props.onGrainToggle}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                  props.grainEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--toggle-off)]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-transform ${
                    props.grainEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {props.grainEnabled && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-muted)]">{t('grainIntensity')}</span>
                  <span className="text-xs text-[var(--text-muted)]">{props.grainIntensity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={props.grainIntensity}
                  onChange={(e) => props.onGrainIntensityChange(Number(e.target.value))}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="pt-4">
            <ExportPanel isMobile={true} {...props} />
            <p className="text-[10px] text-[var(--text-subtle)] mt-3 text-center tracking-wider">
              {t('longPressSave')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileControls;
