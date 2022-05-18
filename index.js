const express = require("express")
const Contenedor = require("./contenedor")
const Api = require("./api")

const app = express()
const APP_PORT = 8080;


app.listen(APP_PORT, () => {
    new Api(app, new Contenedor("data.json"))
    console.log("listening on port " + APP_PORT)
});