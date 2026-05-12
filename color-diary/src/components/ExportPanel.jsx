import { useI18n } from '../i18nContext';
import { useCanvasState } from '../canvasStateContext';

function ExportPanel({ isMobile }) {
  const { t } = useI18n();
  const { onExportPng, hasImage } = useCanvasState();

  return (
    <div className={`flex gap-3 ${isMobile ? 'flex-row justify-center px-4' : 'flex-col'}`}>
      <button
        onClick={onExportPng}
        disabled={!hasImage}
        className="flex-1 px-5 py-2.5 border border-[var(--accent)]/20 rounded-full text-sm tracking-wider text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        {t('exportPng')}
      </button>
    </div>
  );
}

export default ExportPanel;
