import { Hono } from 'hono'
import type { Bindings, Greeting } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// Greeting Edit Page
app.get('/', requireAuth, async (c) => {
  const greeting = await c.env.DB.prepare(
    'SELECT * FROM greeting LIMIT 1'
  ).first<Greeting>();

  const content = `
        <div class="max-w-4xl mx-auto">
            <form id="greeting-form" class="bg-white p-8 rounded-lg shadow space-y-6">
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">タイトル <span class="text-red-600">*</span></label>
                    <input type="text" name="title" id="title" value="${greeting?.title || ''}" required 
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                           placeholder="例: 料理長からのご挨拶">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">ご挨拶文 <span class="text-red-600">*</span></label>
                    <textarea name="message" id="message" rows="10" required
                              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="ご挨拶の内容を入力してください（最大500文字程度）">${greeting?.message || ''}</textarea>
                    <p class="text-xs text-gray-500 mt-1">
                        現在の文字数: <span id="char-count">0</span>文字
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">画像URL</label>
                    <input type="url" name="image_url" id="image-url" value="${greeting?.image_url || ''}"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                           placeholder="https://example.com/chef-photo.jpg">
                    <p class="text-xs text-gray-500 mt-1">料理長の写真などがある場合はURLを入力してください（任意）</p>
                    ${greeting?.image_url ? `
                    <div class="mt-4">
                        <img src="${greeting.image_url}" alt="プレビュー" class="w-48 h-48 rounded-full object-cover">
                    </div>
                    ` : ''}
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
          const messageTextarea = document.getElementById('message');
          const charCount = document.getElementById('char-count');

          function updateCharCount() {
            charCount.textContent = messageTextarea.value.length;
          }

          messageTextarea.addEventListener('input', updateCharCount);
          updateCharCount();

          document.getElementById('greeting-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
              await axios.post('/admin/api/greeting', data);
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
  `;

  return c.html(getAdminLayout(content, 'greeting', 'ご挨拶編集'));
})

// API: Save greeting
app.post('/', requireAuth, async (c) => {
  const data = await c.req.json();
  
  // Check if greeting exists
  const existing = await c.env.DB.prepare('SELECT id FROM greeting LIMIT 1').first();
  
  if (existing) {
    // Update
    await c.env.DB.prepare(`
      UPDATE greeting SET
        title = ?,
        message = ?,
        image_url = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(data.title, data.message, data.image_url || null, existing.id).run();
  } else {
    // Insert
    await c.env.DB.prepare(`
      INSERT INTO greeting (title, message, image_url)
      VALUES (?, ?, ?)
    `).bind(data.title, data.message, data.image_url || null).run();
  }
  
  return c.json({ success: true });
})

export default app
