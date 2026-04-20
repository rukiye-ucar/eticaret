import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import './PWAUpdatePrompt.css';

function PWAUpdatePrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('✅ Service Worker kayıtlı: ' + swUrl);
      // Her 1 saatte güncelleme kontrolü
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ Service Worker kayıt hatası:', error);
    },
  });

  // "Ana ekrana ekle" prompt'unu yakala
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(outcome === 'accepted' ? '✅ Uygulama yüklendi' : '❌ Yükleme reddedildi');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  return (
    <>
      {/* Güncelleme bildirimi */}
      {needRefresh && (
        <div className="pwa-toast pwa-update-toast">
          <div className="pwa-toast-content">
            <div className="pwa-toast-icon">🔄</div>
            <div className="pwa-toast-text">
              <strong>Yeni versiyon mevcut!</strong>
              <span>Güncellemek için tıklayın</span>
            </div>
          </div>
          <div className="pwa-toast-actions">
            <button className="pwa-btn pwa-btn-primary" onClick={handleUpdate}>
              Güncelle
            </button>
            <button className="pwa-btn pwa-btn-secondary" onClick={() => setNeedRefresh(false)}>
              Sonra
            </button>
          </div>
        </div>
      )}

      {/* Yükleme bildirimi */}
      {showInstallPrompt && (
        <div className="pwa-toast pwa-install-toast">
          <div className="pwa-toast-content">
            <div className="pwa-toast-icon">📲</div>
            <div className="pwa-toast-text">
              <strong>Albatros'u Yükle</strong>
              <span>Ana ekranına ekleyerek hızlı erişim sağla</span>
            </div>
          </div>
          <div className="pwa-toast-actions">
            <button className="pwa-btn pwa-btn-primary" onClick={handleInstall}>
              Yükle
            </button>
            <button className="pwa-btn pwa-btn-secondary" onClick={() => setShowInstallPrompt(false)}>
              Şimdi Değil
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PWAUpdatePrompt;
