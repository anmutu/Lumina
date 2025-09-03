const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class ImageProcessor {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
  }

  // 检查文件是否为支持的图片格式
  isSupportedImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return this.supportedFormats.includes(ext);
  }

  // 获取文件夹中的所有图片
  async getImagesFromFolder(folderPath) {
    try {
      const files = await fs.readdir(folderPath);
      const imageFiles = files
        .filter(file => this.isSupportedImage(file))
        .map(file => ({
          name: file,
          path: path.join(folderPath, file),
          fullPath: path.join(folderPath, file)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      return imageFiles;
    } catch (error) {
      throw new Error(`读取文件夹失败: ${error.message}`);
    }
  }

  // 获取图片信息
  async getImageInfo(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: await fs.stat(imagePath).then(stats => stats.size),
        aspectRatio: metadata.width / metadata.height
      };
    } catch (error) {
      throw new Error(`获取图片信息失败: ${error.message}`);
    }
  }

  // 处理单张图片
  async processImage(imagePath, options) {
    const {
      targetWidth,
      targetHeight,
      strategy = 'fit-with-margins',
      marginColor = '#FFFFFF',
      quality = 100
    } = options;

    try {
      let image = sharp(imagePath);

      if (strategy === 'fit-with-margins') {
        // 缩放以适合，添加留白
        image = image.resize(targetWidth, targetHeight, {
          fit: 'inside',
          background: marginColor
        });
      } else if (strategy === 'fill-with-crop') {
        // 缩放以填充，自动裁剪
        image = image.resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'center'
        });
      }

      // 转换为CMYK色彩模式（KDP要求）
      image = image.removeAlpha().toColorspace('cmyk');

      return await image.jpeg({ quality }).toBuffer();
    } catch (error) {
      throw new Error(`处理图片失败: ${error.message}`);
    }
  }

  // 批量处理图片
  async processImages(imagePaths, options) {
    const results = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
      try {
        const processedImage = await this.processImage(imagePaths[i], options);
        results.push({
          index: i,
          originalPath: imagePaths[i],
          processed: processedImage,
          success: true
        });
      } catch (error) {
        results.push({
          index: i,
          originalPath: imagePaths[i],
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  // 验证图片质量（检查分辨率）
  async validateImageQuality(imagePath, minDpi = 300) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const dpi = Math.min(metadata.density?.x || 72, metadata.density?.y || 72);
      
      return {
        isValid: dpi >= minDpi,
        dpi: dpi,
        width: metadata.width,
        height: metadata.height,
        recommendedDpi: minDpi
      };
    } catch (error) {
      throw new Error(`验证图片质量失败: ${error.message}`);
    }
  }

  // 生成缩略图
  async generateThumbnail(imagePath, maxSize = 200) {
    try {
      const thumbnail = await sharp(imagePath)
        .resize(maxSize, maxSize, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      return thumbnail;
    } catch (error) {
      throw new Error(`生成缩略图失败: ${error.message}`);
    }
  }
}

module.exports = ImageProcessor;
