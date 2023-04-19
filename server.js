const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const fs = require('fs')
const Datastore = require('nedb')

const app = express()
const port = 5000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    defaultLayout: 'main.hbs',
    helpers: {
        when: (oper1, oper, oper2, options) => {
            var opers = {
                    'check': function (l, r) {
                        return l == r;
                    },
                },
                outcome = opers[oper](oper1, oper2);

            if (outcome) return options.fn(this);
            else return options.inverse(this);
        }
    }
}));

app.use(express.urlencoded({
    extended: true
}))
app.use(express.static('static'))


const cars = new Datastore({
    filename: 'kolekcja.db',
    autoload: true
})

app.get("/", (req, res) => {
    res.render('index.hbs', {
        mout1: true
    })
})
app.get("/add", (req, res) => {
    res.render('add.hbs', {
        mout2: true
    })
})

app.post('/add', (req, res) => {
    const data = {
        ubez: req.body.ubez != undefined ? "TAK" : "NIE",
        benz: req.body.benz != undefined ? "TAK" : "NIE",
        uszk: req.body.uczk != undefined ? "TAK" : "NIE",
        nape: req.body.nape != undefined ? "TAK" : "NIE",
    }

    cars.insert(data, (err, newDoc) => {
        res.render('add.hbs', {
            mout2: true,
            id: newDoc._id
        })
    })

})

app.get("/edit", (req, res) => {
    cars.find({}, (err, docs) => {
        docs.forEach((e, i) => {
            e.is_edit_id = req.query._id === e._id ? true : false
        })
        res.render('edit.hbs', {
            mout4: true,
            docs: docs,
            edit_id: req.query._id
        })
    })
})

app.post("/edit", (req, res) => {
    if (req.body.ubez == "TAK") {
        var ubez = "TAK"
    } else if (req.body.ubez == "NIE") {
        var ubez = "NIE"
    } else {
        var ubez = "BRAK"
    }

    if (req.body.benz == "TAK") {
        var benz = "TAK"
    } else if (req.body.benz == "NIE") {
        var benz = "NIE"
    } else {
        var benz = "BRAK"
    }

    if (req.body.uszk == "TAK") {
        var uszk = "TAK"
    } else if (req.body.uszk == "NIE") {
        var uszk = "NIE"
    } else {
        var uszk = "BRAK"
    }

    if (req.body.nape == "TAK") {
        var nape = "TAK"
    } else if (req.body.nape == "NIE") {
        var nape = "NIE"
    } else {
        var nape = "BRAK"
    }

    cars.update({
        _id: req.body._id
    }, {
        ubez: ubez,
        benz: benz,
        uszk: uszk,
        nape: nape
    }, {}, (err, numReplaced) => {
        cars.find({}, (err, docs) => {
            res.render('edit.hbs', {
                mout4: true,
                docs: docs
            })
        })
    })
})

app.post("/list", (req, res) => {
    console.log(req.body)
})

app.get("/list", (req, res) => {
    cars.find({}, (err, docs) => {
        docs.forEach((e, i) => e.tmp = 'temporary')
        res.render('list.hbs', {
            mout3: true,
            docs: docs
        })
    })
})

app.get('/list&id=:id', (req, res) => {
    const id = req.params.id
    cars.remove({
        _id: id
    }, {}, (err, docRemoved) => {
        cars.find({}, (err, docs) => {
            docs.forEach((e, i) => e.tmp = 'temporary')
            res.render('list.hbs', {
                mout3: true,
                docs: docs
            })
        })
    })
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})