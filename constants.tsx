
import { Paper, Folder, Author } from './types';

export const ALL_PAPERS: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    arxivId: '1706.03762',
    type: 'PDF',
    progress: 85,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTcyJoryh7OYteeL7xmHljdlFRmbGDvmPeP9BgHiQR5JE8oRlyNgNJjTyNsKYweqbX4qlGUJunK0qzuvyPGZKC7AbvABKQRbrVLwxFE3HskIGEcRUIYuHatsQYB5-XdUlUVW-4zBMJLbUZDDSxmCBTm5_HFed-1UzgPutLc29UJzMSjX1G79kJwVUU7vvneIcnO-gyqrP1iIPbgwSi5D9-d37kHEU6BoJvuWbs3vRSAgC9W1q7S63hglIepQQY2VaQloM0PHwZOu10',
    conference: '第31届 NIPS 会议',
    folderId: 'f1',
    abstract: '主流的序列转换模型基于复杂的循环神经网络或卷积神经网络，包含一个编码器和一个解码器。表现最好的模型还通过注意力机制连接编码器和解码器。我们提出了一种新的简单网络架构——Transformer，它完全基于注意力机制，彻底摒弃了循环和卷积。'
  },
  {
    id: '2',
    title: 'User Experience in AI Tools',
    authors: 'Norman, D.',
    year: 2023,
    type: 'EPUB',
    progress: 5,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQKPwtt2hRhBq3jKIsZddiPXy_u7H00Nd9I9qisptS1xonQixnhy_U5a01NSMV-_VeZZECfLudJpptVZj9g0DkgnYIqNJpYBfRlPZsGyGKRy-ALCD1TjEMpnmgpBJC53ADoEW7KqvFVYaxtEG6iVVX-YaHVAgdsjuImKzwiK3JpNjBpsBvCLy1QRZamYgJgxFG_hLlEJ8EAGV6yQY8UN8Z1EDmThwJ4Metoks1LtPrwpei8nO70rYShHGWeAKEHPEVj_AH_xIe-R6g',
    conference: 'UX Conference 2023',
    folderId: 'f2',
    abstract: '随着生成式 AI 的普及，用户体验 (UX) 设计面临着从确定性系统到概率性系统的转变。本研究探讨了 AI 工具中信任、透明度和反馈回路的重要性。我们提出了“AI 协同设计框架”，旨在增强用户对自动化过程的掌控感和理解力。'
  },
  {
    id: '3',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He et al.',
    year: 2016,
    type: 'PDF',
    progress: 100,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIh-yLRBO3HTcjrny4E38OVafUZol7Xv7ABuCgbfLPCLD8cfXeRrhiWCMP-MOZnegmjdV787ZfOUq5srLiJDhYxME0fRoai4rDFW3neKoWg3iWjcfagkwGC2p4CYCQjiP1EPHLK8DYmJvf8VoAg3w9WOpKGSX6Je49GDORO3WI-ipv6PIShH9SjNapJcv8TG-tstoivDgJfEgWPK91tvOX9jc1e-ooDN-tMH5iiKLzJVsWxTB0vnvp6Sipy6121W1gbQxx52rNDhXp',
    conference: 'CVPR 2016',
    folderId: 'f1',
    abstract: '随着神经网络深度的增加，训练变得更加困难，且会出现退化问题。我们提出了残差学习框架（ResNet），通过显式地让层拟合残差映射来简化极深网络的训练。这种方法使得我们可以训练高达 152 层的网络，同时保持较低的复杂度。'
  },
  {
    id: '4',
    title: 'Language Models are Few-Shot Learners',
    authors: 'Brown et al.',
    year: 2020,
    type: 'PDF',
    progress: 20,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8m-zN9qE1y-J7X_xR-hH9HjVlO9Zl_0_1_2_3_4_5_6_7_8_9_0',
    conference: 'NeurIPS 2020',
    folderId: 'f1',
    abstract: '我们证明，扩大语言模型的规模可以极大地提高其在少样本学习任务上的表现。我们训练了 GPT-3，一个具有 1750 亿个参数的自回归语言模型，并在不需要微调的情况下，在许多 NLP 任务上实现了最先进的性能。'
  }
];

export const RECENT_PAPERS = ALL_PAPERS.slice(0, 3);

export const FOLDERS: Folder[] = [
  { id: 'f1', name: '机器学习', count: 124, lastAdded: '2小时前', color: 'blue', icon: 'folder' },
  { id: 'f2', name: '用户体验研究', count: 45, lastAdded: '1天前', color: 'purple', icon: 'folder' },
  { id: 'f3', name: '认知科学', count: 12, lastAdded: '1周前', color: 'teal', icon: 'folder' },
  { id: 'f4', name: '未分类', count: 8, lastAdded: '很久以前', color: 'gray', icon: 'folder_open' }
];

export const AUTHOR_DATA: Author = {
  id: 'a1',
  name: 'Ashish Vaswani',
  role: 'Adept AI Labs 联合创始人 | 前 Google Brain 研究员',
  citations: '85k+',
  hIndex: 34,
  papersCount: 12,
  bio: '深度学习研究员，著名的 Transformer 架构的主要作者之一，该架构彻底改变了自然语言处理领域。专注于序列建模、生成式 AI 以及大规模模型的高效训练。',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGoLfkie3KEkvScXHuBzOHdVtdhNR2X2Q9HUGgajORc08MGnsGCJCFlCqensWeN6xeo0gb7taV_X63uZiliBGW86PUQo6H1t2QJttCYlkTAlCf65p0Gr4lsiwfzP1S7iu_09IZCz68326gMiA1ivMzIAl5R4jxG0m6yuBq3e1FeeVHJLQurujvDCC0xXDOgv-jcTN-imAftH83lX6HXpymTBr3ihOqyL1J26KkvnvswmIEfD3jmLh11UGpHfGePvOacn_qQN2LVMB2',
  education: [
    { institution: 'University of Southern California', degree: 'Ph.D. in Computer Science', years: '2004 - 2011', advisor: 'David Chiang' },
    { institution: 'IIT Roorkee', degree: 'Bachelor of Technology in Computer Science', years: '2000 - 2004' }
  ],
  contributions: [
    {
      title: 'Attention Is All You Need',
      description: '提出了 Transformer 架构，摒弃了循环和卷积，完全基于注意力机制。',
      tags: ['NIPS 2017'],
      stats: '引用: 80k+'
    },
    {
      title: 'Tensor2Tensor',
      description: '用于加速深度学习研究的库和数据集集合。',
      tags: ['GitHub'],
      stats: ''
    }
  ]
};
