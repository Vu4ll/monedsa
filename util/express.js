const express = require("express");
const app = express();
const { PORT } = require("../config").env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", require("../routes"));

app.get("/", (req, res) => {
    res.json({ message: "API" });
});

app.listen(PORT, () =>
    console.log(`Server is running on port ${PORT}`)
);
