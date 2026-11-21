# Monedsa - Gelir Gider Takip Uygulaması

> [!WARNING]
> **Monedsa sunucusu 20 Aralık 2026'da kapatılıyor.** Monedsa 2.0 tamamen çevrimdışı çalışan yeni bir sürüm: verileriniz cihazınızda kalır, isterseniz kendi Google Drive'ınıza yedekleyebilirsiniz. Hesap veya giriş gerekmez.
>
> **Sunucu kapanmadan önce verilerinizi dışa aktarın:** Monedsa 1.6'da *Ayarlar → Verilerimi dışa aktar* ile `.json` dosyasını kaydedin. 2.0'a güncelledikten sonra *Ayarlar → Dosyadan içe aktar* ile geri yükleyin. 20 Aralık'tan sonra sunucudaki veriler dışa aktarılamaz.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Kotlin](https://img.shields.io/badge/Kotlin-Jetpack%20Compose-7f52ff.svg)
![Android](https://img.shields.io/badge/Android-7.0+-3ddc84.svg)
![License](https://img.shields.io/badge/license-GPL3-yellow.svg)

Türkçe | [İngilizce](README.md) | [Felemenkçe](README_NL.md)

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" 
alt="Download from Google Play" height="80">](https://play.google.com/store/apps/details?id=com.vu4ll.monedsa)

**Monedsa**, Android için bir gelir gider takip uygulamasıdır. Hesap ya da sunucu olmadan çalışır: girdiğiniz her şey telefonunuzda kalır, yedek isterseniz kendi Google Drive'ınıza gider.

Web sitesi: [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl/tr/)

## 📱 Özellikler

- **Gelir ve giderler:** tutar, kategori, tarih ve isteğe bağlı açıklamayla işlem ekleyin, düzenleyin ve silin
- **Aylık görünüm:** her ayın geliri, gideri ve bakiyesi, harcamaların kategorilere göre dağılımıyla
- **Kategoriler:** her biri simge ve renkli kendi gelir ve gider kategorileriniz
- **Sıralama, filtre ve arama:** tutara, tarihe, kategoriye ya da açıklamaya göre
- **Para birimi:** hesap tuttuğunuz para birimini seçin (Türk lirası, euro, dolar, sterlin ve diğerleri)
- **Açık ve koyu tema:** telefonunuzu izler ya da kendiniz seçersiniz
- **Diller:** Türkçe, İngilizce ve Felemenkçe
- **Google Drive yedeklemesi (isteğe bağlı):** hemen ya da günlük veya haftalık otomatik olarak, yalnızca Monedsa'nın açabildiği gizli bir uygulama klasörüne
- **Dosyadan içe aktarma:** bir yedek dosyasını geri yükleyin ya da verilerinizi Monedsa 1.6'dan taşıyın

## 🔒 Gizlilik

Monedsa'da sunucu, hesap, reklam ya da analiz yoktur. Verileriniz cihazınızda, uygulamanın içinde saklanır. Google Drive yedeklemesi `drive.appdata` iznini kullanır; bu izin diğer dosyalarınıza değil, yalnızca Drive'ınızdaki gizli bir uygulama klasörüne erişim verir. Ayrıntılar için [gizlilik politikasına](https://monedsa.vu4ll.nl/tr/privacy-policy/) bakın.

## 🚀 Kaynaktan derleme

### Gereksinimler

- **Android Studio** (güncel kararlı sürüm) ve JDK 17
- **Android SDK 36**
- Android 7.0 (API 24) veya üstü bir cihaz ya da emülatör

### Derleme ve çalıştırma

```bash
git clone https://github.com/Vu4ll/monedsa.git
cd monedsa
./gradlew installDebug
```

Ya da projeyi Android Studio'da açıp `app` yapılandırmasını çalıştırın. Debug derlemeleri Play Store sürümünün yanına `com.vu4ll.monedsa.debug` olarak kurulur.

Release imzalama bilgileri proje kökündeki `signing.properties` dosyasından okunur (repoda yoktur). Bu dosya yoksa `assembleRelease` imzasız bir APK üretir.

Google Drive yedeklemesinin çalışması için paket adının ve imza anahtarının SHA-1 değerinin, Drive API'si açık bir Google Cloud projesinde Android OAuth istemcisi olarak kayıtlı olması gerekir.

## 🏗️ Proje Yapısı

```
monedsa/
├── app/                       # Android uygulaması (Kotlin, Jetpack Compose)
│   └── src/main/java/com/vu4ll/monedsa/
│       ├── data/              # Room veritabanı, DAO'lar, tercihler
│       ├── backup/            # Yedek dosya biçimi, Google Drive, WorkManager
│       └── ui/                # Ekranlar, bileşenler ve tema
└── web/                       # Web sitesi (Astro, statik)
```

`web/` klasörü [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl/tr/) için tanıtım sayfasını ve gizlilik politikasını içerir. Bkz. [web/README.md](web/README.md).

## 🔧 Teknolojiler

- **Kotlin** ve **Jetpack Compose** (Material 3)
- **Room** - yerel veritabanı
- **DataStore** - ayarlar
- **WorkManager** - otomatik yedekleme
- **Google Play services auth** ve **Google Drive REST API** - yedekleme
- **kotlinx.serialization** - yedek ve içe aktarma dosyaları
- **Astro** - web sitesi

## 🐛 Sorunlar

Bir hata mı buldunuz ya da bir fikriniz mi var? [Bir issue açın](https://github.com/Vu4ll/monedsa/issues/new). Uygulamada *Ayarlar → Sorun bildirin* üzerinden de ulaşabilirsiniz.

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin
2. Yeni bir feature branch oluşturun (`git checkout -b feature/new-feat`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/new-feat`)
5. Pull Request oluşturun

## 📝 Lisans

- Bu proje GPL3 lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.
- **Gizlilik politikası**: [monedsa.vu4ll.nl/tr/privacy-policy](https://monedsa.vu4ll.nl/tr/privacy-policy/)

## 📞 İletişim

- **Web sitesi:** [vu4ll.nl](https://vu4ll.nl)
- **E-posta:** [contact@vu4ll.nl](mailto:contact@vu4ll.nl)

---

**Monedsa** ile finansal durumunuzu kolayca takip edin ve bütçenizi kontrol altında tutun! 💰📊
