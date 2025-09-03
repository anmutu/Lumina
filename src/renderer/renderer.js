// 导入KDP规格常量
import { 
  KDP_SIZES, 
  PRINTING_METHODS, 
  PAPER_TYPES, 
  COVER_FINISHES, 
  LAYOUT_STRATEGIES, 
  MARGIN_COLORS 
} from '../constants/kdp-specs.js';

class KDPPictureBookGenerator {
  constructor() {
    this.currentStep = 1;
    this.projectData = {
      projectName: '',
      selectedFolder: null,
      images: [],
      selectedImages: [],
      kdpSize: null,
      printingMethod: 'double-sided',
      paperType: 'standard-white',
      coverFinish: 'matte',
      layoutStrategy: 'fit-with-margins',
      marginColor: '#FFFFFF'
    };
    
    this.init();
  }

  init() {
    console.log('KDPPictureBookGenerator 初始化开始...');
    this.bindEvents();
    this.loadStoredData();
    console.log('KDPPictureBookGenerator 初始化完成');
    
    // 检查 electronAPI 是否可用
    if (window.electronAPI) {
      console.log('electronAPI 可用:', Object.keys(window.electronAPI));
    } else {
      console.error('electronAPI 不可用!');
    }
  }

  bindEvents() {
    // 文件夹选择
    const selectFolderBtn = document.getElementById('select-folder-btn');
    if (selectFolderBtn) {
      selectFolderBtn.addEventListener('click', () => {
        this.selectFolder();
      });
    }

    // 项目名称输入
    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
      projectNameInput.addEventListener('input', (e) => {
        this.projectData.projectName = e.target.value;
        this.saveProjectData();
        this.updateNextButtonState();
      });
    }

    // 下一步按钮
    const nextStepBtn = document.getElementById('next-step-1');
    if (nextStepBtn) {
      nextStepBtn.addEventListener('click', () => {
        this.nextStep();
      });
    }
  }

  async selectFolder() {
    try {
      console.log('开始选择文件夹...');
      
      if (!window.electronAPI || !window.electronAPI.selectFolder) {
        console.error('electronAPI.selectFolder 未定义');
        alert('应用程序接口未正确加载，请重启应用');
        return;
      }
      
      const folderPath = await window.electronAPI.selectFolder();
      console.log('选择的文件夹路径:', folderPath);
      
      if (folderPath) {
        this.projectData.selectedFolder = folderPath;
        this.updateFolderDisplay();
        this.saveProjectData();
        console.log('文件夹选择成功');
      } else {
        console.log('用户取消了文件夹选择');
      }
    } catch (error) {
      console.error('选择文件夹失败:', error);
      alert(`选择文件夹失败: ${error.message}`);
    }
  }

  updateFolderDisplay() {
    const selectedFolderElement = document.getElementById('selected-folder');
    if (selectedFolderElement) {
      selectedFolderElement.textContent = this.projectData.selectedFolder || '未选择文件夹';
    }
    
    // 更新下一步按钮状态
    this.updateNextButtonState();
  }

  updateNextButtonState() {
    const nextButton = document.getElementById('next-step-1');
    if (nextButton) {
      const canProceed = this.projectData.projectName && this.projectData.selectedFolder;
      nextButton.disabled = !canProceed;
    }
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.goToStep(this.currentStep + 1);
    }
  }

  goToStep(stepNumber) {
    console.log(`切换到步骤 ${stepNumber}`);
    // 这里可以添加步骤切换逻辑
  }

  async loadStoredData() {
    try {
      const storedData = await window.electronAPI.getStoredData();
      if (storedData && Object.keys(storedData).length > 0) {
        this.projectData = { ...this.projectData, ...storedData };
        this.updateFolderDisplay();
      }
    } catch (error) {
      console.warn('加载存储数据失败:', error);
    }
  }

  async saveProjectData() {
    try {
      await window.electronAPI.saveStoredData(this.projectData);
    } catch (error) {
      console.warn('保存项目数据失败:', error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KDPPictureBookGenerator();
});
