export function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

export function formatDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}

export function drawGrain(ctx, width, height, intensity) {
  if (intensity <= 0) return;

  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const offCtx = off.getContext('2d');
  const imageData = offCtx.createImageData(width, height);
  const data = imageData.data;
  const strength = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const noise = ((Math.random() * 2 - 1) * strength * 255) | 0;
    const gray = 128 + noise;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    data[i + 3] = Math.abs(noise);
  }

  offCtx.putImageData(imageData, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.15 + strength * 0.25;
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(off, 0, 0);
  ctx.restore();
}

export function getVideoFrame(video, canvas) {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    resolve(canvas);
  });
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
