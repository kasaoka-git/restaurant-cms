import { Hono } from 'hono'
import type { Bindings, CommitmentItem } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// Commitment Items List Page
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM commitment_items ORDER BY display_order ASC'
  ).all<CommitmentItem>();

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
                            こだわり情報は1つから6つまで登録できます。ドラッグ&ドロップで表示順序を変更できます。
                        </p>
                    </div>
                </div>
            </div>

            <!-- Add New Button -->
            ${results.length < 6 ? `
            <button onclick="openAddModal()" class="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>新規追加
            </button>
            ` : `
            <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p class="text-sm text-yellow-700">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    最大数（6つ）に達しています。新しく追加するには既存のものを削除してください。
                </p>
            </div>
            `}

            <!-- Items List -->
            <div id="items-list" class="space-y-4">
                ${results.map((item, index) => `
                <div class="bg-white p-6 rounded-lg shadow-lg flex items-start space-x-4 cursor-move ${item.is_visible ? '' : 'opacity-60'}" data-id="${item.id}">
                    <div class="flex-shrink-0 pt-2">
                        <i class="fas fa-grip-vertical text-gray-400 text-2xl"></i>
                    </div>
                    
                    <!-- Preview -->
                    ${item.image_url ? `
                    <div class="flex-shrink-0">
                        <img src="${item.image_url}" alt="${item.title}" class="w-32 h-24 object-cover rounded">
                    </div>
                    ` : ''}

                    <!-- Info -->
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <h3 class="text-lg font-bold">${item.title}</h3>
                            ${!item.is_visible ? '<span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">非表示</span>' : ''}
                        </div>
                        ${item.description ? `<p class="text-sm text-gray-600 line-clamp-2">${item.description}</p>` : ''}
                        <p class="text-xs text-gray-500 mt-2">表示順序: ${index + 1}</p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col space-y-2">
                        <button onclick='editItem(${JSON.stringify(item).replace(/'/g, "\\'")})'
                                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition whitespace-nowrap">
                            <i class="fas fa-edit"></i> 編集
                        </button>
                        <button onclick="toggleVisibility(${item.id}, ${item.is_visible})" 
                                class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition whitespace-nowrap">
                            <i class="fas fa-eye${item.is_visible ? '-slash' : ''}"></i> ${item.is_visible ? '非表示' : '表示'}
                        </button>
                        <button onclick="deleteItem(${item.id})" 
                                class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition whitespace-nowrap">
                            <i class="fas fa-trash"></i> 削除
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>

            ${results.length === 0 ? `
            <div class="bg-white p-12 rounded-lg shadow text-center">
                <i class="fas fa-heart text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500">こだわり情報が登録されていません</p>
                <button onclick="openAddModal()" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>最初のこだわり情報を追加
                </button>
            </div>
            ` : ''}

        </div>
        </div>

        <!-- Add/Edit Modal -->
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modal-title" class="text-2xl font-bold">こだわり情報を追加</h2>
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
                               placeholder="例: 厳選された旬の食材">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">説明文</label>
                        <textarea name="description" id="description" rows="4"
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="こだわりの詳細を入力してください"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">こだわり画像</label>
                        <p class="text-xs text-gray-500 mb-2">推奨サイズ: 800px × 600px | 形式: JPEG/PNG | <strong class="text-red-600">最大: 3MB</strong></p>
                        
                        <!-- Tab Navigation -->
                        <div class="flex space-x-2 mb-4 border-b">
                            <button type="button" onclick="switchCommitmentTab('upload')" id="tab-upload"
                                    class="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
                                アップロード
                            </button>
                            <button type="button" onclick="switchCommitmentTab('url')" id="tab-url"
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
                                   placeholder="https://example.com/image.jpg">
                        </div>

                        <input type="hidden" name="image_url" id="image-url">
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" name="is_visible" id="is-visible" checked
                               class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <label for="is-visible" class="ml-2 text-sm text-gray-700">公開する</label>
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

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/simple-uploader.js"></script>
        <script>
          let isEditMode = false;

          // Initialize uploader with 3MB limit
          addSimpleUploader('image-url', { 
            acceptVideos: false,
            maxSize: 3 * 1024 * 1024 // 3MB
          });

          // Tab switching
          function switchCommitmentTab(tab) {
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
                  await axios.post('/admin/api/commitment/reorder', { updates });
                  location.reload();
                } catch (error) {
                  alert('並び替えの保存に失敗しました: ' + error.message);
                }
              }
            });
          }

          function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'こだわり情報を追加';
            document.getElementById('item-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('is-visible').checked = true;
            document.getElementById('modal').classList.remove('hidden');
            
            // Initialize uploader
            setTimeout(() => addSimpleUploader('image-url', { acceptVideos: false }), 100);
          }

          function editItem(item) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'こだわり情報を編集';
            document.getElementById('item-id').value = item.id;
            document.getElementById('title').value = item.title;
            document.getElementById('description').value = item.description || '';
            document.getElementById('image-url').value = item.image_url || '';
            document.getElementById('is-visible').checked = item.is_visible === 1;
            document.getElementById('modal').classList.remove('hidden');
          }

          function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal-success').classList.add('hidden');
            document.getElementById('modal-error').classList.add('hidden');
          }

          async function toggleVisibility(id, currentVisibility) {
            try {
              await axios.patch('/admin/api/commitment/' + id + '/visibility', {
                is_visible: currentVisibility ? 0 : 1
              });
              location.reload();
            } catch (error) {
              alert('表示/非表示の切り替えに失敗しました: ' + error.message);
            }
          }

          async function deleteItem(id) {
            if (!confirm('このこだわり情報を削除しますか？')) return;
            
            try {
              await axios.delete('/admin/api/commitment/' + id);
              location.reload();
            } catch (error) {
              alert('削除に失敗しました: ' + error.message);
            }
          }

          document.getElementById('item-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.is_visible = formData.get('is_visible') ? 1 : 0;
            
            try {
              if (isEditMode) {
                await axios.put('/admin/api/commitment/' + data.id, data);
              } else {
                await axios.post('/admin/api/commitment', data);
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

  return c.html(getAdminLayout(content, 'commitment', 'こだわり情報管理'));
})

// API: Add new commitment item
app.post('/', requireAuth, async (c) => {
  const data = await c.req.json();
  
  // Check if already 6 items
  const { results } = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM commitment_items'
  ).all();
  
  if (results[0].count >= 6) {
    return c.json({ success: false, message: '最大6つまでしか登録できません' }, 400);
  }
  
  // Get next display_order
  const maxOrder = await c.env.DB.prepare(
    'SELECT MAX(display_order) as max_order FROM commitment_items'
  ).first();
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;
  
  await c.env.DB.prepare(`
    INSERT INTO commitment_items (title, description, image_url, display_order, is_visible)
    VALUES (?, ?, ?, ?, ?)
  `).bind(data.title, data.description || null, data.image_url || null, nextOrder, data.is_visible || 1).run();
  
  return c.json({ success: true });
})

// API: Update commitment item
app.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE commitment_items SET
      title = ?,
      description = ?,
      image_url = ?,
      is_visible = ?
    WHERE id = ?
  `).bind(data.title, data.description || null, data.image_url || null, data.is_visible, id).run();
  
  return c.json({ success: true });
})

// API: Toggle visibility
app.patch('/:id/visibility', requireAuth, async (c) => {
  const id = c.req.param('id');
  const { is_visible } = await c.req.json();
  
  await c.env.DB.prepare(
    'UPDATE commitment_items SET is_visible = ? WHERE id = ?'
  ).bind(is_visible, id).run();
  
  return c.json({ success: true });
})

// API: Delete commitment item
app.delete('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  
  try {
    // Delete the item
    const deleteResult = await c.env.DB.prepare('DELETE FROM commitment_items WHERE id = ?').bind(id).run();
    
    if (!deleteResult.success) {
      return c.json({ success: false, message: '削除に失敗しました' }, 500);
    }
    
    // Get remaining items and reorder
    const { results } = await c.env.DB.prepare(
      'SELECT id FROM commitment_items ORDER BY display_order ASC'
    ).all();
    
    // Batch update for better performance
    if (results && results.length > 0) {
      const batch = results.map((item, index) => 
        c.env.DB.prepare('UPDATE commitment_items SET display_order = ? WHERE id = ?')
          .bind(index + 1, item.id)
      );
      
      await c.env.DB.batch(batch);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
})

// API: Reorder commitment items
app.post('/reorder', requireAuth, async (c) => {
  const { updates } = await c.req.json();
  
  for (const update of updates) {
    await c.env.DB.prepare(
      'UPDATE commitment_items SET display_order = ? WHERE id = ?'
    ).bind(update.display_order, update.id).run();
  }
  
  return c.json({ success: true });
})

export default app
