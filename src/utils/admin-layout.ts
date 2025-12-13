export function getAdminLayout(content: string, currentPage: string = '', pageTitle: string = '管理画面') {
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageTitle} - 管理画面</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
        <style>
          .sidebar-link {
            transition: all 0.3s ease;
          }
          .sidebar-link:hover {
            background-color: rgba(59, 130, 246, 0.1);
            padding-left: 1.5rem;
          }
          .sidebar-link.active {
            background-color: rgba(59, 130, 246, 0.2);
            border-left: 4px solid #3b82f6;
            font-weight: 600;
          }
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="flex min-h-screen">
            <!-- Sidebar -->
            <aside class="w-64 bg-white shadow-lg fixed h-full overflow-y-auto">
                <!-- Logo / Brand -->
                <div class="p-6 border-b">
                    <h1 class="text-2xl font-bold text-gray-800">
                        <i class="fas fa-utensils text-blue-600 mr-2"></i>
                        管理画面
                    </h1>
                </div>

                <!-- Navigation Menu -->
                <nav class="p-4">
                    <div class="mb-6">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">メインメニュー</p>
                        
                        <a href="/admin/dashboard" class="sidebar-link ${currentPage === 'dashboard' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-home w-5"></i>
                            <span class="ml-3">ダッシュボード</span>
                        </a>

                        <a href="/admin/store-info" class="sidebar-link ${currentPage === 'store-info' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-store w-5"></i>
                            <span class="ml-3">店舗情報</span>
                        </a>
                    </div>

                    <div class="mb-6">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">コンテンツ管理</p>
                        
                        <a href="/admin/main-images" class="sidebar-link ${currentPage === 'main-images' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-images w-5"></i>
                            <span class="ml-3">メインイメージ</span>
                        </a>

                        <a href="/admin/commitment" class="sidebar-link ${currentPage === 'commitment' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-heart w-5"></i>
                            <span class="ml-3">こだわり情報</span>
                        </a>

                        <a href="/admin/greeting" class="sidebar-link ${currentPage === 'greeting' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-user-tie w-5"></i>
                            <span class="ml-3">ご挨拶</span>
                        </a>

                        <a href="/admin/menu" class="sidebar-link ${currentPage === 'menu' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-utensils w-5"></i>
                            <span class="ml-3">メニュー</span>
                        </a>

                        <a href="/admin/banquet" class="sidebar-link ${currentPage === 'banquet' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-wine-glass w-5"></i>
                            <span class="ml-3">宴会コース</span>
                        </a>

                        <a href="/admin/news" class="sidebar-link ${currentPage === 'news' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-newspaper w-5"></i>
                            <span class="ml-3">新着情報</span>
                        </a>

                        <a href="/admin/gallery" class="sidebar-link ${currentPage === 'gallery' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-camera w-5"></i>
                            <span class="ml-3">ギャラリー</span>
                        </a>

                        <a href="/admin/faq" class="sidebar-link ${currentPage === 'faq' ? 'active' : ''} flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-question-circle w-5"></i>
                            <span class="ml-3">よくある質問</span>
                        </a>
                    </div>

                    <div class="mb-6">
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">その他</p>
                        
                        <a href="/" target="_blank" class="sidebar-link flex items-center px-4 py-3 text-gray-700 rounded-lg mb-1">
                            <i class="fas fa-external-link-alt w-5"></i>
                            <span class="ml-3">サイトを表示</span>
                        </a>

                        <a href="/admin/logout" class="sidebar-link flex items-center px-4 py-3 text-red-600 rounded-lg mb-1">
                            <i class="fas fa-sign-out-alt w-5"></i>
                            <span class="ml-3">ログアウト</span>
                        </a>
                    </div>
                </nav>
            </aside>

            <!-- Main Content -->
            <div class="flex-1 ml-64">
                <!-- Top Bar -->
                <header class="bg-white shadow-sm sticky top-0 z-10">
                    <div class="px-6 py-4 flex justify-between items-center">
                        <h2 class="text-xl font-semibold text-gray-800">${pageTitle}</h2>
                        <div class="flex items-center space-x-4">
                            <a href="/" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                                <i class="fas fa-external-link-alt mr-1"></i>
                                サイトを見る
                            </a>
                        </div>
                    </div>
                </header>

                <!-- Page Content -->
                <main class="p-6">
                    ${content}
                </main>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    </body>
    </html>
  `;
}
