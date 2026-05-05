import { useRef, useCallback, useState } from 'react';
import { useI18n } from '../i18nContext';

function CanvasView({
  imageUrl,
  canvasW,
  canvasH,
  onFileSelect,
  canvasRef,
  previewRef,
  imageOffsetX,
  imageOffsetY,
  onImageOffsetChange,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragInfo = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

  const { t } = useI18n();

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = '';
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!imageUrl) return;
      e.preventDefault();
      dragInfo.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: imageOffsetX || 0,
        offsetY: imageOffsetY || 0,
      };
    },
    [imageUrl, imageOffsetX, imageOffsetY]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragInfo.current.active) return;
      const dx = e.clientX - dragInfo.current.startX;
      const dy = e.clientY - dragInfo.current.startY;
      onImageOffsetChange?.(dragInfo.current.offsetX + dx, dragInfo.current.offsetY + dy);
    },
    [onImageOffsetChange]
  );

  const handleMouseUp = useCallback(() => {
    dragInfo.current.active = false;
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (!imageUrl || e.touches.length !== 1) return;
      const touch = e.touches[0];
      dragInfo.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        offsetX: imageOffsetX || 0,
        offsetY: imageOffsetY || 0,
      };
    },
    [imageUrl, imageOffsetX, imageOffsetY]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!dragInfo.current.active) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragInfo.current.startX;
      const dy = touch.clientY - dragInfo.current.startY;
      onImageOffsetChange?.(dragInfo.current.offsetX + dx, dragInfo.current.offsetY + dy);
    },
    [onImageOffsetChange]
  );

  const handleTouchEnd = useCallback(() => {
    dragInfo.current.active = false;
  }, []);

  const handleDoubleClick = useCallback(() => {
    onImageOffsetChange?.(0, 0);
  }, [onImageOffsetChange]);

  return (
    <div
      ref={previewRef}
      className="relative w-full flex items-center justify-center bg-[var(--bg-canvas)]"
      style={{
        aspectRatio: imageUrl && canvasW ? `${canvasW}/${canvasH}` : 'auto',
        maxHeight: imageUrl ? 'calc(100vh - 100px)' : 'auto',
      }}
      onDragOver={imageUrl ? handleDragOver : undefined}
      onDragLeave={imageUrl ? handleDragLeave : undefined}
      onDrop={imageUrl ? handleDrop : undefined}
    >
      {isDragOver && imageUrl && (
        <div className="absolute inset-0 z-10 bg-[var(--bg-panel)]/80 flex items-center justify-center pointer-events-none">
          <p className="text-lg tracking-[0.3em] text-[var(--accent)] font-courier">{t('dropFile')}</p>
        </div>
      )}

      {imageUrl ? (
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          className="max-w-full max-h-full object-contain cursor-move select-none"
          style={{ imageRendering: 'auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        />
      ) : (
        <div
          className={`w-full h-full min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragOver ? 'bg-[var(--bg-panel)]' : 'bg-[var(--bg-canvas)]'
          }`}
          onClick={triggerFileSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center select-none pointer-events-none">
            <svg
              className="mx-auto mb-4 opacity-40"
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
            >
              <rect
                x="4"
                y="8"
                width="40"
                height="32"
                rx="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 36l10-10 8 8 6-6 10 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isDragOver ? (
              <p className="text-lg tracking-[0.3em] text-[var(--accent)] font-courier">{t('dropFile')}</p>
            ) : (
              <>
                <p className="text-sm tracking-[0.3em] text-[var(--text-muted)] font-courier">{t('clickToUpload')}</p>
                <p className="text-xs tracking-wider text-[var(--text-subtle)] mt-2 font-courier">{t('dragAndDrop')}</p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default CanvasView;
