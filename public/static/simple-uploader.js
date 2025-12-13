// Simplified uploader integration for admin forms

function addSimpleUploader(inputId, options = {}) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) return;

  const containerId = inputId + '-upload-container';
  const accept = options.acceptVideos ? 'image/*,video/*' : 'image/*';
  const maxSize = options.maxSize || (options.acceptVideos ? 100 * 1024 * 1024 : 10 * 1024 * 1024);

  // Create upload UI
  const uploadHTML = `
    <div id="${containerId}" class="mb-2">
      <input type="file" id="${inputId}-file" accept="${accept}" class="hidden">
      <div class="flex items-center space-x-2">
        <button type="button" onclick="document.getElementById('${inputId}-file').click()" 
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm">
          <i class="fas fa-upload mr-1"></i>ファイルをアップロード
        </button>
        <span id="${inputId}-filename" class="text-xs text-gray-600"></span>
      </div>
      <div id="${inputId}-progress" class="hidden mt-2">
        <div class="w-full bg-gray-200 rounded-full h-1.5">
          <div id="${inputId}-progress-bar" class="bg-blue-600 h-1.5 rounded-full transition-all" style="width: 0%"></div>
        </div>
      </div>
    </div>
  `;

  inputElement.insertAdjacentHTML('beforebegin', uploadHTML);

  // Handle file selection
  document.getElementById(inputId + '-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      alert(`ファイルサイズが大きすぎます（最大${Math.round(maxSize / 1024 / 1024)}MB）`);
      return;
    }

    try {
      // Show filename and progress
      document.getElementById(inputId + '-filename').textContent = file.name;
      const progressContainer = document.getElementById(inputId + '-progress');
      const progressBar = document.getElementById(inputId + '-progress-bar');
      progressContainer.classList.remove('hidden');

      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/admin/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          progressBar.style.width = percent + '%';
        }
      });

      // Hide progress and update input
      setTimeout(() => {
        progressContainer.classList.add('hidden');
        progressBar.style.width = '0%';
      }, 500);

      if (response.data.success) {
        inputElement.value = response.data.url;
        if (options.onSuccess) options.onSuccess(response.data);
      } else {
        throw new Error(response.data.message || 'アップロード失敗');
      }
    } catch (error) {
      document.getElementById(inputId + '-progress').classList.add('hidden');
      alert('アップロードエラー: ' + (error.response?.data?.message || error.message));
    }
  });
}
