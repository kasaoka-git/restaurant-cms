-- デフォルト管理者アカウント（パスワード: admin123）
-- bcryptハッシュは実装後に生成
INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES 
  ('admin', '$2a$10$eDZvHOVhLCYoJlEbRvnPh.wXp1e7L.XPXKNMqOZjYrY6pL.JNQvPO');

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
  '懐石料理 雅 -MIYABI- | 大阪・難波の本格和食',
  '大阪・難波で本格懐石料理をご提供。旬の食材を使った季節の味わいをお楽しみください。'
);

-- サンプルご挨拶
INSERT OR IGNORE INTO greeting (title, message) VALUES (
  '料理長からのご挨拶',
  '当店では、四季折々の旬の食材を厳選し、伝統的な日本料理の技法を大切にしながら、心を込めてお料理をご提供しております。

お客様に至福のひとときをお過ごしいただけますよう、スタッフ一同、真心を込めておもてなしさせていただきます。

どうぞごゆっくりとお楽しみくださいませ。'
);

-- サンプルこだわり情報
INSERT OR IGNORE INTO commitment_items (title, description, display_order) VALUES 
  ('厳選された旬の食材', '全国各地から取り寄せた旬の食材を使用。季節の味わいをお楽しみいただけます。', 1),
  ('伝統の技', '長年培った伝統的な技法で、素材の味を最大限に引き出します。', 2),
  ('個室完備', '大切な方とのお食事に最適な、落ち着いた雰囲気の個室をご用意しております。', 3);

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
  ('show_banquet_section', '1');
