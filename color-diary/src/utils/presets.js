const STORAGE_KEY = 'color-diary-presets';

const PRESET_FIELDS = [
  'split', 'fontSize', 'grainEnabled', 'grainIntensity',
  'flipped', 'showDate', 'fontFamily', 'dateFormat',
  'gradientEnabled', 'textColor', 'bgColor', 'bgColor2',
];

export function loadPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePreset(name, config) {
  const presets = loadPresets();
  const entry = {
    id: Date.now().toString(36),
    name,
    config: {},
  };
  PRESET_FIELDS.forEach((k) => {
    if (config[k] !== undefined) entry.config[k] = config[k];
  });
  presets.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  return presets;
}

export function deletePreset(id) {
  const presets = loadPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  return presets;
}
