const fs = require('fs').promises;
const crypto = require('crypto');

class Contendor {

    constructor(filename) {
        this.filename = filename;
    }

    //PUBLIC METHODS

    save(object) {
        return new Promise((resolve, reject) => {
            this.#fileStatus()
                .then(() => {
                    this.#readFileAndParse()
                        .then(fileParsed => {
                            if (verbose) console.log("File opened: ", this.filename)
                            object.id = crypto.randomUUID()
                            fileParsed.push(object)
                            this.#writeFile(JSON.stringify(fileParsed))
                                .then(() => { resolve(object.id) })
                                .catch((err) => { reject(err) })
                        })
                        .catch(err => reject(err))
                })
                .catch(err => {
                    if (err.code === 'ENOENT') {
                        const newFile = []
                        object.id = crypto.randomUUID()
                        newFile.push(object)
                        this.#writeFile(JSON.stringify(newFile))
                            .then(() => {
                                if (verbose) console.log("File created: ", this.filename)
                                resolve(object.id)
                            })
                            .catch(err => reject(err))
                    }
                })
        })

    }

    modifyEntry(id, object) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
            .then((fileParsed => {
                const foundedObject = fileParsed.find(file => file.id == id)
                if (!foundedObject) resolve(null)
                Object.keys(object).forEach(key => {
                    if (object[key] == undefined) return
                    foundedObject[key] = object[key]
                })

                this.#writeFile(JSON.stringify(fileParsed))
                                .then(() => { resolve() })
                                .catch((err) => { reject(err) })
            }))
            .catch(err => {
                reject(err)
            })

        })
    }

    getById(id) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
                .then((fileParsed => {
                    const foundedObject = fileParsed.find(file => file.id == id)
                    if (!foundedObject) resolve(null)
                    resolve(foundedObject)
                }))
                .catch(err => {
                    reject(err)
                })

        })
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
                .then(fileParsed => (resolve(fileParsed)))
                .catch(err => {
                    reject(err)
                })

        })
    }

    deleteByID(UUID) {
        return new Promise((resolve, reject) => {
            this.#readFileAndParse()
                .then(fileParsed => {
                    const objectID = fileParsed.findIndex(object => object.id === UUID);
                    if (objectID==-1){
                        reject("UUID not found")
                        return
                    }
                    fileParsed.splice(objectID, 1)
                    this.#writeFile(JSON.stringify(fileParsed))
                        .then(() => {
                            resolve(UUID + " has been removed from file")
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
                .catch(err => {
                    reject(err)
                })

        })
    }

    deleteAll(){
        return new Promise((resolve, reject) => {
            this.#writeFile(JSON.stringify([]))
                .then (() => {
                    resolve("File content has been deleted")
                })
                .catch((err)=> { 
                    reject(err)
                })
        })
    }


    //PRIVATE METHODS

    #writeFile(content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.filename, content)
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    #readFileAndParse() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filename)
                .then(file => JSON.parse(file))
                .then((fileParsed => resolve(fileParsed)))
                .catch(err => { reject(err) })
        })

    }

    #fileStatus() {
        return new Promise((resolve, reject) => {
            fs.stat(this.filename)
                .then(ans => resolve(ans))
                .catch(err => reject(err))
        })
    }


}
verbose = false;

//TEST 
/*
verbose = false;

const productos = new Contendor("prueba.json")
const dummyProduct =
{
    name: "Coca-Cola",
    size: "1 ltr",
    type: "diet"
}

if (true) {
    console.log("Save")
    productos.save(dummyProduct)
        .then(res => console.log(res))
        .catch(err => console.error(err))
}

if (false) {
    console.log("Get by ID")
    productos.getById("886c638c-9cec-41e2-97d1-097dda69d86d")
        .then(res => console.log(res))
        .catch(err => console.error(err))
}

if (false) {
    console.log("getAll")
    productos.getAll()
        .then(res => console.log(res))
        .catch(err => console.error(err))
}

if (false) {
    console.log("Delete by ID")
    productos.deleteByID("6773ef73-af78-486c-a026-d38b968f875d")
        .then(res => console.log(res))
        .catch(err => console.error(err))
}

if (false){
    console.log("delete all")
    productos.deleteAll()
        .then(res => console.log(res))
        .catch(err => console.error(err))
}
*/
module.exports = Contendor