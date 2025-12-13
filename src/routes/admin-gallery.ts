import { Hono } from 'hono'
import type { Bindings, Gallery } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// Gallery List Page
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM gallery ORDER BY display_order ASC'
  ).all<Gallery>();

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
                            ギャラリー画像を管理できます。ドラッグ&ドロップで表示順序を変更できます。
                        </p>
                    </div>
                </div>
            </div>

            <!-- Add New Button -->
            <button onclick="openAddModal()" class="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>新規追加
            </button>

            <!-- Gallery Grid -->
            <div id="items-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                ${results.map((item, index) => `
                <div class="bg-white rounded-lg shadow-lg overflow-hidden cursor-move" data-id="${item.id}">
                    <div class="aspect-square relative group">
                        <img src="${item.image_url}" alt="${item.title || 'ギャラリー画像'}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex flex-col items-center justify-center">
                            <i class="fas fa-grip-vertical text-white text-2xl opacity-0 group-hover:opacity-100 transition mb-2"></i>
                            ${item.title ? `<p class="text-white text-sm px-2 text-center opacity-0 group-hover:opacity-100 transition">${item.title}</p>` : ''}
                        </div>
                    </div>
                    <div class="p-4">
                        <p class="text-sm text-gray-600 mb-3">表示順序: ${index + 1}</p>
                        <div class="flex space-x-2">
                            <button onclick='editItem(${JSON.stringify(item).replace(/'/g, "\\'")})'
                                    class="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition text-sm">
                                <i class="fas fa-edit"></i> 編集
                            </button>
                            <button onclick="deleteItem(${item.id})" 
                                    class="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm">
                                <i class="fas fa-trash"></i> 削除
                            </button>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>

            ${results.length === 0 ? `
            <div class="bg-white p-12 rounded-lg shadow text-center">
                <i class="fas fa-images text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500">ギャラリー画像が登録されていません</p>
                <button onclick="openAddModal()" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>最初の画像を追加
                </button>
            </div>
            ` : ''}

        </div>

        <!-- Add/Edit Modal -->
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modal-title" class="text-2xl font-bold">ギャラリー画像を追加</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <form id="item-form" class="space-y-6">
                    <input type="hidden" id="item-id" name="id">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">ギャラリー画像 <span class="text-red-600">*</span></label>
                        <p class="text-xs text-gray-500 mb-2">推奨サイズ: 1200px × 900px | 形式: JPEG/PNG | <strong class="text-red-600">最大: 3MB</strong></p>
                        
                        <!-- Tab Navigation -->
                        <div class="flex space-x-2 mb-4 border-b">
                            <button type="button" onclick="switchGalleryTab('upload')" id="tab-upload"
                                    class="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-medium">
                                アップロード
                            </button>
                            <button type="button" onclick="switchGalleryTab('url')" id="tab-url"
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
                                   placeholder="https://example.com/gallery-image.jpg">
                        </div>

                        <input type="hidden" name="image_url" id="image-url" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                        <input type="text" name="title" id="title"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                               placeholder="店内の様子">
                        <p class="text-xs text-gray-500 mt-1">画像の説明やタイトル（任意）</p>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">説明</label>
                        <textarea name="description" id="description" rows="3" 
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="落ち着いた雰囲気の店内"></textarea>
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

        <script src="/static/simple-uploader.js"></script>
        <script>
          let isEditMode = false;

          // Initialize uploader with 3MB limit
          addSimpleUploader('image-url', { 
            acceptVideos: false,
            maxSize: 3 * 1024 * 1024 // 3MB
          });

          // Tab switching
          function switchGalleryTab(tab) {
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
              onEnd: async function(evt) {
                const items = Array.from(itemsList.children);
                const updates = items.map((item, index) => ({
                  id: parseInt(item.dataset.id),
                  display_order: index + 1
                }));
                
                try {
                  await axios.post('/admin/api/gallery/reorder', { updates });
                  location.reload();
                } catch (error) {
                  alert('並び替えの保存に失敗しました: ' + error.message);
                }
              }
            });
          }

          function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'ギャラリー画像を追加';
            document.getElementById('item-form').reset();
            document.getElementById('item-id').value = '';
            document.getElementById('modal').classList.remove('hidden');
            
            // Initialize uploader
            setTimeout(() => addSimpleUploader('image-url', { acceptVideos: false }), 100);
          }

          function editItem(item) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'ギャラリー画像を編集';
            document.getElementById('item-id').value = item.id;
            document.getElementById('image-url').value = item.image_url || '';
            document.getElementById('title').value = item.title || '';
            document.getElementById('description').value = item.description || '';
            document.getElementById('modal').classList.remove('hidden');
          }

          function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal-success').classList.add('hidden');
            document.getElementById('modal-error').classList.add('hidden');
          }

          async function deleteItem(id) {
            if (!confirm('このギャラリー画像を削除しますか？')) return;
            
            try {
              await axios.delete('/admin/api/gallery/' + id);
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
                await axios.put('/admin/api/gallery/' + data.id, data);
              } else {
                await axios.post('/admin/api/gallery', data);
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

  return c.html(getAdminLayout(content, 'gallery', 'ギャラリー管理'));
})

// API: Add new gallery image
app.post('/', requireAuth, async (c) => {
  const data = await c.req.json();
  
  const maxOrder = await c.env.DB.prepare(
    'SELECT MAX(display_order) as max_order FROM gallery'
  ).first();
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;
  
  await c.env.DB.prepare(`
    INSERT INTO gallery (image_url, title, description, display_order)
    VALUES (?, ?, ?, ?)
  `).bind(data.image_url, data.title || null, data.description || null, nextOrder).run();
  
  return c.json({ success: true });
})

// API: Update gallery image
app.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE gallery 
    SET image_url = ?, title = ?, description = ?
    WHERE id = ?
  `).bind(data.image_url, data.title || null, data.description || null, id).run();
  
  return c.json({ success: true });
})

// API: Delete gallery image
app.delete('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('DELETE FROM gallery WHERE id = ?').bind(id).run();
  
  // Reorder remaining items
  const { results } = await c.env.DB.prepare(
    'SELECT id FROM gallery ORDER BY display_order ASC'
  ).all();
  
  for (let i = 0; i < results.length; i++) {
    await c.env.DB.prepare(
      'UPDATE gallery SET display_order = ? WHERE id = ?'
    ).bind(i + 1, results[i].id).run();
  }
  
  return c.json({ success: true });
})

// API: Reorder gallery images
app.post('/reorder', requireAuth, async (c) => {
  const { updates } = await c.req.json();
  
  for (const update of updates) {
    await c.env.DB.prepare(
      'UPDATE gallery SET display_order = ? WHERE id = ?'
    ).bind(update.display_order, update.id).run();
  }
  
  return c.json({ success: true });
})

export default app
