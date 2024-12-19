// Firebase 配置
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// 声明全局变量
let auth;
let googleProvider;
let db;
let analytics;

try {
    // 初始化 Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // 初始化服务
    auth = firebase.auth();
    db = firebase.firestore();
    analytics = firebase.analytics();
    
    // 设置持久化
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // 初始化 Google 认证提供程序
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });

    // 监听认证状态
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('用户已登录:', user.email);
            // 记录登录事件
            analytics.logEvent('user_login', {
                method: user.providerData[0].providerId
            });
        } else {
            console.log('用户未登录');
        }
    });

} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase 初始化失败: ' + error.message);
}
  