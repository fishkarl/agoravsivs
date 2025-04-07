// Global variables for charts
let architectureChart;
let networkChart;
let scenarioChart;
let platformChart;
let radarChart;

// Current language
let currentLanguage = 'zh'; // Default language is Chinese

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Set up language selector
  setupLanguageSelector();
  
  // Load default language
  loadLanguage(currentLanguage);
  
  // Initialize charts
  initCharts();
  
  // Handle window resize for responsive charts
  window.addEventListener('resize', function() {
    if (platformChart && radarChart) {
      platformChart.resize();
      radarChart.resize();
    }
  });
});

// Set up language selector
function setupLanguageSelector() {
  // 获取所有语言按钮
  const languageButtons = document.querySelectorAll('.language-btn');
  
  // 为每个按钮添加点击事件
  languageButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 获取按钮的data-lang属性值
      const lang = this.getAttribute('data-lang');
      
      // 移除所有按钮的active类
      languageButtons.forEach(btn => btn.classList.remove('active'));
      
      // 为当前点击的按钮添加active类
      this.classList.add('active');
      
      // 加载对应语言
      loadLanguage(lang.split('-')[0]); // 只取语言代码的第一部分，如zh-CN取zh
    });
  });
  
  // 获取语言选择下拉菜单
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    // 为下拉菜单添加change事件
    languageSelector.addEventListener('change', function() {
      // 获取选中的语言值
      const lang = this.value;
      
      // 加载对应语言
      loadLanguage(lang);
    });
  }
}

// Load language data and update UI
async function loadLanguage(lang) {
  try {
    // 确保使用正确的语言代码格式
    // 将zh-CN, en-US等格式转换为zh, en等格式，以匹配locales目录下的文件名
    const langCode = lang.split('-')[0];
    
    const response = await fetch(`locales/${langCode}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load language file: ${response.status}`);
    }
    
    const data = await response.json();
    currentLanguage = langCode;
    updatePageContent(data);
    updateCharts(data);
    // 更新语言选择下拉菜单的选中值
    const languageSelector = document.getElementById('language-selector');    
    // 更新语言按钮状态
    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(btn => {
      if (btn.getAttribute('data-lang').startsWith(langCode)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  } catch (error) {
    console.error('Error loading language:', error);
  }
}

// Update page content with translated text
function updatePageContent(data) {
    console.log('updatePageContent called with data:', data);
  // Update page title
  document.title = data.page_title;
  
  // Update header
  document.querySelector('h1').textContent = data.header.title;
  document.querySelector('.subtitle').textContent = data.header.subtitle;
  
  // Update sections
  updateSection('architecture', data.sections.architecture);
  updateSection('audio_video', data.sections.audio_video);
  updateSection('network', data.sections.network);
  updateSection('platform', data.sections.platform);
  updateSection('scenarios', data.sections.scenarios);
  updateSection('demo', data.sections.demo);
  updateSection('device_coverage', data.sections.device_coverage);
  updateSection('conclusion', data.sections.conclusion);
  
  // Update footer
  const footerParagraphs = document.querySelectorAll('footer p');
  if (footerParagraphs.length >= 2) {
    footerParagraphs[0].innerHTML = data.footer.data_source;
    footerParagraphs[1].innerHTML = data.footer.last_update;
  }
  
  // Update language selector
  updateLanguageSelector(data.language_selector);
}

// Update a specific section with translated content
function updateSection(sectionId, sectionData) {
  const section = document.getElementById(sectionId);
  if (!section || !sectionData) {
    console.log(`Section ${sectionId} or its data not found`);
    return;
  }
  
  console.log(`Updating section: ${sectionId}`);
  
  // Update section title
  const title = section.querySelector('h2');
  if (title) title.textContent = sectionData.title;
  
  // Update section overview
  const overview = section.querySelector('p');
  if (overview) overview.innerHTML = sectionData.overview;
  
  // Handle specific section content
  switch (sectionId) {
    case 'audio_video':
      updateAudioVideoSection(section, sectionData);
      break;
    case 'scenarios':
      updateScenariosSection(section, sectionData);
      break;
    case 'demo':
      updateDemoSection(section, sectionData);
      break;
    case 'conclusion':
      updateConclusionSection(section, sectionData);
      break;
    case 'device_coverage':
      updateDeviceCoverageSection(section, sectionData);
      break;
  }
}

function updateRadarSection(section, sectionData) {
  console.log('Updating radar section with:', sectionData);
  
  if (!radarChart || !sectionData.radar_indicators) {
    console.log('Radar chart or radar indicators not found');
    return;
  }
  
  // 获取雷达图配置
  const option = radarChart.getOption();
  
  // 更新雷达图标题
  if (sectionData.radar_title) {
    option.title[0].text = sectionData.radar_title;
  }
  
  // 更新雷达图图例
  if (sectionData.agora_label && sectionData.ivs_label) {
    option.legend[0].data[0] = sectionData.agora_label;
    option.legend[0].data[1] = sectionData.ivs_label;
    option.series[0].data[0].name = sectionData.agora_label;
    option.series[0].data[1].name = sectionData.ivs_label;
  }
  
  // 更新雷达图指标名称
  if (sectionData.radar_indicators && sectionData.radar_indicators.length === 7) {
    for (let i = 0; i < 7; i++) {
      option.radar[0].indicator[i].name = sectionData.radar_indicators[i];
    }
  }
  
  // 应用更新后的配置
  radarChart.setOption(option);
  console.log('Radar chart updated successfully');
}

// 修改updateRadarChart函数，确保它能够更新雷达图的指标名称
function updateRadarChart(chartData) {
  if (!radarChart) return;
  console.log('Updating radar chart with:', chartData);
  const option = radarChart.getOption();
  option.title[0].text = chartData.title;
  option.legend[0].data[0] = chartData.agora_label;
  option.legend[0].data[1] = chartData.ivs_label;
  option.series[0].data[0].name = chartData.agora_label;
  option.series[0].data[1].name = chartData.ivs_label;
  
  // 更新雷达图指标名称
  if (chartData.indicators && chartData.indicators.length === 7) {
    for (let i = 0; i < 7; i++) {
      option.radar[0].indicator[i].name = chartData.indicators[i];
    }
  }
  
  radarChart.setOption(option);
}

// Update audio/video section
function updateAudioVideoSection(section, sectionData) {
  console.log('Updating audio/video section with:', sectionData);
  const advantageTitles = section.querySelectorAll('h3');
  if (advantageTitles.length >= 2) {
    advantageTitles[0].textContent = sectionData.agora_advantages;
    advantageTitles[1].textContent = sectionData.ivs_advantages;
  }
  
  // Update feature items
  updateFeatureItem(section, 'agora_aec', sectionData.features.agora_aec);
  updateFeatureItem(section, 'agora_codec', sectionData.features.agora_codec);
  updateFeatureItem(section, 'agora_image', sectionData.features.agora_image);
  updateFeatureItem(section, 'ivs_aws', sectionData.features.ivs_aws);
  updateFeatureItem(section, 'ivs_webrtc', sectionData.features.ivs_webrtc);
  updateFeatureItem(section, 'ivs_mobile', sectionData.features.ivs_mobile);
  
  // 更新雷达图
  if (sectionData.radar_indicators) {
    updateRadarSection(section, sectionData);
  }
}

// Update a feature item
function updateFeatureItem(section, featureId, featureData) {
  console.log('Updating feature item:', featureId, 'with:', featureData);
  
  // 直接通过特定的类名或ID来查找元素
  const featureItem = section.querySelector(`.${featureId}`);
  if (!featureItem) {
    console.error(`Feature item with ID ${featureId} not found`);
    return;
  }
  
  // 更新标题和描述
  const titleElement = featureItem.querySelector('.feature-title');
  const descElement = featureItem.querySelector('p');
  
  if (titleElement) {
    titleElement.textContent = featureData.title;
    console.log(`Updated title for ${featureId}: ${featureData.title}`);
  } else {
    console.error(`Title element not found for ${featureId}`);
  }
  
  if (descElement) {
    descElement.innerHTML = featureData.description;
    console.log(`Updated description for ${featureId}`);
  } else {
    console.error(`Description element not found for ${featureId}`);
  }
}

// Update scenarios section
function updateScenariosSection(section, sectionData) {
  const table = section.querySelector('.comparison-table');
  if (!table) return;
  
  // Update table headers
  const headers = table.querySelectorAll('th');
  if (headers.length >= 3) {
    headers[0].textContent = sectionData.table.header.scenario;
    headers[1].textContent = sectionData.table.header.agora;
    headers[2].textContent = sectionData.table.header.ivs;
  }
  
  // Update table rows
  const rows = table.querySelectorAll('tbody tr');
  if (rows.length >= 5) {
    updateTableRow(rows[0], sectionData.table.rows.one_to_one);
    updateTableRow(rows[1], sectionData.table.rows.small_class);
    updateTableRow(rows[2], sectionData.table.rows.large_class);
    updateTableRow(rows[3], sectionData.table.rows.social_live);
    updateTableRow(rows[4], sectionData.table.rows.large_live);
  }
}

// Update a table row
function updateTableRow(row, rowData) {
  const cells = row.querySelectorAll('td');
  if (cells.length >= 3) {
    cells[0].textContent = rowData.scenario;
    cells[1].innerHTML = rowData.agora;
    cells[2].innerHTML = rowData.ivs;
  }
}

// Update demo section
function updateDemoSection(section, sectionData) {
  const placeholder = section.querySelector('.video-placeholder');
  if (placeholder) {
    placeholder.textContent = sectionData.placeholder;
  }
}

// Update conclusion section
function updateConclusionSection(section, sectionData) {
  const titles = section.querySelectorAll('h3');
  const lists = section.querySelectorAll('ul');
  
  if (titles.length >= 2 && lists.length >= 2) {
    titles[0].textContent = sectionData.agora_title;
    titles[1].textContent = sectionData.ivs_title;
    
    updateListItems(lists[0], sectionData.agora_scenarios);
    updateListItems(lists[1], sectionData.ivs_scenarios);
  }
}

// Update list items
function updateListItems(list, items) {
  const listItems = list.querySelectorAll('li');
  for (let i = 0; i < Math.min(listItems.length, items.length); i++) {
    listItems[i].innerHTML = items[i];
  }
}

// Update language selector
function updateLanguageSelector(selectorData) {
  const selector = document.getElementById('language-selector');
  if (!selector) return;
  
  const label = document.querySelector('.language-selector label');
  if (label) label.textContent = selectorData.label;
  
  // Update options if needed
  for (const [code, name] of Object.entries(selectorData.languages)) {
    const option = selector.querySelector(`option[value="${code}"]`);
    if (option) option.textContent = name;
  }
}

// Initialize charts
function initCharts() {
  initArchitectureChart();
  initNetworkChart();
  initScenarioChart();
  initPlatformChart();
  initRadarChart();
}

// Update charts with translated labels
function updateCharts(data) {
  updateArchitectureChart(data.charts.architecture);
  updateNetworkChart(data.charts.network);
  updateScenarioChart(data.charts.scenarios);
  updatePlatformChart(data.charts.platform);
  updateRadarChart(data.charts.radar);
}

// Architecture chart
function initArchitectureChart() {
  const architectureCtx = document.getElementById('architectureChart').getContext('2d');
  architectureChart = new Chart(architectureCtx, {
    type: 'bar',
    data: {
      labels: ['模块化程度', '扩展性设计', '核心设计理念', '跨平台一致性'],
      datasets: [
        {
          label: 'Agora SDK',
          data: [9, 8, 9, 9],
          backgroundColor: 'rgba(9, 157, 253, 0.6)',
          borderColor: 'rgba(9, 157, 253, 1)',
          borderWidth: 1
        },
        {
          label: 'Amazon IVS',
          data: [6, 5, 5, 6],
          backgroundColor: 'rgba(255, 153, 0, 0.6)',
          borderColor: 'rgba(255, 153, 0, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      },
      plugins: {
        title: {
          display: true,
          text: '架构特性评分对比 (满分10分)'
        }
      }
    }
  });
}

function updateArchitectureChart(chartData) {
  if (!architectureChart) return;
  
  architectureChart.data.labels = chartData.labels;
  architectureChart.data.datasets[0].label = chartData.agora_label;
  architectureChart.data.datasets[1].label = chartData.ivs_label;
  architectureChart.options.plugins.title.text = chartData.title;
  
  architectureChart.update();
}

// Network chart
function initNetworkChart() {
  const networkCtx = document.getElementById('networkChart').getContext('2d');
  networkChart = new Chart(networkCtx, {
    type: 'line',
    data: {
      labels: ['极佳网络', '良好网络', '一般网络', '较差网络', '极差网络'],
      datasets: [
        {
          label: 'Agora SDK - 视频质量保持率',
          data: [100, 95, 85, 70, 55],
          borderColor: 'rgba(9, 157, 253, 1)',
          backgroundColor: 'rgba(9, 157, 253, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Amazon IVS - 视频质量保持率',
          data: [100, 80, 50, 10, 5],
          borderColor: 'rgba(255, 153, 0, 1)',
          backgroundColor: 'rgba(255, 153, 0, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: '视频质量保持率 (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: '网络环境'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '不同网络环境下的视频质量表现'
        }
      }
    }
  });
}

function updateNetworkChart(chartData) {
  if (!networkChart) return;
  
  networkChart.data.labels = chartData.labels;
  networkChart.data.datasets[0].label = chartData.agora_label;
  networkChart.data.datasets[1].label = chartData.ivs_label;
  networkChart.options.plugins.title.text = chartData.title;
  networkChart.options.scales.y.title.text = chartData.y_axis;
  networkChart.options.scales.x.title.text = chartData.x_axis;
  
  networkChart.update();
}

// Scenario chart
function initScenarioChart() {
  const scenarioCtx = document.getElementById('scenarioChart').getContext('2d');
  scenarioChart = new Chart(scenarioCtx, {
    type: 'radar',
    data: {
      labels: ['1对1教学', '小班教学', '大班教学', '社交直播', '大规模直播', '白板协作', '互动工具'],
      datasets: [
        {
          label: 'Agora SDK',
          data: [5, 5, 4, 5, 4, 5, 4],
          backgroundColor: 'rgba(9, 157, 253, 0.2)',
          borderColor: 'rgba(9, 157, 253, 0.8)',
          pointBackgroundColor: 'rgba(9, 157, 253, 1)',
          pointRadius: 4
        },
        {
          label: 'Amazon IVS',
          data: [4, 4, 3, 3, 4.5, 2, 2],
          backgroundColor: 'rgba(255, 153, 0, 0.2)',
          borderColor: 'rgba(255, 153, 0, 0.8)',
          pointBackgroundColor: 'rgba(255, 153, 0, 1)',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '不同应用场景表现评分 (满分5星)'
        }
      }
    }
  });
}

function updateScenarioChart(chartData) {
  if (!scenarioChart) return;
  
  scenarioChart.data.labels = chartData.labels;
  scenarioChart.data.datasets[0].label = chartData.agora_label;
  scenarioChart.data.datasets[1].label = chartData.ivs_label;
  scenarioChart.options.plugins.title.text = chartData.title;
  
  scenarioChart.update();
}

// Platform chart (ECharts)
function initPlatformChart() {
  platformChart = echarts.init(document.getElementById('platformChart'));
  const platformOption = {
    title: {
      text: '平台支持对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '平台支持',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 10, name: 'Agora支持的平台', itemStyle: { color: '#099DFD' } },
          { value: 5, name: 'IVS支持的平台', itemStyle: { color: '#FF9900' } },
          { value: 5, name: 'Agora独有支持', itemStyle: { color: '#85A3EF' } }
        ]
      }
    ]
  };
  platformChart.setOption(platformOption);
}

function updatePlatformChart(chartData) {
  if (!platformChart) return;
  
  const option = platformChart.getOption();
  option.title[0].text = chartData.title;
  option.series[0].data[0].name = chartData.agora_platforms;
  option.series[0].data[1].name = chartData.ivs_platforms;
  option.series[0].data[2].name = chartData.agora_exclusive;
  
  platformChart.setOption(option);
}

// Radar chart (ECharts)
function initRadarChart() {
  radarChart = echarts.init(document.getElementById('radarChart'));
  const radarOption = {
    title: {
      text: '音视频技术能力对比'
    },
    legend: {
      data: ['Agora SDK', 'Amazon IVS']
    },
    radar: {
      indicator: [
        { name: '音频质量', max: 10 },
        { name: '视频质量', max: 10 },
        { name: '编解码支持', max: 10 },
        { name: '延迟表现', max: 10 },
        { name: '弱网表现', max: 10 },
        { name: '特效能力', max: 10 },
        { name: '开发便捷性', max: 10 }
      ]
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [9, 8, 9, 7, 9, 8, 7],
          name: 'Agora SDK',
          areaStyle: {
            color: 'rgba(9, 157, 253, 0.2)'
          },
          lineStyle: {
            color: 'rgba(9, 157, 253, 0.8)'
          },
          itemStyle: {
            color: 'rgba(9, 157, 253, 1)'
          }
        },
        {
          value: [6, 5, 6, 4, 7, 3, 5],
          name: 'Amazon IVS',
          areaStyle: {
            color: 'rgba(255, 153, 0, 0.2)'
          },
          lineStyle: {
            color: 'rgba(255, 153, 0, 0.8)'
          },
          itemStyle: {
            color: 'rgba(255, 153, 0, 1)'
          }
        }
      ]
    }]
  };
  radarChart.setOption(radarOption);
}

// 更新设备覆盖部分
function updateDeviceCoverageSection(section, sectionData) {
  console.log('Updating device coverage section with:', sectionData);
  if (!section || !sectionData) {
    console.error('Missing section or section data for device coverage');
    return;
  }
  
  // 更新标题和概述
  const title = section.querySelector('h2');
  if (title) title.textContent = sectionData.title;
  
  const overview = section.querySelector('p');
  if (overview) overview.innerHTML = sectionData.overview;
  
  // 更新iOS设备支持部分
  const iosTitles = section.querySelectorAll('h3');
  if (iosTitles.length > 0) {
    iosTitles[0].textContent = sectionData.ios.title;
  }
  
  const iosDesc = section.querySelectorAll('.device-coverage-container > p');
  if (iosDesc.length > 0) {
    iosDesc[0].innerHTML = sectionData.ios.description;
  }
  
  // 更新iOS版本支持标题
  const iosVersionTitles = section.querySelectorAll('.ios-version-title');
  iosVersionTitles.forEach(title => {
    title.textContent = sectionData.ios.version;
  });
  
  // 更新iOS设备兼容性标题
  const iosCompatibilityTitles = section.querySelectorAll('.ios-compatibility-title');
  iosCompatibilityTitles.forEach(title => {
    title.textContent = sectionData.ios.compatibility;
  });
  
  // 更新Agora和IVS的iOS版本支持和设备兼容性内容
  const agoraIosVersion = section.querySelector('.agora-ios-version');
  if (agoraIosVersion) agoraIosVersion.innerHTML = sectionData.ios.agora_version;
  
  const agoraIosCompatibility = section.querySelector('.agora-ios-compatibility');
  if (agoraIosCompatibility) agoraIosCompatibility.innerHTML = sectionData.ios.agora_compatibility;
  
  const ivsIosVersion = section.querySelector('.ivs-ios-version');
  if (ivsIosVersion) ivsIosVersion.innerHTML = sectionData.ios.ivs_version;
  
  const ivsIosCompatibility = section.querySelector('.ivs-ios-compatibility');
  if (ivsIosCompatibility) ivsIosCompatibility.innerHTML = sectionData.ios.ivs_compatibility;
  
  // 更新Android设备支持部分
  if (iosTitles.length > 1) {
    iosTitles[1].textContent = sectionData.android.title;
  }
  
  const androidDesc = section.querySelectorAll('.device-coverage-container > p');
  if (androidDesc.length > 1) {
    androidDesc[1].innerHTML = sectionData.android.description;
  }
  
  // 更新Android版本支持标题
  const androidVersionTitles = section.querySelectorAll('.android-version-title');
  androidVersionTitles.forEach(title => {
    title.textContent = sectionData.android.version;
  });
  
  // 更新Android设备覆盖标题
  const androidCoverageTitles = section.querySelectorAll('.android-coverage-title');
  androidCoverageTitles.forEach(title => {
    title.textContent = sectionData.android.coverage;
  });
  
  // 更新Agora和IVS的Android版本支持和设备覆盖内容
  const agoraAndroidVersion = section.querySelector('.agora-android-version');
  if (agoraAndroidVersion) agoraAndroidVersion.innerHTML = sectionData.android.agora_version;
  
  const agoraAndroidCoverage = section.querySelector('.agora-android-coverage');
  if (agoraAndroidCoverage) agoraAndroidCoverage.innerHTML = sectionData.android.agora_coverage;
  
  const ivsAndroidVersion = section.querySelector('.ivs-android-version');
  if (ivsAndroidVersion) ivsAndroidVersion.innerHTML = sectionData.android.ivs_version;
  
  const ivsAndroidCoverage = section.querySelector('.ivs-android-coverage');
  if (ivsAndroidCoverage) ivsAndroidCoverage.innerHTML = sectionData.android.ivs_coverage;
}

// 在文件末尾添加以下代码

// 视频播放功能
function initVideoPlayer() {
  console.log('初始化视频播放器...');
  
  const videoContainer = document.getElementById('video-container');
  const videoPreview = document.getElementById('video-preview');
  const playButton = document.getElementById('video-play-button');
  const iframeContainer = document.getElementById('video-iframe-container');
  
  if (!videoContainer || !videoPreview || !playButton || !iframeContainer) {
    console.error('视频元素未找到:', {
      container: !!videoContainer,
      preview: !!videoPreview,
      button: !!playButton,
      iframe: !!iframeContainer
    });
    return;
  }
  
  console.log('找到视频元素，添加事件监听器');
  
  const loadVideo = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('加载视频...');
    
    // 创建iframe
    const iframe = document.createElement('iframe');
    iframe.src = "https://qiuyanli1.oss-cn-shanghai.aliyuncs.com/3%E6%9C%8826%E6%97%A5%282%29.mp4";
    iframe.setAttribute('allowfullscreen', '');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // 清空并添加iframe
    iframeContainer.innerHTML = '';
    iframeContainer.appendChild(iframe);
    
    // 显示视频，隐藏预览
    iframeContainer.style.display = 'block';
    videoPreview.style.display = 'none';
    
    console.log('视频已加载');
  };
  
  // 为播放按钮添加点击事件
  playButton.addEventListener('click', loadVideo);
  
  // 为预览区域添加点击事件（作为备用）
  videoPreview.addEventListener('click', loadVideo);
  
  console.log('视频播放器初始化完成');
}

// 确保在DOM加载完成后初始化视频播放器
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM加载完成，初始化视频播放器');
  // 延迟一点执行，确保所有元素都已渲染
  setTimeout(initVideoPlayer, 500);
});
