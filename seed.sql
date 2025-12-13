-- デフォルト管理者アカウント（パスワード: admin123）
-- SHA-256ハッシュ
INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES 
  ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

-- デフォルト店舗情報
INSERT OR IGNORE INTO store_info (
  shoulder_name,
  store_name,
  phone,
  address,
  nearest_station,
  parking_info,
  payment_methods,
  other_info,
  google_maps_url,
  reservation_type,
  reservation_value,
  contact_form_url,
  show_contact_form,
  seo_title,
  seo_description
) VALUES (
  '懐石料理',
  '雅 -MIYABI-',
  '06-1234-5678',
  '〒542-0074 大阪府大阪市中央区千日前２丁目８−１７',
  '各線「難波駅」より徒歩5分',
  '専用駐車場あり（お食事のお客様は割引あり）',
  'クレジットカード、電子マネー、QRコード決済',
  '完全個室あり。お子様連れも歓迎いたします。',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.2!2d135.5!3d34.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1',
  'phone',
  '06-1234-5678',
  'https://docs.google.com/forms/d/e/1FAIpQLSeXVaQpEbYt9xKWgJuqPQ0RPNoS6nugSFT6tePmjsAuu65lbw/viewform?usp=header',
  1,
  '懐石料理 雅 -MIYABI- | 大阪・難波の本格和食',
  '大阪・難波で本格懐石料理をご提供。旬の食材を使った季節の味わいをお楽しみください。'
);

-- サンプルご挨拶
INSERT OR IGNORE INTO greeting (title, message, image_url) VALUES (
  'ご挨拶',
  '当店では、四季折々の旬の食材を厳選し、伝統的な日本料理の技法を大切にしながら、心を込めてお料理をご提供しております。

お客様に至福のひとときをお過ごしいただけますよう、スタッフ一同、真心を込めておもてなしさせていただきます。

どうぞごゆっくりとお楽しみくださいませ。

店主 山田 太郎',
  'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400'
);

-- サンプルメインイメージ（ダミー画像URL）
INSERT OR IGNORE INTO main_images (media_type, media_url, display_order) VALUES 
  ('image', 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=1200', 1),
  ('image', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200', 2),
  ('image', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200', 3);

-- サンプルこだわり情報
INSERT OR IGNORE INTO commitment_items (title, description, display_order, image_url) VALUES 
  ('厳選された旬の食材', '全国各地から取り寄せた旬の食材を使用。季節の味わいをお楽しみいただけます。', 1, 'https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=400'),
  ('伝統の技', '長年培った伝統的な技法で、素材の味を最大限に引き出します。', 2, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400'),
  ('個室完備', '大切な方とのお食事に最適な、落ち着いた雰囲気の個室をご用意しております。', 3, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'),
  ('厳選された日本酒', '全国の蔵元から厳選した日本酒を取り揃えております。', 4, 'https://images.unsplash.com/photo-1545828106-53b0a1dee0d0?w=400');

-- サンプルメニュー画像
INSERT OR IGNORE INTO menu_images (image_url, display_order) VALUES 
  ('https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800', 1),
  ('https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800', 2),
  ('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 3);

-- サンプル宴会コース
INSERT OR IGNORE INTO banquet_courses (course_name, course_description, display_order, image_url) VALUES 
  ('季節の懐石コース', '旬の食材を使った全8品の懐石コース。お一人様 12,000円（税込）', 1, 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600'),
  ('特選会席コース', '厳選食材を贅沢に使用した全10品のコース。お一人様 18,000円（税込）', 2, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600'),
  ('おまかせコース', '料理長おまかせの特別コース。お一人様 25,000円（税込）', 3, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600');

-- サンプルギャラリー
INSERT OR IGNORE INTO gallery (image_url, title, description, display_order) VALUES 
  ('https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600', '季節の前菜', '旬の食材を美しく盛り付けた前菜', 1),
  ('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', 'お造り', '新鮮な魚介類のお造り盛り合わせ', 2),
  ('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', '焼き物', '旬の魚を使った焼き物', 3),
  ('https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600', '揚げ物', 'サクサクの天ぷら', 4),
  ('https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=600', 'お食事', '季節の炊き込みご飯', 5),
  ('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', '店内の様子', '落ち着いた雰囲気の店内', 6);

-- サンプル新着情報
INSERT OR IGNORE INTO news (title, content, published_date) VALUES 
  ('年末年始の営業についてのお知らせ', '12月31日〜1月3日は特別営業となります。ご予約はお早めにお願いいたします。', '2024-12-01'),
  ('新春特別コースのご案内', '1月限定の特別懐石コースをご用意いたしました。', '2024-12-15');

-- サンプルFAQ
INSERT OR IGNORE INTO faq (question, answer, display_order) VALUES 
  ('予約は必要ですか？', 'お席に限りがございますので、事前のご予約をおすすめしております。当日のお席の状況によってはご案内できない場合がございます。', 1),
  ('個室はありますか？', 'はい、完全個室をご用意しております。ご予約時にお申し付けください。', 2),
  ('駐車場はありますか？', '専用駐車場をご用意しております。お食事のお客様には割引サービスがございます。', 3),
  ('子供連れでも大丈夫ですか？', 'もちろんでございます。お子様用のお料理もご用意できますので、ご予約時にお申し付けください。', 4),
  ('アレルギー対応はできますか？', '食材のアレルギーがございましたら、ご予約時にお知らせください。可能な限り対応させていただきます。', 5);

-- サイト設定のデフォルト値
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES 
  ('news_display_count', '5'),
  ('show_banquet_section', '1'),
  ('banquet_section_title', '宴会コース'),
  ('theme', 'default');
