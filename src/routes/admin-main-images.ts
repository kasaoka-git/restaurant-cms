import { Hono } from 'hono'
import type { Bindings, MainImage } from '../types'
import { requireAuth } from '../utils/auth'
import { getAdminLayout } from '../utils/admin-layout'

const app = new Hono<{ Bindings: Bindings }>()

// Main Images List Page
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM main_images ORDER BY display_order ASC'
  ).all<MainImage>();

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
                            メインイメージは最大3つまで登録できます。ドラッグ&ドロップで表示順序を変更できます。
                        </p>
                    </div>
                </div>
            </div>

            <!-- Add New Button -->
            ${results.length < 3 ? `
            <button onclick="openAddModal()" class="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-plus mr-2"></i>新規追加
            </button>
            ` : `
            <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p class="text-sm text-yellow-700">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    最大数（3つ）に達しています。新しく追加するには既存のものを削除してください。
                </p>
            </div>
            `}

            <!-- Images List -->
            <div id="images-list" class="space-y-4">
                ${results.map((img, index) => `
                <div class="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 cursor-move" data-id="${img.id}">
                    <div class="flex-shrink-0">
                        <i class="fas fa-grip-vertical text-gray-400 text-2xl"></i>
                    </div>
                    
                    <!-- Preview -->
                    <div class="flex-shrink-0">
                        ${img.media_type === 'video' ? `
                            <video src="${img.media_url}" class="w-32 h-24 object-cover rounded" muted></video>
                            <p class="text-xs text-gray-500 mt-1 text-center">
                                <i class="fas fa-video"></i> 動画
                            </p>
                        ` : `
                            <img src="${img.media_url}" alt="メインイメージ" class="w-32 h-24 object-cover rounded">
                            <p class="text-xs text-gray-500 mt-1 text-center">
                                <i class="fas fa-image"></i> 画像
                            </p>
                        `}
                    </div>

                    <!-- Info -->
                    <div class="flex-1">
                        <p class="text-sm text-gray-600">表示順序: ${index + 1}</p>
                        <p class="text-xs text-gray-500 mt-1 break-all">${img.media_url}</p>
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-2">
                        <button onclick='editImage(${JSON.stringify(img).replace(/'/g, "\\'")})'
                                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                            <i class="fas fa-edit"></i> 編集
                        </button>
                        <button onclick="deleteImage(${img.id})" 
                                class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
                            <i class="fas fa-trash"></i> 削除
                        </button>
                    </div>
                </div>
                `).join('')}
            </div>

            ${results.length === 0 ? `
            <div class="bg-white p-12 rounded-lg shadow text-center">
                <i class="fas fa-images text-gray-300 text-6xl mb-4"></i>
                <p class="text-gray-500">メインイメージが登録されていません</p>
                <button onclick="openAddModal()" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                    <i class="fas fa-plus mr-2"></i>最初のメインイメージを追加
                </button>
            </div>
            ` : ''}

        </div>
        </div>

        <!-- Add/Edit Modal -->
        <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="modal-title" class="text-2xl font-bold">メインイメージを追加</h2>
                    <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <form id="image-form" class="space-y-6">
                    <input type="hidden" id="image-id" name="id">

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">メディアタイプ <span class="text-red-600">*</span></label>
                        <select name="media_type" id="media-type" required 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="image">画像</option>
                            <option value="video">動画</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">PC用画像/動画 <span class="text-red-600">*</span></label>
                        <p class="text-xs text-gray-500 mb-3">
                            <i class="fas fa-info-circle mr-1"></i>
                            <strong>推奨:</strong> 画像 1920×1080px (16:9横長), <strong class="text-red-600">最大3MB</strong> | 動画 1920×1080px 30fps, 最大100MB, 10-30秒
                        </p>
                        
                        <!-- Tab Selection -->
                        <div class="flex mb-4 border-b">
                            <button type="button" onclick="switchTab('upload')" id="tab-upload" 
                                    class="px-4 py-2 font-medium border-b-2 border-blue-600 text-blue-600">
                                <i class="fas fa-upload mr-2"></i>アップロード
                            </button>
                            <button type="button" onclick="switchTab('url')" id="tab-url" 
                                    class="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
                                <i class="fas fa-link mr-2"></i>URLで指定
                            </button>
                        </div>

                        <!-- Upload Tab -->
                        <div id="upload-tab" class="tab-content">
                            <div id="media-upload-container"></div>
                        </div>

                        <!-- URL Tab -->
                        <div id="url-tab" class="tab-content hidden">
                            <input type="url" id="media-url-input" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="https://example.com/image.jpg">
                            <p class="text-xs text-gray-500 mt-1">
                                画像または動画ファイルの完全なURLを入力してください
                            </p>
                        </div>

                        <input type="hidden" name="media_url" id="media-url" required>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">スマホ用画像/動画（任意）</label>
                        <p class="text-xs text-gray-500 mb-3">
                            <i class="fas fa-info-circle mr-1"></i>
                            スマホで表示する専用の画像/動画を設定できます。未設定の場合はPC用画像が表示されます。<br>
                            <strong>推奨:</strong> 画像 1080×1920px (9:16縦長), <strong class="text-red-600">最大3MB</strong> | 動画 1080×1920px 30fps, 最大50MB, 10-20秒
                        </p>
                        
                        <!-- Mobile Tab Selection -->
                        <div class="flex mb-4 border-b">
                            <button type="button" onclick="switchMobileTab('upload')" id="tab-mobile-upload" 
                                    class="px-4 py-2 font-medium border-b-2 border-blue-600 text-blue-600">
                                <i class="fas fa-upload mr-2"></i>アップロード
                            </button>
                            <button type="button" onclick="switchMobileTab('url')" id="tab-mobile-url" 
                                    class="px-4 py-2 font-medium text-gray-500 hover:text-gray-700">
                                <i class="fas fa-link mr-2"></i>URLで指定
                            </button>
                        </div>

                        <!-- Mobile Upload Tab -->
                        <div id="mobile-upload-tab" class="tab-content">
                            <div id="mobile-media-upload-container"></div>
                        </div>

                        <!-- Mobile URL Tab -->
                        <div id="mobile-url-tab" class="tab-content hidden">
                            <input type="url" id="mobile-media-url-input" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="https://example.com/mobile-image.jpg">
                            <p class="text-xs text-gray-500 mt-1">
                                スマホ用の画像または動画ファイルのURLを入力してください
                            </p>
                        </div>

                        <input type="hidden" name="mobile_media_url" id="mobile-media-url">
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
        <script>
          let isEditMode = false;
          let uploader = null;

          // Initialize Sortable
          const imagesList = document.getElementById('images-list');
          if (imagesList && imagesList.children.length > 0) {
            new Sortable(imagesList, {
              animation: 150,
              handle: '.fa-grip-vertical',
              onEnd: async function(evt) {
                const items = Array.from(imagesList.children);
                const updates = items.map((item, index) => ({
                  id: parseInt(item.dataset.id),
                  display_order: index + 1
                }));
                
                try {
                  await axios.post('/admin/api/main-images/reorder', { updates });
                  location.reload();
                } catch (error) {
                  alert('並び替えの保存に失敗しました: ' + error.message);
                }
              }
            });
          }

          // Tab switching
          function switchTab(tab) {
            const uploadTab = document.getElementById('upload-tab');
            const urlTab = document.getElementById('url-tab');
            const uploadBtn = document.getElementById('tab-upload');
            const urlBtn = document.getElementById('tab-url');
            const mediaUrlInput = document.getElementById('media-url-input');
            const mediaUrlHidden = document.getElementById('media-url');

            if (tab === 'upload') {
              uploadTab.classList.remove('hidden');
              urlTab.classList.add('hidden');
              uploadBtn.classList.add('border-blue-600', 'text-blue-600');
              uploadBtn.classList.remove('text-gray-500');
              urlBtn.classList.remove('border-blue-600', 'text-blue-600');
              urlBtn.classList.add('text-gray-500');
              
              // Clear URL input when switching to upload
              mediaUrlInput.value = '';
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
          document.getElementById('media-url-input').addEventListener('input', (e) => {
            document.getElementById('media-url').value = e.target.value;
          });

          // Mobile tab switching
          function switchMobileTab(tab) {
            const uploadTab = document.getElementById('mobile-upload-tab');
            const urlTab = document.getElementById('mobile-url-tab');
            const uploadBtn = document.getElementById('tab-mobile-upload');
            const urlBtn = document.getElementById('tab-mobile-url');
            const mediaUrlInput = document.getElementById('mobile-media-url-input');

            if (tab === 'upload') {
              uploadTab.classList.remove('hidden');
              urlTab.classList.add('hidden');
              uploadBtn.classList.add('border-blue-600', 'text-blue-600');
              uploadBtn.classList.remove('text-gray-500');
              urlBtn.classList.remove('border-blue-600', 'text-blue-600');
              urlBtn.classList.add('text-gray-500');
              
              // Clear URL input when switching to upload
              mediaUrlInput.value = '';
            } else {
              uploadTab.classList.add('hidden');
              urlTab.classList.remove('hidden');
              urlBtn.classList.add('border-blue-600', 'text-blue-600');
              urlBtn.classList.remove('text-gray-500');
              uploadBtn.classList.remove('border-blue-600', 'text-blue-600');
              uploadBtn.classList.add('text-gray-500');
            }
          }

          // Sync mobile URL input with hidden field
          document.getElementById('mobile-media-url-input').addEventListener('input', (e) => {
            document.getElementById('mobile-media-url').value = e.target.value;
          });

          function openAddModal() {
            isEditMode = false;
            document.getElementById('modal-title').textContent = 'メインイメージを追加';
            document.getElementById('image-form').reset();
            document.getElementById('image-id').value = '';
            document.getElementById('modal').classList.remove('hidden');
            
            // Initialize uploader
            initUploader();
          }

          function initUploader() {
            const container = document.getElementById('media-upload-container');
            if (!container) return;

            uploader = new MediaUploader({
              acceptImages: true,
              acceptVideos: true,
              maxImageSize: 3 * 1024 * 1024, // 3MB
              maxVideoSize: 100 * 1024 * 1024, // 100MB
              onUploadStart: (file) => {
                console.log('Upload started:', file.name);
              },
              onUploadProgress: (percent) => {
                console.log('Upload progress:', percent + '%');
              },
              onUploadComplete: (result) => {
                document.getElementById('media-url').value = result.url;
                console.log('Upload complete:', result);
              },
              onUploadError: (error) => {
                alert('アップロードエラー: ' + error);
              }
            });

            uploader.createUploadButton('media-upload-container', {
              name: 'media_url',
              buttonText: 'ファイルを選択',
              showPreview: true
            });

            // Initialize mobile uploader
            const mobileUploader = new MediaUploader({
              acceptImages: true,
              acceptVideos: true,
              maxImageSize: 3 * 1024 * 1024, // 3MB
              maxVideoSize: 100 * 1024 * 1024, // 100MB
              onUploadStart: (file) => {
                console.log('Mobile upload started:', file.name);
              },
              onUploadProgress: (percent) => {
                console.log('Mobile upload progress:', percent + '%');
              },
              onUploadComplete: (result) => {
                document.getElementById('mobile-media-url').value = result.url;
                console.log('Mobile upload complete:', result);
              },
              onUploadError: (error) => {
                alert('スマホ画像アップロードエラー: ' + error);
              }
            });

            mobileUploader.createUploadButton('mobile-media-upload-container', {
              name: 'mobile_media_url',
              buttonText: 'スマホ用ファイルを選択',
              showPreview: true
            });
          }

          function editImage(image) {
            isEditMode = true;
            document.getElementById('modal-title').textContent = 'メインイメージを編集';
            document.getElementById('image-id').value = image.id;
            document.getElementById('media-type').value = image.media_type;
            document.getElementById('media-url').value = image.media_url;
            document.getElementById('media-url-input').value = image.media_url;
            document.getElementById('mobile-media-url').value = image.mobile_media_url || '';
            document.getElementById('mobile-media-url-input').value = image.mobile_media_url || '';
            document.getElementById('modal').classList.remove('hidden');
            
            // Initialize uploader
            initUploader();
            
            // Switch to URL tab and show existing URL
            switchTab('url');
            switchMobileTab('url');
          }

          function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            document.getElementById('modal-success').classList.add('hidden');
            document.getElementById('modal-error').classList.add('hidden');
          }

          async function deleteImage(id) {
            if (!confirm('このメインイメージを削除しますか？')) return;
            
            try {
              await axios.delete('/admin/api/main-images/' + id);
              location.reload();
            } catch (error) {
              alert('削除に失敗しました: ' + error.message);
            }
          }

          document.getElementById('image-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
              if (isEditMode) {
                await axios.put('/admin/api/main-images/' + data.id, data);
              } else {
                await axios.post('/admin/api/main-images', data);
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

  return c.html(getAdminLayout(content, 'main-images', 'メインイメージ管理'));
})

// API: Get all main images
app.get('/', requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM main_images ORDER BY display_order ASC'
  ).all();
  
  return c.json(results);
})

// API: Add new main image
app.post('/', requireAuth, async (c) => {
  const data = await c.req.json();
  
  // Check if already 3 images
  const { results } = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM main_images'
  ).all();
  
  if (results[0].count >= 3) {
    return c.json({ success: false, message: '最大3つまでしか登録できません' }, 400);
  }
  
  // Get next display_order
  const maxOrder = await c.env.DB.prepare(
    'SELECT MAX(display_order) as max_order FROM main_images'
  ).first();
  
  const nextOrder = (maxOrder?.max_order || 0) + 1;
  
  await c.env.DB.prepare(`
    INSERT INTO main_images (media_type, media_url, mobile_media_url, display_order)
    VALUES (?, ?, ?, ?)
  `).bind(data.media_type, data.media_url, data.mobile_media_url || null, nextOrder).run();
  
  return c.json({ success: true });
})

// API: Update main image
app.put('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  const data = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE main_images SET
      media_type = ?,
      media_url = ?,
      mobile_media_url = ?
    WHERE id = ?
  `).bind(data.media_type, data.media_url, data.mobile_media_url || null, id).run();
  
  return c.json({ success: true });
})

// API: Delete main image
app.delete('/:id', requireAuth, async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare('DELETE FROM main_images WHERE id = ?').bind(id).run();
  
  // Reorder remaining images
  const { results } = await c.env.DB.prepare(
    'SELECT id FROM main_images ORDER BY display_order ASC'
  ).all();
  
  for (let i = 0; i < results.length; i++) {
    await c.env.DB.prepare(
      'UPDATE main_images SET display_order = ? WHERE id = ?'
    ).bind(i + 1, results[i].id).run();
  }
  
  return c.json({ success: true });
})

// API: Reorder main images
app.post('/reorder', requireAuth, async (c) => {
  const { updates } = await c.req.json();
  
  for (const update of updates) {
    await c.env.DB.prepare(
      'UPDATE main_images SET display_order = ? WHERE id = ?'
    ).bind(update.display_order, update.id).run();
  }
  
  return c.json({ success: true });
})

export default app
