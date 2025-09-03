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
  
  // PDF保存
  savePDF: (defaultPath) => ipcRenderer.invoke('save-pdf', defaultPath),
  
  // 数据存储
  getStoredData: () => ipcRenderer.invoke('get-stored-data'),
  saveStoredData: (data) => ipcRenderer.invoke('save-stored-data', data),
  
  // 图片处理
  processImages: (imagePaths, options) => ipcRenderer.invoke('process-images', imagePaths, options),
  
  // PDF生成
  generatePDF: (projectData) => ipcRenderer.invoke('generate-pdf', projectData)
});

console.log('预加载脚本执行完成，electronAPI 已暴露到渲染进程');
