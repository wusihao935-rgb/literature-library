
import React, { useState, useEffect, useRef } from 'react';
import { Screen, Paper, Author, Folder } from './types';
import { AUTHOR_DATA } from './constants';
import { getPaperInsights, chatAboutPaper } from './services/gemini';
import { papersApi, foldersApi } from './src/services/api';
import { getCurrentUser, onAuthStateChange, signOut, User } from './src/services/auth';
import AuthScreen from './src/components/AuthScreen';
import UploadModal from './src/components/UploadModal';
import CreateFolderModal from './src/components/CreateFolderModal';
import EditPaperModal from './src/components/EditPaperModal';
import EditFolderModal from './src/components/EditFolderModal';
// import PdfReader from './src/components/PdfReader'; // 暂时禁用，使用 iframe 替代

// --- Types ---
interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

// --- Sub-components ---

const BottomNav: React.FC<{ active: Screen; onNavigate: (s: Screen) => void }> = ({ active, onNavigate }) => (
  <nav className="fixed bottom-0 w-full max-w-screen-md left-1/2 -translate-x-1/2 bg-white dark:bg-[#161b26] border-t border-gray-200 dark:border-gray-800 pb-safe pt-2 px-6 flex justify-between items-center z-40">
    {[
      { id: Screen.HOME, icon: 'home', label: '首页' },
      { id: Screen.SEARCH, icon: 'search', label: '搜索' },
      { id: Screen.INSIGHTS, icon: 'auto_awesome', label: '洞察' },
      { id: Screen.HOME, icon: 'person', label: '我的' },
    ].map((item) => (
      <button
        key={item.id + item.label}
        onClick={() => onNavigate(item.id)}
        className={`flex flex-col items-center gap-1 w-16 transition-colors ${active === item.id ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}
      >
        <span className={`material-symbols-outlined ${active === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
        <span className="text-[10px] font-medium">{item.label}</span>
      </button>
    ))}
  </nav>
);

const PaperCard: React.FC<{ paper: Paper; onClick: (p: Paper) => void }> = ({ paper, onClick }) => (
  <div onClick={() => onClick(paper)} className="flex items-center p-3 bg-white dark:bg-[#1C2333] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
    <div className="size-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
      <img src={paper.imageUrl || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" alt={paper.title} />
    </div>
    <div className="ml-4 flex-1 min-w-0">
      <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{paper.title}</h3>
      <p className="text-xs text-gray-500 truncate">{paper.authors} • {paper.year}</p>
      <div className="mt-1 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${paper.progress}%` }}></div>
      </div>
    </div>
    <span className="material-symbols-outlined text-gray-300 ml-2">chevron_right</span>
  </div>
);

const HomeScreen: React.FC<{
  onPaperClick: (p: Paper) => void;
  onFolderClick: (f: Folder) => void;
  onNavigate: (s: Screen) => void;
  onAllPapersClick: () => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  onEditFolderClick: (f: Folder) => void;
  recentPapers: Paper[];
  folders: Folder[];
  loading: boolean;
  user: User;
  onSignOut: () => void;
}> = ({ onPaperClick, onFolderClick, onNavigate, onAllPapersClick, onUploadClick, onCreateFolderClick, onEditFolderClick, recentPapers, folders, loading, user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<'fav' | 'all'>('fav');

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm pt-4 pb-2 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              className="rounded-full size-10 border-2 border-primary/20 object-cover"
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=fff`}
              alt="User"
            />
            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-background-light dark:border-background-dark rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight dark:text-white">文献库</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">欢迎回来，{user.name || user.email?.split('@')[0] || '用户'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center justify-center size-10 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-gray-600 dark:text-gray-300 hover:text-red-600"
            title="登出"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        <div
          onClick={() => onNavigate(Screen.SEARCH)}
          className="flex items-center rounded-xl bg-white dark:bg-[#1C2333] shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden h-12 cursor-pointer"
        >
          <span className="material-symbols-outlined ml-4 text-gray-400">search</span>
          <span className="flex-1 text-base text-gray-400 px-3">搜索标题、作者或关键词...</span>
          <button className="mr-4 text-gray-400 hover:text-primary">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </div>

      <section className="flex flex-col gap-3 py-2">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-bold">最近阅读</h2>
          <button onClick={onAllPapersClick} className="text-sm font-medium text-primary">查看全部</button>
        </div>
        <div className="flex overflow-x-auto no-scrollbar pb-2 px-4 gap-4 snap-x">
          {loading ? (
            <div className="flex items-center justify-center w-full py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : recentPapers.length > 0 ? (
            recentPapers.map((paper) => (
              <div key={paper.id} onClick={() => onPaperClick(paper)} className="snap-center shrink-0 flex flex-col w-64 bg-white dark:bg-[#1C2333] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden group hover:border-primary/50 cursor-pointer transition-all">
                <div className="relative h-32 w-full bg-gray-100 dark:bg-gray-800">
                  <img src={paper.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt={paper.title} />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase">{paper.type}</div>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <h3 className="text-sm font-bold truncate">{paper.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{paper.authors} • {paper.year}</p>
                  <div className="mt-1">
                    <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-1">
                      <span>{paper.progress === 100 ? '已完成' : `已读 ${paper.progress}%`}</span>
                      <span className="text-primary flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">auto_awesome</span>AI 摘要</span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${paper.progress === 100 ? 'bg-green-500' : 'bg-primary'} rounded-full`} style={{ width: `${paper.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 w-full text-gray-500">暂无最近阅读记录</div>
          )}
        </div>
      </section>

      <div className="px-4 py-4">
        <div className="flex p-1 bg-gray-200 dark:bg-[#1C2333] rounded-lg">
          <button
            onClick={() => setActiveTab('fav')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'fav' ? 'bg-white dark:bg-primary text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >收藏夹</button>
          <button
            onClick={() => onAllPapersClick()}
            className={`flex-1 py-1.5 text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white dark:bg-primary text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
          >全部论文</button>
        </div>
      </div>

      <section className="flex flex-col px-4 pb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">文件夹</h2>
          <button
            onClick={onCreateFolderClick}
            className="flex items-center gap-1 text-sm text-primary hover:text-blue-700"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            新建
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => onFolderClick(folder)}
              className="flex items-center p-3 bg-white dark:bg-[#1C2333] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${folder.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                folder.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                  folder.color === 'teal' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                <span className="material-symbols-outlined fill-1">{folder.icon}</span>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <h3 className="text-base font-bold truncate">{folder.name}</h3>
                <p className="text-sm text-gray-500">{folder.count} 篇论文 • {folder.lastAdded}添加</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onEditFolderClick(folder); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <span className="material-symbols-outlined text-gray-400">more_vert</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="fixed bottom-0 w-full max-w-screen-md left-1/2 -translate-x-1/2 h-0 z-30 pointer-events-none">
        <button
          onClick={onUploadClick}
          className="absolute bottom-24 right-5 size-14 bg-primary hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto transform transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[32px]">add</span>
        </button>
      </div>
      <BottomNav active={Screen.HOME} onNavigate={onNavigate} />
    </div>
  );
};

const SearchScreen: React.FC<{ onBack: () => void; onPaperClick: (p: Paper) => void; allPapers: Paper[] }> = ({ onBack, onPaperClick, allPapers }) => {
  const [query, setQuery] = useState('');
  const results = allPapers.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.authors.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      <header className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onBack} className="p-2"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="flex-1 bg-white dark:bg-[#1C2333] h-10 rounded-full flex items-center px-4 border border-gray-200 dark:border-gray-800">
          <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
          <input
            autoFocus
            className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0"
            placeholder="搜索论文..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {query && results.length > 0 ? (
          results.map(paper => <PaperCard key={paper.id} paper={paper} onClick={onPaperClick} />)
        ) : query ? (
          <div className="text-center py-10 text-gray-500">未找到相关结果</div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase">热门搜索</h3>
            <div className="flex flex-wrap gap-2">
              {['Transformer', 'Deep Learning', 'UX Design', 'ResNet'].map(tag => (
                <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-1.5 rounded-full bg-white dark:bg-[#1C2333] border border-gray-200 dark:border-gray-800 text-sm">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FolderDetailScreen: React.FC<{ folder: Folder; onBack: () => void; onPaperClick: (p: Paper) => void; papers: Paper[]; loading: boolean }> = ({ folder, onBack, onPaperClick, papers, loading }) => {
  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
      <header className="flex items-center p-4 gap-4 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onBack} className="p-2"><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${folder.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
            <span className="material-symbols-outlined">{folder.icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold">{folder.name}</h2>
            <p className="text-xs text-gray-500">{papers.length} 篇论文</p>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : papers.length > 0 ? (
          papers.map(paper => <PaperCard key={paper.id} paper={paper} onClick={onPaperClick} />)
        ) : (
          <div className="text-center py-20 text-gray-500">文件夹为空</div>
        )}
      </div>
    </div>
  );
};

const InsightsScreen: React.FC<{ onBack: () => void; onPaperClick: (p: Paper) => void; recommendedPapers: Paper[] }> = ({ onBack, onPaperClick, recommendedPapers }) => (
  <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20">
    <header className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary fill-1">auto_awesome</span>
        AI 文献洞察
      </h2>
      <button onClick={onBack} className="p-2"><span className="material-symbols-outlined">close</span></button>
    </header>
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-2xl text-white shadow-lg">
        <h3 className="text-lg font-bold mb-2">本周阅读趋势</h3>
        <p className="text-sm opacity-80 mb-4">你本周已经掌握了 3 个核心概念，比上周提升了 20%。</p>
        <div className="flex items-end gap-2 h-20">
          {[30, 60, 45, 90, 70, 40, 50].map((h, i) => (
            <div key={i} className="flex-1 bg-white/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase">AI 智能推荐</h3>
        <div className="space-y-3">
          {recommendedPapers.slice(0, 2).map(p => (
            <div key={p.id} onClick={() => onPaperClick(p)} className="p-4 bg-white dark:bg-[#1C2333] rounded-xl border border-gray-100 dark:border-gray-800 flex gap-4 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="size-16 rounded-lg overflow-hidden shrink-0 border border-gray-200 dark:border-gray-800">
                <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-primary text-xs">sparkles</span>
                  <span className="text-[10px] font-bold text-primary uppercase">推荐阅读</span>
                </div>
                <h4 className="text-sm font-bold mb-1">{p.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">这篇论文与你最近研究的 Transformer 架构高度相关，涉及更高效的训练方法。</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ChatModal: React.FC<{ isOpen: boolean; onClose: () => void; paper: Paper }> = ({ isOpen, onClose, paper }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: `你好！我是你的 AI 科研助手。关于《${paper.title}》这篇论文，有什么我可以帮你的吗？你可以问我它的方法论、应用场景或者任何疑惑。` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    const responseText = await chatAboutPaper(paper.title, paper.abstract || "", [], userMsg);

    setMessages(prev => [...prev, { role: 'assistant', text: responseText || "抱歉，我现在无法回答。" }]);
    setIsTyping(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-background-dark animate-fade-in">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-base font-bold">AI 助手</h2>
          <p className="text-[10px] text-gray-500">正在讨论: {paper.title}</p>
        </div>
        <div className="w-10"></div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-gray-100 dark:bg-[#1C2333] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-800'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-[#1C2333] px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-800">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 pb-safe">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1C2333] rounded-2xl px-3 border border-gray-200 dark:border-gray-800 overflow-hidden h-12">
          <input
            className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-0 px-2"
            placeholder="问问 AI..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={`p-2 rounded-full transition-colors ${inputValue.trim() && !isTyping ? 'text-primary' : 'text-gray-400'}`}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ReaderScreen: React.FC<{ paper: Paper; onBack: () => void; onAuthorClick: (a: Author) => void; onEdit: () => void }> = ({ paper, onBack, onAuthorClick, onEdit }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'summary' | 'pdf'>(paper.pdfUrl ? 'pdf' : 'summary');
  const [selectedTextForAI, setSelectedTextForAI] = useState<string>('');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);  // 折叠状态

  // 从论文作者字段动态生成作者对象
  const generateAuthorFromPaper = (): Author => ({
    id: 'dynamic-author',
    name: paper.authors.split(',')[0].trim().split(' et al')[0].trim(),
    role: '论文作者',
    citations: '-',
    hIndex: 0,
    papersCount: 1,
    bio: `${paper.authors} 是《${paper.title}》的作者。`,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(paper.authors.split(',')[0].trim())}&background=3b82f6&color=fff`,
    education: [],
    contributions: [{
      title: paper.title,
      description: paper.abstract || '暂无描述',
      tags: paper.conference ? [paper.conference] : [],
      stats: `${paper.year}年`,
    }],
  });

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const res = await getPaperInsights(paper.title, paper.abstract || "");
      setInsights(res);
      setLoading(false);
    };
    if (paper.abstract) fetchInsights();
    else setInsights({ objective: "暂无摘要，无法分析", methodology: "-", findings: "-", authorInsight: "-" });
  }, [paper]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
      <header className="flex items-center justify-between px-4 py-3 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/50">
        <button onClick={onBack} className="size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 text-center mx-2 truncate flex flex-col items-center">
          <span className="text-sm font-bold opacity-90">{paper.title}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">阅读模式</span>
        </div>
        <div className="flex items-center gap-1">
          {/* 视图切换按钮 */}
          {paper.pdfUrl && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'summary' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500'}`}
              >
                摘要
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'pdf' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500'}`}
              >
                全文
              </button>
            </div>
          )}
          <button onClick={onEdit} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
            <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">edit</span>
          </button>
          <span className="material-symbols-outlined p-2 text-gray-600 dark:text-gray-300">bookmark_border</span>
        </div>
      </header>

      {/* 主内容区域 */}
      {viewMode === 'pdf' && paper.pdfUrl ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 使用 iframe 显示 PDF */}
          <iframe
            src={paper.pdfUrl}
            className="flex-1 w-full border-0"
            title={paper.title}
          />
          {/* 底部 AI 按钮 */}
          <div className="shrink-0 p-4 bg-white dark:bg-[#1C2333] border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <button
              onClick={() => setIsChatOpen(true)}
              className="py-3 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">chat_spark</span>
              询问 AI 分析论文
            </button>
          </div>
        </div>
      ) : (
        <main className="flex-1 overflow-y-auto no-scrollbar pb-[45vh]">
          <div className="px-5 py-6 max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold leading-tight mb-3 text-gray-900 dark:text-white">{paper.title}</h1>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
                <span className="text-primary cursor-pointer hover:underline" onClick={() => onAuthorClick(generateAuthorFromPaper())}>{paper.authors}</span>
                <span>•</span>
                <span>{paper.year}</span>
                {paper.arxivId && (
                  <>
                    <span>•</span>
                    <span>arXiv:{paper.arxivId}</span>
                  </>
                )}
                {paper.conference && (
                  <>
                    <span>•</span>
                    <span className="text-gray-400">{paper.conference}</span>
                  </>
                )}
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-8"></div>
            <div className="font-serif text-[17px] leading-[1.8] text-gray-800 dark:text-gray-200 space-y-6 text-justify">
              <h2 className="text-xl font-bold font-display border-l-4 border-primary pl-3 mb-4">摘要</h2>
              <p className="first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-4px] first-letter:text-primary">
                {paper.abstract || '暂无摘要信息。您可以点击右上角的编辑按钮添加摘要。'}
              </p>
              {paper.pdfUrl && (
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span className="material-symbols-outlined">picture_as_pdf</span>
                    这篇论文有 PDF 全文，点击右上角“全文”按钮阅读。
                  </p>
                </div>
              )}
              {paper.conference && (
                <>
                  <h2 className="text-xl font-bold font-display border-l-4 border-primary pl-3 mt-8 mb-4">发表信息</h2>
                  <p>本论文发表于 <strong>{paper.conference}</strong>（{paper.year}年）。</p>
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {/* AI Insights Panel */}
      <div className={`absolute bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-dark rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.4)] border-t border-gray-100 dark:border-gray-700/50 flex flex-col transition-all duration-300 ${isPanelCollapsed ? 'h-[70px]' : 'h-[45vh]'}`}>
        {/* 可点击的头部 */}
        <div
          className="cursor-pointer shrink-0"
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
        >
          <div className="w-full flex justify-center py-3">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
          <div className="px-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <span className="material-symbols-outlined fill-1 text-primary text-[20px]">auto_awesome</span>
              </div>
              <h2 className="text-lg font-bold">AI 核心洞察</h2>
            </div>
            <span className={`material-symbols-outlined text-gray-400 transition-transform ${isPanelCollapsed ? 'rotate-180' : ''}`}>
              {isPanelCollapsed ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {/* 内容区域 - 折叠时隐藏 */}
        {!isPanelCollapsed && (
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-24 no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm font-medium">正在由 Gemini 分析论文...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => onAuthorClick(generateAuthorFromPaper())}
                    className="p-3 bg-gray-50 dark:bg-background-dark/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-bold uppercase text-gray-500">学者背景</span>
                      </div>
                      <span className="material-symbols-outlined text-[14px] text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                    </div>
                    <p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">{insights?.authorInsight || '加载中...'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-background-dark/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-1.5 rounded-full bg-pink-500"></div>
                      <span className="text-[10px] font-bold uppercase text-gray-500">发表刊物</span>
                    </div>
                    <p className="text-xs font-medium truncate">{paper.conference}</p>
                  </div>
                </div>
                <InsightBlock color="blue" label="研究目标" text={insights?.objective || '正在提取核心目标...'} />
                <InsightBlock color="purple" label="方法论" text={insights?.methodology || '分析实验设计中...'} />
                <InsightBlock color="emerald" label="核心发现" text={insights?.findings || '总结关键成果...'} />
              </>
            )}
          </div>
        )}

        {/* 底部按钮 - 折叠时隐藏 */}
        {!isPanelCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 flex gap-3">
            <button className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-gray-500">format_ink_highlighter</span>
              <span>高亮共性</span>
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex-none py-3 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">chat_spark</span>
              提问 AI
            </button>
          </div>
        )}
      </div>

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        paper={paper}
      />
    </div>
  );
};

const InsightBlock: React.FC<{ color: string; label: string; text: string }> = ({ color, label, text }) => (
  <div className={`p-4 bg-gray-50 dark:bg-background-dark/50 rounded-xl border border-gray-100 dark:border-gray-800`}>
    <div className="flex items-start gap-3.5">
      <div className={`mt-1.5 min-w-1.5 h-1.5 rounded-full bg-${color === 'emerald' ? 'emerald-500' : color + '-500'}`}></div>
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">{label}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{text}</p>
      </div>
    </div>
  </div>
);

const AuthorScreen: React.FC<{ author: Author; onBack: () => void }> = ({ author, onBack }) => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
    <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800/50">
      <button onClick={onBack} className="size-10 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center">
        <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">arrow_back_ios_new</span>
      </button>
      <span className="text-base font-bold">学者档案</span>
      <span className="material-symbols-outlined p-2 text-gray-600 dark:text-gray-300">share</span>
    </header>

    <main className="px-5 pt-6 max-w-lg mx-auto space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-surface-dark shadow-lg">
            <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white dark:border-surface-dark"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">{author.name}</h1>
          <p className="text-sm text-gray-500 font-medium">{author.role}</p>
        </div>
        <div className="flex gap-4 text-xs">
          {[
            { val: author.citations, label: '引用次数' },
            { val: author.hIndex, label: 'H-Index' },
            { val: author.papersCount, label: '发表论文' }
          ].map((stat, i) => (
            <div key={i} className="text-center px-4 py-2 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800 min-w-20">
              <div className="font-bold text-lg text-primary">{stat.val}</div>
              <div className="opacity-70">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 max-w-sm">{author.bio}</p>
        <button className="w-full max-w-xs py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          关注学者
        </button>
      </div>

      <section className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800/50">
          <span className="material-symbols-outlined text-primary">emoji_events</span>
          <h2 className="font-bold">主要贡献</h2>
        </div>
        <div className="space-y-4">
          {author.contributions.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start group">
              <div className="mt-1 w-8 h-10 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gray-400 text-sm">description</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold group-hover:text-primary">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <div className="mt-1.5 flex gap-2">
                  {item.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px]">{tag}</span>)}
                  {item.stats && <span className="px-1.5 py-0.5 rounded bg-gray-50 dark:bg-gray-800 text-gray-500 text-[10px]">{item.stats}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800/50">
          <span className="material-symbols-outlined text-primary">history_edu</span>
          <h2 className="font-bold">教育背景</h2>
        </div>
        <div className="relative pl-2 space-y-6 border-l-2 border-gray-100 dark:border-gray-800 ml-1.5">
          {author.education.map((edu, idx) => (
            <div key={idx} className="relative pl-6">
              <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-card-dark ${idx === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold">{edu.institution}</h3>
                <span className="text-[10px] font-mono text-gray-400 mt-0.5">{edu.years}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{edu.degree}</p>
              {edu.advisor && <p className="text-[11px] text-gray-400 mt-1 italic">Advisor: {edu.advisor}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [activeAuthor, setActiveAuthor] = useState<Author | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);

  // 认证状态
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // API 数据状态
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderPapers, setFolderPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderLoading, setFolderLoading] = useState(false);

  // 弹窗状态
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isEditPaperModalOpen, setIsEditPaperModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthLoading(false);
    };
    checkAuth();

    // 监听认证状态变化
    const { data: { subscription } } = onAuthStateChange((newUser) => {
      setUser(newUser);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 加载初始数据（仅在用户登录后）
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [papersData, recentData, foldersData] = await Promise.all([
          papersApi.getAll(),
          papersApi.getRecent(),
          foldersApi.getAll()
        ]);
        setAllPapers(papersData as Paper[]);
        setRecentPapers(recentData as Paper[]);
        setFolders(foldersData as Folder[]);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // 加载文件夹内的论文
  useEffect(() => {
    if (activeFolder && screen === Screen.FOLDER_DETAIL) {
      const loadFolderPapers = async () => {
        setFolderLoading(true);
        try {
          const papers = await foldersApi.getPapers(activeFolder.id);
          setFolderPapers(papers as Paper[]);
        } catch (error) {
          console.error('加载文件夹论文失败:', error);
        } finally {
          setFolderLoading(false);
        }
      };
      loadFolderPapers();
    }
  }, [activeFolder, screen]);

  const navigateToHome = () => setScreen(Screen.HOME);
  const navigateToReader = (p: Paper) => {
    setActivePaper(p);
    setScreen(Screen.READER);
  };
  const navigateToAuthor = (a: Author) => {
    setActiveAuthor(a);
    setScreen(Screen.AUTHOR);
  };
  const navigateToFolder = (f: Folder) => {
    setActiveFolder(f);
    setScreen(Screen.FOLDER_DETAIL);
  };

  // 登出处理
  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  // 认证加载中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500">正在检查登录状态...</p>
        </div>
      </div>
    );
  }

  // 游客模式登录
  const handleGuestLogin = () => {
    setUser({
      id: 'guest',
      email: 'guest@example.com',
      name: '游客用户',
      avatar: undefined,
    });
  };

  // 未登录显示登录页面
  if (!user) {
    return <AuthScreen onAuthSuccess={handleGuestLogin} />;
  }

  return (
    <div className="w-full mx-auto max-w-screen-md shadow-2xl overflow-x-hidden min-h-screen">
      {screen === Screen.HOME && (
        <HomeScreen
          onPaperClick={navigateToReader}
          onFolderClick={navigateToFolder}
          onNavigate={setScreen}
          onAllPapersClick={() => {
            setActiveFolder({ id: 'all', name: '全部论文', icon: 'auto_stories', color: 'blue', count: allPapers.length, lastAdded: '刚刚' });
            setScreen(Screen.FOLDER_DETAIL);
          }}
          onUploadClick={() => setIsUploadModalOpen(true)}
          onCreateFolderClick={() => setIsCreateFolderModalOpen(true)}
          onEditFolderClick={(folder) => {
            setEditingFolder(folder);
            setIsEditFolderModalOpen(true);
          }}
          recentPapers={recentPapers}
          folders={folders}
          loading={loading}
          user={user}
          onSignOut={handleSignOut}
        />
      )}
      {screen === Screen.READER && activePaper && (
        <ReaderScreen
          paper={activePaper}
          onBack={navigateToHome}
          onAuthorClick={navigateToAuthor}
          onEdit={() => {
            setEditingPaper(activePaper);
            setIsEditPaperModalOpen(true);
          }}
        />
      )}
      {screen === Screen.AUTHOR && activeAuthor && (
        <AuthorScreen
          author={activeAuthor}
          onBack={() => setScreen(Screen.READER)}
        />
      )}
      {screen === Screen.SEARCH && (
        <SearchScreen onBack={navigateToHome} onPaperClick={navigateToReader} allPapers={allPapers} />
      )}
      {screen === Screen.FOLDER_DETAIL && activeFolder && (
        <FolderDetailScreen folder={activeFolder} onBack={navigateToHome} onPaperClick={navigateToReader} papers={folderPapers} loading={folderLoading} />
      )}
      {screen === Screen.INSIGHTS && (
        <InsightsScreen onBack={navigateToHome} onPaperClick={navigateToReader} recommendedPapers={allPapers} />
      )}

      {/* Universal Bottom Nav for non-overlay screens */}
      {![Screen.READER, Screen.AUTHOR, Screen.SEARCH, Screen.FOLDER_DETAIL].includes(screen) && (
        <BottomNav active={screen} onNavigate={setScreen} />
      )}

      {/* 上传弹窗 */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
        onSuccess={async (paperData) => {
          try {
            // 使用 API 服务保存到数据库
            await papersApi.create({
              title: paperData.title || '未知标题',
              authors: paperData.authors || '未知作者',
              year: paperData.year || new Date().getFullYear(),
              arxiv_id: paperData.arxivId,
              type: (paperData.type as 'PDF' | 'EPUB') || 'PDF',
              progress: 0,
              image_url: paperData.imageUrl || '',
              conference: paperData.conference,
              abstract: paperData.abstract,
              folder_id: paperData.folderId || undefined,
              pdf_url: paperData.pdfUrl,  // 添加 PDF URL
            });

            // 刷新数据
            const [papersData, recentData] = await Promise.all([
              papersApi.getAll(),
              papersApi.getRecent(),
            ]);
            setAllPapers(papersData as Paper[]);
            setRecentPapers(recentData as Paper[]);

            console.log('论文保存成功！');
          } catch (error) {
            console.error('保存论文失败:', error);
            alert('保存失败，请重试');
          }
        }}
      />

      {/* 创建文件夹弹窗 */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSuccess={async (folderData) => {
          try {
            await foldersApi.create({
              name: folderData.name,
              color: folderData.color,
              icon: folderData.icon,
            });
            // 刷新文件夹列表
            const foldersData = await foldersApi.getAll();
            setFolders(foldersData as Folder[]);
          } catch (error) {
            console.error('创建文件夹失败:', error);
            alert('创建失败，请重试');
          }
        }}
      />

      {/* 编辑论文弹窗 */}
      <EditPaperModal
        isOpen={isEditPaperModalOpen}
        paper={editingPaper}
        onClose={() => {
          setIsEditPaperModalOpen(false);
          setEditingPaper(null);
        }}
        onSave={async (id, updates) => {
          try {
            await papersApi.update(id, {
              title: updates.title,
              authors: updates.authors,
              year: updates.year,
              conference: updates.conference,
              abstract: updates.abstract,
            });
            // 刷新数据
            const [papersData, recentData] = await Promise.all([
              papersApi.getAll(),
              papersApi.getRecent(),
            ]);
            setAllPapers(papersData as Paper[]);
            setRecentPapers(recentData as Paper[]);
            // 更新当前论文
            if (activePaper && activePaper.id === id) {
              setActivePaper({ ...activePaper, ...updates } as Paper);
            }
          } catch (error) {
            console.error('更新论文失败:', error);
            alert('更新失败，请重试');
          }
        }}
        onDelete={async (id) => {
          try {
            await papersApi.delete(id);
            // 刷新数据
            const [papersData, recentData] = await Promise.all([
              papersApi.getAll(),
              papersApi.getRecent(),
            ]);
            setAllPapers(papersData as Paper[]);
            setRecentPapers(recentData as Paper[]);
            // 返回首页
            navigateToHome();
          } catch (error) {
            console.error('删除论文失败:', error);
            alert('删除失败，请重试');
          }
        }}
      />

      {/* 编辑文件夹弹窗 */}
      <EditFolderModal
        isOpen={isEditFolderModalOpen}
        folder={editingFolder}
        onClose={() => {
          setIsEditFolderModalOpen(false);
          setEditingFolder(null);
        }}
        onSave={async (id, updates) => {
          try {
            await foldersApi.update(id, updates);
            // 刷新文件夹列表
            const foldersData = await foldersApi.getAll();
            setFolders(foldersData as Folder[]);
          } catch (error) {
            console.error('更新文件夹失败:', error);
            alert('更新失败，请重试');
          }
        }}
        onDelete={async (id) => {
          try {
            await foldersApi.delete(id);
            // 刷新文件夹列表
            const foldersData = await foldersApi.getAll();
            setFolders(foldersData as Folder[]);
          } catch (error) {
            console.error('删除文件夹失败:', error);
            alert('删除失败，请重试');
          }
        }}
      />
    </div>
  );
};

export default App;
