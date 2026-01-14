import React, { useState } from 'react';
import { signInWithGoogle } from '../services/auth';

interface AuthScreenProps {
    onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        const { error } = await signInWithGoogle();

        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // 如果成功，页面会重定向，不需要手动调用 onAuthSuccess
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-background-dark dark:to-gray-800 flex flex-col items-center justify-center p-6">
            {/* Logo 和标题 */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/30 mb-6">
                    <span className="material-symbols-outlined text-white text-4xl">auto_stories</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">文献库</h1>
                <p className="text-gray-500 dark:text-gray-400">您的智能学术研究助手</p>
            </div>

            {/* 登录卡片 */}
            <div className="w-full max-w-sm bg-white dark:bg-[#1C2333] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">欢迎使用</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">使用 Google 账号登录或注册</p>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </p>
                    </div>
                )}

                {/* Google 登录按钮 */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-xl px-6 py-4 text-gray-700 dark:text-gray-200 font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                            <span>正在连接...</span>
                        </>
                    ) : (
                        <>
                            {/* Google Logo */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>使用 Google 账号继续</span>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">arrow_forward</span>
                        </>
                    )}
                </button>

                {/* 分割线 */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-xs text-gray-400 uppercase">或</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>

                {/* 游客模式按钮 */}
                <button
                    onClick={onAuthSuccess}
                    className="w-full flex items-center justify-center gap-3 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary rounded-xl px-6 py-4 text-primary font-medium transition-all"
                >
                    <span className="material-symbols-outlined">person</span>
                    <span>以游客身份继续</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                {/* 提示信息 */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    游客模式下数据仅保存在本地，不会同步到云端
                </p>
            </div>

            {/* 底部信息 */}
            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                    继续即表示您同意我们的
                    <a href="#" className="text-primary hover:underline mx-1">服务条款</a>
                    和
                    <a href="#" className="text-primary hover:underline mx-1">隐私政策</a>
                </p>
            </div>

            {/* 装饰元素 */}
            <div className="fixed top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        </div>
    );
};

export default AuthScreen;
