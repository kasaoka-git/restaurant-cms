import { Hono } from 'hono'
import type { Bindings } from '../types'
import { hashPassword, verifyPassword, createSession, getSession, destroySession, requireAuth } from '../utils/auth'

const app = new Hono<{ Bindings: Bindings }>()

// Login page
app.get('/login', async (c) => {
  const session = await getSession(c);
  if (session) {
    return c.redirect('/admin/dashboard');
  }

  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>管理画面ログイン</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">管理画面ログイン</h1>
            <form id="login-form" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">ユーザー名</label>
                    <input type="text" name="username" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">パスワード</label>
                    <input type="password" name="password" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <button type="submit" 
                        class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                    ログイン
                </button>
                <div id="error-message" class="hidden text-red-600 text-sm text-center"></div>
            </form>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
              const response = await axios.post('/admin/api/login', data);
              if (response.data.success) {
                window.location.href = '/admin/dashboard';
              }
            } catch (error) {
              const errorDiv = document.getElementById('error-message');
              errorDiv.textContent = 'ログインに失敗しました。ユーザー名またはパスワードが正しくありません。';
              errorDiv.classList.remove('hidden');
            }
          });
        </script>
    </body>
    </html>
  `);
})

// Login API
app.post('/api/login', async (c) => {
  const { username, password } = await c.req.json();
  
  const user = await c.env.DB.prepare(
    'SELECT * FROM admin_users WHERE username = ?'
  ).bind(username).first();
  
  if (!user) {
    return c.json({ success: false, message: 'Invalid credentials' }, 401);
  }
  
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return c.json({ success: false, message: 'Invalid credentials' }, 401);
  }
  
  await createSession(c, user.id, user.username);
  
  return c.json({ success: true });
})

// Logout
app.get('/logout', async (c) => {
  await destroySession(c);
  return c.redirect('/admin/login');
})

// Dashboard (protected)
app.get('/dashboard', requireAuth, async (c) => {
  const session = c.get('session');

  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>管理画面ダッシュボード</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <!-- Header -->
        <nav class="bg-white shadow-md">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 class="text-2xl font-bold text-gray-800">管理画面</h1>
                <div class="flex items-center space-x-4">
                    <span class="text-gray-600">ようこそ、${session.username}さん</span>
                    <a href="/admin/logout" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                        ログアウト
                    </a>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <!-- Store Info Card -->
                <a href="/admin/store-info" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-store text-4xl text-blue-600"></i>
                        <h2 class="text-xl font-bold ml-4">店舗情報</h2>
                    </div>
                    <p class="text-gray-600">店舗の基本情報を編集</p>
                </a>

                <!-- Main Images Card -->
                <a href="/admin/main-images" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-images text-4xl text-purple-600"></i>
                        <h2 class="text-xl font-bold ml-4">メインイメージ</h2>
                    </div>
                    <p class="text-gray-600">トップページのスライダー画像・動画</p>
                </a>

                <!-- Commitment Card -->
                <a href="/admin/commitment" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-heart text-4xl text-red-600"></i>
                        <h2 class="text-xl font-bold ml-4">こだわり情報</h2>
                    </div>
                    <p class="text-gray-600">店舗のこだわりポイント</p>
                </a>

                <!-- Greeting Card -->
                <a href="/admin/greeting" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-user-tie text-4xl text-green-600"></i>
                        <h2 class="text-xl font-bold ml-4">ご挨拶</h2>
                    </div>
                    <p class="text-gray-600">料理長からのご挨拶</p>
                </a>

                <!-- Menu Card -->
                <a href="/admin/menu" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-utensils text-4xl text-orange-600"></i>
                        <h2 class="text-xl font-bold ml-4">メニュー</h2>
                    </div>
                    <p class="text-gray-600">メニュー画像の管理</p>
                </a>

                <!-- Banquet Card -->
                <a href="/admin/banquet" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-wine-glass text-4xl text-pink-600"></i>
                        <h2 class="text-xl font-bold ml-4">宴会コース</h2>
                    </div>
                    <p class="text-gray-600">宴会コースの管理</p>
                </a>

                <!-- News Card -->
                <a href="/admin/news" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-newspaper text-4xl text-teal-600"></i>
                        <h2 class="text-xl font-bold ml-4">新着情報</h2>
                    </div>
                    <p class="text-gray-600">お知らせの管理</p>
                </a>

                <!-- Gallery Card -->
                <a href="/admin/gallery" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-camera text-4xl text-indigo-600"></i>
                        <h2 class="text-xl font-bold ml-4">ギャラリー</h2>
                    </div>
                    <p class="text-gray-600">写真ギャラリーの管理</p>
                </a>

                <!-- FAQ Card -->
                <a href="/admin/faq" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-question-circle text-4xl text-yellow-600"></i>
                        <h2 class="text-xl font-bold ml-4">よくある質問</h2>
                    </div>
                    <p class="text-gray-600">FAQの管理</p>
                </a>

            </div>

            <!-- Quick Actions -->
            <div class="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 class="text-2xl font-bold mb-4">クイックアクション</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/" target="_blank" class="flex items-center text-blue-600 hover:text-blue-800">
                        <i class="fas fa-external-link-alt mr-2"></i>
                        サイトを表示
                    </a>
                    <a href="/admin/settings" class="flex items-center text-blue-600 hover:text-blue-800">
                        <i class="fas fa-cog mr-2"></i>
                        サイト設定
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
})

// Store Info Editor (protected)
app.get('/store-info', requireAuth, async (c) => {
  const storeInfo = await c.env.DB.prepare(
    'SELECT * FROM store_info LIMIT 1'
  ).first();

  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>店舗情報編集</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-100">
        <!-- Header -->
        <nav class="bg-white shadow-md">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <a href="/admin/dashboard" class="text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left"></i> ダッシュボードに戻る
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800">店舗情報編集</h1>
                </div>
                <a href="/admin/logout" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                    ログアウト
                </a>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8 max-w-4xl">
            <form id="store-info-form" class="bg-white p-8 rounded-lg shadow space-y-6">
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ショルダーネーム</label>
                        <input type="text" name="shoulder_name" value="${storeInfo?.shoulder_name || ''}" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="例: 懐石料理">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">店名 <span class="text-red-600">*</span></label>
                        <input type="text" name="store_name" value="${storeInfo?.store_name || ''}" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="例: 雅 -MIYABI-">
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                        <input type="tel" name="phone" value="${storeInfo?.phone || ''}" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="06-1234-5678">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">住所</label>
                        <input type="text" name="address" value="${storeInfo?.address || ''}" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="〒542-0074 大阪府...">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">最寄り駅</label>
                    <input type="text" name="nearest_station" value="${storeInfo?.nearest_station || ''}" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                           placeholder="各線「難波駅」より徒歩5分">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">駐車場情報</label>
                    <textarea name="parking_info" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="専用駐車場あり（お食事のお客様は割引あり）">${storeInfo?.parking_info || ''}</textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">決済方法</label>
                    <input type="text" name="payment_methods" value="${storeInfo?.payment_methods || ''}" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                           placeholder="クレジットカード、電子マネー、QRコード決済">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">その他情報（フリーエリア）</label>
                    <textarea name="other_info" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="完全個室あり。お子様連れも歓迎いたします。">${storeInfo?.other_info || ''}</textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Googleマップ埋め込みURL</label>
                    <input type="url" name="google_maps_url" value="${storeInfo?.google_maps_url || ''}" 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                           placeholder="https://www.google.com/maps/embed?...">
                    <p class="text-xs text-gray-500 mt-1">Google Mapsの「共有」→「地図を埋め込む」からURLを取得してください</p>
                </div>

                <!-- Reservation Settings -->
                <div class="border-t pt-6">
                    <h3 class="text-lg font-bold mb-4">予約ボタン設定</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">予約方法</label>
                            <select name="reservation_type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="none" ${storeInfo?.reservation_type === 'none' ? 'selected' : ''}>表示しない</option>
                                <option value="url" ${storeInfo?.reservation_type === 'url' ? 'selected' : ''}>予約URL</option>
                                <option value="phone" ${storeInfo?.reservation_type === 'phone' ? 'selected' : ''}>電話番号</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">予約URL または 電話番号</label>
                            <input type="text" name="reservation_value" value="${storeInfo?.reservation_value || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="https://... または 06-1234-5678">
                        </div>
                    </div>
                </div>

                <!-- Contact Form Settings -->
                <div class="border-t pt-6">
                    <h3 class="text-lg font-bold mb-4">お問い合わせフォーム設定</h3>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input type="checkbox" name="show_contact_form" id="show_contact_form" 
                                   ${storeInfo?.show_contact_form ? 'checked' : ''}
                                   class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="show_contact_form" class="ml-2 text-sm text-gray-700">お問い合わせフォームを表示する</label>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">GoogleフォームURL</label>
                            <input type="url" name="contact_form_url" value="${storeInfo?.contact_form_url || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="https://docs.google.com/forms/...">
                        </div>
                    </div>
                </div>

                <!-- SEO Settings -->
                <div class="border-t pt-6">
                    <h3 class="text-lg font-bold mb-4">SEO設定</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SEOタイトル</label>
                            <input type="text" name="seo_title" value="${storeInfo?.seo_title || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="例: 懐石料理 雅 -MIYABI- | 大阪・難波の本格和食">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SEO説明文</label>
                            <textarea name="seo_description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                      placeholder="大阪・難波で本格懐石料理をご提供。旬の食材を使った季節の味わいをお楽しみください。">${storeInfo?.seo_description || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SEOキーワード（カンマ区切り）</label>
                            <input type="text" name="seo_keywords" value="${storeInfo?.seo_keywords || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="懐石料理, 和食, 大阪, 難波, 高級">
                        </div>
                    </div>
                </div>

                <!-- Analytics Settings -->
                <div class="border-t pt-6">
                    <h3 class="text-lg font-bold mb-4">アクセス解析設定</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Google Analytics 4 測定ID</label>
                            <input type="text" name="ga4_id" value="${storeInfo?.ga4_id || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="G-XXXXXXXXXX">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Microsoft Clarity プロジェクトID</label>
                            <input type="text" name="clarity_id" value="${storeInfo?.clarity_id || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="xxxxxxxxxx">
                        </div>
                    </div>
                </div>

                <div class="flex space-x-4 pt-6">
                    <button type="submit" class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                        <i class="fas fa-save mr-2"></i>保存
                    </button>
                    <a href="/admin/dashboard" class="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold text-center">
                        キャンセル
                    </a>
                </div>

                <div id="success-message" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"></div>
                <div id="error-message" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>
            </form>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
          document.getElementById('store-info-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // Convert checkbox to integer
            data.show_contact_form = formData.get('show_contact_form') ? 1 : 0;
            
            try {
              await axios.post('/admin/api/store-info', data);
              const successDiv = document.getElementById('success-message');
              successDiv.textContent = '保存しました！';
              successDiv.classList.remove('hidden');
              setTimeout(() => successDiv.classList.add('hidden'), 3000);
            } catch (error) {
              const errorDiv = document.getElementById('error-message');
              errorDiv.textContent = '保存に失敗しました: ' + (error.response?.data?.message || error.message);
              errorDiv.classList.remove('hidden');
            }
          });
        </script>
    </body>
    </html>
  `);
})

// Save store info API
app.post('/api/store-info', requireAuth, async (c) => {
  const data = await c.req.json();
  
  // Check if store info exists
  const existing = await c.env.DB.prepare('SELECT id FROM store_info LIMIT 1').first();
  
  if (existing) {
    // Update
    await c.env.DB.prepare(`
      UPDATE store_info SET
        shoulder_name = ?,
        store_name = ?,
        phone = ?,
        address = ?,
        nearest_station = ?,
        parking_info = ?,
        payment_methods = ?,
        other_info = ?,
        google_maps_url = ?,
        reservation_type = ?,
        reservation_value = ?,
        contact_form_url = ?,
        show_contact_form = ?,
        seo_title = ?,
        seo_description = ?,
        seo_keywords = ?,
        ga4_id = ?,
        clarity_id = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.shoulder_name,
      data.store_name,
      data.phone,
      data.address,
      data.nearest_station,
      data.parking_info,
      data.payment_methods,
      data.other_info,
      data.google_maps_url,
      data.reservation_type,
      data.reservation_value,
      data.contact_form_url,
      data.show_contact_form,
      data.seo_title,
      data.seo_description,
      data.seo_keywords,
      data.ga4_id,
      data.clarity_id,
      existing.id
    ).run();
  } else {
    // Insert
    await c.env.DB.prepare(`
      INSERT INTO store_info (
        shoulder_name, store_name, phone, address, nearest_station,
        parking_info, payment_methods, other_info, google_maps_url,
        reservation_type, reservation_value, contact_form_url, show_contact_form,
        seo_title, seo_description, seo_keywords, ga4_id, clarity_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.shoulder_name,
      data.store_name,
      data.phone,
      data.address,
      data.nearest_station,
      data.parking_info,
      data.payment_methods,
      data.other_info,
      data.google_maps_url,
      data.reservation_type,
      data.reservation_value,
      data.contact_form_url,
      data.show_contact_form,
      data.seo_title,
      data.seo_description,
      data.seo_keywords,
      data.ga4_id,
      data.clarity_id
    ).run();
  }
  
  return c.json({ success: true });
})

export default app
