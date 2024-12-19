document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const previewImage = document.getElementById('previewImage');
    const resultArea = document.getElementById('resultArea');
    const promptResult = document.getElementById('promptResult');
    const copyButton = document.getElementById('copyButton');

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 处理文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 处理拖拽
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#E5E5E5';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#E5E5E5';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect({ target: { files: [file] } });
        }
    });

    // 复制按钮点击事件
    copyButton.addEventListener('click', () => {
        promptResult.select();
        document.execCommand('copy');
        showMessage('提示词已复制到剪贴板');
    });

    // 处理文件选择
    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 显示预览
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewArea.hidden = false;
        };
        reader.readAsDataURL(file);

        // TODO: 调用API处理图片
        // 这里添加调用API的代码
    }

    // 显示消息
    function showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message success';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}); 