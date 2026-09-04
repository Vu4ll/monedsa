require("dotenv").config();
const { version } = require("./package.json");

module.exports = {
    env: {
        PORT: process.env.PORT || 3000,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION || "15m",
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || "14d",
    },

    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    usernameRegex: /^[a-z0-9_.]{2,16}$/,
    passwordRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

    appData: {
        name: "Monedsa",
        tagline: "Gelir Gider Takip Uygulaması",
        description: "Android cihazlarınızda kolayca gelir ve giderlerinizi takip edin. Basit, hızlı ve güvenli.",
        features: [
            {
                icon: "💰",
                title: "Gelir Takibi",
                description: "Tüm gelirlerinizi kategorilere ayırarak takip edin",
            },
            {
                icon: "📊",
                title: "Gider Analizi",
                description: "Harcamalarınızı analiz edin ve bütçenizi kontrol altında tutun",
            },
            {
                icon: "📱",
                title: "Mobil Uyumlu",
                description: "Android cihazlarınızda sorunsuz çalışan modern arayüz",
            },
            {
                icon: "🔒",
                title: "Güvenli",
                description: "Verileriniz güvenli bir şekilde bulut veritabanında saklanır",
            },
        ],
        screenshots: {
            en: [
                "/images/en/home-page.png",
                "/images/en/home-page-white.png",
                "/images/en/filter.png",
                "/images/en/add-transaction.png",
                "/images/en/categories.png",
                "/images/en/add-category.png",
                "/images/en/profile.png",
                "/images/en/settings.png"
            ],
            tr: [
                "/images/tr/home-page.png",
                "/images/tr/home-page-white.png",
                "/images/tr/filter.png",
                "/images/tr/add-transaction.png",
                "/images/tr/categories.png",
                "/images/tr/add-category.png",
                "/images/tr/profile.png",
                "/images/tr/settings.png"
            ],
            nl: [
                "/images/nl/home-page.png",
                "/images/nl/home-page-white.png",
                "/images/nl/filter.png",
                "/images/nl/add-transaction.png",
                "/images/nl/categories.png",
                "/images/nl/add-category.png",
                "/images/nl/profile.png",
                "/images/nl/settings.png"
            ]
        },
        downloadLinks: {
            playStore: "https://play.google.com/store/apps/details?id=com.vu4ll.monedsa",
            apk: "https://github.com/Vu4ll/monedsa/releases/download/v1.5/monedsa-1.5.apk",
        },
        githubUrl: "https://github.com/Vu4ll/monedsa",
        version
    }
};