import React, { useState, useEffect } from 'react';
import { Paper } from '../../types';

interface EditPaperModalProps {
    isOpen: boolean;
    paper: Paper | null;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Paper>) => void;
    onDelete: (id: string) => void;
}

const EditPaperModal: React.FC<EditPaperModalProps> = ({ isOpen, paper, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [authors, setAuthors] = useState('');
    const [year, setYear] = useState<number | ''>('');
    const [conference, setConference] = useState('');
    const [abstract, setAbstract] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (paper) {
            setTitle(paper.title || '');
            setAuthors(paper.authors || '');
            setYear(paper.year || '');
            setConference(paper.conference || '');
            setAbstract(paper.abstract || '');
        }
    }, [paper]);

    const handleSave = async () => {
        if (!paper) return;

        setLoading(true);
        try {
            onSave(paper.id, {
                title,
                authors,
                year: typeof year === 'number' ? year : undefined,
                conference: conference || undefined,
                abstract: abstract || undefined,
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!paper) return;
        onDelete(paper.id);
        onClose();
    };

    const handleClose = () => {
        setShowDeleteConfirm(false);
        onClose();
    };

    if (!isOpen || !paper) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1C2333] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* 头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span>
                        编辑论文
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="text-xs text-gray-500 uppercase mb-1 block">标题</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 uppercase mb-1 block">作者</label>
                            <input
                                type="text"
                                value={authors}
                                onChange={(e) => setAuthors(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase mb-1 block">年份</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value ? parseInt(e.target.value) : '')}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase mb-1 block">会议/期刊</label>
                        <input
                            type="text"
                            value={conference}
                            onChange={(e) => setConference(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 uppercase mb-1 block">摘要</label>
                        <textarea
                            value={abstract}
                            onChange={(e) => setAbstract(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
                        />
                    </div>

                    {/* 删除确认 */}
                    {showDeleteConfirm ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                                确定要删除这篇论文吗？此操作无法撤销。
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
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
                            删除论文
                        </button>
                    )}
                </div>

                {/* 底部按钮 */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !title.trim()}
                        className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? '保存中...' : '保存'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPaperModal;
