class AuthManager {
    constructor() {
        this.setupEventListeners();
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

            if (password !== confirmPassword) {
                this.showMessage('两次输入的密码不一致', 'error');
                return;
            }

            try {
                await auth.createUserWithEmailAndPassword(email, password);
                this.handleRegisterSuccess();
            } catch (error) {
                console.error('Registration failed:', error);
                this.showMessage(this.getErrorMessage(error), 'error');
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