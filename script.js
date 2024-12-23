document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const previewImage = document.getElementById('previewImage');
    const resultArea = document.getElementById('resultArea');
    const promptResult = document.getElementById('promptResult');
    const promptResultEn = document.getElementById('promptResultEn');
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
                stream: false,
                max_tokens: 3000,
                model: API_CONFIG.model,
                system_prompt: "你是一个专业的图片分析师和AI提示词专家，请从以下几个方面详细分析图片：1. 主题内容描述 2. 构图和视角特点 3. 色彩和光影效果 4. 风格和艺术特征 5. 细节和质感表现。然后生成详细的AI绘画提示词，包含以上所有特点。",
                messages: [
                    {
                        content: [
                            {
                                type: "text",
                                text: "请对这张图片进行专业的艺术分析，包括：1. 主题内容的详细描述 2. 构图方式和视角特点 3. 色彩搭配和光影效果 4. 艺术风格和美学特征 5. 材质和细节表现。然后生成一个包含所有这些特点的详细AI提示词。请分别用[ZH]和[EN]标记提供中英文两个版本，确保两个版本都非常详尽。"
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
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }

            const result = await response.json();
            const content = result.choices[0].message.content;
            
            // 分离中英文结果
            let zhContent = '', enContent = '';
            
            try {
                // 使用更严格的正则表达式来分离内容
                const zhRegex = /\[ZH\]([\s\S]*?)\[EN\]/;
                const enRegex = /\[EN\]([\s\S]*?)(?:\[ZH\]|$)/;
                
                const zhMatch = content.match(zhRegex);
                const enMatch = content.match(enRegex);
                
                if (zhMatch && zhMatch[1]) {
                    zhContent = zhMatch[1].trim();
                }
                
                if (enMatch && enMatch[1]) {
                    enContent = enMatch[1].trim();
                }
                
                // 如果没有找到标记，尝试按段落分割
                if (!zhContent && !enContent) {
                    const paragraphs = content.split('\n\n').filter(p => p.trim());
                    // 检查是否包含中文字符
                    const isChinese = str => /[\u4e00-\u9fa5]/.test(str);
                    
                    paragraphs.forEach(p => {
                        if (isChinese(p)) {
                            zhContent += (zhContent ? '\n\n' : '') + p;
                        } else {
                            enContent += (enContent ? '\n\n' : '') + p;
                        }
                    });
                }
                
                // 确保两种语言都有内容
                if (!zhContent) zhContent = '未能获取中文内容';
                if (!enContent) enContent = 'Content not available in English';
            } catch (error) {
                console.error('Content parsing error:', error);
                zhContent = '内容解析错误';
                enContent = 'Content parsing error';
            }

            // 显示结果
            resultArea.style.display = 'block';
            document.querySelector('.tab-pane[data-lang="zh"]').value = zhContent;
            document.querySelector('.tab-pane[data-lang="en"]').value = enContent;

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

    // 添加标签切换功能
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活动状态
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            
            // 添加当前活动状态
            button.classList.add('active');
            const lang = button.dataset.lang;
            document.querySelector(`.tab-pane[data-lang="${lang}"]`).classList.add('active');
        });
    });

    // 修改复制按钮逻辑
    copyButton.addEventListener('click', () => {
        // 获取当前活动的文本框
        const activeTab = document.querySelector('.tab-pane.active');
        activeTab.select();
        document.execCommand('copy');
        showMessage(activeTab.dataset.lang === 'zh' ? '中文提示词已复制到剪贴板' : 'English prompt copied to clipboard');
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
            // 显示登录模态���
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