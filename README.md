# DolmaParmak — Profesyonel Türkçe Klavye Eğitim Platformu

DolmaParmak, kullanıcıların A1 seviyesinden C2 seviyesine kadar Türkçe klavye yazma hızlarını (WPM) ve doğruluk oranlarını artırmayı hedefleyen modern bir web uygulamasıdır.

## Özellikler

- **Milyonlarca Renk Değil, Neon:** Cam tasarımı (glassmorphism) ve neon ışıklandırmalı ultra modern UI/X.
- **Canlı Analiz Motoru:** Anlık WPM, doğruluk ve saniye sayacı. (Kopyala-yapıştır korumalı)
- **Firebase Auth:** Güvenli E-posta/şifre girişi, otomatik online/offline takibi.
- **Seviye ve XP Sistemi:** A1'den C2'ye kilitli seviyeler, XP kazanımı ve 7 gelişmiş rozet.
- **Admin Yönetim Paneli:** Kullanıcı istatistikleri (aktif kullanıcı, yaş/xp dağılımı), detaylı WPM grafiği, kullanıcı engelleme.
- **Sistem Duyuruları (AdminMessages):** Hedefe yönelik veya genel, süreli, modal pop-up duyuru sistemi.
- **PWA Desteği:** Masaüstü ve mobil kullanım için çevrimdışı önbellekleme yeteneği.

## Kurulum ve Çalıştırma

### 1) Bağımlılıkları Yükleyin

```bash
npm install
```

### 2) Firebase Ayarlarını Yapılandırın

1. [Firebase Console](https://console.firebase.google.com/)'a gidin ve yeni bir proje oluşturun.
2. **Authentication** > **Sign-in method** bölümünden *Email/Password* girişini aktif edin.
3. **Firestore Database** oluşturun. Kurulumda *Test Mode* veya *Production Mode* seçebilirsiniz.
4. Proje ayarları altından yeni bir **Web App** oluşturun ve config bilgilerini kopyalayın.
5. Proje kök dizininde bulunan `.env.example` dosyasını `.env` olarak kopyalayın ve içine Firebase ayarlarınızı yapıştırın.

### 3) Firestore Güvenlik Kurallarını Ayarlayın

Firebase Console > Firestore Database > Rules sekmesine gidin ve `firestore.rules` dosyasındaki içeriği yapıştırıp yayınlayın.

### 4) Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

---

## 🔑 İlk Admin Kullanıcısını Nasıl Oluştururum?

Uygulamanın güvenlik modelleri gereği arayüzden direkt "Admin" kayıt olunamaz.

1. Arayüzden normal bir kullanıcı olarak (`admin@ornek.com`) kayıt olun.
2. **Firebase Console** > **Firestore Database** > `users` koleksiyonuna gidin.
3. Kendi oluşturduğunuz kullanıcının dökümanını (UID) bulun.
4. `role` alanının değerini `"user"` yerine `"admin"` olarak değiştirin.
5. Uygulamaya geri dönün ve sayfayı yenileyin; artık sol menüde **Admin Panel** seçeneğini göreceksiniz.

---

## 🚀 GitHub Pages Üzerine Deployment (Otomatik)

Bu proje GitHub Actions ile entegre edilmiştir. Kodu GitHub'a "main" dalına push ettiğiniz anda otomatik olarak deploy edilir.

**GitHub Secrets Ayarları:**
Repo > Settings > Secrets and variables > Actions sekmesine gidin. `Repository secrets` altına şu değerleri **MUTLAKA** ekleyin:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Ayrıca GitHub Repo > Settings > Pages menüsünden "Source" olarak *GitHub Actions* seçtiğinizden emin olun.
