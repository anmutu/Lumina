class KDPPictureBookGenerator {
  constructor() {
    this.currentStep = 1;
    this.projectData = {
      projectName: '',
      selectedFolder: null,
      images: [],
      selectedImages: []
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
    
    // 初始化完成后，确保按钮状态正确
    setTimeout(() => {
      console.log('初始化完成后的延迟检查...');
      this.updateNextButtonState();
      this.initializeProgress();
      
      // 测试项目名称输入框
      const projectNameInput = document.getElementById('project-name');
      if (projectNameInput) {
        console.log('项目名称输入框当前值:', projectNameInput.value);
        console.log('项目名称输入框是否可见:', projectNameInput.offsetParent !== null);
      }
    }, 200);
  }

  bindEvents() {
    console.log('绑定事件...');
    
    // 文件夹选择
    const selectFolderBtn = document.getElementById('select-folder-btn');
    if (selectFolderBtn) {
      console.log('找到选择文件夹按钮，绑定点击事件');
      selectFolderBtn.addEventListener('click', () => {
        console.log('选择文件夹按钮被点击');
        this.selectFolder();
      });
    } else {
      console.error('未找到选择文件夹按钮!');
    }

    // 项目名称输入
    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
      console.log('找到项目名称输入框，绑定输入事件');
      projectNameInput.addEventListener('input', (e) => {
        this.projectData.projectName = e.target.value.trim();
        console.log('项目名称已更新:', this.projectData.projectName);
        this.saveProjectData();
        this.updateNextButtonState();
        this.validateProjectName();
      });
      
      // 如果已有项目名称，立即更新按钮状态
      if (this.projectData.projectName) {
        projectNameInput.value = this.projectData.projectName;
        this.updateNextButtonState();
      }
      
      // 添加焦点事件来测试输入框是否正常工作
      projectNameInput.addEventListener('focus', () => {
        console.log('项目名称输入框获得焦点');
        this.hideProjectNameValidation();
      });
      
      projectNameInput.addEventListener('blur', () => {
        console.log('项目名称输入框失去焦点，当前值:', projectNameInput.value);
        this.validateProjectName();
      });
      
      // 添加键盘事件，在按下Enter键时也验证
      projectNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.validateProjectName();
          projectNameInput.blur();
        }
      });
    } else {
      console.error('未找到项目名称输入框!');
    }

    // 下一步按钮
    const nextStepBtn = document.getElementById('next-step-1');
    if (nextStepBtn) {
      console.log('找到下一步按钮，绑定点击事件');
      nextStepBtn.addEventListener('click', () => {
        console.log('下一步按钮被点击');
        this.nextStep();
      });
    } else {
      console.error('未找到下一步按钮!');
    }

    // 步骤2的按钮
    const nextStep2Btn = document.getElementById('next-step-2');
    const prevStep2Btn = document.getElementById('prev-step-2');
    if (nextStep2Btn) {
      nextStep2Btn.addEventListener('click', () => this.nextStep());
    }
    if (prevStep2Btn) {
      prevStep2Btn.addEventListener('click', () => this.prevStep());
    }

    // 图片选择控件
    const selectAllCheckbox = document.getElementById('select-all-images');
    const clearSelectionBtn = document.getElementById('clear-selection');
    
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.toggleSelectAll(e.target.checked);
      });
    }
    
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener('click', () => {
        this.clearAllSelection();
      });
    }

    // 排序策略选择
    const sortingRadios = document.querySelectorAll('input[name="sorting"]');
    sortingRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleSortingStrategyChange(e.target.value);
        this.updateRadioOptionStyles();
      });
    });
    
    // 初始化单选按钮样式
    this.updateRadioOptionStyles();

    // 随机选择控件
    const applyRandomBtn = document.getElementById('apply-random');
    const reshuffleRandomBtn = document.getElementById('reshuffle-random');
    
    if (applyRandomBtn) {
      applyRandomBtn.addEventListener('click', () => {
        this.applyRandomSelection();
      });
    }
    
    if (reshuffleRandomBtn) {
      reshuffleRandomBtn.addEventListener('click', () => {
        this.reshuffleRandomSelection();
      });
    }

    // 步骤3的按钮
    const nextStep3Btn = document.getElementById('next-step-3');
    const prevStep3Btn = document.getElementById('prev-step-3');
    if (nextStep3Btn) {
      nextStep3Btn.addEventListener('click', () => this.nextStep());
    }
    if (prevStep3Btn) {
      prevStep3Btn.addEventListener('click', () => this.prevStep());
    }

    // 步骤4的按钮
    const prevStep4Btn = document.getElementById('prev-step-4');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    if (prevStep4Btn) {
      prevStep4Btn.addEventListener('click', () => this.prevStep());
    }
    if (generatePdfBtn) {
      generatePdfBtn.addEventListener('click', () => this.generatePDF());
    }
    
    console.log('事件绑定完成');
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
        console.log('文件夹选择成功，路径:', folderPath);
        this.updateFolderDisplay();
        this.saveProjectData();
        
        // 更新进度
        this.updateProgress('folder', true);
        
        // 加载文件夹中的图片
        await this.loadImagesFromFolder(folderPath);
        
        // 强制更新下一步按钮状态
        setTimeout(() => {
          this.updateNextButtonState();
        }, 100);
      } else {
        console.log('用户取消了文件夹选择');
      }
    } catch (error) {
      console.error('选择文件夹失败:', error);
      alert(`选择文件夹失败: ${error.message}`);
    }
  }

  async loadImagesFromFolder(folderPath) {
    try {
      console.log('开始加载文件夹中的图片...');
      
      // 调用主进程扫描真实图片
      const images = await window.electronAPI.scanImages(folderPath);
      
      // 默认全选所有图片
      images.forEach(img => img.selected = true);
      
      this.projectData.images = images;
      this.projectData.selectedImages = [...images];
      
      console.log(`加载了 ${images.length} 张真实图片，默认全选`);
      this.updateImageGrid();
      
      // 更新全选复选框状态
      this.updateSelectAllCheckbox();
      
      // 分析图片比例
      this.analyzeImageRatios();
      
      // 更新进度
      this.updateProgress('ratio', true);
      
    } catch (error) {
      console.error('加载图片失败:', error);
      alert(`加载图片失败: ${error.message}`);
    }
  }

  updateImageGrid() {
    const imageGrid = document.getElementById('image-grid');
    const imageCount = document.getElementById('image-count');
    const selectedCount = document.getElementById('selected-count');
    
    if (!imageGrid) return;
    
    // 清空现有内容
    imageGrid.innerHTML = '';
    
    // 更新图片数量
    if (imageCount) {
      imageCount.textContent = this.projectData.images.length;
    }
    
    // 修复：正确计算选中的图片数量
    if (selectedCount) {
      const actualSelectedCount = this.projectData.images.filter(img => img.selected).length;
      selectedCount.textContent = actualSelectedCount;
      console.log(`图片网格更新：总图片 ${this.projectData.images.length}，实际选中 ${actualSelectedCount}`);
    }
    
    // 创建图片缩略图
    this.projectData.images.forEach((image, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'image-thumbnail';
      thumbnail.dataset.index = index;
      
      // 创建复选框
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = image.selected;
      checkbox.className = 'image-checkbox';
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        this.toggleImageSelection(index);
      });
      
      // 创建真实的图片元素
      const img = document.createElement('img');
      img.src = `file://${image.path}`;
      img.alt = image.name;
      img.className = 'image-thumbnail-img';
      
      // 添加图片加载错误处理
      img.onerror = () => {
        console.warn(`图片加载失败: ${image.name}`);
        // 如果图片加载失败，显示占位符
        img.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
          <div class="image-name">${image.name}</div>
        `;
        thumbnail.appendChild(placeholder);
      };
      
      // 添加图片名称标签
      const imageName = document.createElement('div');
      imageName.className = 'image-name-label';
      imageName.textContent = image.name;
      
      thumbnail.appendChild(checkbox);
      thumbnail.appendChild(img);
      thumbnail.appendChild(imageName);
      imageGrid.appendChild(thumbnail);
    });
    
    console.log('图片网格已更新');
  }

  toggleImageSelection(index) {
    const image = this.projectData.images[index];
    image.selected = !image.selected;
    
    // 更新选中图片列表
    this.projectData.selectedImages = this.projectData.images.filter(img => img.selected);
    
    // 更新显示
    this.updateImageGrid();
    this.updateSelectAllCheckbox();
    this.saveProjectData();
    
    console.log(`图片 ${image.name} 选择状态已切换为: ${image.selected ? '选中' : '未选中'}`);
  }

  toggleSelectAll(selectAll) {
    this.projectData.images.forEach(img => img.selected = selectAll);
    this.projectData.selectedImages = selectAll ? [...this.projectData.images] : [];
    
    this.updateImageGrid();
    this.saveProjectData();
    
    console.log(`${selectAll ? '全选' : '取消全选'}所有图片`);
  }

  clearAllSelection() {
    this.projectData.images.forEach(img => img.selected = false);
    this.projectData.selectedImages = [];
    
    this.updateImageGrid();
    this.updateSelectAllCheckbox();
    this.saveProjectData();
    
    console.log('已清除所有选择');
  }

  updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all-images');
    if (selectAllCheckbox) {
      const allSelected = this.projectData.images.every(img => img.selected);
      const someSelected = this.projectData.images.some(img => img.selected);
      
      selectAllCheckbox.checked = allSelected;
      selectAllCheckbox.indeterminate = someSelected && !allSelected;
    }
  }

  handleSortingStrategyChange(strategy) {
    console.log('排序策略改变为:', strategy);
    
    const randomSelection = document.getElementById('random-selection');
    
    if (strategy === 'random') {
      randomSelection.style.display = 'block';
    } else {
      randomSelection.style.display = 'none';
      
      if (strategy === 'filename') {
        // 按文件名排序
        this.projectData.images.sort((a, b) => a.name.localeCompare(b.name));
        this.projectData.selectedImages = [...this.projectData.images];
        this.updateImageGrid();
        this.updateSelectAllCheckbox();
        this.saveProjectData();
      } else if (strategy === 'manual') {
        // 手动选择模式，保持当前选择状态
        console.log('切换到手动选择模式');
      }
    }
  }

  applyRandomSelection() {
    const countInput = document.getElementById('random-count');
    const count = parseInt(countInput.value);
    
    if (isNaN(count) || count < 1 || count > this.projectData.images.length) {
      alert(`请输入1到${this.projectData.images.length}之间的数字`);
      return;
    }
    
    // 使用Fisher-Yates洗牌算法，确保真正的随机性
    const shuffled = [...this.projectData.images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const selected = shuffled.slice(0, count);
    
    // 更新选择状态
    this.projectData.images.forEach(img => {
      img.selected = selected.includes(img);
    });
    
    this.projectData.selectedImages = selected;
    this.updateImageGrid();
    this.updateSelectAllCheckbox();
    this.saveProjectData();
    
    console.log(`随机选择了 ${count} 张图片，使用Fisher-Yates算法`);
  }

  reshuffleRandomSelection() {
    // 添加随机种子，确保每次重新随机都不同
    const seed = Date.now() + Math.random();
    this.applyRandomSelection(seed);
  }

  applyRandomSelection(customSeed = null) {
    const countInput = document.getElementById('random-count');
    const count = parseInt(countInput.value);
    
    if (isNaN(count) || count < 1 || count > this.projectData.images.length) {
      alert(`请输入1到${this.projectData.images.length}之间的数字`);
      return;
    }
    
    // 使用Fisher-Yates洗牌算法，确保真正的随机性
    const shuffled = [...this.projectData.images];
    
    // 如果有自定义种子，使用它来生成随机数
    let random = customSeed ? this.seededRandom(customSeed) : Math.random;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const selected = shuffled.slice(0, count);
    
    // 更新选择状态
    this.projectData.images.forEach(img => {
      img.selected = selected.includes(img);
    });
    
    this.projectData.selectedImages = selected;
    this.updateImageGrid();
    this.updateSelectAllCheckbox();
    this.saveProjectData();
    
    console.log(`随机选择了 ${count} 张图片，使用Fisher-Yates算法`);
  }

  // 使用多个随机数生成器组合，确保真正的随机性
  seededRandom(seed) {
    // 使用多个种子值
    let seed1 = seed;
    let seed2 = seed * 16807 % 2147483647; // 线性同余
    let seed3 = seed ^ 0x12345678; // XOR变换
    
    return () => {
      // 组合多个随机数生成器
      seed1 = (seed1 * 1103515245 + 12345) & 0x7fffffff;
      seed2 = (seed2 * 16807) % 2147483647;
      seed3 = seed3 ^ (seed3 << 13);
      seed3 = seed3 ^ (seed3 >> 17);
      seed3 = seed3 ^ (seed3 << 5);
      
      // 混合三个随机数
      const combined = (seed1 + seed2 + seed3) & 0x7fffffff;
      return combined / 0x7fffffff;
    };
  }

  analyzeImageRatios() {
    if (this.projectData.images.length === 0) return;
    
    // 显示比例确认区域
    const ratioConfirmation = document.getElementById('ratio-confirmation');
    if (ratioConfirmation) {
      ratioConfirmation.style.display = 'block';
    }
    
    // 分析第一张图片的比例（假设所有图片比例相同）
    const firstImage = this.projectData.images[0];
    const imagePath = firstImage.path;
    
    // 创建临时图片元素来分析尺寸
    const img = new Image();
    img.onload = () => {
      const aspectRatio = (img.width / img.height).toFixed(2);
      const ratioText = `${img.width} × ${img.height} (${aspectRatio}:1)`;
      
      // 更新检测到的比例
      const detectedRatio = document.getElementById('detected-ratio');
      if (detectedRatio) {
        detectedRatio.textContent = ratioText;
      }
      
      // 根据比例建议书籍尺寸
      this.suggestBookSize(aspectRatio);
      
      // 清理
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      console.warn('无法分析图片比例');
      const detectedRatio = document.getElementById('detected-ratio');
      if (detectedRatio) {
        detectedRatio.textContent = '无法检测';
      }
    };
    
    // 使用file://协议加载图片
    img.src = `file://${imagePath}`;
  }

  suggestBookSize(aspectRatio) {
    const ratio = parseFloat(aspectRatio);
    let suggestedSize = '8.5x11';
    let suggestedRatio = '0.77:1';
    let showWarning = false;
    
    if (Math.abs(ratio - 1) < 0.1) {
      // 接近1:1的比例
      suggestedSize = '8.5x8.5';
      suggestedRatio = '1:1';
    } else if (ratio > 1.2) {
      // 宽幅图片
      suggestedSize = '11x8.5';
      suggestedRatio = '1.29:1';
      showWarning = true;
    } else if (ratio < 0.8) {
      // 竖幅图片
      suggestedSize = '6x9';
      suggestedRatio = '0.67:1';
      showWarning = true;
    }
    
    // 更新建议的比例
    const suggestedRatioElement = document.getElementById('suggested-ratio');
    if (suggestedRatioElement) {
      suggestedRatioElement.textContent = `${suggestedSize} (${suggestedRatio})`;
    }
    
    // 更新书籍尺寸选择器
    const bookSizeSelect = document.getElementById('kdp-size');
    if (bookSizeSelect) {
      bookSizeSelect.value = suggestedSize;
    }
    
    // 显示或隐藏警告
    const ratioWarning = document.getElementById('ratio-warning');
    if (ratioWarning) {
      ratioWarning.style.display = showWarning ? 'block' : 'none';
    }
  }

  validateProjectName() {
    const projectNameInput = document.getElementById('project-name');
    const validationMessage = document.getElementById('project-name-validation');
    
    if (!projectNameInput || !validationMessage) return;
    
    const projectName = projectNameInput.value.trim();
    
    if (!projectName) {
      validationMessage.style.display = 'flex';
      projectNameInput.style.borderColor = '#dc3545';
      projectNameInput.style.boxShadow = '0 0 0 3px rgba(220, 53, 69, 0.1)';
      this.updateProgress('name', false);
    } else {
      this.hideProjectNameValidation();
      this.updateProgress('name', true);
    }
  }

  hideProjectNameValidation() {
    const validationMessage = document.getElementById('project-name-validation');
    const projectNameInput = document.getElementById('project-name');
    
    if (validationMessage) {
      validationMessage.style.display = 'none';
    }
    
    if (projectNameInput) {
      projectNameInput.style.borderColor = '#e9ecef';
      projectNameInput.style.boxShadow = '';
    }
  }

  updateProgress(type, completed) {
    // 更新步骤指示器
    const stepIndicator = document.getElementById(`step-${type}-indicator`);
    if (stepIndicator) {
      if (completed) {
        stepIndicator.classList.add('completed');
      } else {
        stepIndicator.classList.remove('completed');
      }
    }
    
    // 更新进度条和百分比
    this.updateProgressBar();
  }

  updateProgressBar() {
    // 计算完成进度
    let completedSteps = 0;
    const totalSteps = 3;
    
    const hasProjectName = this.projectData.projectName && this.projectData.projectName.trim().length > 0;
    const hasSelectedFolder = this.projectData.selectedFolder && this.projectData.selectedFolder.trim().length > 0;
    const hasRatioAnalysis = hasSelectedFolder && this.projectData.images && this.projectData.images.length > 0;
    
    if (hasProjectName) completedSteps++;
    if (hasSelectedFolder) completedSteps++;
    if (hasRatioAnalysis) completedSteps++;
    
    const percentage = Math.round((completedSteps / totalSteps) * 100);
    
    // 更新进度条
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressText = document.getElementById('progress-text');
    const progressGlow = document.getElementById('progress-glow');
    
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
    
    if (progressPercentage) {
      progressPercentage.textContent = `${percentage}%`;
    }
    
    // 更新进度文本
    if (progressText) {
      let text = '准备开始';
      if (percentage >= 33) text = '项目名称已设置';
      if (percentage >= 66) text = '文件夹已选择';
      if (percentage >= 100) text = '比例分析完成';
      progressText.textContent = text;
    }
    
    // 添加发光效果
    if (progressGlow && percentage > 0) {
      progressGlow.style.width = `${percentage}%`;
      progressGlow.classList.add('active');
      setTimeout(() => {
        progressGlow.classList.remove('active');
      }, 1500);
    }
    
    console.log(`进度更新: ${completedSteps}/${totalSteps} (${percentage}%)`);
  }

  initializeProgress() {
    // 根据当前数据状态初始化进度
    const hasProjectName = this.projectData.projectName && this.projectData.projectName.trim().length > 0;
    const hasSelectedFolder = this.projectData.selectedFolder && this.projectData.selectedFolder.trim().length > 0;
    
    this.updateProgress('name', hasProjectName);
    this.updateProgress('folder', hasSelectedFolder);
    this.updateProgress('ratio', hasSelectedFolder && this.projectData.images && this.projectData.images.length > 0);
    
    // 更新进度条
    this.updateProgressBar();
    
    console.log('进度状态已初始化:', {
      name: hasProjectName,
      folder: hasSelectedFolder,
      ratio: hasSelectedFolder && this.projectData.images && this.projectData.images.length > 0
    });
  }

  updateRadioOptionStyles() {
    const sortingRadios = document.querySelectorAll('input[name="sorting"]');
    sortingRadios.forEach(radio => {
      const radioOption = radio.closest('.radio-option');
      if (radioOption) {
        if (radio.checked) {
          radioOption.classList.add('selected');
        } else {
          radioOption.classList.remove('selected');
        }
      }
    });
  }

  updateFolderDisplay() {
    const selectedFolderElement = document.getElementById('selected-folder');
    if (selectedFolderElement) {
      selectedFolderElement.textContent = this.projectData.selectedFolder || '未选择文件夹';
      console.log('文件夹显示已更新:', this.projectData.selectedFolder);
    }
    
    // 更新下一步按钮状态
    this.updateNextButtonState();
  }

  updateNextButtonState() {
    const nextButton = document.getElementById('next-step-1');
    if (nextButton) {
      // 检查两个条件是否都满足
      const hasProjectName = this.projectData.projectName && this.projectData.projectName.trim().length > 0;
      const hasSelectedFolder = this.projectData.selectedFolder && this.projectData.selectedFolder.trim().length > 0;
      const canProceed = hasProjectName && hasSelectedFolder;
      
      nextButton.disabled = !canProceed;
      console.log('下一步按钮状态更新:', canProceed ? '启用' : '禁用');
      console.log('项目名称:', this.projectData.projectName, '是否有效:', hasProjectName);
      console.log('选择的文件夹:', this.projectData.selectedFolder, '是否有效:', hasSelectedFolder);
      
      // 如果按钮被禁用，添加详细的视觉提示
      if (!canProceed) {
        if (!hasProjectName) {
          nextButton.title = '请先输入项目名称';
        } else if (!hasSelectedFolder) {
          nextButton.title = '请先选择图片文件夹';
        } else {
          nextButton.title = '请完成所有必填项';
        }
      } else {
        nextButton.title = '点击进入下一步';
      }
    } else {
      console.error('未找到下一步按钮!');
    }
  }

  updateProjectSummary() {
    console.log('更新项目摘要...');
    
    const summaryProjectName = document.getElementById('summary-project-name');
    const summarySelectedFolder = document.getElementById('summary-selected-folder');
    const summaryImageCount = document.getElementById('summary-image-count');
    const summaryBookSize = document.getElementById('summary-book-size');
    const summaryPrintingMode = document.getElementById('summary-printing-mode');
    const summaryPageCount = document.getElementById('summary-page-count');
    
    if (summaryProjectName) {
      summaryProjectName.textContent = this.projectData.projectName || '-';
    }
    
    if (summarySelectedFolder) {
      summarySelectedFolder.textContent = this.projectData.selectedFolder || '-';
    }
    
    if (summaryImageCount) {
      const imageCount = this.projectData.selectedImages ? this.projectData.selectedImages.length : 0;
      summaryImageCount.textContent = `${imageCount} 张图片`;
    }
    
    if (summaryBookSize) {
      const bookSizeSelect = document.getElementById('kdp-size');
      const selectedSize = bookSizeSelect ? bookSizeSelect.value : '8.5x11';
      const sizeLabels = {
        '8.5x11': '8.5" × 11" (标准A4)',
        '8.5x8.5': '8.5" × 8.5" (正方形)',
        '11x8.5': '11" × 8.5" (横向)',
        '6x9': '6" × 9" (标准书籍)'
      };
      summaryBookSize.textContent = sizeLabels[selectedSize] || selectedSize;
    }
    
    if (summaryPrintingMode) {
      const printingRadios = document.querySelectorAll('input[name="printing"]');
      let printingMode = '双面印刷';
      printingRadios.forEach(radio => {
        if (radio.checked) {
          printingMode = radio.value === 'single-sided' ? '单面印刷' : '双面印刷';
        }
      });
      summaryPrintingMode.textContent = printingMode;
    }
    
    if (summaryPageCount) {
      const imageCount = this.projectData.selectedImages ? this.projectData.selectedImages.length : 0;
      const printingRadios = document.querySelectorAll('input[name="printing"]');
      let isSingleSided = false;
      printingRadios.forEach(radio => {
        if (radio.checked) {
          isSingleSided = radio.value === 'single-sided';
        }
      });
      
      let pageCount = imageCount;
      if (isSingleSided) {
        pageCount = imageCount * 2; // 每张图片后加空白页
      }
      
      summaryPageCount.textContent = `${pageCount} 页`;
    }
    
    console.log('项目摘要已更新');
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.goToStep(this.currentStep + 1);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  async generatePDF() {
    try {
      console.log('开始生成PDF...');
      
      // 验证项目数据
      if (!this.validateProjectData()) {
        return;
      }
      
      // 获取用户选择的书籍尺寸和印刷方式
      const bookSizeSelect = document.getElementById('kdp-size');
      const selectedSize = bookSizeSelect ? bookSizeSelect.value : '8.5x11';
      
      const printingRadios = document.querySelectorAll('input[name="printing"]');
      let printingMode = 'double-sided';
      printingRadios.forEach(radio => {
        if (radio.checked) {
          printingMode = radio.value;
        }
      });
      
      // 将选择添加到项目数据中
      this.projectData.selectedSize = selectedSize;
      this.projectData.printingMode = printingMode;
      console.log('选择的书籍尺寸:', selectedSize, '印刷方式:', printingMode);
      
      // 显示进度提示
      const generateBtn = document.getElementById('generate-pdf-btn');
      if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = '正在生成...';
      }
      
      // 调用主进程生成PDF
      const result = await window.electronAPI.generatePDF(this.projectData);
      
      if (result.success) {
        console.log('PDF生成成功:', result);
        alert(`🎉 ${result.message}\n\n文件路径: ${result.filePath}`);
      } else {
        console.error('PDF生成失败:', result);
        alert(`❌ ${result.message}`);
      }
      
    } catch (error) {
      console.error('生成PDF失败:', error);
      alert(`生成PDF失败: ${error.message}`);
    } finally {
      // 恢复按钮状态
      const generateBtn = document.getElementById('generate-pdf-btn');
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = '🚀 生成PDF';
      }
    }
  }

  validateProjectData() {
    if (!this.projectData.projectName) {
      alert('请输入项目名称');
      return false;
    }
    
    if (!this.projectData.selectedFolder) {
      alert('请选择图片文件夹');
      return false;
    }
    
    if (!this.projectData.selectedImages || this.projectData.selectedImages.length === 0) {
      alert('请至少选择一张图片');
      return false;
    }
    
    return true;
  }

  goToStep(stepNumber) {
    console.log(`切换到步骤 ${stepNumber}`);
    
    if (stepNumber < 1 || stepNumber > 4) {
      console.error('无效的步骤编号:', stepNumber);
      return;
    }
    
    // 隐藏所有步骤面板
    document.querySelectorAll('.step-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    // 显示目标步骤面板
    const targetPanel = document.getElementById(`step-${stepNumber}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
      console.log(`步骤 ${stepNumber} 面板已激活`);
    } else {
      console.error(`未找到步骤 ${stepNumber} 面板`);
    }
    
    // 更新步骤指示器
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });
    
    const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (targetStep) {
      targetStep.classList.add('active');
      console.log(`步骤指示器已更新到步骤 ${stepNumber}`);
    }
    
    this.currentStep = stepNumber;
    
    // 如果到达步骤4，更新项目摘要
    if (stepNumber === 4) {
      this.updateProjectSummary();
    }
  }

  async loadStoredData() {
    try {
      console.log('加载存储数据...');
      const storedData = await window.electronAPI.getStoredData();
      if (storedData && Object.keys(storedData).length > 0) {
        this.projectData = { ...this.projectData, ...storedData };
        console.log('加载的存储数据:', this.projectData);
        this.updateFolderDisplay();
        
        // 更新项目名称输入框的值
        const projectNameInput = document.getElementById('project-name');
        if (projectNameInput && this.projectData.projectName) {
          projectNameInput.value = this.projectData.projectName;
        }
        
        // 更新下一步按钮状态
        this.updateNextButtonState();
        console.log('存储数据加载成功');
      }
    } catch (error) {
      console.warn('加载存储数据失败:', error);
    }
  }

  async saveProjectData() {
    try {
      console.log('保存项目数据:', this.projectData);
      const result = await window.electronAPI.saveStoredData(this.projectData);
      if (result) {
        console.log('项目数据保存成功');
      } else {
        console.warn('项目数据保存失败');
      }
    } catch (error) {
      console.warn('保存项目数据失败:', error);
    }
  }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM加载完成，开始初始化应用...');
  new KDPPictureBookGenerator();
});
