
export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: number;
  arxivId?: string;
  type: 'PDF' | 'EPUB' | string;
  progress: number;
  imageUrl: string;
  conference?: string;
  abstract?: string;
  folderId?: string;
  pdfUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  count: number;
  lastAdded: string;
  color: string;
  icon: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  citations: string;
  hIndex: number;
  papersCount: number;
  bio: string;
  avatarUrl: string;
  education: {
    institution: string;
    degree: string;
    years: string;
    advisor?: string;
  }[];
  contributions: {
    title: string;
    description: string;
    tags: string[];
    stats: string;
  }[];
}

export enum Screen {
  HOME = 'home',
  READER = 'reader',
  AUTHOR = 'author',
  SEARCH = 'search',
  INSIGHTS = 'insights',
  FOLDER_DETAIL = 'folder_detail'
}
