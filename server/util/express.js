const express = require("express");
const app = express();
const { PORT } = require("../config").env;
const cors = require('cors');
const path = require("path");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("../routes"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
    const appData = {
        name: "Monera",
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
                description: "Verileriniz güvenli bir şekilde cihazınızda saklanır",
            },
        ],
        screenshots: ["/images/image.png", "/images/image.png", "/images/image.png"],
        downloadLinks: {
            playStore: "#",
            apk: "#",
        },
        githubUrl: "https://github.com/Vu4ll/monera",
        version: "1.0",
    };

    res.render("index", { app: appData });
});

app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);
