const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

let mainWindow;

function createWindow() {
  console.log('创建主窗口...');
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload-simple.js')
    },
    title: 'KDP绘本PDF生成器'
  });

  console.log('预加载脚本路径:', path.join(__dirname, 'preload-simple.js'));
  console.log('HTML文件路径:', path.join(__dirname, 'renderer/index.html'));

  // 加载HTML文件
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // 打开开发者工具
  mainWindow.webContents.openDevTools();

  // 窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 页面加载完成事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成');
  });

  // 页面加载失败事件
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('页面加载失败:', errorCode, errorDescription, validatedURL);
  });
}

// 应用准备就绪时创建窗口
app.whenReady().then(() => {
  console.log('应用准备就绪');
  createWindow();
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  console.log('所有窗口已关闭');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用激活时重新创建窗口
app.on('activate', () => {
  console.log('应用激活');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 处理器
ipcMain.handle('select-folder', async () => {
  console.log('select-folder IPC 处理器被调用');
  try {
    console.log('显示文件夹选择对话框...');
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: '选择包含图片的文件夹'
    });
    
    console.log('Dialog result:', result);
    
    if (!result.canceled && result.filePaths.length > 0) {
      console.log('用户选择了文件夹:', result.filePaths[0]);
      return result.filePaths[0];
    } else {
      console.log('用户取消了文件夹选择');
      return null;
    }
  } catch (error) {
    console.error('Error in select-folder:', error);
    throw error;
  }
});

ipcMain.handle('get-stored-data', async () => {
  console.log('get-stored-data 被调用');
  return {};
});

ipcMain.handle('save-stored-data', async (event, data) => {
  try {
    console.log('save-stored-data 被调用，数据:', data);
    // 暂时只记录数据，不进行实际存储操作
    return true;
  } catch (error) {
    console.error('save-stored-data 错误:', error);
    return false;
  }
});

ipcMain.handle('scan-images', async (event, folderPath) => {
  try {
    console.log('scan-images 被调用，文件夹路径:', folderPath);
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const images = [];
    
    // 读取文件夹中的所有文件
    const files = fs.readdirSync(folderPath);
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const fullPath = path.join(folderPath, file);
        const stats = fs.statSync(fullPath);
        
        images.push({
          name: file,
          path: fullPath,
          selected: true,
          size: stats.size,
          modified: stats.mtime
        });
      }
    });
    
    // 按文件名排序
    images.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`扫描到 ${images.length} 张图片`);
    return images;
    
  } catch (error) {
    console.error('scan-images 错误:', error);
    throw error;
  }
});

ipcMain.handle('generate-pdf', async (event, projectData) => {
  try {
    console.log('generate-pdf 被调用，项目数据:', projectData);
    
    // 创建PDF文档
    const pdfDoc = await PDFDocument.create();
    
            // 根据用户选择的尺寸设置页面大小
        let pageWidth, pageHeight;
        
        // 这里应该从projectData中获取用户选择的尺寸
        // 暂时使用默认值，后续会从UI获取
        const selectedSize = projectData.selectedSize || '8.5x11';
        
        switch (selectedSize) {
          case '8.5x8.5':
            pageWidth = 8.5 * 72;
            pageHeight = 8.5 * 72;
            break;
          case '8.5x11':
          default:
            pageWidth = 8.5 * 72;
            pageHeight = 11 * 72;
            break;
          case '11x8.5':
            pageWidth = 11 * 72;
            pageHeight = 8.5 * 72;
            break;
          case '6x9':
            pageWidth = 6 * 72;
            pageHeight = 9 * 72;
            break;
        }
        
        console.log(`使用页面尺寸: ${pageWidth/72}" x ${pageHeight/72}"`);
    
    // 获取印刷模式
    const printingMode = projectData.printingMode || 'double-sided';
    console.log(`印刷模式: ${printingMode}`);
    
    // 处理每张选中的图片
    for (const imageData of projectData.selectedImages) {
      try {
        console.log(`处理图片: ${imageData.name}`);
        
        // 根据页面比例调整图片尺寸
        const imageBuffer = await sharp(imageData.path)
          .resize(Math.floor(pageWidth - 100), Math.floor(pageHeight - 100), { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 90 })
          .toBuffer();
        
        // 将图片嵌入PDF
        const image = await pdfDoc.embedJpg(imageBuffer);
        const { width, height } = image.scale(1);
        
        // 创建新页面
        const imagePage = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // 计算图片在页面中的位置（居中）
        const scale = Math.min((pageWidth - 100) / width, (pageHeight - 100) / height);
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;
        
        // 在页面上绘制图片
        imagePage.drawImage(image, {
          x: x,
          y: y,
          width: scaledWidth,
          height: scaledHeight
        });
        
        console.log(`图片 ${imageData.name} 已添加到PDF`);
        
        // 如果是单面印刷，在每张图片后添加空白页
        if (printingMode === 'single-sided') {
          const blankPage = pdfDoc.addPage([pageWidth, pageHeight]);
          console.log(`为图片 ${imageData.name} 添加空白页`);
        }
        
      } catch (imageError) {
        console.error(`处理图片 ${imageData.name} 失败:`, imageError);
        // 继续处理其他图片
      }
    }
    
    // 生成PDF文件
    const pdfBytes = await pdfDoc.save();
    
    // 保存PDF文件到桌面
    const desktopPath = path.join(app.getPath('desktop'), `${projectData.projectName || '绘本'}.pdf`);
    fs.writeFileSync(desktopPath, pdfBytes);
    
    console.log(`PDF已保存到: ${desktopPath}`);
    
    return {
      success: true,
      message: `PDF生成成功！已保存 ${projectData.selectedImages.length} 页`,
      filePath: desktopPath
    };
    
  } catch (error) {
    console.error('generate-pdf 错误:', error);
    return {
      success: false,
      message: `PDF生成失败: ${error.message}`
    };
  }
});
