This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Gider Takip - Expense Tracker

Bu proje, kişisel gider ve gelir takibi için geliştirilmiş bir React Native uygulamasıdır.

## Özellikler

- 🔐 Kullanıcı girişi ve kimlik doğrulama
- 💰 Gider ve gelir takibi
- 📊 Kategori bazlı işlem yönetimi
- 🌙 Karanlık/Açık tema desteği
- 📱 Android ve iOS uyumluluğu
- 🔄 Otomatik token yenileme
- 📈 İşlem özeti ve raporlama

## Kurulum

### Gereksinimler

- Node.js (v18 veya üzeri)
- React Native CLI
- Android Studio (Android geliştirme için)
- Xcode (iOS geliştirme için)

### Backend Kurulumu

1. Server klasörüne gidin:
```bash
cd server
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyası oluşturun:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
```

4. Sunucuyu başlatın:
```bash
npm run dev
```

### Client Kurulumu

1. Client klasörüne gidin:
```bash
cd client
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. API yapılandırmasını güncelleyin (`src/constants/api.js`):
```javascript
export const API_CONFIG = {
  BASE_URL: "http://YOUR_SERVER_IP:3000", // Sunucu IP adresinizi buraya yazın
  // ...
};
```

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış

### Transactions
- `GET /api/transaction/list` - İşlem listesi
- `POST /api/transaction/add` - Yeni işlem ekleme
- `PUT /api/transaction/edit/:id` - İşlem düzenleme
- `DELETE /api/transaction/delete/:id` - İşlem silme
- `GET /api/transaction/summary` - İşlem özeti

### Categories
- `GET /api/category/list` - Kategori listesi
- `POST /api/category/add` - Yeni kategori ekleme
- `PUT /api/category/edit/:id` - Kategori düzenleme
- `DELETE /api/category/delete/:id` - Kategori silme

## Kullanım

1. Uygulamayı başlattıktan sonra giriş ekranında email/kullanıcı adı ve şifrenizi girin
2. Ana ekranda gider ve gelirlerinizi görüntüleyebilirsiniz
3. Yeni işlem eklemek için ilgili butonları kullanın
4. Kategoriler ile işlemlerinizi organize edin
5. Karanlık/açık tema arasında geçiş yapabilirsiniz

## Teknolojiler

### Frontend
- React Native 0.80.1
- React Navigation 7.x
- Axios (HTTP istekleri)
- AsyncStorage (yerel depolama)

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT (JSON Web Tokens)
- Argon2 (şifre hashleme)

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
