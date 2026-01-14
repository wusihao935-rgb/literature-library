import React, { useState } from 'react';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (folder: { name: string; color: string; icon: string }) => void;
}

const COLORS = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'teal', class: 'bg-teal-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'gray', class: 'bg-gray-500' },
];

const ICONS = [
    'folder',
    'science',
    'psychology',
    'biotech',
    'school',
    'computer',
    'calculate',
    'architecture',
];

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [icon, setIcon] = useState('folder');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('请输入文件夹名称');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            onSuccess({ name: name.trim(), color, icon });
            handleClose();
        } catch (err) {
            setError('创建失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setColor('blue');
        setIcon('folder');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#1C2333] rounded-2xl shadow-2xl overflow-hidden">
                {/* 头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">create_new_folder</span>
                        新建文件夹
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-5">
                    {/* 名称输入 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            文件夹名称
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：机器学习"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* 颜色选择 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            选择颜色
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.name)}
                                    className={`w-8 h-8 rounded-full ${c.class} ${color === c.name ? 'ring-2 ring-offset-2 ring-primary' : ''
                                        } transition-all`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 图标选择 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            选择图标
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {ICONS.map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${icon === i
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        } transition-all`}
                                >
                                    <span className="material-symbols-outlined">{i}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    {/* 按钮 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !name.trim()}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '创建中...' : '创建'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateFolderModal;
