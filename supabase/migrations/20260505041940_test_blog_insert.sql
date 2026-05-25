-- Test insert
INSERT INTO blog_posts (slug, title, excerpt, content, category, image_url, read_time, featured, published, author_name, published_at, tags)
VALUES ('test-blog-insert-2026', 'Test Article', 'Test excerpt for verification.', '<p>Test content</p>', 'Event Planning', '/blog/adinkra-symbols-ghana.jpg', '2 min read', false, true, 'VibeLink Editorial', NOW(), ARRAY['test'])
ON CONFLICT (slug) DO NOTHING;
