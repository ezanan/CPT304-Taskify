const { urlencoded } = require("express");
const express = require("express");
const path = require("path");
require("dotenv").config();
require("../src/db/conn");
const views_path = path.join(__dirname, "../views");
const static_path = path.join(__dirname, "../static");
const app = express();
const port = process.env.PORT || 80;


app.use("/static", express.static(static_path));
app.use(express.json());
app.use(urlencoded({ extended: false }));


app.set("view engine", "ejs");
app.set("views", views_path);

app.get("/", (req, res) => {
    res.status(200).render("index.ejs");
});

app.get("/signup", (req, res) => {
    res.status(200).render("signup.ejs");
});

// In Future this dashboard will be rendered after authentication of users 
app.get("/dashboard", (req, res) => {
    res.status(200).render("dashboard/dashboard.ejs");
});


app.use((req, res) => {
    // return 404 
    res.status(404).send(`
        <div style="text-align: center; margin-top: 100px; font-family: sans-serif;">
            <h1 style="font-size: 50px; color: #5a21e6;">404</h1>
            <h2>Oops! Page Not Found</h2>
            <p>The page you are looking for does not exist or has been moved.</p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #5a21e6; color: white; text-decoration: none; border-radius: 5px;">Go Back Home</a>
        </div>
    `);
});



//* listen
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});