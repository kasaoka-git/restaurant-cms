import { Hono } from 'hono'
import type { Bindings, StoreInfo } from '../types'

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  // Fetch store info for SEO
  const storeInfo = await c.env.DB.prepare(
    'SELECT * FROM store_info LIMIT 1'
  ).first<StoreInfo>();

  // Fetch theme setting
  const themeSetting = await c.env.DB.prepare(
    'SELECT setting_value FROM site_settings WHERE setting_key = ?'
  ).bind('theme').first();
  
  const theme = themeSetting?.setting_value || 'default';

  const seoTitle = storeInfo?.seo_title || storeInfo?.store_name || '和食レストラン';
  const seoDescription = storeInfo?.seo_description || '';
  const ga4Id = storeInfo?.ga4_id || '';
  const clarityId = storeInfo?.clarity_id || '';

  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${seoTitle}</title>
        <meta name="description" content="${seoDescription}">
        ${storeInfo?.seo_keywords ? `<meta name="keywords" content="${storeInfo.seo_keywords}">` : ''}
        
        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="/static/favicon.ico">
        
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Swiper CSS -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
        
        <!-- Font Awesome -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        
        <!-- Base CSS (構造) -->
        <link href="/static/base.css" rel="stylesheet">
        
        <!-- Theme CSS (デザイン) -->
        <link href="/static/theme-${theme}.css" rel="stylesheet">
        
        <!-- Custom CSS (追加カスタマイズ用) -->
        <link href="/static/style.css" rel="stylesheet">
        
        <!-- Google Analytics 4 -->
        ${ga4Id ? `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${ga4Id}');
        </script>
        ` : ''}
        
        <!-- Microsoft Clarity -->
        ${clarityId ? `
        <script type="text/javascript">
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        </script>
        ` : ''}

        <!-- Tailwind Custom Config -->
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#8B4513',
                  secondary: '#D2691E',
                  accent: '#F4A460',
                  dark: '#2C1810',
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gray-50 text-gray-800">
        <!-- Navigation -->
        <nav id="navbar" class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50 transition-all duration-300">
            <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                <div class="text-2xl font-bold text-primary" id="nav-store-name">
                    <!-- Loaded by JS -->
                </div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="nav-link text-gray-700 hover:text-primary transition">ホーム</a>
                    <a href="#commitment" class="nav-link text-gray-700 hover:text-primary transition">こだわり</a>
                    <a href="#greeting" class="nav-link text-gray-700 hover:text-primary transition">ご挨拶</a>
                    <a href="#menu" class="nav-link text-gray-700 hover:text-primary transition">メニュー</a>
                    <a href="#news" class="nav-link text-gray-700 hover:text-primary transition">新着情報</a>
                    <a href="#gallery" class="nav-link text-gray-700 hover:text-primary transition">ギャラリー</a>
                    <a href="#access" class="nav-link text-gray-700 hover:text-primary transition">アクセス</a>
                    <a href="#faq" class="nav-link text-gray-700 hover:text-primary transition">よくある質問</a>
                </div>
                <button id="reservation-btn-nav" class="hidden bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition">
                    ご予約
                </button>
                <button class="md:hidden text-primary" id="mobile-menu-btn">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
                <div class="container mx-auto px-4 py-4 flex flex-col space-y-4">
                    <a href="#home" class="nav-link text-gray-700 hover:text-primary transition">ホーム</a>
                    <a href="#commitment" class="nav-link text-gray-700 hover:text-primary transition">こだわり</a>
                    <a href="#greeting" class="nav-link text-gray-700 hover:text-primary transition">ご挨拶</a>
                    <a href="#menu" class="nav-link text-gray-700 hover:text-primary transition">メニュー</a>
                    <a href="#news" class="nav-link text-gray-700 hover:text-primary transition">新着情報</a>
                    <a href="#gallery" class="nav-link text-gray-700 hover:text-primary transition">ギャラリー</a>
                    <a href="#access" class="nav-link text-gray-700 hover:text-primary transition">アクセス</a>
                    <a href="#faq" class="nav-link text-gray-700 hover:text-primary transition">よくある質問</a>
                    <button id="reservation-btn-mobile" class="hidden bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition">
                        ご予約
                    </button>
                </div>
            </div>
        </nav>

        <!-- Hero Section with Swiper -->
        <section id="home" class="pt-16">
            <div class="swiper hero-swiper h-[70vh]">
                <div class="swiper-wrapper" id="hero-slides">
                    <!-- Loaded by JS -->
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        </section>

        <!-- Commitment Section -->
        <section id="commitment" class="py-20 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">当店のこだわり</h2>
                <div id="commitment-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Loaded by JS -->
                </div>
            </div>
        </section>

        <!-- Greeting Section -->
        <section id="greeting" class="py-20 bg-gray-100">
            <div class="container mx-auto px-4">
                <div id="greeting-content" class="max-w-4xl mx-auto">
                    <!-- Loaded by JS -->
                </div>
            </div>
        </section>

        <!-- Menu Section -->
        <section id="menu" class="py-20 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">メニュー</h2>
                <div class="max-w-4xl mx-auto">
                    <div class="swiper menu-swiper">
                        <div class="swiper-wrapper" id="menu-slides">
                            <!-- Loaded by JS -->
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Banquet Section -->
        <section id="banquet" class="py-20 bg-gray-100 hidden">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">宴会コース</h2>
                <div id="banquet-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Loaded by JS -->
                </div>
            </div>
        </section>

        <!-- News Section -->
        <section id="news" class="py-20 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">新着情報</h2>
                <div id="news-list" class="max-w-3xl mx-auto space-y-6">
                    <!-- Loaded by JS -->
                </div>
            </div>
        </section>

        <!-- Gallery Section -->
        <section id="gallery" class="py-20 bg-gray-100">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">ギャラリー</h2>
                <div class="max-w-6xl mx-auto">
                    <div class="swiper gallery-swiper">
                        <div class="swiper-wrapper" id="gallery-slides">
                            <!-- Loaded by JS -->
                        </div>
                        <div class="swiper-pagination gallery-pagination"></div>
                        <div class="swiper-button-prev gallery-prev"></div>
                        <div class="swiper-button-next gallery-next"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Access Section -->
        <section id="access" class="py-20 bg-white">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">アクセス・店舗情報</h2>
                <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <div id="store-info-content">
                        <!-- Loaded by JS -->
                    </div>
                    <div id="map-content">
                        <!-- Loaded by JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <section id="faq" class="py-20 bg-gray-100">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">よくある質問</h2>
                <div id="faq-list" class="max-w-3xl mx-auto space-y-4">
                    <!-- Loaded by JS -->
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="py-20 bg-white hidden">
            <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-primary mb-12">お問い合わせ</h2>
                <div id="contact-content" class="max-w-3xl mx-auto">
                    <!-- Loaded by JS -->
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-dark text-white py-12">
            <div class="container mx-auto px-4">
                <div class="grid md:grid-cols-3 gap-8">
                    <div>
                        <h3 id="footer-store-name" class="text-2xl font-bold mb-4">
                            <!-- Loaded by JS -->
                        </h3>
                        <p id="footer-address" class="text-gray-300">
                            <!-- Loaded by JS -->
                        </p>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4">営業時間</h4>
                        <p id="footer-hours" class="text-gray-300">
                            <!-- Loaded by JS -->
                        </p>
                    </div>
                    <div>
                        <h4 class="text-xl font-bold mb-4">お問い合わせ</h4>
                        <p id="footer-phone" class="text-gray-300">
                            <!-- Loaded by JS -->
                        </p>
                        <button id="reservation-btn-footer" class="hidden mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-secondary transition">
                            ご予約
                        </button>
                    </div>
                </div>
                <div class="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                    <p>&copy; <span id="footer-year"></span> <span id="footer-copyright-name"></span>. All Rights Reserved.</p>
                </div>
            </div>
        </footer>

        <!-- Image Modal -->
        <div id="image-modal" class="hidden fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onclick="closeModal()">
            <img id="modal-image" src="" alt="" class="max-w-full max-h-full object-contain">
            <button class="absolute top-4 right-4 text-white text-4xl" onclick="closeModal()">&times;</button>
        </div>

        <!-- Swiper JS -->
        <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
        
        <!-- Axios -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        <!-- Custom JS -->
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
