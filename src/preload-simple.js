const { contextBridge, ipcRenderer } = require('electron');

console.log('预加载脚本开始执行...');

contextBridge.exposeInMainWorld('electronAPI', {
  // 文件夹选择
  selectFolder: async () => {
    console.log('预加载脚本: selectFolder 被调用');
    try {
      const result = await ipcRenderer.invoke('select-folder');
      console.log('预加载脚本: selectFolder 返回结果:', result);
      return result;
    } catch (error) {
      console.error('预加载脚本: selectFolder 错误:', error);
      throw error;
    }
  },
  
  // 数据存储
  getStoredData: async () => {
    try {
      const result = await ipcRenderer.invoke('get-stored-data');
      return result;
    } catch (error) {
      console.error('预加载脚本: getStoredData 错误:', error);
      return {};
    }
  },
  
  saveStoredData: async (data) => {
    try {
      const result = await ipcRenderer.invoke('save-stored-data', data);
      return result;
    } catch (error) {
      console.error('预加载脚本: saveStoredData 错误:', error);
      return false;
    }
  },
  
  scanImages: async (folderPath) => {
    try {
      const result = await ipcRenderer.invoke('scan-images', folderPath);
      return result;
    } catch (error) {
      console.error('预加载脚本: scanImages 错误:', error);
      throw error;
    }
  },
  
  generatePDF: async (projectData) => {
    try {
      const result = await ipcRenderer.invoke('generate-pdf', projectData);
      return result;
    } catch (error) {
      console.error('预加载脚本: generatePDF 错误:', error);
      return {
        success: false,
        message: `PDF生成失败: ${error.message}`
      };
    }
  }
});

console.log('预加载脚本执行完成，electronAPI 已暴露到渲染进程');
