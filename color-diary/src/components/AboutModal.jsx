import { useI18n } from '../i18nContext';

function AboutModal({ onClose }) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay-bg)] backdrop-blur-sm">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] rounded-2xl p-8 max-w-sm mx-4 text-center">
        <h2 className="text-lg text-[var(--accent)] mb-4 tracking-wider">{t('aboutTitle')}</h2>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed mb-6">{t('aboutText')}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 border border-[var(--border-strong)] rounded-full text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-colors cursor-pointer"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}

export default AboutModal;
