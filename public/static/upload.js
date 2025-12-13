// Image/Video Upload Component

class MediaUploader {
  constructor(options = {}) {
    this.maxImageSize = options.maxImageSize || 10 * 1024 * 1024; // 10MB
    this.maxVideoSize = options.maxVideoSize || 100 * 1024 * 1024; // 100MB
    this.acceptImages = options.acceptImages !== false; // default true
    this.acceptVideos = options.acceptVideos !== false; // default true
    this.onUploadStart = options.onUploadStart || (() => {});
    this.onUploadProgress = options.onUploadProgress || (() => {});
    this.onUploadComplete = options.onUploadComplete || (() => {});
    this.onUploadError = options.onUploadError || (() => {});
  }

  // Create file input element
  createFileInput() {
    const input = document.createElement('input');
    input.type = 'file';
    
    const accept = [];
    if (this.acceptImages) {
      accept.push('image/jpeg', 'image/png', 'image/gif', 'image/webp');
    }
    if (this.acceptVideos) {
      accept.push('video/mp4', 'video/webm', 'video/quicktime');
    }
    input.accept = accept.join(',');
    
    return input;
  }

  // Validate file
  validateFile(file) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return { valid: false, error: '対応していないファイル形式です' };
    }

    if (!this.acceptImages && isImage) {
      return { valid: false, error: '画像ファイルはアップロードできません' };
    }

    if (!this.acceptVideos && isVideo) {
      return { valid: false, error: '動画ファイルはアップロードできません' };
    }

    const maxSize = isVideo ? this.maxVideoSize : this.maxImageSize;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { 
        valid: false, 
        error: `ファイルサイズが大きすぎます（最大${maxSizeMB}MB）` 
      };
    }

    return { valid: true, isImage, isVideo };
  }

  // Upload file to server
  async upload(file) {
    // Validate
    const validation = this.validateFile(file);
    if (!validation.valid) {
      this.onUploadError(validation.error);
      throw new Error(validation.error);
    }

    this.onUploadStart(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/admin/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          this.onUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        this.onUploadComplete(response.data);
        return response.data;
      } else {
        throw new Error(response.data.message || 'アップロードに失敗しました');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'アップロードに失敗しました';
      this.onUploadError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Create upload button with preview
  createUploadButton(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }

    const inputId = options.inputId || 'file-input-' + Date.now();
    const previewId = options.previewId || 'preview-' + Date.now();
    const buttonText = options.buttonText || 'ファイルを選択';
    const showPreview = options.showPreview !== false;

    // Create HTML structure
    container.innerHTML = `
      <div class="upload-container">
        <input type="hidden" id="${inputId}-url" name="${options.name || 'file_url'}" value="${options.initialValue || ''}">
        <div class="flex items-center space-x-4">
          <button type="button" onclick="document.getElementById('${inputId}').click()" 
                  class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            <i class="fas fa-upload mr-2"></i>${buttonText}
          </button>
          <input type="file" id="${inputId}" class="hidden" accept="${this.getAcceptString()}">
          <span id="${inputId}-filename" class="text-sm text-gray-600"></span>
          <div id="${inputId}-progress" class="hidden">
            <div class="w-48 bg-gray-200 rounded-full h-2">
              <div id="${inputId}-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>
        ${showPreview ? `
        <div id="${previewId}" class="mt-4 hidden">
          <div class="relative inline-block">
            <img id="${previewId}-img" class="hidden max-w-xs max-h-48 rounded shadow-lg" alt="Preview">
            <video id="${previewId}-video" class="hidden max-w-xs max-h-48 rounded shadow-lg" controls></video>
            <button type="button" onclick="document.getElementById('${inputId}-url').value=''; document.getElementById('${previewId}').classList.add('hidden')"
                    class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        ` : ''}
      </div>
    `;

    // Show initial preview if URL is provided
    if (options.initialValue && showPreview) {
      this.showPreview(previewId, options.initialValue);
    }

    // Handle file selection
    document.getElementById(inputId).addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // Show filename
        document.getElementById(`${inputId}-filename`).textContent = file.name;
        
        // Show progress bar
        const progressContainer = document.getElementById(`${inputId}-progress`);
        progressContainer.classList.remove('hidden');

        // Upload
        const result = await this.upload(file);

        // Hide progress bar
        progressContainer.classList.add('hidden');

        // Update hidden input with URL
        document.getElementById(`${inputId}-url`).value = result.url;

        // Show preview
        if (showPreview) {
          this.showPreview(previewId, result.url, file.type);
        }

        // Success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      } catch (error) {
        // Hide progress bar
        document.getElementById(`${inputId}-progress`).classList.add('hidden');
        
        // Error callback
        if (options.onError) {
          options.onError(error);
        } else {
          alert('アップロードエラー: ' + error.message);
        }
      }
    });
  }

  // Show preview
  showPreview(previewId, url, mimeType = '') {
    const previewContainer = document.getElementById(previewId);
    const imgElement = document.getElementById(`${previewId}-img`);
    const videoElement = document.getElementById(`${previewId}-video`);

    if (!previewContainer) return;

    const isVideo = mimeType.startsWith('video/') || url.match(/\.(mp4|webm|mov)$/i);

    if (isVideo) {
      videoElement.src = url;
      videoElement.classList.remove('hidden');
      imgElement.classList.add('hidden');
    } else {
      imgElement.src = url;
      imgElement.classList.remove('hidden');
      videoElement.classList.add('hidden');
    }

    previewContainer.classList.remove('hidden');
  }

  // Get accept string for file input
  getAcceptString() {
    const accept = [];
    if (this.acceptImages) {
      accept.push('image/*');
    }
    if (this.acceptVideos) {
      accept.push('video/*');
    }
    return accept.join(',');
  }
}

// Global uploader instance
window.MediaUploader = MediaUploader;
