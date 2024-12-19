document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const previewImage = document.getElementById('previewImage');
    const resultArea = document.getElementById('resultArea');
    const promptResult = document.getElementById('promptResult');
    const copyButton = document.getElementById('copyButton');
    const analyzeButton = document.getElementById('analyzeButton');

    // API 配置
    const API_CONFIG = {
        url: 'https://ai-maas.wair.ac.cn/maas/v1/chat/completions',
        key: 'h1hp58eek42ek0taidpky6kg',
        model: 'taichu2_mm'
    };

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
        
        // 检查用户是否登录
        if (!auth.currentUser) {
            showMessage('请先登录后再上传图片', 'info');
            const loginModal = document.getElementById('loginModal');
            loginModal.classList.add('show');
            loginModal.hidden = false;
            return;
        }
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect({ target: { files: [file] } });
        }
    });

    // 分析按钮点击事件
    analyzeButton.addEventListener('click', async () => {
        // 检查用户是否登录
        if (!auth.currentUser) {
            // 显示登录提示
            showMessage('请先登录后再使用分析功能', 'info');
            // 显示登录模态框
            const loginModal = document.getElementById('loginModal');
            loginModal.classList.add('show');
            loginModal.hidden = false;
            return;
        }

        try {
            // 禁用按钮并显示加载状态
            analyzeButton.disabled = true;
            analyzeButton.classList.add('loading');
            analyzeButton.textContent = '分析中...';

            // 获取预览图的 base64 数据
            const imageData = previewImage.src;

            // 准备请求数据
            const requestData = {
                temperature: 0.8,
                top_p: 0.9,
                repetition_penalty: 1,
                stream: false, // 改为 false 以获取完整响应
                max_tokens: 3000,
                model: API_CONFIG.model,
                system_prompt: "你是一个专业的图片分析师，请分析图片的风格、构图、色彩、光影等特点，并生成适合AI绘画的详细提示词。",
                messages: [
                    {
                        content: [
                            {
                                type: "text",
                                text: "请分析这张图片的风格特点，并生成适合AI绘画的详细提示词。"
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageData
                                }
                            }
                        ],
                        role: "user"
                    }
                ]
            };

            // 发送请求
            const response = await fetch(API_CONFIG.url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();

            // 显示结果
            resultArea.style.display = 'block';
            promptResult.value = result.choices[0].message.content;

            // 滚动到结果区域
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('分析失败，请重试: ' + error.message);
        } finally {
            // 恢复按钮状态
            analyzeButton.disabled = false;
            analyzeButton.classList.remove('loading');
            analyzeButton.textContent = '开始分析';
        }
    });

    // 复制按钮点击事件
    copyButton.addEventListener('click', () => {
        promptResult.select();
        document.execCommand('copy');
        showMessage('提示词已复制到剪贴板');
    });

    // 添加图片转 base64 函数
    function getBase64Image(img) {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL("image/jpeg");
    }

    // 修改文件选择处理函数
    function handleFileSelect(e) {
        // 检查用户是否登录
        if (!auth.currentUser) {
            // 显示登录提示
            showMessage('请先登录后再上传图片', 'info');
            // 显示登录模态框
            const loginModal = document.getElementById('loginModal');
            loginModal.classList.add('show');
            loginModal.hidden = false;
            // 清空文件选择
            fileInput.value = '';
            return;
        }

        const file = e.target.files[0];
        if (!file) return;

        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) {
            alert('文件大小不能超过 5MB');
            return;
        }

        // 显示预览
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewArea.style.display = 'block';
            resultArea.style.display = 'none';
            
            // 滚动到预览区域
            previewArea.scrollIntoView({ behavior: 'smooth' });
        };
        reader.readAsDataURL(file);
    }

    // 修改消息提示样式
    function showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}); 