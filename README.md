# Monedsa - Income & Expense Tracker

> [!WARNING]
> **The Monedsa server is shutting down on 20 December 2026.** Monedsa 2.0 is a new, fully offline version: your data stays on your device and can optionally be backed up to your own Google Drive. No account or login needed.
>
> **Export your data before the shutdown:** in Monedsa 1.6, go to *Settings → Export my data* and keep the `.json` file. After updating to 2.0, use *Settings → Import from file* to bring it back. After 20 December, data on the server can no longer be exported.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Kotlin](https://img.shields.io/badge/Kotlin-Jetpack%20Compose-7f52ff.svg)
![Android](https://img.shields.io/badge/Android-7.0+-3ddc84.svg)
![License](https://img.shields.io/badge/license-GPL3-yellow.svg)

[Turkish](README_TR.md) | English | [Dutch](README_NL.md)

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" 
alt="Download from Google Play" height="80">](https://play.google.com/store/apps/details?id=com.vu4ll.monedsa)

**Monedsa** is an income and expense tracker for Android. It works without an account or a server: everything you enter stays on your phone, and backups go to your own Google Drive if you want them.

Website: [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl)

## 📱 Features

- **Income and expenses:** add, edit and delete transactions with an amount, category, date and optional description
- **Monthly overview:** income, expenses and balance per month, with spending broken down by category
- **Categories:** your own income and expense categories, each with an icon and colour
- **Sort, filter and search:** by amount, date, category or description
- **Currency:** pick the currency you count in (Turkish lira, euro, dollar, pound and more)
- **Light and dark theme:** follows your phone, or choose one yourself
- **Languages:** English, Turkish and Dutch
- **Google Drive backup (optional):** back up now, or automatically every day or week, to a private app folder only Monedsa can open
- **Import from file:** restore a backup file, or bring over your data from Monedsa 1.6

## 🔒 Privacy

Monedsa has no server, no account, no ads and no analytics. Your data is stored in the app on your device. Google Drive backup uses the `drive.appdata` permission, which only gives access to a hidden app folder in your Drive, not to your other files. See the [privacy policy](https://monedsa.vu4ll.nl/privacy-policy/).

## 🚀 Building from source

### Requirements

- **Android Studio** (recent stable) with JDK 17
- **Android SDK 36**
- An Android 7.0 (API 24) or newer device or emulator

### Build and run

```bash
git clone https://github.com/Vu4ll/monedsa.git
cd monedsa
./gradlew installDebug
```

Or open the project in Android Studio and run the `app` configuration. Debug builds install as `com.vu4ll.monedsa.debug`, next to the Play Store version.

Release signing reads its values from a `signing.properties` file in the project root (not committed). Without it, `assembleRelease` builds an unsigned APK.

Google Drive backup only works when the package name and the signing key's SHA-1 are registered as an Android OAuth client in a Google Cloud project with the Drive API enabled.

## 🏗️ Project Structure

```
monedsa/
├── app/                       # Android app (Kotlin, Jetpack Compose)
│   └── src/main/java/com/vu4ll/monedsa/
│       ├── data/              # Room database, DAOs, preferences
│       ├── backup/            # Backup file format, Google Drive, WorkManager
│       └── ui/                # Screens, components and theme
└── web/                       # Website (Astro, static)
```

`web/` holds the landing page and privacy policy for [monedsa.vu4ll.nl](https://monedsa.vu4ll.nl). See [web/README.md](web/README.md).

## 🔧 Technologies

- **Kotlin** and **Jetpack Compose** (Material 3)
- **Room** - local database
- **DataStore** - settings
- **WorkManager** - automatic backups
- **Google Play services auth** and the **Google Drive REST API** - backups
- **kotlinx.serialization** - backup and import files
- **Astro** - website

## 🐛 Issues

Found a bug or have an idea? [Open an issue](https://github.com/Vu4ll/monedsa/issues/new). You can also get there from *Settings → Report an issue* in the app.

## 🤝 Contributing

1. Fork this project
2. Create a new feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push your branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

- This project is licensed under the GPL3 License. See the [LICENSE](LICENSE) file for details.
- **Privacy Policy**: [monedsa.vu4ll.nl/privacy-policy](https://monedsa.vu4ll.nl/privacy-policy/)

## 📞 Contact

- **Website:** [vu4ll.nl](https://vu4ll.nl)
- **E-mail:** [contact@vu4ll.nl](mailto:contact@vu4ll.nl)

---

**Monedsa** - Easily track your financial situation and keep your budget under control! 💰📊
