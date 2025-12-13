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
                    <label class="block text-sm font-medium text-gray-700 mb-2">料理長の写真</label>
                    <p class="text-xs text-gray-500 mb-2">推奨サイズ: 800px × 800px（正方形） | 形式: JPEG/PNG | 最大: 10MB</p>
                    
                    <!-- Tab Navigation -->
                    <div class="flex space-x-2 mb-4 border-b">
                        <button type="button" onclick="switchGreetingTab('upload')" id="tab-upload"
                                class="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
                            アップロード
                        </button>
                        <button type="button" onclick="switchGreetingTab('url')" id="tab-url"
                                class="px-4 py-2 text-gray-500 font-medium">
                            URLで指定
                        </button>
                    </div>

                    <!-- Upload Tab -->
                    <div id="upload-tab" class="space-y-3">
                        <div id="image-url-upload-container"></div>
                    </div>

                    <!-- URL Tab -->
                    <div id="url-tab" class="hidden space-y-3">
                        <input type="url" id="image-url-input"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="https://example.com/chef-photo.jpg">
                    </div>

                    <input type="hidden" name="image_url" id="image-url" value="${greeting?.image_url || ''}">

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
        <script src="/static/simple-uploader.js"></script>
        <script>
          const messageTextarea = document.getElementById('message');
          const charCount = document.getElementById('char-count');

          function updateCharCount() {
            charCount.textContent = messageTextarea.value.length;
          }

          messageTextarea.addEventListener('input', updateCharCount);
          updateCharCount();

          // Initialize uploader
          addSimpleUploader('image-url', { acceptVideos: false });

          // Tab switching
          function switchGreetingTab(tab) {
            const uploadTab = document.getElementById('upload-tab');
            const urlTab = document.getElementById('url-tab');
            const uploadBtn = document.getElementById('tab-upload');
            const urlBtn = document.getElementById('tab-url');
            const imageUrlInput = document.getElementById('image-url-input');

            if (tab === 'upload') {
              uploadTab.classList.remove('hidden');
              urlTab.classList.add('hidden');
              uploadBtn.classList.add('border-blue-600', 'text-blue-600');
              uploadBtn.classList.remove('text-gray-500');
              urlBtn.classList.remove('border-blue-600', 'text-blue-600');
              urlBtn.classList.add('text-gray-500');
              imageUrlInput.value = '';
            } else {
              uploadTab.classList.add('hidden');
              urlTab.classList.remove('hidden');
              urlBtn.classList.add('border-blue-600', 'text-blue-600');
              urlBtn.classList.remove('text-gray-500');
              uploadBtn.classList.remove('border-blue-600', 'text-blue-600');
              uploadBtn.classList.add('text-gray-500');
            }
          }

          // Sync URL input with hidden field
          document.getElementById('image-url-input').addEventListener('input', (e) => {
            document.getElementById('image-url').value = e.target.value;
          });

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
