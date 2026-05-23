import { useI18n } from '../i18nContext';
import { useTheme } from '../themeContext';

const themeIcons = { dark: '☀', light: '◐', system: '☾' };
const themeNext = { dark: 'light', light: 'system', system: 'dark' };

function Header({ onAboutClick, onUndo, onRedo, canUndo, canRedo }) {
  const { t, toggleLang, lang } = useI18n();
  const { mode, cycle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 bg-[var(--bg-app)] border-b border-[var(--border)]">
      <div className="flex items-center gap-2 select-none">
        <svg width="20" height="20" viewBox="0 0 20 20" className="text-[var(--accent)]">
          <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="7" cy="8" r="2" fill="currentColor" />
          <circle cx="13" cy="8" r="2" fill="currentColor" />
          <circle cx="10" cy="13" r="1.5" fill="currentColor" />
        </svg>
        <span className="text-sm tracking-widest text-[var(--accent)] font-courier">COLOR DIARY</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="text-xs tracking-wider text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="text-xs tracking-wider text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default"
          title="Redo (Ctrl+Shift+Z)"
        >
          ↪
        </button>
        <button
          onClick={toggleLang}
          className="text-xs tracking-wider text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          {lang === 'en' ? 'CN' : 'EN'}
        </button>
        <button
          onClick={cycle}
          className="text-xs tracking-wider text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          title={mode}
        >
          {themeIcons[mode]}
        </button>
        <button
          onClick={onAboutClick}
          className="text-xs tracking-wider text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors cursor-pointer"
        >
          {t('about').toUpperCase()}
        </button>
      </div>
    </header>
  );
}

export default Header;
