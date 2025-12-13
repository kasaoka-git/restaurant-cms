-- 管理者認証テーブル
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 店舗基本情報テーブル
CREATE TABLE IF NOT EXISTS store_info (
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
);

-- メインイメージテーブル（最大3つ）
CREATE TABLE IF NOT EXISTS main_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_type TEXT CHECK(media_type IN ('image', 'video')) NOT NULL,
  media_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- こだわり情報テーブル（1-6個）
CREATE TABLE IF NOT EXISTS commitment_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ご挨拶テーブル
CREATE TABLE IF NOT EXISTS greeting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- メニュー画像テーブル（最大50枚）
CREATE TABLE IF NOT EXISTS menu_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 宴会コーステーブル
CREATE TABLE IF NOT EXISTS banquet_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  course_name TEXT NOT NULL,
  course_description TEXT,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 新着情報テーブル
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  published_date DATE NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ギャラリーテーブル
CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- よくある質問テーブル
CREATE TABLE IF NOT EXISTS faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_visible INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- サイト設定テーブル
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_main_images_order ON main_images(display_order);
CREATE INDEX IF NOT EXISTS idx_commitment_items_order ON commitment_items(display_order);
CREATE INDEX IF NOT EXISTS idx_menu_images_order ON menu_images(display_order);
CREATE INDEX IF NOT EXISTS idx_banquet_courses_order ON banquet_courses(display_order);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(display_order);
CREATE INDEX IF NOT EXISTS idx_faq_order ON faq(display_order);
