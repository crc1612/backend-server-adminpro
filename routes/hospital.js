var express = require('express');

// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');
// =============================================
// Obtener todos los hospitales
// =============================================

app.get('/', function(req, res, next) {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img')
        .skip(desde)
        .limit(5)
        // .populate('usuario', 'nombre email')
        .exec(function(err, hospitales) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }
            Hospital.count({}, function(err, conteo) {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});

// =============================================
// Obtener Hospital por ID
// =============================================

app.get('/:id', function(req, res) {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec(function(err, hospital) {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: { mensaje: 'No existe un hospital con ese id' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

// =============================================
// Actualizar Hospital
// =============================================

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin_Role], function(req, res) {
    var id = req.params.id;
    var body = req.body;
    var date = new Date() - 18000000;
    Hospital.findById(id, function(err, hospital) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error no se encontro hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: err
            });
        }

        hospital.nombre = body.nombre;
        hospital.modifiedBy = body.usuario._id;
        hospital.modifiedDate = date.toString();
        // hospital.usuario = req.usuario._id;

        hospital.save(function(err, hospitalGuardado) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });
});

// =============================================
// Crear un nuevo hospital
// =============================================

app.post('/', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin_Role], function(req, res) {
    var body = req.body;
    var date = new Date() - 18000000;

    var hospital = new Hospital({
        nombre: body.nombre,
        createdBy: body.usuario._id,
        modifiedBy: body.usuario._id,
        createDate: date.toString(),
        modifiedDate: date.toString()
            // usuario: req.usuario._id
    });

    hospital.save(function(err, hospitalGuardado) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

// =============================================
// Eliminar Hospital
// =============================================

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin_Role], function(req, res) {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, function(err, hospitalBorrado) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id: ' + id,
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;