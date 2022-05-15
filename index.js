const Contenedor = require("./contenedor")
const express = require("express")
const app = express()
const path = require("path")
const multer = require("multer")
const apiRouter = express.Router();
let contenedor

app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const APP_PORT = 8080;
const storage = multer.diskStorage({
    destination: "storage",
    filename: (req, file, cb) => {
        const filename = file.originalname;
        cb(null, filename)
    }
})

const uploader = multer({storage: storage})

//return all products
apiRouter.get ("/", (req, res) => {
    contenedor.getAll()
        .then((products) => {
            if (products.length == 0) 
                res.status(404).send(JSON.stringify({ error : 'productos no encontrados' }))
            else
                res.send(products)
        })
        .catch((err) => {
            console.log (err)
            res.status(404).send(JSON.stringify({ error : 'productos no encontrados' }))
        })
})

//return product by id
apiRouter.get ("/:id", (req, res) => {
    contenedor.getById(req.params.id)
        .then((products) => {
            if (products.length == 0) 
                res.status(404).send(JSON.stringify({ error : 'producto no encontrado' }))
            else
                res.send(products)
        })
        .catch((err) => {
            console.log (err)
            res.status(404).send(JSON.stringify({ error : 'producto no encontrado' }))
        })
})

//add new producto and return new id
apiRouter.post ("/", uploader.single("image"), (req, res) => {
    const { file } = req;

    const title = req.query.title || req.body.title
    const price = parseFloat(req.query.price) || parseFloat(req.body.price)
    const image = file.filename
    const newProduct = {title, price, image}

    if ((title == undefined) || (price == undefined) || (image == undefined) || (isNaN(price))){
        res.status(404).send(JSON.stringify({error: "datos incorrectos"}))
        return
    }
    
    contenedor.save(newProduct)
        .then((id) => {
                res.status(201).send(JSON.stringify({ success : 'producto agregado', id }))
        })
        .catch((err) => {
            console.log (err)
            res.status(501).send(JSON.stringify({ error : 'producto no agregado' }))
        })

})

//modify existing product
apiRouter.put ("/:id", (req, res) => {

    const title = req.query.title
    const price = req.query.price
    const image = req.query.image

    if ((title == undefined) && (price == undefined) && (image == undefined)){
        res.status(404).send(JSON.stringify({error: "datos incorrectos"}))
        return
    }

    const existingProduct = {title, price, image}

    contenedor.modifyEntry(req.params.id, existingProduct)  
        .then(() => {
            res.status(200).send(JSON.stringify({ success : 'producto modificado' }))
        })
        .catch((err) => {
            console.log (err)
            res.status(501).send(JSON.stringify({ error : 'producto no agregado' }))
        })

})

//delete product
apiRouter.delete ("/:id", (req, res) => {
    contenedor.deleteByID(req.params.id)
    .then(() => {
        res.status(200).send(JSON.stringify({ success : 'producto eliminado' }))
    })
    .catch((err) => {
        console.log (err)
        res.status(400).send(JSON.stringify({ error : 'no se pudo eliminar' }))
    })
})

app.use ("/api/productos", apiRouter)
app.use ("/", express.static(path.join(__dirname, 'public')))

app.listen(APP_PORT, () => {
    contenedor = new Contenedor("data.json")
    console.log("listening on port " + APP_PORT)
});