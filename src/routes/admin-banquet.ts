import { Hono } from 'hono'
import type { Bindings, BanquetCourse } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// Banquet Courses List Page
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM banquet_courses ORDER BY display_order ASC'
  ).all<BanquetCourse>();

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
                            宴会コースを管理できます。ドラッグ&ドロップで表示順序を変更できます。
                        </p>
                    </div>
                </div>
            </div>

            <!-- Add New Button -->
            <button onclick="openAddModal()" class="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>新規追加
            </button>

            <!-- Courses List -->
            <div id="items-list" class="space-y-4">
                ${results.map((item, index) => `
                <div class="bg-white rounded-lg shadow-lg p-6 cursor-move" data-id="${item.id}">
                    <div class="flex items-start space-x-4">
                        <div class="flex-shrink-0 cursor-grab active:cursor-grabbing">
                            <i class="fas fa-grip-vertical text-gray-400 text-2xl"></i>
                        </div>
                        ${item.image_url ? `
                        <div class="flex-shrink-0">
                            <img src="${item.image_url}" alt="${item.name}" class="w-32 h-32 object-cover rounded-lg">
                        </div>
                        ` : ''}
                        <div class="flex-1">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xl font-bold">${item.name}</h3>
                                <span class="px-3 py-1 text-sm rounded-full ${item.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${item.is_visible ? '表示中' : '非表示'}
                                </span>
                            </div>
                            <p class="text-gray-600 mb-3">${item.description || '説明なし'}</p>
                            <p class="text-sm text-gray-500 mb-4">表示順序: ${index + 1}</p>
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
                `).join('')}
            </div>

            ${results.length === 0 ? `
            <div class="bg-white p-12 rounded-lg shadow text-center">
                <i class="fas fa-wine-glass-alt text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500">宴会コースが登録されていません</p>
                <button onclick="openAddModal()" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>最初のコースを追加
                </button>
            </div>
            ` : ''}

        </div>

        <!-- Add/Edit Modal -->
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modal-title" class="text-2xl font-bold">宴会コースを追加</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <form id="item-form" class="space-y-6">
                    <input type="hidden" id="item-id" name="id">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">コース名 <span class="text-red-600">*</span></label>
                        <input type="text" name="name" id="name" required 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="会席コース（全8品）">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">説明</label>
                        <textarea name="description" id="description" rows="4" 
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="季節の食材を使った本格会席料理をお楽しみください。"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">画像URL</label>
                        <input type="url" name="image_url" id="image-url" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="https://example.com/course-image.jpg">
                        <p class="text-xs text-gray-500 mt-1">コース画像のURLを入力してください</p>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="is_visible" id="is-visible" class="w-5 h-5 text-blue-600">
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
                  await axios.post('/admin/api/banquet/reorder', { updates });
                  location.reload();
                } catch (error) {
                  alert('並び替えの保存に失敗しました: ' + error.message);
                }
              }
            });
          }

          function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = '宴会コースを追加';
            document.getElementById('item-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('modal').classList.remove('hidden');
          }

          function editItem(item) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = '宴会コースを編集';
            document.getElementById('item-id').value = item.id;
            document.getElementById('name').value = item.name || '';
            document.getElementById('description').value = item.description || '';
            document.getElementById('image-url').value = item.image_url || '';
            document.getElementById('is-visible').checked = item.is_visible == 1;
            document.getElementById('modal').classList.remove('hidden');
          }

          function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal-success').classList.add('hidden');
            document.getElementById('modal-error').classList.add('hidden');
          }

          async function deleteItem(id) {
            if (!confirm('この宴会コースを削除しますか？')) return;
            
            try {
              await axios.delete('/admin/api/banquet/' + id);
              location.reload();
            } catch (error) {
              alert('削除に失敗しました: ' + error.message);
            }
          }

          document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {
              name: formData.get('name'),
              description: formData.get('description'),
              image_url: formData.get('image_url'),
              is_visible: formData.get('is_visible') ? 1 : 0
            };
            
            try {
              if (isEditMode) {
                data.id = formData.get('id');
                await axios.put('/admin/api/banquet/' + data.id, data);
              } else {
                await axios.post('/admin/api/banquet', data);
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

  return c.html(getAdminLayout(content, 'banquet', '宴会コース管理'));
})

// API: Add new banquet course
app.post('/api', requireAuth, async (c) => {
  const data = await c.req.json();
  
  const maxOrder = await c.env.DB.prepare(
    'SELECT MAX(display_order) as max_order FROM banquet_courses'
  ).first();
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;
  
  await c.env.DB.prepare(`
    INSERT INTO banquet_courses (name, description, image_url, is_visible, display_order)
    VALUES (?, ?, ?, ?, ?)
  `).bind(data.name, data.description || null, data.image_url || null, data.is_visible || 1, nextOrder).run();
  
  return c.json({ success: true });
})

// API: Update banquet course
app.put('/api/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE banquet_courses 
    SET name = ?, description = ?, image_url = ?, is_visible = ?
    WHERE id = ?
  `).bind(data.name, data.description || null, data.image_url || null, data.is_visible || 1, id).run();
  
  return c.json({ success: true });
})

// API: Delete banquet course
app.delete('/api/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('DELETE FROM banquet_courses WHERE id = ?').bind(id).run();
  
  // Reorder remaining items
  const { results } = await c.env.DB.prepare(
    'SELECT id FROM banquet_courses ORDER BY display_order ASC'
  ).all();
  
  for (let i = 0; i < results.length; i++) {
    await c.env.DB.prepare(
      'UPDATE banquet_courses SET display_order = ? WHERE id = ?'
    ).bind(i + 1, results[i].id).run();
  }
  
  return c.json({ success: true });
})

// API: Reorder banquet courses
app.post('/api/reorder', requireAuth, async (c) => {
  const { updates } = await c.req.json();
  
  for (const update of updates) {
    await c.env.DB.prepare(
      'UPDATE banquet_courses SET display_order = ? WHERE id = ?'
    ).bind(update.display_order, update.id).run();
  }
  
  return c.json({ success: true });
})

export default app
