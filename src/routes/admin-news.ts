import { Hono } from 'hono'
import type { Bindings, News } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// News List Page
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM news ORDER BY published_date DESC'
  ).all<News>();

  const content = `
        <div class="max-w-6xl">
            
            <!-- Info Alert -->
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-info-circle text-blue-500"></i>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-blue-700">
                            お知らせ・新着情報を管理できます。日付の新しい順に表示されます。
                        </p>
                    </div>
                </div>
            </div>

            <!-- Add New Button -->
            <button onclick="openAddModal()" class="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>新規追加
            </button>

            <!-- News List -->
            <div class="space-y-4">
                ${results.map((item) => `
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="text-sm text-gray-500">${new Date(item.published_date).toLocaleDateString('ja-JP')}</span>
                                <span class="px-3 py-1 text-sm rounded-full ${item.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${item.is_visible ? '表示中' : '非表示'}
                                </span>
                            </div>
                            <h3 class="text-xl font-bold mb-2">${item.title}</h3>
                            <p class="text-gray-600">${item.content}</p>
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button onclick='editItem(${JSON.stringify(item).replace(/'/g, "\\'")})' 
                                    class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteItem(${item.id})" 
                                    class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>

            ${results.length === 0 ? `
            <div class="bg-white p-12 rounded-lg shadow text-center">
                <i class="fas fa-newspaper text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500">お知らせが登録されていません</p>
                <button onclick="openAddModal()" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>最初のお知らせを追加
                </button>
            </div>
            ` : ''}

        </div>

        <!-- Add/Edit Modal -->
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modal-title" class="text-2xl font-bold">お知らせを追加</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <form id="item-form" class="space-y-6">
                    <input type="hidden" id="item-id" name="id">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">タイトル <span class="text-red-600">*</span></label>
                        <input type="text" name="title" id="title" required 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="年末年始営業のお知らせ">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">内容 <span class="text-red-600">*</span></label>
                        <textarea name="content" id="content" rows="4" required
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="12月31日〜1月3日まで休業させていただきます。"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">公開日 <span class="text-red-600">*</span></label>
                        <input type="date" name="published_date" id="published-date" required
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="is_visible" id="is-visible" class="w-5 h-5 text-blue-600" checked>
                        <label for="is-visible" class="ml-2 text-sm font-medium text-gray-700">フロントエンドで表示する</label>
                    </div>

                    <div class="flex space-x-4 pt-6">
                        <button type="submit" class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                            <i class="fas fa-save mr-2"></i>保存
                        </button>
                        <button type="button" onclick="closeModal()" class="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition font-semibold">
                            キャンセル
                        </button>
                    </div>
                </form>

                <div id="modal-success" class="hidden bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4"></div>
                <div id="modal-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4"></div>
            </div>
        </div>

        <script>
          let isEditMode = false;

          // Set default date to today
          const today = new Date().toISOString().split('T')[0];
          document.getElementById('published-date').value = today;

          function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'お知らせを追加';
            document.getElementById('item-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('published-date').value = today;
            document.getElementById('is-visible').checked = true;
            document.getElementById('modal').classList.remove('hidden');
          }

          function editItem(item) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'お知らせを編集';
            document.getElementById('item-id').value = item.id;
            document.getElementById('title').value = item.title || '';
            document.getElementById('content').value = item.content || '';
            document.getElementById('published-date').value = item.published_date?.split('T')[0] || today;
            document.getElementById('is-visible').checked = item.is_visible == 1;
            document.getElementById('modal').classList.remove('hidden');
          }

          function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal-success').classList.add('hidden');
            document.getElementById('modal-error').classList.add('hidden');
          }

          async function deleteItem(id) {
            if (!confirm('このお知らせを削除しますか？')) return;
            
            try {
              await axios.delete('/admin/api/news/' + id);
              location.reload();
            } catch (error) {
              alert('削除に失敗しました: ' + error.message);
            }
          }

          document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              title: formData.get('title'),
              content: formData.get('content'),
              published_date: formData.get('published_date'),
              is_visible: formData.get('is_visible') ? 1 : 0
            };
            
            try {
              if (isEditMode) {
                data.id = formData.get('id');
                await axios.put('/admin/api/news/' + data.id, data);
              } else {
                await axios.post('/admin/api/news', data);
              }
              
              const successDiv = document.getElementById('modal-success');
              successDiv.textContent = '保存しました！';
              successDiv.classList.remove('hidden');
              
              setTimeout(() => {
                location.reload();
              }, 1000);
            } catch (error) {
              const errorDiv = document.getElementById('modal-error');
              errorDiv.textContent = '保存に失敗しました: ' + (error.response?.data?.message || error.message);
              errorDiv.classList.remove('hidden');
            }
          });
        </script>
  `;

  return c.html(getAdminLayout(content, 'news', 'お知らせ管理'));
})

// API: Add new news
app.post('/api', requireAuth, async (c) => {
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    INSERT INTO news (title, content, published_date, is_visible)
    VALUES (?, ?, ?, ?)
  `).bind(data.title, data.content, data.published_date, data.is_visible || 1).run();
  
  return c.json({ success: true });
})

// API: Update news
app.put('/api/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE news 
    SET title = ?, content = ?, published_date = ?, is_visible = ?
    WHERE id = ?
  `).bind(data.title, data.content, data.published_date, data.is_visible || 1, id).run();
  
  return c.json({ success: true });
})

// API: Delete news
app.delete('/api/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
  
  return c.json({ success: true });
})

export default app
