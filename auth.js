class AuthManager {
    constructor() {
        this.setupEventListeners();
        this.setupAuthStateListener();
    }

    setupAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            const btnLogin = document.getElementById('btnLogin');
            const btnRegister = document.getElementById('btnRegister');
            const userProfile = document.getElementById('userProfile');

            if (user) {
                // 用户已登录：隐藏登录注册按钮，显示用户图标
                btnLogin.style.display = 'none';
                btnRegister.style.display = 'none';
                userProfile.style.display = 'block';
            } else {
                // 用户未登录：显示登录注册按钮，隐藏用户图标
                btnLogin.style.display = 'inline-block';
                btnRegister.style.display = 'inline-block';
                userProfile.style.display = 'none';
            }
        });
    }

    setupEventListeners() {
        // 登录按钮点击事件
        document.getElementById('btnLogin').addEventListener('click', () => {
            const modal = document.getElementById('loginModal');
            modal.classList.add('show');
            modal.hidden = false;
        });

        // 注册按钮点击事件
        document.getElementById('btnRegister').addEventListener('click', () => {
            const modal = document.getElementById('registerModal');
            modal.classList.add('show');
            modal.hidden = false;
        });

        // 登录表单提交
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                this.handleLoginSuccess();
            } catch (error) {
                console.error('Login failed:', error);
                this.showMessage(this.getErrorMessage(error), 'error');
            }
        });

        // 注册表单提交
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // 表单验证
            if (!email || !password || !confirmPassword) {
                this.showMessage('请填写所有必填项', 'error');
                return;
            }

            if (password !== confirmPassword) {
                this.showMessage('两次输入的密码不一致', 'error');
                return;
            }

            try {
                // 显示加载状态
                const submitButton = e.target.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = '注册中...';

                // 创建用户
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // 创建用户文档
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // 关闭模态框
                const modal = document.getElementById('registerModal');
                modal.classList.remove('show');
                modal.hidden = true;

                // 显示成功消息
                this.showMessage('注册成功！');

                // 清空表单
                e.target.reset();
            } catch (error) {
                console.error('Registration failed:', error);
                this.showMessage(this.getErrorMessage(error), 'error');
            } finally {
                // 恢复按钮状态
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });

        // Google 登录
        document.getElementById('googleLogin').addEventListener('click', async () => {
            try {
                await auth.signInWithPopup(googleProvider);
                this.handleLoginSuccess();
            } catch (error) {
                console.error('Google login failed:', error);
                this.showMessage(this.getErrorMessage(error), 'error');
            }
        });

        // 关闭模态框
        document.getElementById('closeLoginModal').addEventListener('click', () => {
            const modal = document.getElementById('loginModal');
            modal.classList.remove('show');
            modal.hidden = true;
        });

        document.getElementById('closeRegisterModal').addEventListener('click', () => {
            const modal = document.getElementById('registerModal');
            modal.classList.remove('show');
            modal.hidden = true;
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const loginModal = document.getElementById('loginModal');
            const registerModal = document.getElementById('registerModal');
            
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
                loginModal.hidden = true;
            }
            if (e.target === registerModal) {
                registerModal.classList.remove('show');
                registerModal.hidden = true;
            }
        });

        // 添加用户菜单点击事件
        const userMenu = document.querySelector('.user-menu');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        userMenu?.addEventListener('click', () => {
            dropdownMenu.hidden = !dropdownMenu.hidden;
        });

        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!userMenu?.contains(e.target)) {
                dropdownMenu.hidden = true;
            }
        });

        // 退出登录
        document.getElementById('btnLogout')?.addEventListener('click', async () => {
            try {
                await auth.signOut();
                this.showMessage('已退出登录');
                dropdownMenu.hidden = true;
            } catch (error) {
                console.error('Logout failed:', error);
                this.showMessage('退出失败，请重试', 'error');
            }
        });
    }

    handleLoginSuccess() {
        const modal = document.getElementById('loginModal');
        modal.classList.remove('show');
        modal.hidden = true;
        this.showMessage('登录成功！');
    }

    handleRegisterSuccess() {
        const modal = document.getElementById('registerModal');
        modal.classList.remove('show');
        modal.hidden = true;
        this.showMessage('注册成功！');
    }

    showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                return '该邮箱已被注册';
            case 'auth/invalid-email':
                return '邮箱格式不正确';
            case 'auth/weak-password':
                return '密码强度太弱';
            case 'auth/user-not-found':
                return '用户不存在';
            case 'auth/wrong-password':
                return '密码错误';
            default:
                return error.message;
        }
    }
}

// 初始化认证管理器
new AuthManager(); 