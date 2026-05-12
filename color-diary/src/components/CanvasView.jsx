import { useRef, useCallback, useState } from 'react';
import { useI18n } from '../i18nContext';

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_SENSITIVITY = 0.001;

function CanvasView({
  imageUrl,
  canvasW,
  canvasH,
  onFileSelect,
  canvasRef,
  imageOffsetX,
  imageOffsetY,
  imageScale,
  onImageOffsetChange,
  onImageScaleChange,
  onResetImagePosition,
  availableHeight,
  offsetBounds,
  split,
  flipped,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  const dragInfo = useRef({ active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const lastTouchDistance = useRef(0);
  const lastPinchScale = useRef(1);
  const snapAnimRef = useRef(null);
  const offsetBoundsRef = useRef(null);
  offsetBoundsRef.current = offsetBounds;
  const offsetChangeRef = useRef(null);
  offsetChangeRef.current = onImageOffsetChange;
  const offsetRef = useRef({ x: 0, y: 0 });
  offsetRef.current = { x: imageOffsetX, y: imageOffsetY };

  const { t } = useI18n();

  const cancelSnap = useCallback(() => {
    if (snapAnimRef.current) {
      cancelAnimationFrame(snapAnimRef.current);
      snapAnimRef.current = null;
    }
  }, []);

  const snapToValid = useCallback(() => {
    if (!imageUrl || !offsetBoundsRef.current) return;
    const bounds = offsetBoundsRef.current;
    const curX = offsetRef.current.x;
    const curY = offsetRef.current.y;

    const targetX = Math.min(bounds.maxX, Math.max(bounds.minX, curX));
    const targetY = Math.min(bounds.maxY, Math.max(bounds.minY, curY));

    if (targetX === curX && targetY === curY) return;

    const duration = 280;
    const startX = curX;
    const startY = curY;
    const startTime = performance.now();
    const changeFn = offsetChangeRef.current;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      changeFn?.(startX + (targetX - startX) * ease, startY + (targetY - startY) * ease);
      if (t < 1) {
        snapAnimRef.current = requestAnimationFrame(animate);
      } else {
        snapAnimRef.current = null;
      }
    };
    snapAnimRef.current = requestAnimationFrame(animate);
  }, [imageUrl]);

  const GAP_TOLERANCE = 2;
  const hasBounds = !!(offsetBounds && imageUrl);
  const gapLeft = hasBounds && imageOffsetX > offsetBounds.maxX + GAP_TOLERANCE;
  const gapRight = hasBounds && imageOffsetX < offsetBounds.minX - GAP_TOLERANCE;
  const gapTop = hasBounds && imageOffsetY > offsetBounds.maxY + GAP_TOLERANCE;
  const gapBottom = hasBounds && imageOffsetY < offsetBounds.minY - GAP_TOLERANCE;
  const hasGap = gapLeft || gapRight || gapTop || gapBottom;

  const photoStyle = flipped
    ? { top: 0, bottom: `${split * 100}%` }
    : { top: `${split * 100}%`, bottom: 0 };

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
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
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!imageUrl) return;
      cancelSnap();
      e.preventDefault();
      setIsDragging(true);
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
    setIsDragging(false);
    snapToValid();
  }, [snapToValid]);

  const handleWheel = useCallback(
    (e) => {
      if (!imageUrl) return;
      e.preventDefault();

      const delta = -e.deltaY * SCALE_SENSITIVITY;
      const currentScale = imageScale || 1;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, currentScale + delta * currentScale));

      if (newScale !== currentScale) {
        onImageScaleChange?.(newScale);
      }
    },
    [imageUrl, imageScale, onImageScaleChange]
  );

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback(
    (e) => {
      if (!imageUrl) return;
      cancelSnap();

      if (e.touches.length === 2) {
        e.preventDefault();
        lastTouchDistance.current = getTouchDistance(e.touches);
        lastPinchScale.current = imageScale || 1;
        setIsPinching(true);
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        dragInfo.current = {
          active: true,
          startX: touch.clientX,
          startY: touch.clientY,
          offsetX: imageOffsetX || 0,
          offsetY: imageOffsetY || 0,
        };
      }
    },
    [imageUrl, imageOffsetX, imageOffsetY, imageScale]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && lastTouchDistance.current > 0) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const ratio = distance / lastTouchDistance.current;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, lastPinchScale.current * ratio));
        onImageScaleChange?.(newScale);
        lastTouchDistance.current = distance;
      } else if (e.touches.length === 1 && dragInfo.current.active) {
        const touch = e.touches[0];
        const dx = touch.clientX - dragInfo.current.startX;
        const dy = touch.clientY - dragInfo.current.startY;
        onImageOffsetChange?.(dragInfo.current.offsetX + dx, dragInfo.current.offsetY + dy);
      }
    },
    [onImageOffsetChange, onImageScaleChange]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (e.touches.length < 2) {
        lastTouchDistance.current = 0;
        setIsPinching(false);
      }
      if (e.touches.length === 0) {
        dragInfo.current.active = false;
        setIsDragging(false);
        snapToValid();
      }
    },
    [snapToValid]
  );

  const handleDoubleClick = useCallback(() => {
    onResetImagePosition?.();
  }, [onResetImagePosition]);

  const TARGET_ASPECT_RATIO = 5 / 7;

  const previewWidth = availableHeight != null
    ? `min(100%, ${availableHeight * 5 / 7}px)`
    : "min(100%, calc((100vh - 80px) * 5 / 7))";

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-[var(--bg-canvas)] overflow-hidden p-3"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-20 bg-[var(--bg-panel)]/80 flex items-center justify-center pointer-events-none">
          <p className="text-lg tracking-[0.3em] text-[var(--accent)] font-courier">{t('dropFile')}</p>
        </div>
      )}

      <div
        className="relative bg-black shadow-2xl"
        style={{
          aspectRatio: TARGET_ASPECT_RATIO,
          width: previewWidth,
          maxWidth: imageUrl ? '100%' : '100%',
        }}
      >
        {imageUrl ? (
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden select-none"
            style={{ cursor: isPinching ? 'zoom-in' : isDragging ? 'grabbing' : 'grab' }}
          >
            <canvas
              ref={canvasRef}
              width={canvasW}
              height={canvasH}
              className="w-full h-full object-contain select-none"
              style={{ imageRendering: 'auto', touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
            />
            {hasGap && (
              <div className="absolute inset-0 pointer-events-none" style={photoStyle}>
                {gapLeft && <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-r from-red-400/60 to-transparent animate-gap-pulse" />}
                {gapRight && <div className="absolute right-0 top-0 bottom-0 w-[5px] bg-gradient-to-l from-red-400/60 to-transparent animate-gap-pulse" />}
                {gapTop && <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-b from-red-400/60 to-transparent animate-gap-pulse" />}
                {gapBottom && <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-gradient-to-t from-red-400/60 to-transparent animate-gap-pulse" />}
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full min-h-[400px] flex flex-col items-center justify-center cursor-pointer bg-[var(--bg-canvas)]"
            onClick={triggerFileSelect}
          >
            <div className="text-center select-none pointer-events-none">
              <div className="w-48 h-56 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg opacity-50">
                <div className="h-[45%] bg-gradient-to-b from-[var(--text-dim)] to-[var(--text-muted)]" />
                <div className="h-[55%] bg-[var(--bg-panel)] flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="opacity-40">
                    <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 36l10-10 8 8 6-6 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <p className="text-sm tracking-[0.3em] text-[var(--text-dim)] font-courier">{t('clickToUpload')}</p>
              <p className="text-xs tracking-wider text-[var(--text-subtle)] mt-2 font-courier">{t('dragAndDrop')}</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

export default CanvasView;
