import { useState, useRef, useCallback, useEffect, useMemo, useReducer } from 'react';
import { Vibrant } from 'node-vibrant/browser';
import { I18nProvider, useI18n } from './i18nContext';
import { ThemeProvider } from './themeContext';
import { CanvasStateProvider } from './canvasStateContext';
import { getContrastColor, formatDate, drawGrain } from './utils';
import { getRandomTitle } from './data/titles';
import Header from './components/Header';
import CanvasView from './components/CanvasView';
import ControlPanel from './components/ControlPanel';
import MobileControls from './components/MobileControls';
import AboutModal from './components/AboutModal';
import ExportPreviewModal from './components/ExportPreviewModal';

const DEFAULT_W = 1000;
const DEFAULT_H = 1400;
const MAX_W = 2000;
const MAX_HISTORY = 50;

const FONT_MAP = {
  courier: '"Courier Prime", "Courier New", monospace',
  serif: '"Noto Serif SC", "Georgia", serif',
  sans: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

// State keys that are tracked in undo history
const TRACKED_KEYS = new Set([
  'title', 'date', 'split', 'fontSize', 'bgColor', 'bgColor2', 'textColor',
  'grainEnabled', 'grainIntensity', 'gradientEnabled', 'flipped', 'showDate',
  'fontFamily', 'imageScale', 'imageOffsetX', 'imageOffsetY', 'dateFormat', 'palette'
]);

function createInitialState() {
  return {
    imageUrl: null,
    imageElement: null,
    canvasW: DEFAULT_W,
    canvasH: DEFAULT_H,
    palette: null,
    bgColor: '#000000',
    bgColor2: '#333333',
    textColor: 'auto',
    title: '',
    date: formatDate(),
    split: 0.45,
    fontSize: 32,
    grainEnabled: false,
    grainIntensity: 20,
    gradientEnabled: false,
    aboutVisible: false,
    isMobile: false,
    imageOffsetX: 0,
    imageOffsetY: 0,
    flipped: false,
    showDate: true,
    fontFamily: 'serif',
    imageScale: 1,
    dateFormat: 'YYYY.MM.DD',
    showExportPreview: false,
    // Undo history - managed by reducer
    _past: [],
    _future: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'UNDO': {
      if (state._past.length === 0) return state;
      const previous = state._past[state._past.length - 1];
      const newPast = state._past.slice(0, -1);
      const currentSnapshot = {};
      for (const key of TRACKED_KEYS) {
        currentSnapshot[key] = state[key];
      }
      return {
        ...previous,
        _past: newPast,
        _future: [currentSnapshot, ...state._future],
      };
    }
    case 'REDO': {
      if (state._future.length === 0) return state;
      const next = state._future[0];
      const newFuture = state._future.slice(1);
      const currentSnapshot = {};
      for (const key of TRACKED_KEYS) {
        currentSnapshot[key] = state[key];
      }
      return {
        ...state,
        ...next,
        _past: [...state._past, currentSnapshot].slice(-MAX_HISTORY),
        _future: newFuture,
      };
    }
    case 'SET': {
      const { key, value } = action;
      if (state[key] === value) return state;
      const newState = { ...state, [key]: value };
      if (TRACKED_KEYS.has(key)) {
        const snapshot = {};
        for (const k of TRACKED_KEYS) {
          snapshot[k] = state[k];
        }
        newState._past = [...state._past, snapshot].slice(-MAX_HISTORY);
        newState._future = [];
      }
      return newState;
    }
    default:
      return state;
  }
}

function computeCanvasWH(imgW, imgH) {
  let w = Math.max(Math.min(imgW, MAX_W), DEFAULT_W);
  let h = Math.round(w * 7 / 5);
  if (h > MAX_W * 7 / 5) {
    h = Math.round(MAX_W * 7 / 5);
    w = Math.round(h * 5 / 7);
  }
  return { w, h };
}

function AppInner() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const {
    imageUrl,
    imageElement,
    canvasW,
    canvasH,
    palette,
    bgColor,
    bgColor2,
    textColor,
    title,
    date,
    split,
    fontSize,
    grainEnabled,
    grainIntensity,
    gradientEnabled,
    aboutVisible,
    isMobile,
    imageOffsetX,
    imageOffsetY,
    flipped,
    showDate,
    fontFamily,
    imageScale,
    dateFormat,
    showExportPreview,
    _past,
    _future,
  } = state;

  const set = useCallback((key, value) => {
    dispatch({ type: 'SET', key, value });
  }, []);

  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const { t } = useI18n();

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        dispatch({ type: 'REDO' });
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const checkMobile = () => dispatch({ type: 'SET', key: 'isMobile', value: window.innerWidth < 768 });
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scaleFactor = canvasW / DEFAULT_W;
  const effectiveFontSize = Math.round(fontSize * scaleFactor);

  // Compute valid offset bounds so the image always covers its designated area
  const offsetBounds = (() => {
    if (!imageElement) return null;
    const imgW = imageElement.naturalWidth || imageElement.width;
    const imgH = imageElement.naturalHeight || imageElement.height;
    if (!imgW || !imgH) return null;

    const bgHeight = split * canvasH;
    const photoH = canvasH - bgHeight;
    const photoW = canvasW;
    const coverScale = Math.max(photoW / imgW, photoH / imgH);
    const finalScale = coverScale * (imageScale || 1);
    const dw = imgW * finalScale;
    const dh = imgH * finalScale;

    const maxOffsetX = Math.max(0, (dw - photoW) / 2) / scaleFactor;
    const maxOffsetY = Math.max(0, (dh - photoH) / 2) / scaleFactor;

    return { minX: -maxOffsetX, maxX: maxOffsetX, minY: -maxOffsetY, maxY: maxOffsetY };
  })();

  const drawPhotoInRect = useCallback(
    (ctx, ox, oy, w, h) => {
      if (!imageElement) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(ox, oy, w, h);
      ctx.clip();

      const img = imageElement;
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      const coverScale = Math.max(w / imgW, h / imgH);
      const finalScale = coverScale * (imageScale || 1);
      const dw = imgW * finalScale;
      const dh = imgH * finalScale;
      const dx = ox + (w - dw) / 2 + (imageOffsetX || 0) * scaleFactor;
      const dy = oy + (h - dh) / 2 + (imageOffsetY || 0) * scaleFactor;

      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    },
    [imageElement, imageOffsetX, imageOffsetY, imageScale, scaleFactor]
  );

  const drawTitleAndDate = useCallback(
    (ctx, centerY) => {
      const effectiveTextColor = textColor === 'auto' ? getContrastColor(bgColor) : textColor;
      const font = FONT_MAP[fontFamily] || FONT_MAP.serif;
      ctx.fillStyle = effectiveTextColor;
      ctx.font = `${effectiveFontSize}px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (title) {
        ctx.fillText(title, canvasW / 2, centerY);
      } else if (showDate && date) {
        ctx.fillText('────────', canvasW / 2, centerY);
      }

      if (showDate && date) {
        const lineY = centerY + effectiveFontSize * 0.7;
        ctx.globalAlpha = 0.3;
        ctx.fillText('──────', canvasW / 2, lineY);
        ctx.globalAlpha = 0.55;
        ctx.font = `${Math.round(effectiveFontSize * 0.75)}px ${font}`;
        ctx.fillText(date, canvasW / 2, lineY + effectiveFontSize * 0.65);
        ctx.globalAlpha = 1;
      }
    },
    [title, date, showDate, effectiveFontSize, textColor, bgColor, canvasW, fontFamily]
  );

  const renderFrame = useCallback(
    (ctx) => {
      ctx.clearRect(0, 0, canvasW, canvasH);
      const bgHeight = split * canvasH;

      if (flipped) {
        ctx.fillStyle = bgColor;
        if (gradientEnabled) {
          const grad = ctx.createLinearGradient(0, canvasH - bgHeight, 0, canvasH);
          grad.addColorStop(0, bgColor);
          grad.addColorStop(1, bgColor2);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = bgColor;
        }
        ctx.fillRect(0, canvasH - bgHeight, canvasW, bgHeight);

        drawPhotoInRect(ctx, 0, 0, canvasW, canvasH - bgHeight);

        if ((title || (showDate && date))) {
          drawTitleAndDate(ctx, canvasH - bgHeight / 2);
        }
      } else {
        if (gradientEnabled) {
          const grad = ctx.createLinearGradient(0, 0, 0, bgHeight);
          grad.addColorStop(0, bgColor);
          grad.addColorStop(1, bgColor2);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = bgColor;
        }
        ctx.fillRect(0, 0, canvasW, bgHeight);

        drawPhotoInRect(ctx, 0, bgHeight, canvasW, canvasH - bgHeight);

        if ((title || (showDate && date))) {
          drawTitleAndDate(ctx, bgHeight / 2);
        }
      }

      if (grainEnabled && grainIntensity > 0) {
        drawGrain(ctx, canvasW, canvasH, grainIntensity);
      }

      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = getContrastColor(bgColor);
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const splitY = flipped ? canvasH - bgHeight : bgHeight;
      ctx.moveTo(0, splitY);
      ctx.lineTo(canvasW, splitY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [canvasW, canvasH, split, flipped, gradientEnabled, bgColor, bgColor2, drawPhotoInRect, drawTitleAndDate, title, date, showDate, grainEnabled, grainIntensity]
  );

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    renderFrame(ctx);
  }, [renderFrame]);

  useEffect(() => {
    if (imageUrl) {
      requestAnimationFrame(renderCanvas);
    }
  }, [renderCanvas, imageUrl]);

  const extractColors = useCallback(async (img) => {
    try {
      const swatches = await Vibrant.from(img).getPalette();
      const paletteList = [
        swatches.Vibrant,
        swatches.Muted,
        swatches.DarkVibrant,
        swatches.DarkMuted,
        swatches.LightVibrant,
        swatches.LightMuted,
      ].filter(Boolean);

      const colors = paletteList.map((s) => s.hex);
      if (colors.length > 0) {
        dispatch({ type: 'SET', key: 'palette', value: colors });
        dispatch({ type: 'SET', key: 'bgColor', value: colors[0] });
        if (colors.length >= 2) {
          dispatch({ type: 'SET', key: 'bgColor2', value: colors[1] });
        }
      }
    } catch (err) {
      console.error('Color extraction failed:', err);
      const fallback = ['#4A90D9', '#357ABD', '#2C3E50', '#34495E', '#7FB3E0', '#A8D0F0'];
      dispatch({ type: 'SET', key: 'palette', value: fallback });
      dispatch({ type: 'SET', key: 'bgColor', value: fallback[0] });
      dispatch({ type: 'SET', key: 'bgColor2', value: fallback[1] });
    }
  }, []);

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;
      dispatch({ type: 'SET', key: 'imageOffsetX', value: 0 });
      dispatch({ type: 'SET', key: 'imageOffsetY', value: 0 });
      dispatch({ type: 'SET', key: 'imageScale', value: 1 });

      const url = URL.createObjectURL(file);
      dispatch({ type: 'SET', key: 'imageUrl', value: url });

      const processImage = (img) => {
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        const { w, h } = computeCanvasWH(nw, nh);
        dispatch({ type: 'SET', key: 'canvasW', value: w });
        dispatch({ type: 'SET', key: 'canvasH', value: h });
        dispatch({ type: 'SET', key: 'imageElement', value: img });
        extractColors(img);
      };

      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        video.playsInline = true;

        await new Promise((resolve) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.load();
        });

        video.currentTime = 0;
        await new Promise((resolve) => {
          video.addEventListener('seeked', resolve, { once: true });
        });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth || 640;
        tempCanvas.height = video.videoHeight || 480;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        const img = new Image();
        img.onload = () => processImage(img);
        img.src = tempCanvas.toDataURL('image/jpeg', 0.9);
        URL.revokeObjectURL(url);
        dispatch({ type: 'SET', key: 'imageUrl', value: img.src });
      } else {
        const img = new Image();
        img.onload = () => processImage(img);
        img.src = url;
      }
    },
    [extractColors]
  );

  const handleRandom = useCallback(() => {
    if (palette && palette.length > 0) {
      const idx = Math.floor(Math.random() * palette.length);
      dispatch({ type: 'SET', key: 'bgColor', value: palette[idx] });
    }
  }, [palette]);

  const handleRandomTitle = useCallback(() => {
    dispatch({ type: 'SET', key: 'title', value: getRandomTitle() });
  }, []);

  const handleImageOffsetChange = useCallback((x, y) => {
    dispatch({ type: 'SET', key: 'imageOffsetX', value: x });
    dispatch({ type: 'SET', key: 'imageOffsetY', value: y });
  }, []);

  const handleImageScaleChange = useCallback((s) => {
    dispatch({ type: 'SET', key: 'imageScale', value: s });
  }, []);

  const handleResetImagePosition = useCallback(() => {
    dispatch({ type: 'SET', key: 'imageScale', value: 1 });
    dispatch({ type: 'SET', key: 'imageOffsetX', value: 0 });
    dispatch({ type: 'SET', key: 'imageOffsetY', value: 0 });
  }, []);

  const handleDateFormatChange = useCallback((fmt) => {
    dispatch({ type: 'SET', key: 'dateFormat', value: fmt });
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const map = {
      'YYYY.MM.DD': `${yyyy}.${mm}.${dd}`,
      'MM/DD/YYYY': `${mm}/${dd}/${yyyy}`,
      'DD/MM/YYYY': `${dd}/${mm}/${yyyy}`,
      'YYYY-MM-DD': `${yyyy}-${mm}-${dd}`,
    };
    dispatch({ type: 'SET', key: 'date', value: map[fmt] || `${yyyy}.${mm}.${dd}` });
  }, []);

  const showExportPreviewFn = useCallback(() => {
    dispatch({ type: 'SET', key: 'showExportPreview', value: true });
  }, []);

  const doDownload = useCallback(() => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasW;
    tempCanvas.height = canvasH;
    const ctx = tempCanvas.getContext('2d');
    renderFrame(ctx);

    tempCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `color-diary-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }, [canvasW, canvasH, renderFrame]);

  const handleConfirmExport = useCallback(() => {
    doDownload();
    dispatch({ type: 'SET', key: 'showExportPreview', value: false });
  }, [doDownload]);

  const commonProps = {
    imageUrl,
    palette,
    bgColor,
    bgColor2,
    textColor,
    title,
    date,
    split,
    fontSize,
    grainEnabled,
    grainIntensity,
    gradientEnabled,
    flipped,
    showDate,
    fontFamily,
    imageScale,
    dateFormat,
    hasImage: !!imageUrl,
    canUndo: _past.length > 0,
    canRedo: _future.length > 0,
    onFileSelect: handleFileSelect,
    onTitleChange: (v) => dispatch({ type: 'SET', key: 'title', value: v }),
    onDateChange: (v) => dispatch({ type: 'SET', key: 'date', value: v }),
    onSplitChange: (v) => dispatch({ type: 'SET', key: 'split', value: v }),
    onFontSizeChange: (v) => dispatch({ type: 'SET', key: 'fontSize', value: v }),
    onFontChange: (v) => dispatch({ type: 'SET', key: 'fontFamily', value: v }),
    onBgColor: (v) => dispatch({ type: 'SET', key: 'bgColor', value: v }),
    onBgColor2: (v) => dispatch({ type: 'SET', key: 'bgColor2', value: v }),
    onTextColor: (v) => dispatch({ type: 'SET', key: 'textColor', value: v }),
    onGrainToggle: () => dispatch({ type: 'SET', key: 'grainEnabled', value: !grainEnabled }),
    onGrainIntensityChange: (v) => dispatch({ type: 'SET', key: 'grainIntensity', value: v }),
    onGradientToggle: () => dispatch({ type: 'SET', key: 'gradientEnabled', value: !gradientEnabled }),
    onFlipToggle: () => dispatch({ type: 'SET', key: 'flipped', value: !flipped }),
    onShowDateToggle: () => dispatch({ type: 'SET', key: 'showDate', value: !showDate }),
    onRandom: handleRandom,
    onRandomTitle: handleRandomTitle,
    onExportPng: showExportPreviewFn,
    onImageScaleChange: handleImageScaleChange,
    onResetImagePosition: handleResetImagePosition,
    onDateFormatChange: handleDateFormatChange,
    onUndo: () => dispatch({ type: 'UNDO' }),
    onRedo: () => dispatch({ type: 'REDO' }),
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-app)]">
      <Header
        onAboutClick={() => dispatch({ type: 'SET', key: 'aboutVisible', value: true })}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        canUndo={_past.length > 0}
        canRedo={_future.length > 0}
      />

      <div className="flex-1 flex pt-[52px] overflow-hidden">
        {!isMobile ? (
          <>
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
              <div className="w-full max-h-full flex items-center justify-center p-2">
                <CanvasView
                  imageUrl={imageUrl}
                  canvasW={canvasW}
                  canvasH={canvasH}
                  onFileSelect={handleFileSelect}
                  canvasRef={canvasRef}
                  previewRef={previewRef}
                  imageOffsetX={imageOffsetX}
                  imageOffsetY={imageOffsetY}
                  imageScale={imageScale}
                  onImageOffsetChange={handleImageOffsetChange}
                  onImageScaleChange={handleImageScaleChange}
                  onResetImagePosition={handleResetImagePosition}
                  offsetBounds={offsetBounds}
                />
              </div>
            </div>
            <CanvasStateProvider value={commonProps}>
              <ControlPanel />
            </CanvasStateProvider>
          </>
        ) : (
          <div className="flex-1 relative overflow-hidden">
            <div
              className="absolute left-0 right-0 flex items-center justify-center bg-[#0a0a0a] transition-all duration-200 ease-out"
              style={{
                top: 0,
                bottom: mobileSheetOpen ? 'calc(40vh + 52px + env(safe-area-inset-bottom, 0px))' : 0,
                padding: 8,
              }}
              id="mobile-canvas-container"
            >
              <CanvasView
                imageUrl={imageUrl}
                canvasW={canvasW}
                canvasH={canvasH}
                onFileSelect={handleFileSelect}
                canvasRef={canvasRef}
                previewRef={previewRef}
                imageOffsetX={imageOffsetX}
                imageOffsetY={imageOffsetY}
                imageScale={imageScale}
                onImageOffsetChange={handleImageOffsetChange}
                onImageScaleChange={handleImageScaleChange}
                onResetImagePosition={handleResetImagePosition}
                offsetBounds={offsetBounds}
              />
            </div>
            <CanvasStateProvider value={commonProps}>
              <MobileControls onSheetChange={setMobileSheetOpen} />
            </CanvasStateProvider>
          </div>
        )}
      </div>

      {aboutVisible && <AboutModal onClose={() => dispatch({ type: 'SET', key: 'aboutVisible', value: false })} />}
      {showExportPreview && (
        <ExportPreviewModal
          onClose={() => dispatch({ type: 'SET', key: 'showExportPreview', value: false })}
          onDownload={handleConfirmExport}
          canvasW={canvasW}
          canvasH={canvasH}
          renderFrame={renderFrame}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppInner />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
