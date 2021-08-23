// importing necessary libraries
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require('body-parser')
const formidable = require("formidable")
const fs = require("fs")
const url = "mongodb://localhost:27017/cloudesign"


app.use(bodyParser.json())
app.use(cors())

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log("connected!");
    }
})

// creating schemas
var schema1 = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    //  Media(can upload jpeg, png, gif, pdf)
    Status: { type: String, enum: ["Open", "InProgress", "Completed"], required: true },
    Datetime: { type: String, timeStamps: true, required: true },
    file: { type: Buffer, required: true }
})

// creating class/models for CRUD
var Cloudesign = mongoose.model("cloudesign", schema1)

var readingFile;

// saving whole data
app.post("/savedata", (req, res) => {

    var obj1 = new Cloudesign({
        'Title': req.body.Title,
        'Description': req.body.Description,
        'Status': req.body.Status,
        'Datetime': req.body.Datetime,
        'file': readingFile
    })
    console.log(obj1);

    var saveThis = async () => {
        return await obj1.save(obj1)
    }
    saveThis()
        .then((d) => {
            // making new object so to not returning the media file
            var obj = {
                _id: d._id,
                Title: d.Title,
                Description: d.Description,
                Status: d.Status,
                Datetime: d.Datetime
            }

            console.log("res after delete : ", obj);
            res.send(JSON.stringify(obj))
        })
        .catch((e) => {
            // console.log(e);
            res.send("some error occured")
        })

})
// getting/reading filedata
app.post("/savedatafile", (req, res) => {
    var form = formidable.IncomingForm()
    form.parse(req, (_err, _feild, _file) => {
        if (_err) {
            console.log("err is", _err);
            res.send('0')
        } else {
            console.log("feild : ", _feild, "file is : ", _file);
            if (_feild.myfile != 'undefined') {
                readingFile = fs.readFileSync(_file.myfile.path)
                console.log(readingFile);
                res.send('1')
            }else{
                res.send('0')
            }

        }
    })

})

// getting saved data
app.get("/getData", (req, res) => {
    var getData = async () => {
        return await Cloudesign.find({}, '-file')
    }
    var a1 = []
    var a2 = []
    var a3 = []
    getData()
        .then((d) => {
            // console.log(d);
            d.map((e) => {
                switch (e.Status) {
                    case "Open":
                        a1.push(e)
                        break
                    case "InProgress":
                        a2.push(e)
                        break
                    case "Completed":
                        a3.push(e)
                        break
                }
            })

            res.send(JSON.stringify({ "Open": a1, "InProgress": a2, "Completed": a3 }))
        })
        .catch((e) => {
            res.send("some error occured")
        })
})

// editing the saved status
app.post("/editstate", (req, res) => {
    var q1 = { _id: req.body._id } // match the record
    var a1 = { Status: req.body.Status } // change the status

    if (a1.Status == "Completed" || a1.Status == "Open" || a1.Status == "InProgress") {
        Cloudesign.updateOne(q1, a1, (_err, _res) => {
            if (_err) {
                // console.log(e);
                res.send("0")
            } else {
                // console.log(_res);
                res.send("1")
            }
        })
    } else {
        res.end()
    }

})

// deleting the data
app.post("/deleteData", (req, res) => {
    var q1 = { _id: req.body._id }

    Cloudesign.deleteOne(q1, (_err, _res) => {
        if (_err) {
            // console.log(_err);
            res.send("0")
        } else {
            // console.log(_res);
            res.send("1")
        }
    })
})

// editing the whole records
app.post("/editData", (req, res) => {
    var q1 = { _id: req.body._id } // match the record
    var a1 = { Title: req.body.Title, Description: req.body.Description } // change the record


    Cloudesign.updateOne(q1, a1, (_err, _res) => {
        if (_err) {
            // console.log(e);
            res.send("0")
        } else {
            // console.log(_res);
            res.send("1")
        }
    })


})

const PORT = 9000 || process.env.PORT
app.listen(PORT, () => {
    console.log("server started listening on : ", PORT);
})