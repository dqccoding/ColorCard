import { useState, useRef, useCallback, useEffect } from 'react';
import { Vibrant } from 'node-vibrant/browser';
import { I18nProvider, useI18n } from './i18nContext';
import { ThemeProvider } from './themeContext';
import { getContrastColor, formatDate, drawGrain } from './utils';
import Header from './components/Header';
import CanvasView from './components/CanvasView';
import ControlPanel from './components/ControlPanel';
import MobileControls from './components/MobileControls';
import AboutModal from './components/AboutModal';

const DEFAULT_W = 1000;
const DEFAULT_H = 1400;
const MAX_W = 2000;

const RANDOM_TITLES = [
  '人间烟火',
  '山河远阔',
  '落日余晖',
  '星辰大海',
  '风起之时',
  '且听风吟',
  '浮光掠影',
  '夏日晚风',
  '秋日私语',
  '冬日暖阳',
  '春暖花开',
  '岁月静好',
  '如约而至',
  '不期而遇',
  '山野万里',
  '暮色温柔',
  '晨光熹微',
  '晚来天欲雪',
  '陪你度过漫长岁月',
  '世间美好与你环环相扣',
  '一万年太久 只争朝夕',
  '心中有山海 静而无边',
  '所爱隔山海 山海皆可平',
  '慢慢来 会好的 你又不差',
  '来日方长 何惧路遥马慢',
  '山水一程 三生有幸',
  '落日归山海 山海藏深意',
  '光落在你脸上 可爱一如往常',
  '月亮不会奔你而来 星星也不会',
  '在人间 拾荒 收集温柔与黄昏',
];

const FONT_MAP = {
  courier: '"Courier Prime", "Courier New", monospace',
  serif: '"Noto Serif SC", "Georgia", serif',
  sans: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
};

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
  const [imageUrl, setImageUrl] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [canvasW, setCanvasW] = useState(DEFAULT_W);
  const [canvasH, setCanvasH] = useState(DEFAULT_H);
  const [palette, setPalette] = useState(null);
  const [bgColor, setBgColor] = useState('#000000');
  const [bgColor2, setBgColor2] = useState('#333333');
  const [textColor, setTextColor] = useState('auto');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(formatDate());
  const [split, setSplit] = useState(0.45);
  const [fontSize, setFontSize] = useState(32);
  const [grainEnabled, setGrainEnabled] = useState(false);
  const [grainIntensity, setGrainIntensity] = useState(20);
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDate, setShowDate] = useState(true);
  const [fontFamily, setFontFamily] = useState('serif');

  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scaleFactor = canvasW / DEFAULT_W;
  const effectiveFontSize = Math.round(fontSize * scaleFactor);

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

      const scale = Math.max(w / imgW, h / imgH);
      const dw = imgW * scale;
      const dh = imgH * scale;
      const dx = ox + (w - dw) / 2 + (imageOffsetX || 0) * scaleFactor;
      const dy = oy + (h - dh) / 2 + (imageOffsetY || 0) * scaleFactor;

      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    },
    [imageElement, imageOffsetX, imageOffsetY, scaleFactor]
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
        setPalette(colors);
        setBgColor(colors[0]);
        if (colors.length >= 2) {
          setBgColor2(colors[1]);
        }
      }
    } catch (err) {
      console.error('Color extraction failed:', err);
      const fallback = ['#4A90D9', '#357ABD', '#2C3E50', '#34495E', '#7FB3E0', '#A8D0F0'];
      setPalette(fallback);
      setBgColor(fallback[0]);
      setBgColor2(fallback[1]);
    }
  }, []);

  const handleFileSelect = useCallback(
    async (file) => {
      if (!file) return;
      setImageOffsetX(0);
      setImageOffsetY(0);

      const url = URL.createObjectURL(file);
      setImageUrl(url);

      const processImage = (img) => {
        const nw = img.naturalWidth || img.width;
        const nh = img.naturalHeight || img.height;
        const { w, h } = computeCanvasWH(nw, nh);
        setCanvasW(w);
        setCanvasH(h);
        setImageElement(img);
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
        setImageUrl(img.src);
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
      setBgColor(palette[idx]);
    }
  }, [palette]);

  const handleRandomTitle = useCallback(() => {
    const idx = Math.floor(Math.random() * RANDOM_TITLES.length);
    setTitle(RANDOM_TITLES[idx]);
  }, []);

  const handleImageOffsetChange = useCallback((x, y) => {
    setImageOffsetX(x);
    setImageOffsetY(y);
  }, []);

  const exportPng = useCallback(() => {
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
    hasImage: !!imageUrl,
    onFileSelect: handleFileSelect,
    onTitleChange: setTitle,
    onDateChange: setDate,
    onSplitChange: setSplit,
    onFontSizeChange: setFontSize,
    onFontChange: setFontFamily,
    onBgColor: setBgColor,
    onBgColor2: setBgColor2,
    onTextColor: setTextColor,
    onGrainToggle: () => setGrainEnabled((v) => !v),
    onGrainIntensityChange: setGrainIntensity,
    onGradientToggle: () => setGradientEnabled((v) => !v),
    onFlipToggle: () => setFlipped((v) => !v),
    onShowDateToggle: () => setShowDate((v) => !v),
    onRandom: handleRandom,
    onRandomTitle: handleRandomTitle,
    onExportPng: exportPng,
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-app)]">
      <Header onAboutClick={() => setAboutVisible(true)} />

      <div className="flex-1 flex pt-[52px] overflow-hidden">
        {!isMobile ? (
          <>
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
              <div className="w-full max-h-full flex items-center justify-center p-4">
                <CanvasView
                  imageUrl={imageUrl}
                  canvasW={canvasW}
                  canvasH={canvasH}
                  onFileSelect={handleFileSelect}
                  canvasRef={canvasRef}
                  previewRef={previewRef}
                  imageOffsetX={imageOffsetX}
                  imageOffsetY={imageOffsetY}
                  onImageOffsetChange={handleImageOffsetChange}
                />
              </div>
            </div>
            <ControlPanel {...commonProps} />
          </>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#0a0a0a] p-2">
              <CanvasView
                imageUrl={imageUrl}
                canvasW={canvasW}
                canvasH={canvasH}
                onFileSelect={handleFileSelect}
                canvasRef={canvasRef}
                previewRef={previewRef}
                imageOffsetX={imageOffsetX}
                imageOffsetY={imageOffsetY}
                onImageOffsetChange={handleImageOffsetChange}
              />
            </div>
            <MobileControls {...commonProps} />
          </div>
        )}
      </div>

      {aboutVisible && <AboutModal onClose={() => setAboutVisible(false)} />}
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
