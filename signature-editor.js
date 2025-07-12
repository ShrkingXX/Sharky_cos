// 全局变量
let selectedImage = '';
let customSignature = ''; // 用户输入的祝福语
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentBrushSize = 5;
let artisticName = '';

// 签名调整参数
let signatureX = 80; // 位置X (百分比)
let signatureY = 80; // 位置Y (百分比)
let signatureSize = 100; // 大小 (百分比)
let signatureOpacity = 100; // 透明度 (百分比)
let signatureRotation = 0; // 旋转角度
let toSignColor = '#333333'; // To签颜色

// DOM 元素
const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const selectedImageElement = document.getElementById('selected-image');
const nameInput = document.getElementById('name-input');
const generateNameBtn = document.getElementById('generate-name-btn');
const signatureInput = document.getElementById('signature-input');
const generateSignatureBtn = document.getElementById('generate-signature-btn');
const signatureOverlay = document.getElementById('signature-overlay');
const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');

// 字体face引入
const style = document.createElement('style');
style.innerHTML = `
@font-face {
  font-family: 'Allura';
  src: url('./Allura-Regular.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'ZhiMangXing';
  src: url('./ZhiMangXing-Regular.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'AiNiZaiHuangHunRiLuoShouXieTi';
  src: url('./AiNiZaiHuangHunRiLuoShouXieTi-2.ttf') format('truetype');
  font-display: swap;
}
@font-face {
  font-family: 'AaZhuNiWoMingMeiXiangChunTian';
  src: url('./AaZhuNiWoMingMeiXiangChunTian-2.ttf') format('truetype');
  font-display: swap;
}
`;
document.head.appendChild(style);

// 字体映射
const FONT_MAP = {
  default: '"Brush Script MT", cursive, "Noto Sans SC", sans-serif',
  Allura: 'Allura, cursive',
  ZhiMangXing: 'ZhiMangXing, "Noto Sans SC", sans-serif',
  AiNiZaiHuangHunRiLuoShouXieTi: 'AiNiZaiHuangHunRiLuoShouXieTi, "Noto Sans SC", sans-serif',
  AaZhuNiWoMingMeiXiangChunTian: 'AaZhuNiWoMingMeiXiangChunTian, "Noto Sans SC", sans-serif'
};
let selectedFontKey = 'default';
let selectedFontFamily = FONT_MAP['default'];

// 字体选择事件
function setupFontPreviewEvents() {
  document.querySelectorAll('.font-preview-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.font-preview-item').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      selectedFontKey = this.getAttribute('data-font');
      selectedFontFamily = FONT_MAP[selectedFontKey];
      // 重新渲染To签和祝福语预览
      showArtisticName();
      showSignaturePreview();
    });
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    setupCanvas();
    setupFontPreviewEvents();
});

// 初始化页面
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    selectedImage = urlParams.get('image') || 'image1.jpg';
    selectedImageElement.src = selectedImage;
    
    // 等待图片加载完成后设置画布尺寸
    selectedImageElement.onload = function() {
        const container = document.querySelector('.image-container');
        const containerRect = container.getBoundingClientRect();
        
        // 计算3:4比例的画布尺寸
        const containerWidth = containerRect.width;
        const containerHeight = containerWidth * (4/3); // 3:4比例
        
        // 设置画布尺寸
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // 调整画布样式以匹配图片
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.aspectRatio = '3/4';
        
        // 初始化画布背景为透明
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
}

// 设置事件监听器
function setupEventListeners() {
    // 工具按钮
    document.getElementById('pen-tool').addEventListener('click', () => setTool('pen'));
    document.getElementById('eraser-tool').addEventListener('click', () => setTool('eraser'));
    document.getElementById('clear-canvas').addEventListener('click', clearCanvas);
    
    // 颜色选择器
    document.getElementById('color-picker').addEventListener('change', (e) => {
        currentColor = e.target.value;
    });
    
    // 画笔大小
    document.getElementById('brush-size').addEventListener('input', (e) => {
        currentBrushSize = e.target.value;
        document.getElementById('brush-size-value').textContent = currentBrushSize;
    });
    
    // 生成艺术字体按钮
    generateNameBtn.addEventListener('click', generateArtisticName);
    
    // To签颜色选择器
    document.getElementById('to-sign-color').addEventListener('change', (e) => {
        toSignColor = e.target.value;
        if (artisticName) {
            showArtisticName();
        }
        // 同步更新祝福语颜色
        showSignaturePreview();
    });
    
    // 生成祝福语按钮
    generateSignatureBtn.addEventListener('click', generateCustomSignature);
    
    // 签名调整控制
    document.getElementById('signature-x').addEventListener('input', updateSignaturePosition);
    document.getElementById('signature-y').addEventListener('input', updateSignaturePosition);
    document.getElementById('signature-size').addEventListener('input', updateSignatureSize);
    document.getElementById('signature-opacity').addEventListener('input', updateSignatureOpacity);
    document.getElementById('signature-rotation').addEventListener('input', updateSignatureRotation);
    document.getElementById('reset-signature').addEventListener('click', resetSignature);
    
    // 只保留保存图片按钮
    document.getElementById('save-btn').addEventListener('click', saveImage);
}

// 设置画布
function setupCanvas() {
    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 触摸事件（移动端支持）
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

// 设置工具
function setTool(tool) {
    currentTool = tool;
    
    // 更新按钮状态
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tool === 'pen') {
        document.getElementById('pen-tool').classList.add('active');
        canvas.style.cursor = 'crosshair';
    } else if (tool === 'eraser') {
        document.getElementById('eraser-tool').classList.add('active');
        canvas.style.cursor = 'crosshair';
    }
}

// 开始绘制
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

// 绘制
function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (currentTool === 'pen') {
        ctx.strokeStyle = currentColor;
    } else if (currentTool === 'eraser') {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
        ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// 停止绘制
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
}

// 触摸事件处理
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// 清空画布
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 生成艺术字体
function generateArtisticName() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('请输入cn！');
        return;
    }
    
    artisticName = 'To ' + name + ':';
    
    // 显示艺术字体
    showArtisticName();
    
    // 显示成功消息
    showMessage('To签生成成功！');
}

// 显示艺术字体
function showArtisticName() {
    if (!artisticName) return;
    
    // 清除之前的艺术字体
    const existingName = signatureOverlay.querySelector('.artistic-name');
    if (existingName) {
        existingName.remove();
    }
    
    // 创建艺术字体元素
    const nameElement = document.createElement('div');
    nameElement.className = 'artistic-name';
    nameElement.textContent = artisticName;
    nameElement.style.position = 'absolute';
    nameElement.style.top = '5%';
    nameElement.style.left = '5%';
    nameElement.style.fontSize = 'clamp(16px, 4vw, 24px)';
    nameElement.style.zIndex = '15';
    nameElement.style.pointerEvents = 'none';
    nameElement.style.transform = 'rotate(-5deg)';
    nameElement.style.textShadow = `2px 2px 4px rgba(0, 0, 0, 0.3)`;
    nameElement.style.color = toSignColor;
    nameElement.style.fontFamily = selectedFontFamily;
    
    signatureOverlay.appendChild(nameElement);
    showWatermarkPreview();
}

// 生成祝福语
function generateCustomSignature() {
    const signature = signatureInput.value.trim();
    if (!signature) {
        alert('请输入祝福语！');
        return;
    }
    
    customSignature = signature;
    
    // 显示签名控制面板
    document.getElementById('signature-controls').style.display = 'block';
    
    // 显示祝福语预览
    showSignaturePreview();
    
    // 显示成功消息
    showMessage('祝福语生成成功！');
}

// 显示签名预览
function showSignaturePreview() {
    if (!customSignature) return;
    
    // 清除之前的签名预览
    const existingSignature = signatureOverlay.querySelector('.signature-preview');
    if (existingSignature) {
        existingSignature.remove();
    }
    
    // 创建签名预览元素
    const signatureElement = document.createElement('div');
    signatureElement.className = 'signature-preview';
    signatureElement.textContent = customSignature;
    signatureElement.style.position = 'absolute';
    signatureElement.style.left = signatureX + '%';
    signatureElement.style.top = signatureY + '%';
    signatureElement.style.transform = `translate(-50%, -50%) scale(${signatureSize / 100}) rotate(${signatureRotation}deg)`;
    signatureElement.style.fontSize = 'clamp(14px, 3vw, 20px)';
    signatureElement.style.fontFamily = selectedFontFamily;
    signatureElement.style.color = toSignColor;
    signatureElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
    signatureElement.style.zIndex = '15';
    signatureElement.style.pointerEvents = 'none';
    signatureElement.style.opacity = signatureOpacity / 100;
    signatureElement.style.textAlign = 'center';
    signatureElement.style.whiteSpace = 'nowrap';
    signatureElement.style.maxWidth = '200px';
    signatureElement.style.overflow = 'hidden';
    signatureElement.style.textOverflow = 'ellipsis';
    
    signatureOverlay.appendChild(signatureElement);
    showWatermarkPreview();
}

// 渲染最终图片到画布
function renderFinalImage(targetCanvas, targetCtx) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // 计算原图中最大3:4区域，居中裁剪
            let cropWidth, cropHeight, sx, sy;
            const imgAspect = img.width / img.height;
            const targetAspect = 3 / 4;
            if (imgAspect > targetAspect) {
                cropHeight = img.height;
                cropWidth = cropHeight * targetAspect;
                sx = (img.width - cropWidth) / 2;
                sy = 0;
            } else {
                cropWidth = img.width;
                cropHeight = cropWidth / targetAspect;
                sx = 0;
                sy = (img.height - cropHeight) / 2;
            }
            targetCanvas.width = cropWidth;
            targetCanvas.height = cropHeight;
            targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
            targetCtx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            // 绘制用户手绘内容（需等比缩放到高分辨率canvas）
            const drawingCanvas = document.getElementById('drawing-canvas');
            targetCtx.drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height, 0, 0, cropWidth, cropHeight);

            // 判断是否为手机端
            const isMobile = window.innerWidth <= 768;
            const previewCanvas = document.getElementById('drawing-canvas');
            const scaleX = cropWidth / previewCanvas.width;
            const scaleY = cropHeight / previewCanvas.height;
            let toFontSize, sigFontSize, toX, toY, toShadowBlur, toShadowOffset, watermarkFontSize, watermarkX, watermarkY;
            if (isMobile) {
                // 手机端参数（与CSS一致）
                toFontSize = 18 * scaleX; // .font-preview-item font-size
                sigFontSize = 18 * scaleX; // 祝福语同样用18px
                toX = 0.05 * cropWidth; // 左上角5%
                toY = 0.10 * cropHeight; // 顶部10%
                toShadowBlur = 2 * scaleX;
                toShadowOffset = 1 * scaleX;
                watermarkFontSize = toFontSize * 2 / 3;
                watermarkX = cropWidth * 0.95;
                watermarkY = cropHeight * 0.95;
            } else {
                // 桌面端参数（与原有一致）
                const pageWidth = document.documentElement.clientWidth;
                const toMin = 16, toMax = 24, toVw = pageWidth * 0.04;
                toFontSize = Math.max(toMin, Math.min(toVw, toMax)) * scaleX;
                const sigMin = 14, sigMax = 20, sigVw = pageWidth * 0.03;
                sigFontSize = Math.max(sigMin, Math.min(sigVw, sigMax)) * scaleX;
                toX = 20 * scaleX;
                toY = 50 * scaleY;
                toShadowBlur = 4 * scaleX;
                toShadowOffset = 2 * scaleX;
                watermarkFontSize = toFontSize * 2 / 3;
                watermarkX = cropWidth * 0.95;
                watermarkY = cropHeight * 0.95;
            }

            // 绘制To签
            if (artisticName) {
                targetCtx.font = `${toFontSize}px ${selectedFontFamily}`;
                targetCtx.fillStyle = toSignColor;
                targetCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                targetCtx.shadowBlur = toShadowBlur;
                targetCtx.shadowOffsetX = toShadowOffset;
                targetCtx.shadowOffsetY = toShadowOffset;
                targetCtx.save();
                targetCtx.translate(toX, toY);
                targetCtx.rotate(-5 * Math.PI / 180);
                targetCtx.fillText(artisticName, 0, 0);
                targetCtx.restore();
            }
            // 绘制签名
            if (customSignature) {
                targetCtx.font = `${sigFontSize}px ${selectedFontFamily}`;
                targetCtx.fillStyle = toSignColor;
                targetCtx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                targetCtx.shadowBlur = toShadowBlur;
                targetCtx.shadowOffsetX = toShadowOffset;
                targetCtx.shadowOffsetY = toShadowOffset;
                targetCtx.textAlign = 'center';
                targetCtx.save();
                targetCtx.globalAlpha = signatureOpacity / 100;
                targetCtx.translate(cropWidth * signatureX / 100, cropHeight * signatureY / 100);
                targetCtx.rotate(signatureRotation * Math.PI / 180);
                targetCtx.scale(signatureSize / 100, signatureSize / 100);
                targetCtx.fillText(customSignature, 0, 0);
                targetCtx.restore();
            }
            // 绘制水印
            const watermarkText = 'From 翠翠鲨';
            targetCtx.font = `${watermarkFontSize}px ${selectedFontFamily}`;
            targetCtx.fillStyle = toSignColor;
            targetCtx.textAlign = 'right';
            targetCtx.textBaseline = 'bottom';
            targetCtx.globalAlpha = 0.7;
            targetCtx.save();
            targetCtx.shadowColor = 'rgba(0,0,0,0.15)';
            targetCtx.shadowBlur = toShadowBlur / 2;
            targetCtx.shadowOffsetX = toShadowOffset / 2;
            targetCtx.shadowOffsetY = toShadowOffset / 2;
            targetCtx.fillText(watermarkText, watermarkX, watermarkY);
            targetCtx.restore();
            targetCtx.globalAlpha = 1;
            resolve();
        };
        img.onerror = function(e) {
            console.error('图片加载失败', e);
        };
        img.src = selectedImage;
    });
}

// 保存图片
function saveImage() {
    console.log('点击了保存图片按钮');
    if (!artisticName){
        alert('请先输入cn！');
        console.log('未输入cn，终止保存');
        return;
    }
    if (!customSignature) {
        alert('请先输入祝福语！');
        console.log('未输入祝福语，终止保存');
        return;
    }
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    console.log('开始渲染最终图片');
    renderFinalImage(finalCanvas, finalCtx).then(() => {
        console.log('渲染完成，准备下载图片');
        downloadImage(finalCanvas.toDataURL());
    });
}

// 确认保存
function confirmSave() {
    // 创建最终图片
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    
    // 使用统一的渲染函数
    renderFinalImage(finalCanvas, finalCtx).then(() => {
        // 下载图片
        downloadImage(finalCanvas.toDataURL());
    });
}

// 下载图片
function downloadImage(dataURL) {
    console.log('开始下载图片');
    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('图片保存成功！');
}

// 关闭模态框
function closeModal() {
    previewModal.style.display = 'none';
}



// 更新签名位置
function updateSignaturePosition() {
    signatureX = document.getElementById('signature-x').value;
    signatureY = document.getElementById('signature-y').value;
    
    document.getElementById('signature-x-value').textContent = signatureX + '%';
    document.getElementById('signature-y-value').textContent = signatureY + '%';
    
    showSignaturePreview();
}

// 更新签名大小
function updateSignatureSize() {
    signatureSize = document.getElementById('signature-size').value;
    document.getElementById('signature-size-value').textContent = signatureSize + '%';
    showSignaturePreview();
}

// 更新签名透明度
function updateSignatureOpacity() {
    signatureOpacity = document.getElementById('signature-opacity').value;
    document.getElementById('signature-opacity-value').textContent = signatureOpacity + '%';
    showSignaturePreview();
}

// 更新签名旋转
function updateSignatureRotation() {
    signatureRotation = document.getElementById('signature-rotation').value;
    document.getElementById('signature-rotation-value').textContent = signatureRotation + '°';
    showSignaturePreview();
}

// 重置签名
function resetSignature() {
    signatureX = 80;
    signatureY = 80;
    signatureSize = 100;
    signatureOpacity = 100;
    signatureRotation = 0;
    
    document.getElementById('signature-x').value = signatureX;
    document.getElementById('signature-y').value = signatureY;
    document.getElementById('signature-size').value = signatureSize;
    document.getElementById('signature-opacity').value = signatureOpacity;
    document.getElementById('signature-rotation').value = signatureRotation;
    
    document.getElementById('signature-x-value').textContent = signatureX + '%';
    document.getElementById('signature-y-value').textContent = signatureY + '%';
    document.getElementById('signature-size-value').textContent = signatureSize + '%';
    document.getElementById('signature-opacity-value').textContent = signatureOpacity + '%';
    document.getElementById('signature-rotation-value').textContent = signatureRotation + '°';
    
    showSignaturePreview();
}

// 将十六进制颜色转换为RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// 显示消息
function showMessage(message) {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '12px 24px';
    messageElement.style.borderRadius = '25px';
    messageElement.style.fontWeight = '600';
    messageElement.style.zIndex = '10000';
    messageElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function showWatermarkPreview() {
    // 先移除旧的水印
    const existing = signatureOverlay.querySelector('.watermark-preview');
    if (existing) existing.remove();
    // 只在有To签时显示
    if (!artisticName) return;
    const watermark = document.createElement('div');
    watermark.className = 'watermark-preview';
    watermark.textContent = 'From 翠翠鲨';
    watermark.style.position = 'absolute';
    watermark.style.right = '5%';
    watermark.style.bottom = '5%';
    watermark.style.fontFamily = selectedFontFamily;
    watermark.style.fontSize = 'calc(clamp(16px, 4vw, 24px) * 2 / 3)';
    watermark.style.color = toSignColor;
    watermark.style.opacity = '0.7';
    watermark.style.textShadow = '1px 1px 2px rgba(0,0,0,0.15)';
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '16';
    watermark.style.textAlign = 'right';
    watermark.style.fontWeight = 'normal';
    signatureOverlay.appendChild(watermark);
}
