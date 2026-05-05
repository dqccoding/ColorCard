const T = {
  en: {
    about: 'About',
    close: 'Close',
    photo: 'Photo',
    upload: 'Upload Image',
    title: 'Title',
    date: 'Date',
    split: 'Split',
    fontSize: 'Font Size',
    bgColor: 'Bg Color',
    bgColor2: 'Gradient To',
    textColor: 'Text Color',
    grain: 'Grain',
    grainIntensity: 'Grain Intensity',
    gradient: 'Gradient',
    random: 'RANDOM',
    auto: 'AUTO',
    exportPng: 'Export PNG',
    flip: 'Swap',
    showDate: 'Show Date',
    randomTitle: 'Random Title',
    fontFamily: 'Font',
    fontCourier: 'Courier',
    fontSerif: 'Serif',
    fontSans: 'Sans',
    dropFile: 'DROP FILE',
    clickToUpload: 'CLICK TO UPLOAD',
    dragAndDrop: 'or drag & drop',
    titlePlaceholder: 'Enter title...',
    datePlaceholder: 'YYYY.MM.DD',
    aboutTitle: 'About Color Diary',
    aboutText: 'Color Diary is a cover image generator that creates beautiful split-cover style images. Upload your photo and let the tool extract its dominant colors to create a unique cover layout with customizable text, grain texture, and more.',
    longPressSave: 'Long press to save',
  },
  cn: {
    about: '关于',
    close: '关闭',
    photo: '图片',
    upload: '上传图片',
    title: '标题',
    date: '日期',
    split: '分割线',
    fontSize: '字体大小',
    bgColor: '背景颜色',
    bgColor2: '渐变至',
    textColor: '文字颜色',
    grain: '颗粒',
    grainIntensity: '颗粒强度',
    gradient: '渐变',
    random: '随机',
    auto: '自动',
    exportPng: '导出 PNG',
    flip: '交换位置',
    showDate: '显示日期',
    randomTitle: '随机标题',
    fontFamily: '字体',
    fontCourier: '打字机',
    fontSerif: '衬线',
    fontSans: '无衬线',
    dropFile: '拖放文件',
    clickToUpload: '点击上传',
    dragAndDrop: '或拖放文件到此处',
    titlePlaceholder: '输入标题...',
    datePlaceholder: 'YYYY.MM.DD',
    aboutTitle: '关于 Color Diary',
    aboutText: 'Color Diary 是一个封面图片生成器，可以创建精美的分割式封面风格图片。上传您的照片，工具将提取其主色调来创建独特的封面布局，并支持自定义文字、颗粒纹理等。',
    longPressSave: '长按图片保存',
  },
};

let currentLang = 'cn';

export function t(key) {
  return T[currentLang]?.[key] ?? T.en?.[key] ?? key;
}

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang;
}

export function toggleLang() {
  currentLang = currentLang === 'en' ? 'cn' : 'en';
}

export default T;
