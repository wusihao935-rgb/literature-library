-- Supabase Storage 配置
-- 在 Supabase SQL Editor 中运行此脚本
-- 此脚本可以安全地重复运行

-- 创建论文存储桶（如果不存在）
INSERT INTO storage.buckets (id, name, public) 
VALUES ('papers', 'papers', true)
ON CONFLICT (id) DO NOTHING;

-- 先删除已存在的策略（如果有）
DROP POLICY IF EXISTS "Allow public read access on papers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload to papers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from papers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to papers bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from papers bucket" ON storage.objects;

-- 创建公开访问策略（开发环境，允许所有操作）
CREATE POLICY "Allow public read access on papers bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'papers');

CREATE POLICY "Allow public upload to papers bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'papers');

CREATE POLICY "Allow public delete from papers bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'papers');
