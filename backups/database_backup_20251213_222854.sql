PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial_schema.sql','2025-12-13 09:24:28');
INSERT INTO "d1_migrations" VALUES(2,'0002_add_logo_url.sql','2025-12-13 13:17:21');
INSERT INTO "d1_migrations" VALUES(3,'0003_add_favicon.sql','2025-12-13 13:23:24');
INSERT INTO "d1_migrations" VALUES(4,'0004_add_mobile_images.sql','2025-12-13 13:25:08');
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "admin_users" VALUES(1,'admin','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','2025-12-13 09:24:31');
CREATE TABLE store_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shoulder_name TEXT,
  store_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  nearest_station TEXT,
  parking_info TEXT,
  payment_methods TEXT,
  other_info TEXT,
  google_maps_url TEXT,
  reservation_type TEXT CHECK(reservation_type IN ('url', 'phone', 'none')) DEFAULT 'none',
  reservation_value TEXT,
  contact_form_url TEXT,
  show_contact_form INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  ga4_id TEXT,
  clarity_id TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
, logo_url TEXT, favicon_url TEXT);
INSERT INTO "store_info" VALUES(1,'懐石料理','雅 -MIYABI-','06-1234-5678','〒542-0074 大阪府大阪市中央区千日前２丁目８−１７','各線「難波駅」より徒歩5分','専用駐車場あり（お食事のお客様は割引あり）','クレジットカード、電子マネー、QRコード決済','完全個室あり。お子様連れも歓迎いたします。','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.2!2d135.5!3d34.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1','url','https://hanjoukai.com/','https://docs.google.com/forms/d/e/1FAIpQLSeXVaQpEbYt9xKWgJuqPQ0RPNoS6nugSFT6tePmjsAuu65lbw/viewform?usp=header',1,'懐石料理 雅 -MIYABI- | 大阪・難波の本格和食','大阪・難波で本格懐石料理をご提供。旬の食材を使った季節の味わいをお楽しみください。','','','','2025-12-13 14:56:30','/uploads/images/1765637785394-scjlsk.png','/uploads/images/1765637772908-pdzavm.png');
CREATE TABLE main_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_type TEXT CHECK(media_type IN ('image', 'video')) NOT NULL,
  media_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, mobile_media_url TEXT);
INSERT INTO "main_images" VALUES(1,'image','/uploads/images/1765637807104-qkumhc.png',1,'2025-12-13 09:24:31','/uploads/images/1765637824261-2j9pcd.png');
INSERT INTO "main_images" VALUES(2,'image','http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765663389604-rnl0t.png',2,'2025-12-13 09:24:31','http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765663399762-m8mp1c.png');
INSERT INTO "main_images" VALUES(3,'image','http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765663420365-zovefq.png',3,'2025-12-13 09:24:31','http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765663426410-78v0at.png');
CREATE TABLE commitment_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "commitment_items" VALUES(1,'https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=400','厳選された旬の食材','全国各地から取り寄せた旬の食材を使用。季節の味わいをお楽しみいただけます。',2,1,'2025-12-13 09:24:31');
INSERT INTO "commitment_items" VALUES(2,'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400','板前の腕を振るう','長年培った伝統的な技法で、素材の味を最大限に引き出します。',3,1,'2025-12-13 09:24:31');
INSERT INTO "commitment_items" VALUES(3,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400','２名様〜３０名様の落ち着ける個室','大切な方とのお食事に最適な、落ち着いた雰囲気の個室をご用意しております。',4,0,'2025-12-13 09:24:31');
INSERT INTO "commitment_items" VALUES(5,'http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765663590120-rxo9z.png','会食や接待を引き立てる和の庭','枯山水の中庭がある特別な部屋がございます。',1,1,'2025-12-13 22:06:32');
CREATE TABLE greeting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "greeting" VALUES(1,'http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765664463006-7ruxdx9.png','ご挨拶',replace('当店では、四季折々の旬の食材を厳選し、伝統的な日本料理の技法を大切にしながら、心を込めてお料理をご提供しております。\n\nお客様に至福のひとときをお過ごしいただけますよう、スタッフ一同、真心を込めておもてなしさせていただきます。\n\nどうぞごゆっくりとお楽しみくださいませ。\n\n店主 山田 太郎','\n',char(10)),'2025-12-13 22:21:12');
CREATE TABLE menu_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "menu_images" VALUES(4,'https://tsubaki.homes/images/%E3%83%AC%E3%83%88%E3%83%AD%E5%96%AB%E8%8C%B6%E3%81%AE%E6%B4%8B%E5%BE%A1%E8%86%B3%E3%82%B3%E3%83%BC%E3%82%B9.png',1,'2025-12-13 22:08:42');
INSERT INTO "menu_images" VALUES(5,'https://tsubaki.homes/images/%E5%BA%97%E5%86%85%E5%80%8B%E5%AE%A4%EF%BC%91.png',2,'2025-12-13 22:08:51');
INSERT INTO "menu_images" VALUES(6,'https://tsubaki.homes/images/%E6%B4%8B%E3%81%AE%E6%BA%80%E5%96%AB%E3%82%B3%E3%83%BC%E3%82%B9.png',3,'2025-12-13 22:08:58');
INSERT INTO "menu_images" VALUES(7,'https://tsubaki.homes/images/%E5%BA%97%E5%86%85%E5%80%8B%E5%AE%A4%EF%BC%92.png',4,'2025-12-13 22:09:12');
CREATE TABLE banquet_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  course_name TEXT NOT NULL,
  course_description TEXT,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "banquet_courses" VALUES(1,'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600','季節の懐石コース','旬の食材を使った全8品の懐石コース。お一人様 12,000円（税込）',1,1,'2025-12-13 09:24:31');
INSERT INTO "banquet_courses" VALUES(2,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600','特選会席コース','厳選食材を贅沢に使用した全10品のコース。お一人様 18,000円（税込）',2,1,'2025-12-13 09:24:31');
INSERT INTO "banquet_courses" VALUES(3,'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600','おまかせコース','料理長おまかせの特別コース。お一人様 25,000円（税込）',3,1,'2025-12-13 09:24:31');
CREATE TABLE news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  published_date DATE NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "news" VALUES(1,'年末年始の営業についてのお知らせ','12月31日〜1月3日は特別営業となります。ご予約はお早めにお願いいたします。','2024-12-01',1,'2025-12-13 09:24:31');
INSERT INTO "news" VALUES(2,'新春特別コースのご案内','1月限定の特別懐石コースをご用意いたしました。','2024-12-15',1,'2025-12-13 09:24:31');
CREATE TABLE gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "gallery" VALUES(1,'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600','季節の前菜','旬の食材を美しく盛り付けた前菜',1,1,'2025-12-13 09:24:31');
INSERT INTO "gallery" VALUES(2,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600','お造り','新鮮な魚介類のお造り盛り合わせ',2,1,'2025-12-13 09:24:31');
INSERT INTO "gallery" VALUES(3,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600','焼き物','旬の魚を使った焼き物',3,1,'2025-12-13 09:24:31');
INSERT INTO "gallery" VALUES(4,'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600','揚げ物','サクサクの天ぷら',4,1,'2025-12-13 09:24:31');
INSERT INTO "gallery" VALUES(5,'https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=600','お食事','季節の炊き込みご飯',5,1,'2025-12-13 09:24:31');
INSERT INTO "gallery" VALUES(6,'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600','店内の様子','落ち着いた雰囲気の店内',6,1,'2025-12-13 09:24:31');
INSERT INTO "gallery" VALUES(7,'http://3000-iz786koes064ckegykvkz-cbeee0f9.sandbox.novita.ai/uploads/images/1765663835430-x8k4v.jpg','美味しいドリンク','ハイボリーなど低アルコールもあります',7,1,'2025-12-13 22:10:48');
CREATE TABLE faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "faq" VALUES(1,'予約は必要ですか？','お席に限りがございますので、事前のご予約をおすすめしております。当日のお席の状況によってはご案内できない場合がございます。',2,1,'2025-12-13 09:24:31');
INSERT INTO "faq" VALUES(2,'個室はありますか？','はい、完全個室をご用意しております。ご予約時にお申し付けください。',3,1,'2025-12-13 09:24:31');
INSERT INTO "faq" VALUES(3,'駐車場はありますか？','専用駐車場を５０台ご用意しております。お食事のお客様には割引サービスがございます。',1,1,'2025-12-13 09:24:31');
INSERT INTO "faq" VALUES(4,'子供連れでも大丈夫ですか？','もちろんでございます。お子様用のお料理もご用意できますので、ご予約時にお申し付けください。',4,1,'2025-12-13 09:24:31');
INSERT INTO "faq" VALUES(5,'アレルギー対応はできますか？','食材のアレルギーがございましたら、ご予約時にお知らせください。可能な限り対応させていただきます。',5,1,'2025-12-13 09:24:31');
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "site_settings" VALUES(1,'news_display_count','5','2025-12-13 09:24:31');
INSERT INTO "site_settings" VALUES(2,'show_banquet_section','1','2025-12-13 09:24:31');
INSERT INTO "site_settings" VALUES(3,'theme','default','2025-12-13 09:24:31');
INSERT INTO "site_settings" VALUES(4,'banquet_title','宴会コース','2025-12-13 14:56:30');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',4);
INSERT INTO "sqlite_sequence" VALUES('admin_users',1);
INSERT INTO "sqlite_sequence" VALUES('store_info',1);
INSERT INTO "sqlite_sequence" VALUES('greeting',1);
INSERT INTO "sqlite_sequence" VALUES('main_images',3);
INSERT INTO "sqlite_sequence" VALUES('commitment_items',5);
INSERT INTO "sqlite_sequence" VALUES('menu_images',7);
INSERT INTO "sqlite_sequence" VALUES('banquet_courses',3);
INSERT INTO "sqlite_sequence" VALUES('gallery',7);
INSERT INTO "sqlite_sequence" VALUES('news',2);
INSERT INTO "sqlite_sequence" VALUES('faq',5);
INSERT INTO "sqlite_sequence" VALUES('site_settings',4);
CREATE INDEX idx_main_images_order ON main_images(display_order);
CREATE INDEX idx_commitment_items_order ON commitment_items(display_order);
CREATE INDEX idx_menu_images_order ON menu_images(display_order);
CREATE INDEX idx_banquet_courses_order ON banquet_courses(display_order);
CREATE INDEX idx_news_date ON news(published_date DESC);
CREATE INDEX idx_gallery_order ON gallery(display_order);
CREATE INDEX idx_faq_order ON faq(display_order);