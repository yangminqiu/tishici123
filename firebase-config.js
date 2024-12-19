// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyCKueOL9Xp4PNvhVJyo1yTul2BhlUVgC7g",
    authDomain: "tishici360-new.firebaseapp.com",
    projectId: "tishici360-new",
    storageBucket: "tishici360-new.firebasestorage.app",
    messagingSenderId: "438059617371",
    appId: "1:438059617371:web:a8ad1ad0b364d1f09fc37e",
    measurementId: "G-SEWE3L82S2"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 设置持久化
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// 获取 Auth 实例
const auth = firebase.auth();

// 配置 Google 认证提供程序
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
  