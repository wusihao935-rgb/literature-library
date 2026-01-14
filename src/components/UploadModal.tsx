import React, { useState, useRef, useCallback } from 'react';
import { uploadPdfFile, extractPaperInfo, ExtractedPaperInfo } from '../services/upload';
import { Paper, Folder } from '../../types';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paper: Partial<Paper>) => void;
    folders: Folder[];
}

type UploadStep = 'select' | 'uploading' | 'extracting' | 'preview' | 'saving';

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess, folders }) => {
    const [step, setStep] = useState<UploadStep>('select');
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [extractedInfo, setExtractedInfo] = useState<ExtractedPaperInfo | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 处理文件选择
    const handleFileSelect = useCallback((selectedFile: File) => {
        if (selectedFile.type !== 'application/pdf') {
            setError('请选择 PDF 文件');
            return;
        }
        setFile(selectedFile);
        setError(null);
    }, []);

    // 拖拽处理
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    // 上传并提取
    const handleUpload = async () => {
        if (!file) return;

        try {
            // 上传文件
            setStep('uploading');
            setUploadProgress(0);

            // 模拟进度
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await uploadPdfFile(file);
            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!result) {
                setError('上传失败，请重试');
                setStep('select');
                return;
            }

            setPdfUrl(result.url);

            // 提取信息（传递文件名作为后备）
            setStep('extracting');
            const info = await extractPaperInfo(result.url, file.name);

            // extractPaperInfo 现在总是返回值，不会返回 null
            setExtractedInfo(info);
            setStep('preview');
        } catch (err) {
            setError('处理失败，请重试');
            setStep('select');
        }
    };

    // 保存论文
    const handleSave = async () => {
        if (!extractedInfo) return;

        setStep('saving');

        const newPaper: Partial<Paper> = {
            title: extractedInfo.title,
            authors: extractedInfo.authors,
            year: extractedInfo.year || new Date().getFullYear(),
            arxivId: extractedInfo.arxivId || undefined,
            conference: extractedInfo.conference || undefined,
            abstract: extractedInfo.abstract || undefined,
            type: extractedInfo.type,
            progress: 0,
            imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(extractedInfo.title.substring(0, 2))}&background=3b82f6&color=fff&size=200`,
            pdfUrl: pdfUrl,
            folderId: selectedFolder || undefined,
        };

        onSuccess(newPaper);
        handleClose();
    };

    // 关闭并重置
    const handleClose = () => {
        setStep('select');
        setFile(null);
        setExtractedInfo(null);
        setError(null);
        setUploadProgress(0);
        setPdfUrl('');
        setSelectedFolder('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1C2333] rounded-2xl shadow-2xl overflow-hidden">
                {/* 头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">upload_file</span>
                        上传论文
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* 内容 */}
                <div className="p-6">
                    {/* 选择文件 */}
                    {step === 'select' && (
                        <div className="space-y-4">
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-4xl text-gray-400 mb-3">cloud_upload</span>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">拖拽 PDF 文件到此处</p>
                                <p className="text-sm text-gray-400">或点击选择文件</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                />
                            </div>

                            {file && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file}
                                className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                            >
                                上传并提取信息
                            </button>
                        </div>
                    )}

                    {/* 上传中 */}
                    {step === 'uploading' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 relative">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                    <circle
                                        cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="4"
                                        strokeDasharray={`${uploadProgress * 1.76} 176`}
                                        className="transition-all duration-300"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{uploadProgress}%</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">正在上传文件...</p>
                        </div>
                    )}

                    {/* 提取中 */}
                    {step === 'extracting' && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">AI 正在分析论文...</p>
                            <p className="text-xs text-gray-400">正在提取标题、作者、摘要等信息</p>
                        </div>
                    )}

                    {/* 预览信息 */}
                    {step === 'preview' && extractedInfo && (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-3">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                <span className="text-sm text-green-700 dark:text-green-400">AI 已成功提取论文信息</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">标题</label>
                                    <input
                                        type="text"
                                        value={extractedInfo.title}
                                        onChange={(e) => setExtractedInfo({ ...extractedInfo, title: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">作者</label>
                                        <input
                                            type="text"
                                            value={extractedInfo.authors}
                                            onChange={(e) => setExtractedInfo({ ...extractedInfo, authors: e.target.value })}
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">年份</label>
                                        <input
                                            type="number"
                                            value={extractedInfo.year || ''}
                                            onChange={(e) => setExtractedInfo({ ...extractedInfo, year: parseInt(e.target.value) || null })}
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">会议/期刊</label>
                                    <input
                                        type="text"
                                        value={extractedInfo.conference || ''}
                                        onChange={(e) => setExtractedInfo({ ...extractedInfo, conference: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">文件夹</label>
                                    <select
                                        value={selectedFolder}
                                        onChange={(e) => setSelectedFolder(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                    >
                                        <option value="">未分类</option>
                                        {folders.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {extractedInfo.abstract && (
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase">摘要</label>
                                        <textarea
                                            value={extractedInfo.abstract}
                                            onChange={(e) => setExtractedInfo({ ...extractedInfo, abstract: e.target.value })}
                                            rows={3}
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm resize-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('select')}
                                    className="flex-1 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    重新上传
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-600"
                                >
                                    保存论文
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 保存中 */}
                    {step === 'saving' && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">正在保存...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
