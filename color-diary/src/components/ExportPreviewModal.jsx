import { useEffect, useRef } from 'react';
import { useI18n } from '../i18nContext';

function ExportPreviewModal({ onClose, onDownload, canvasW, canvasH, renderFrame }) {
  const previewCanvasRef = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    renderFrame(ctx);
  }, [renderFrame]);

  const maxWidth = Math.min(canvasW, 600);
  const displayH = Math.round(maxWidth * (canvasH / canvasW));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay-bg)] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center bg-[var(--bg-panel)] border border-[var(--border-strong)] rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm tracking-wider text-[var(--accent)] mb-4 font-courier">PREVIEW</h3>
        <div className="w-full max-w-[600px] rounded-lg overflow-hidden shadow-lg bg-black mb-5">
          <canvas
            ref={previewCanvasRef}
            width={canvasW}
            height={canvasH}
            className="w-full h-auto block"
            style={{ maxWidth: maxWidth, aspectRatio: `${canvasW} / ${canvasH}` }}
          />
        </div>
        <p className="text-[10px] text-[var(--text-subtle)] tracking-wider mb-5">
          {canvasW} x {canvasH} px
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-[var(--border-strong)] rounded-full text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
          <button
            onClick={onDownload}
            className="px-6 py-2 border border-[var(--accent)]/20 rounded-full text-sm tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-[var(--accent-text)] transition-all cursor-pointer"
          >
            {t('exportPng')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportPreviewModal;
