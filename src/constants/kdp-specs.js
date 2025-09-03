// KDP支持的印刷尺寸规格
export const KDP_SIZES = [
  {
    id: '8.5x11',
    name: '8.5" x 11" | 21.59 x 27.94 cm',
    width: 8.5,
    height: 11,
    widthCm: 21.59,
    heightCm: 27.94,
    bleed: 0.125, // 3mm = 0.125 inches
    minPages: 24,
    maxPages: 828
  },
  {
    id: '8.5x8.5',
    name: '8.5" x 8.5" | 21.59 x 21.59 cm',
    width: 8.5,
    height: 8.5,
    widthCm: 21.59,
    heightCm: 21.59,
    bleed: 0.125,
    minPages: 24,
    maxPages: 828
  },
  {
    id: '6x9',
    name: '6" x 9" | 15.24 x 22.86 cm',
    width: 6,
    height: 9,
    widthCm: 15.24,
    heightCm: 22.86,
    bleed: 0.125,
    minPages: 24,
    maxPages: 828
  },
  {
    id: '7x10',
    name: '7" x 10" | 17.78 x 25.4 cm',
    width: 7,
    height: 10,
    widthCm: 17.78,
    heightCm: 25.4,
    bleed: 0.125,
    minPages: 24,
    maxPages: 828
  },
  {
    id: '8.25x11',
    name: '8.25" x 11" | 20.96 x 27.94 cm',
    width: 8.25,
    height: 11,
    widthCm: 20.96,
    heightCm: 27.94,
    bleed: 0.125,
    minPages: 24,
    maxPages: 828
  }
];

// 印刷方式
export const PRINTING_METHODS = [
  {
    id: 'double-sided',
    name: '双面印刷',
    description: '图片顺序排列，无空白页'
  },
  {
    id: 'single-sided',
    name: '单面印刷',
    description: '每张内容图片后自动插入空白页'
  }
];

// 纸张类型
export const PAPER_TYPES = [
  {
    id: 'standard-white',
    name: '标准白色',
    description: '标准白色纸张，适合大多数绘本',
    weight: 60 // gsm
  },
  {
    id: 'premium-cream',
    name: '高级奶油色',
    description: '高级奶油色纸张，更温暖的色调',
    weight: 70 // gsm
  }
];

// 封面Finish
export const COVER_FINISHES = [
  {
    id: 'matte',
    name: '亚光',
    description: '亚光效果，减少反光'
  },
  {
    id: 'glossy',
    name: '亮光',
    description: '亮光效果，增强色彩饱和度'
  }
];

// 布局策略
export const LAYOUT_STRATEGIES = [
  {
    id: 'fit-with-margins',
    name: '缩放以适合（添加留白）',
    description: '等比缩放图片至完全适应页面，添加均匀留白'
  },
  {
    id: 'fill-with-crop',
    name: '缩放以填充（自动裁剪）',
    description: '等比缩放图片至填满整个页面，边缘内容将被裁剪'
  }
];

// 留白颜色选项
export const MARGIN_COLORS = [
  { id: 'white', name: '白色', hex: '#FFFFFF' },
  { id: 'cream', name: '奶油色', hex: '#F5F5DC' },
  { id: 'light-gray', name: '浅灰色', hex: '#F0F0F0' },
  { id: 'custom', name: '自定义', hex: null }
];
