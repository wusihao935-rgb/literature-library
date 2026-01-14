// 前端 Supabase 认证服务
import { createClient } from '@supabase/supabase-js';

// 从 Vite 环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 用户类型
export interface User {
    id: string;
    email: string | undefined;
    name: string | undefined;
    avatar: string | undefined;
}

// 将 Supabase 用户转换为应用用户格式
function transformUser(supabaseUser: any): User | null {
    if (!supabaseUser) return null;

    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
    };
}

// 使用 Google 登录
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
        },
    });

    return { error: error as Error | null };
}

// 登出
export async function signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error as Error | null };
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return transformUser(user);
}

// 获取当前会话
export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(transformUser(session?.user || null));
    });
}
