# 🕊️ Albatros E-Ticaret ve Dağıtım Yönetim Platformu (albatrosrov.com)

Bu README dosyası, **[albatrosrov.com](https://albatrosrov.com)** adresinde yayında olan Albatros E-Ticaret ve Dağıtım Yönetim Sistemi'nin genel yapısını, kullanıcı panellerini ve site kullanım/erişim bilgilerini içermektedir.

---

## 🚀 Web Sitesi Çalıştırma ve Erişim Kılavuzu

Albatros platformu canlı ortamda yayındadır ve aşağıdaki adresler üzerinden erişilebilir durumdadır:

* 🌐 **Canlı Web Sitesi:** [https://albatrosrov.com](https://albatrosrov.com)
* 🔐 **Giriş Sayfası:** [https://albatrosrov.com/login](https://albatrosrov.com/login)
* 🛠️ **Yönetici Paneli:** [https://albatrosrov.com/admin](https://albatrosrov.com/admin)
* 🚚 **Şoför / Kurye Paneli:** [https://albatrosrov.com/driver](https://albatrosrov.com/driver)

### Yerel Geliştirme Ortamında Çalıştırma (Development)
Eğer projeyi yerel bilgisayarınızda test etmek veya geliştirmek isterseniz:

1. WebUI klasörüne geçiş yapın:
   ```bash
   cd DistroProject.WebUI
   ```
2. Gerekli paketleri yükleyin:
   ```bash
   npm install
   ```
3. Yerel sunucuyu başlatın:
   ```bash
   npm run dev
   ```
4. Tarayıcıda `http://localhost:5173` adresinden yerel arayüze erişebilirsiniz. Proje, `.env` dosyaları üzerinden canlı API bağlantısını (`https://albatrosrov.com`) kullanacak şekilde konfigüre edilmiştir.

---

## 🌟 Kullanıcı Rolleri ve Panel Özellikleri

Platform; Müşteri, Şoför ve Yönetici (Admin) olmak üzere üç farklı rol ve bunlara özel olarak tasarlanmış paneller sunmaktadır.

### 👤 1. Müşteri (Consumer) Paneli
Müşterilerin alışveriş yapabileceği, siparişlerini takip edebileceği ve adreslerini yönetebileceği arayüzdür.
* **Ürün Tarama ve Listeleme:** Kategorilere göre filtreleme, detaylı ürün sayfaları ve dinamik arama motoru.
* **Alışveriş Sepeti:** Dinamik fiyat güncellemeleri ve miktar kontrolleri barındıran gelişmiş sepet yönetimi.
* **Ödeme ve Sipariş Tamamlama (Checkout):** Fatura/teslimat adresi seçimi, ödeme yöntemi belirleme ve sipariş tamamlama adımları.
* **Hesabım (My Account) Sayfası:**
  - Geçmiş sipariş listesi ve siparişlerin anlık kargo/hazırlanma durum takibi.
  - Harita tabanlı gelişmiş adres ekleme (Leaflet harita entegrasyonu ile harita üzerinden tıklayarak tam konum belirleme).
  - Profil ve kişisel bilgi yönetimi.

### 🚚 2. Şoför (Driver) Paneli
Dağıtım kuryeleri ve şoförlerin kendilerine atanan siparişleri teslim etmek için kullandıkları lojistik ve konum odaklı portaldır.
* **Aktif Sipariş Listesi:** Kendisine atanan tüm teslimat siparişlerinin müşteri bilgisi, adres detayı ve ürün bilgileriyle birlikte listelenmesi.
* **Durum Yönetimi:** Teslimat sürecindeki siparişleri "Yola Çıktı" veya "Teslim Edildi" olarak işaretleyip durumunu anlık olarak API'ye bildirme.
* **Akıllı Rota Haritası (Leaflet + OSRM):**
  - Kendisine atanan teslimat konumlarının koordinatları analiz edilerek en verimli dağıtım rotasının harita üzerinde çizilmesi.
  - Adım adım yol tarifi desteği.

### 👑 3. Yönetici (Admin) Paneli
Sistemin tüm e-ticaret, lojistik ve finansal süreçlerinin yönetildiği merkezi kontrol alanıdır.
* **Gösterge Paneli (Dashboard):** Toplam satışlar, sipariş sayıları, şoför aktiflikleri ve kullanıcı istatistiklerinin grafiklerle (Chart.js) anlık takibi.
* **Ürün ve Kategori Yönetimi:** Ürün ekleme, güncelleme, silme, stok durum kontrolü ve kategori ilişkilendirme işlemleri.
* **Kullanıcı ve Rol Yönetimi:** Sistemdeki tüm kullanıcıları görme, rolleri (Müşteri, Şoför, Admin) değiştirme ve hesap kilitleme/aktif etme özellikleri.
* **Şoför ve Araç Yönetimi:** Şoför hesaplarının oluşturulması, güncellenmesi ve durumlarının izlenmesi.
* **Sipariş ve Dağıtım Planlama:**
  - Gelen siparişlerin listelenmesi ve harita üzerindeki teslimat konumlarına göre şoförlere atanması.
* **Fatura Yönetimi:** Tüm siparişlere ait fatura kayıtlarının tutulması, fatura detayları ve jsPDF entegrasyonu ile profesyonel PDF faturası üretilip indirilebilmesi.
* **Finans Yönetimi:** Gelir-gider tabloları, ciro raporları ve finansal grafiklerin takibi.

---

## 🔐 Örnek Giriş Bilgileri (Giriş Hesapları)

Aşağıda platformu test edebilmeniz için kullanabileceğiniz örnek kullanıcı giriş bilgileri yer almaktadır:

### 👑 Yönetici (Admin) Giriş Bilgileri
* **E-posta:** `admin@test.com]`
* **Şifre:** `123456`

### 🚚 Şoför (Driver) Giriş Bilgileri
* **E-posta:** `elif@gmail.com`
* **Şifre:** `123456`

### 👤 Müşteri (Customer) Giriş Bilgileri
* **E-posta:** `rabia@gmail.com`
* **Şifre:** `123456`

---

## 🛠️ Teknolojik Altyapı Özeti

* **Frontend:** React 19, Vite, Ant Design (antd)
* **Yönlendirme:** React Router DOM v7
* **Harita & Rotalama:** Leaflet & OSRM API (Dağıtım Rotaları)
* **Grafikler:** Chart.js & React-Chartjs-2
* **Raporlama:** jsPDF (Fatura PDF Çıktıları)
* **Backend API:** ASP.NET Core 10.0, Entity Framework Core, SQL Server
