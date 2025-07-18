var express = require('express');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { pedirCuenta, crear } = require('../db/pedidos');
var router = express.Router();
const { body, validationResult } = require('express-validator');



/* POST crear cuenta */
router.post('/signup',
    body('usuario').isEmail(),
    body('clave').isLength({ min: 5 }),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const nuevaCuenta = req.body;

        bcrypt.hash(nuevaCuenta.clave, 12, function (err, hash) {
            if (err) {
                return next(err);
            }
            crear('cuentas', { usuario: nuevaCuenta.usuario, hash }, (err, cuenta) => {
                if (err) {
                    return next(err);
                }
                console.log('se consumio el servicio para crear una nueva meta')
                res.send(cuenta);
            });
        });

    });

/* POST login */
router.post('/login',
    body('usuario').isEmail(),
    body('clave').isLength({ min: 5 }),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const login = req.body;

        pedirCuenta(login.usuario, (err, [cuenta]) => {
            if(err){
                return next(err);
            }
            if(!cuenta){
                return res.sendStatus(404);
            }
            bcrypt.compare(login.clave, cuenta.hash, function(err, result) {
                if(err) return next(err);
                if(!result) return res.sendStatus(401);
                let ficha = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + 60,
                    id: cuenta.id
                  }, process.env.SECRET);
                res.send({ token: ficha });
            });
        })

    });

module.exports = router;
