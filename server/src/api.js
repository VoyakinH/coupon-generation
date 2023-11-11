const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');
const dataBase = require('./db');
const gn = require('./generator');
require('dotenv').config();


const router = express.Router();

router.use(fileUpload({
    createParentPath: true
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.use((req, res, next) => {
    const allowedOrigins = process.env.REACT_APP_ALLOWED_DOMAINS.split(',');
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    next();
});

const db = dataBase.createDbConnection();

// API авторизации
router.post('/v1/login', async (req, res) => {
    if (!req.body.login || !req.body.pass) {
        res.status(400).send({
            status: false,
            message: 'Invalid structure of request'
        });
    } else if (process.env.REACT_APP_LOGIN === undefined || process.env.REACT_APP_PASS === undefined) {
        res.status(500).send({
            status: false,
            message: 'Environment variables empty'
        });
    } else if (req.body.login === process.env.REACT_APP_LOGIN && req.body.pass === process.env.REACT_APP_PASS) {
        res.status(200).send({
            status: true,
            message: 'Authorized'
        });
    } else {
        res.status(403).send({
            status: false,
            message: 'Incorrect login or password'
        });
    }
})

// API получения списка сгенерированных купонов
router.post('/v1/coupons', async (req, res) => {
    try {
        const rows = await dataBase.selectRows(db);
        res.status(200).send({
            status: true,
            message: 'OK',
            data: rows
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: false,
            message: 'Error with DB'
        });
    }
})

// API генерации купона с загрузкой
router.post('/v1/generate', async (req, res) => {
    try {
        if (req.body.receiver === undefined || req.body.amount === undefined || req.body.style === undefined) {
            res.status(400).send({
                status: false,
                message: 'Invalid structure of request'
            });
        } else {
            const code = uuid().slice(2, 12);

            const coupon = await gn.generate(req.body.receiver, req.body.amount, req.body.style, code);

            const date = new Date();
            const id = await dataBase.insertRow(db, req.body.receiver, req.body.amount, req.body.style, code, date.toLocaleString("ru"));
            if (id !== undefined) {
                res.status(200).send({
                    status: true,
                    message: 'OK',
                    id: id,
                    coupon: coupon
                });
            } else {
                res.status(500).send({
                    status: false,
                    message: 'Error with DB'
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: false,
            message: 'Error with DB'
        });
    }
})

// API загрузки сгенерированного купона
router.post('/v1/download', async (req, res) => {
    try {
        if (req.body.receiver === undefined || req.body.amount === undefined || req.body.style === undefined || req.body.code === undefined) {
            res.status(400).send({
                status: false,
                message: 'Invalid structure of request'
            });
        } else {
            const coupon = await gn.generate(req.body.receiver, req.body.amount, req.body.style, req.body.code);

            if (coupon !== undefined) {
                res.status(200).send({
                    status: true,
                    message: 'OK',
                    coupon: coupon
                });
            } else {
                res.status(500).send({
                    status: false,
                    message: 'Generating error'
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: false,
            message: 'Generating error'
        });
    }
})

// API удаления купона
router.post('/v1/delete', async (req, res) => {
    try {
        if (req.body.id === undefined) {
            res.status(400).send({
                status: false,
                message: 'Invalid structure of request'
            });
        } else {
            await dataBase.deleteRow(db, req.body.id);
            res.status(200).send({
                status: true,
                message: 'OK',
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            status: false,
            message: 'Error with DB'
        });
    }
})

module.exports = router;
