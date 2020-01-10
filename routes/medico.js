var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');
// =============================================
// Obtener todos los medicos
// =============================================

app.get('/', function(req, res, next) {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img hospital')
        .skip(desde)
        .limit(5)
        // .populate('usuario', 'nombre email')
        //.populate('hospital')
        .exec(function(err, medicos) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medico',
                    errors: err
                });
            }
            Medico.countDocuments({}, function(err, conteo) {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

// =============================================
// Actualizar Medico
// =============================================

app.put('/:id', mdAutenticacion.verificaToken, function(req, res) {
    var id = req.params.id;
    var body = req.body;
    var date = new Date() - 18000000;
    Medico.findById(id, function(err, medico) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error no se encontro medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.modifiedBy = body.usuario._id;
        medico.hospital = body.hospital;
        medico.modifiedDate = date.toString();

        medico.save(function(err, medicoGuardado) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});

// =============================================
// Crear un nuevo medico
// =============================================

app.post('/', mdAutenticacion.verificaToken, function(req, res) {
    var body = req.body;
    var date = new Date() - 18000000;
    var medico = new Medico({
        nombre: body.nombre,
        createdBy: body.usuario._id,
        modifiedBy: body.usuario._id,
        hospital: body.hospital,
        // img: body.img,
        createDate: date.toString(),
        modifiedDate: date.toString()
    });

    medico.save(function(err, medicoGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicotoken: req.medico
        });
    });

});

// =============================================
// Eliminar Medico
// =============================================

app.delete('/:id', mdAutenticacion.verificaToken, function(req, res) {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, function(err, medicoBorrado) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id: ' + id,
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;