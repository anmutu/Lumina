const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

// 暂时移除可能有问题的依赖
// const fs = require('fs-extra');
// const Store = require('electron-store');

// 配置存储 - 暂时使用简单的内存存储
// const store = new Store();

let mainWindow;

function createWindow() {
  console.log('创建主窗口...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icons/icon.png'),
    title: 'KDP绘本PDF生成器',
    show: false
  });

  console.log('预加载脚本路径:', path.join(__dirname, 'preload.js'));

  // 在开发模式下打开开发者工具
  if (process.argv.includes('--dev')) {
    console.log('开发模式：打开开发者工具');
    mainWindow.webContents.openDevTools();
  }

  console.log('加载HTML文件:', path.join(__dirname, 'renderer/index.html'));
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    console.log('窗口准备显示');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    console.log('窗口关闭');
    mainWindow = null;
  });

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('页面加载失败:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('渲染进程崩溃');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
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

ipcMain.handle('save-pdf', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || '绘本.pdf',
    filters: [
      { name: 'PDF文件', extensions: ['pdf'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('get-stored-data', async () => {
  // 暂时返回空对象
  return {};
});

ipcMain.handle('save-stored-data', async (event, data) => {
  // 暂时只记录数据，不保存
  console.log('保存数据:', data);
  return true;
});
