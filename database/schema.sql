-- 文献库数据库 Schema
-- 在 Supabase SQL 编辑器中运行此脚本来创建表结构

-- 文件夹表
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 作者表
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  citations TEXT,
  h_index INTEGER,
  papers_count INTEGER DEFAULT 0,
  bio TEXT,
  avatar_url TEXT,
  education JSONB DEFAULT '[]',
  contributions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 论文表
CREATE TABLE IF NOT EXISTS papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  year INTEGER,
  arxiv_id TEXT,
  type TEXT DEFAULT 'PDF',
  progress INTEGER DEFAULT 0,
  image_url TEXT,
  conference TEXT,
  abstract TEXT,
  pdf_url TEXT,  -- PDF 文件 URL
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 论文-作者关联表（多对多）
CREATE TABLE IF NOT EXISTS paper_authors (
  paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
  PRIMARY KEY (paper_id, author_id)
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_papers_folder_id ON papers(folder_id);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_updated_at ON papers(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_title ON papers USING gin(to_tsvector('simple', title));

-- 启用 RLS（行级安全）
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_authors ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（开发测试用，生产环境请根据需要调整）
-- 先删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Allow public read access on folders" ON folders;
DROP POLICY IF EXISTS "Allow public insert access on folders" ON folders;
DROP POLICY IF EXISTS "Allow public update access on folders" ON folders;
DROP POLICY IF EXISTS "Allow public delete access on folders" ON folders;
DROP POLICY IF EXISTS "Allow public read access on authors" ON authors;
DROP POLICY IF EXISTS "Allow public insert access on authors" ON authors;
DROP POLICY IF EXISTS "Allow public update access on authors" ON authors;
DROP POLICY IF EXISTS "Allow public delete access on authors" ON authors;
DROP POLICY IF EXISTS "Allow public read access on papers" ON papers;
DROP POLICY IF EXISTS "Allow public insert access on papers" ON papers;
DROP POLICY IF EXISTS "Allow public update access on papers" ON papers;
DROP POLICY IF EXISTS "Allow public delete access on papers" ON papers;
DROP POLICY IF EXISTS "Allow public read access on paper_authors" ON paper_authors;
DROP POLICY IF EXISTS "Allow public insert access on paper_authors" ON paper_authors;
DROP POLICY IF EXISTS "Allow public delete access on paper_authors" ON paper_authors;

-- 创建策略
CREATE POLICY "Allow public read access on folders" ON folders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on folders" ON folders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on folders" ON folders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on folders" ON folders FOR DELETE USING (true);

CREATE POLICY "Allow public read access on authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on authors" ON authors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on authors" ON authors FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on authors" ON authors FOR DELETE USING (true);

CREATE POLICY "Allow public read access on papers" ON papers FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on papers" ON papers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on papers" ON papers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on papers" ON papers FOR DELETE USING (true);

CREATE POLICY "Allow public read access on paper_authors" ON paper_authors FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on paper_authors" ON paper_authors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access on paper_authors" ON paper_authors FOR DELETE USING (true);
