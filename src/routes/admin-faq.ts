import { Hono } from 'hono'
import type { Bindings, FAQ } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// FAQ List Page
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM faq ORDER BY display_order ASC'
  ).all<FAQ>();

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
                            FAQ（よくある質問）を管理できます。LLM対策としてWebサイトに埋め込まれます。
                        </p>
                    </div>
                </div>
            </div>

            <!-- Add New Button -->
            <button onclick="openAddModal()" class="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>新規追加
            </button>

            <!-- FAQ List -->
            <div id="items-list" class="space-y-4">
                ${results.map((item, index) => `
                <div class="bg-white rounded-lg shadow-lg p-6 cursor-move" data-id="${item.id}">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0 cursor-grab active:cursor-grabbing">
                            <i class="fas fa-grip-vertical text-gray-400 text-2xl"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center space-x-2">
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">Q${index + 1}</span>
                                    <h3 class="text-lg font-bold">${item.question}</h3>
                                </div>
                                <span class="text-sm text-gray-500">順序: ${index + 1}</span>
                            </div>
                            <div class="pl-12">
                                <p class="text-gray-600 mb-4">${item.answer}</p>
                                <div class="flex space-x-2">
                                    <button onclick='editItem(${JSON.stringify(item).replace(/'/g, "\\'")})' 
                                            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                                        <i class="fas fa-edit"></i> 編集
                                    </button>
                                    <button onclick="deleteItem(${item.id})" 
                                            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                                        <i class="fas fa-trash"></i> 削除
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>

            ${results.length === 0 ? `
            <div class="bg-white p-12 rounded-lg shadow text-center">
                <i class="fas fa-question-circle text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500">FAQが登録されていません</p>
                <button onclick="openAddModal()" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>最初のFAQを追加
                </button>
            </div>
            ` : ''}

        </div>

        <!-- Add/Edit Modal -->
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modal-title" class="text-2xl font-bold">FAQを追加</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <form id="item-form" class="space-y-6">
                    <input type="hidden" id="item-id" name="id">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">質問 <span class="text-red-600">*</span></label>
                        <input type="text" name="question" id="question" required 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="予約は必要ですか？">
                        <p class="text-xs text-gray-500 mt-1">お客様からよく聞かれる質問</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">回答 <span class="text-red-600">*</span></label>
                        <textarea name="answer" id="answer" rows="4" required
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="当日のご予約も承っておりますが、お席が満席の場合がございますので、事前のご予約をおすすめしております。"></textarea>
                        <p class="text-xs text-gray-500 mt-1">質問に対する詳しい回答</p>
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

          // Initialize Sortable
          const itemsList = document.getElementById('items-list');
          if (itemsList && itemsList.children.length > 0) {
            new Sortable(itemsList, {
              animation: 150,
              handle: '.fa-grip-vertical',
              onEnd: async function(evt) {
                const items = Array.from(itemsList.children);
                const updates = items.map((item, index) => ({
                  id: parseInt(item.dataset.id),
                  display_order: index + 1
                }));
                
                try {
                  await axios.post('/admin/api/faq/reorder', { updates });
                  location.reload();
                } catch (error) {
                  alert('並び替えの保存に失敗しました: ' + error.message);
                }
              }
            });
          }

          function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'FAQを追加';
            document.getElementById('item-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('modal').classList.remove('hidden');
          }

          function editItem(item) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'FAQを編集';
            document.getElementById('item-id').value = item.id;
            document.getElementById('question').value = item.question || '';
            document.getElementById('answer').value = item.answer || '';
            document.getElementById('modal').classList.remove('hidden');
          }

          function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal-success').classList.add('hidden');
            document.getElementById('modal-error').classList.add('hidden');
          }

          async function deleteItem(id) {
            if (!confirm('このFAQを削除しますか？')) return;
            
            try {
              await axios.delete('/admin/api/faq/' + id);
              location.reload();
            } catch (error) {
              alert('削除に失敗しました: ' + error.message);
            }
          }

          document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
              if (isEditMode) {
                await axios.put('/admin/api/faq/' + data.id, data);
              } else {
                await axios.post('/admin/api/faq', data);
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

  return c.html(getAdminLayout(content, 'faq', 'FAQ管理'));
})

// API: Add new FAQ
app.post('/api', requireAuth, async (c) => {
  const data = await c.req.json();
  
  const maxOrder = await c.env.DB.prepare(
    'SELECT MAX(display_order) as max_order FROM faq'
  ).first();
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;
  
  await c.env.DB.prepare(`
    INSERT INTO faq (question, answer, display_order)
    VALUES (?, ?, ?)
  `).bind(data.question, data.answer, nextOrder).run();
  
  return c.json({ success: true });
})

// API: Update FAQ
app.put('/api/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE faq SET question = ?, answer = ? WHERE id = ?
  `).bind(data.question, data.answer, id).run();
  
  return c.json({ success: true });
})

// API: Delete FAQ
app.delete('/api/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('DELETE FROM faq WHERE id = ?').bind(id).run();
  
  // Reorder remaining items
  const { results } = await c.env.DB.prepare(
    'SELECT id FROM faq ORDER BY display_order ASC'
  ).all();
  
  for (let i = 0; i < results.length; i++) {
    await c.env.DB.prepare(
      'UPDATE faq SET display_order = ? WHERE id = ?'
    ).bind(i + 1, results[i].id).run();
  }
  
  return c.json({ success: true });
})

// API: Reorder FAQs
app.post('/api/reorder', requireAuth, async (c) => {
  const { updates } = await c.req.json();
  
  for (const update of updates) {
    await c.env.DB.prepare(
      'UPDATE faq SET display_order = ? WHERE id = ?'
    ).bind(update.display_order, update.id).run();
  }
  
  return c.json({ success: true });
})

export default app
