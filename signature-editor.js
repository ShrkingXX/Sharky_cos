// Global variables
let selectedImage = '';
let customSignature = '';
let isDrawing = false;
let currentTool = 'pen';
let currentColor = '#000000';
let currentBrushSize = 5;
let artisticName = '';

// Signature adjustment parameters
let signatureX = 80;
let signatureY = 80;
let signatureSize = 100;
let signatureOpacity = 100;
let signatureRotation = 0;
let toSignColor = '#333333';

// DOM elements
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

// Font face imports
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

// Font mapping
const FONT_MAP = {
  default: '"Brush Script MT", cursive, "Noto Sans SC", sans-serif',
  Allura: 'Allura, cursive',
  ZhiMangXing: 'ZhiMangXing, "Noto Sans SC", sans-serif',
  AiNiZaiHuangHunRiLuoShouXieTi: 'AiNiZaiHuangHunRiLuoShouXieTi, "Noto Sans SC", sans-serif',
  AaZhuNiWoMingMeiXiangChunTian: 'AaZhuNiWoMingMeiXiangChunTian, "Noto Sans SC", sans-serif'
};
let selectedFontKey = 'default';
let selectedFontFamily = FONT_MAP['default'];

// Font selection event
function setupFontPreviewEvents() {
  document.querySelectorAll('.font-preview-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.font-preview-item').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      selectedFontKey = this.getAttribute('data-font');
      selectedFontFamily = FONT_MAP[selectedFontKey];
      // Re-render signature preview
      showArtisticName();
      showSignaturePreview();
    });
  });
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    setupCanvas();
    setupFontPreviewEvents();
});

// Initialize page
function initializePage() {
    const urlParams = new URLSearchParams(window.location.search);
    selectedImage = urlParams.get('image') || 'image1.jpg';
    selectedImageElement.src = selectedImage;
    
    // Wait for image to load before setting canvas size
    selectedImageElement.onload = function() {
        const container = document.querySelector('.image-container');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate canvas size for 3:4 aspect ratio
        const containerWidth = containerRect.width;
        const containerHeight = containerWidth * (4/3); // 3:4 aspect ratio
        
        // Set canvas size
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Adjust canvas style to match image
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.aspectRatio = '3/4';
        
        // Initialize canvas background to transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
}

// Set event listeners
function setupEventListeners() {
    // Tool buttons
    document.getElementById('pen-tool').addEventListener('click', () => setTool('pen'));
    document.getElementById('eraser-tool').addEventListener('click', () => setTool('eraser'));
    document.getElementById('clear-canvas').addEventListener('click', clearCanvas);
    
    // Color picker
    document.getElementById('color-picker').addEventListener('change', (e) => {
        currentColor = e.target.value;
    });
    
    // Brush size
    document.getElementById('brush-size').addEventListener('input', (e) => {
        currentBrushSize = e.target.value;
        document.getElementById('brush-size-value').textContent = currentBrushSize;
    });
    
    // Generate artistic font button
    generateNameBtn.addEventListener('click', generateArtisticName);
    
    // Color selector
    document.getElementById('to-sign-color').addEventListener('change', (e) => {
        toSignColor = e.target.value;
        if (artisticName) {
            showArtisticName();
        }
        // Synchronize signature color update
        showSignaturePreview();
    });
    
    // Generate signature button
    generateSignatureBtn.addEventListener('click', generateCustomSignature);
    
    // Signature adjustment controls
    document.getElementById('signature-x').addEventListener('input', updateSignaturePosition);
    document.getElementById('signature-y').addEventListener('input', updateSignaturePosition);
    document.getElementById('signature-size').addEventListener('input', updateSignatureSize);
    document.getElementById('signature-opacity').addEventListener('input', updateSignatureOpacity);
    document.getElementById('signature-rotation').addEventListener('input', updateSignatureRotation);
    document.getElementById('reset-signature').addEventListener('click', resetSignature);
    
    // Only keep save image button
    document.getElementById('save-btn').addEventListener('click', saveImage);
}

// Set canvas
function setupCanvas() {
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events (mobile support)
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
}

// Set tool
function setTool(tool) {
    currentTool = tool;
    
    // Update button state
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

// Start drawing
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

// Draw
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

// Stop drawing
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
}

// Touch event handling
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

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Generate artistic font
function generateArtisticName() {
    const name = nameInput.value.trim();
    if (!name) {
        alert('请输入cn！');
        return;
    }
    
    artisticName = 'To ' + name + ':';
    
    // Show artistic font
    showArtisticName();
    
    // Show success message
    showMessage('cn生成成功！');
}

// Show artistic font
function showArtisticName() {
    if (!artisticName) return;
    
    // Clear previous artistic font
    const existingName = signatureOverlay.querySelector('.artistic-name');
    if (existingName) {
        existingName.remove();
    }
    
    // Create artistic font element
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

// Generate signature
function generateCustomSignature() {
    const signature = signatureInput.value.trim();
    if (!signature) {
        alert('请输入祝福语！');
        return;
    }
    
    customSignature = signature;
    
    // Show signature control panel
    document.getElementById('signature-controls').style.display = 'block';
    
    // Show signature preview
    showSignaturePreview();
    
    // Show success message
    showMessage('祝福语生成成功！');
}

// Show signature preview
function showSignaturePreview() {
    if (!customSignature) return;
    
    // Clear previous signature preview
    const existingSignature = signatureOverlay.querySelector('.signature-preview');
    if (existingSignature) {
        existingSignature.remove();
    }
    
    // Create signature preview element
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

// Render final image to canvas
function renderFinalImage(targetCanvas, targetCtx) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            // Calculate the largest 3:4 area in the original image, center crop
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

            // Draw user-drawn content (needs to be scaled proportionally)
            const drawingCanvas = document.getElementById('drawing-canvas');
            targetCtx.drawImage(drawingCanvas, 0, 0, drawingCanvas.width, drawingCanvas.height, 0, 0, cropWidth, cropHeight);

            // Check if it's a mobile device
            const isMobile = window.innerWidth <= 768;
            const previewCanvas = document.getElementById('drawing-canvas');
            const scaleX = cropWidth / previewCanvas.width;
            const scaleY = cropHeight / previewCanvas.height;
            let toFontSize, sigFontSize, toX, toY, toShadowBlur, toShadowOffset, watermarkFontSize, watermarkX, watermarkY;
            if (isMobile) {
                // Mobile parameters
                toFontSize = 18 * scaleX; // .font-preview-item font-size
                sigFontSize = 18 * scaleX; // Signature uses 18px
                toX = 0.05 * cropWidth; // Top-left 5%
                toY = 0.10 * cropHeight; // Top 10%
                toShadowBlur = 2 * scaleX;
                toShadowOffset = 1 * scaleX;
                watermarkFontSize = toFontSize * 2 / 3;
                watermarkX = cropWidth * 0.95;
                watermarkY = cropHeight * 0.95;
            } else {
                // Desktop parameters
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

            // Draw user name
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
            // Draw signature
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
            // Draw watermark
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
            console.error('Image failed to load', e);
        };
        img.src = selectedImage;
    });
}

// Save image
function saveImage() {
    console.log('Clicked save image button');
    if (!artisticName){
        alert('请先输入cn！');
        console.log('cn not entered, saving aborted');
        return;
    }
    if (!customSignature) {
        alert('请先输入祝福语！');
        console.log('Signature not entered, saving aborted');
        return;
    }
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    console.log('Starting to render final image');
    renderFinalImage(finalCanvas, finalCtx).then(() => {
        console.log('Rendering complete, preparing to download image');
        downloadImage(finalCanvas.toDataURL());
    });
}

// Confirm save
function confirmSave() {
    // Create final image
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    
    // Use unified rendering function
    renderFinalImage(finalCanvas, finalCtx).then(() => {
        // Download image
        downloadImage(finalCanvas.toDataURL());
    });
}

// Download image
function downloadImage(dataURL) {
    console.log('Starting image download');
    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('图片保存成功！');
}

// Close modal
function closeModal() {
    previewModal.style.display = 'none';
}



// Update signature position
function updateSignaturePosition() {
    signatureX = document.getElementById('signature-x').value;
    signatureY = document.getElementById('signature-y').value;
    
    document.getElementById('signature-x-value').textContent = signatureX + '%';
    document.getElementById('signature-y-value').textContent = signatureY + '%';
    
    showSignaturePreview();
}

// Update signature size
function updateSignatureSize() {
    signatureSize = document.getElementById('signature-size').value;
    document.getElementById('signature-size-value').textContent = signatureSize + '%';
    showSignaturePreview();
}

// Update signature opacity
function updateSignatureOpacity() {
    signatureOpacity = document.getElementById('signature-opacity').value;
    document.getElementById('signature-opacity-value').textContent = signatureOpacity + '%';
    showSignaturePreview();
}

// Update signature rotation
function updateSignatureRotation() {
    signatureRotation = document.getElementById('signature-rotation').value;
    document.getElementById('signature-rotation-value').textContent = signatureRotation + '°';
    showSignaturePreview();
}

// Reset signature
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

// Convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Show message
function showMessage(message) {
    // Create message element
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function showWatermarkPreview() {
    // First, remove old watermark
    const existing = signatureOverlay.querySelector('.watermark-preview');
    if (existing) existing.remove();
    // Only show if there is a To sign
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
