import React, { useState, useEffect } from 'react';
import { Folder } from '../../types';

interface EditFolderModalProps {
    isOpen: boolean;
    folder: Folder | null;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Folder>) => void;
    onDelete: (id: string) => void;
}

const COLORS = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'teal', class: 'bg-teal-500' },
    { name: 'green', class: 'bg-green-500' },
    { name: 'orange', class: 'bg-orange-500' },
    { name: 'red', class: 'bg-red-500' },
];

const ICONS = ['folder', 'science', 'psychology', 'biotech', 'school', 'computer'];

const EditFolderModal: React.FC<EditFolderModalProps> = ({ isOpen, folder, onClose, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [icon, setIcon] = useState('folder');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (folder) {
            setName(folder.name || '');
            setColor(folder.color || 'blue');
            setIcon(folder.icon || 'folder');
        }
    }, [folder]);

    const handleSave = async () => {
        if (!folder || !name.trim()) return;

        setLoading(true);
        try {
            onSave(folder.id, { name, color, icon });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!folder) return;
        onDelete(folder.id);
        onClose();
    };

    const handleClose = () => {
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen || !folder) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#1C2333] rounded-2xl shadow-2xl overflow-hidden">
                {/* 头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit</span>
                        编辑文件夹
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                            文件夹名称
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">颜色</label>
                        <div className="flex gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.name)}
                                    className={`w-8 h-8 rounded-full ${c.class} ${color === c.name ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">图标</label>
                        <div className="flex gap-2">
                            {ICONS.map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setIcon(i)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${icon === i ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{i}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 删除确认 */}
                    {showDeleteConfirm ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                                确定要删除此文件夹吗？文件夹内的论文不会被删除。
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                                >
                                    确认删除
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            删除文件夹
                        </button>
                    )}

                    {/* 按钮 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading || !name.trim()}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50"
                        >
                            {loading ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditFolderModal;
