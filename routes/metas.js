var express = require('express');
const { pedirTodas, pedir, crear, actualizar, borrar } = require('../db/pedidos');
var router = express.Router();
const { body , validationResult } = require('express-validator');

let metas = [
  {
    "id": "1",
    "detalles": "Correr por 30 minutos",
    "periodo": "dia",
    "eventos": "1",
    "icono": "🏃",
    "meta": "365",
    "plazo": "2030-01-01",
    "completado": 5
  },
  {
    "id": "2",
    "detalles": "Nadar por 60 minutos",
    "periodo": "dia",
    "eventos": "2",
    "icono": "🏊",
    "meta": "30",
    "plazo": "2030-04-01",
    "completado": 2
  },
  {
    "id": "3",
    "detalles": "Leer libros",
    "periodo": "dia",
    "eventos": "1",
    "icono": "📚",
    "meta": "4",
    "plazo": "2033-04-04",
    "completado": 2
  }
];

/* GET lista de metas */
router.get('/', function(req, res, next) {
  pedirTodas('metas', (err, metas)=>{
    if(err){
      return next(err);
    }
    console.log('se consumio el servicio para obtener todas las metas');
    res.send(metas);
  });
});

/* GET meta con id */
router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  pedir('metas', id, (err, meta) => {
    if(err){
      return next(err);
    }
    if(!meta.length){
      return res.sendStatus(404);
    }
    console.log('Se consumio el servicio para obtener meta por id')
    res.send(meta[0]);
  });
});

/* POST crear meta */
router.post('/', 
body('detalles').isLength({ min:5 }),
body('periodo').not().isEmpty(),
function(req, res, next) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array()});
  }
  
  const nuevaMeta = req.body;
  crear('metas', nuevaMeta, (err,meta) => {
    if(err){
      return next(err);
    }
    console.log('se consumio el servicio para crear una nueva meta')
    res.send(meta);
  });

});

/* PUT Actualizar meta */
router.put('/:id', 
body('detalles').isLength({ min:5 }),
body('periodo').not().isEmpty(),
function(req, res, next) {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array()});
  }

  const body = req.body;
  const id = parseInt(req.params.id);
  if(body.id !== id){
    return res.sendStatus(409);
  }
  pedir('metas', id, (err, meta) => {
    if(err){
      return next(err);
    }
    if(!meta.length){
      return res.sendStatus(404);
    }
    actualizar('metas', id, body, (err, actualizada) => {
      if(err){
        return next(err);
      }
      console.log('Se consumio el servicio para actualizar meta')
      res.send(actualizada);
    });
  });

});

/* DELETE Borrar meta */
router.delete('/:id', function(req, res, next) {
  const id = req.params.id;
  pedir('metas', id, (err, meta) => {
    if(err){
      return next(err);
    }
    if(!meta.length){
      return res.sendStatus(404);
    }
    borrar('metas', id, (err) => {
      if(err){
        return next(err);
      }
      console.log('Se consumio el servicio de borrar meta')
      res.sendStatus(204);
    });
  });
});

module.exports = router;
