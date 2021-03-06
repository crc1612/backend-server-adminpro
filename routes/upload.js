var express = require('express');
var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id/:user', function(req, res, next) {

    var tipo = req.params.tipo;
    var id = req.params.id;
    var user = req.params.user;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valido',
            error: { message: 'Tipo de coleccion no es valido' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Error al cargar el archivo',
            error: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            error: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var date = new Date().getMilliseconds();
    var nombreArchivo = id + '-' + date + '.' + extensionArchivo;

    // Mover el archivo del temporal a un path
    var path = './uploads/' + tipo + '/' + nombreArchivo;

    archivo.mv(path, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: err
            });
        }
        subirPorTipo(tipo, id, user, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, user, nombreArchivo, res) {
    var date = new Date() - 18000000;
    if (tipo === 'usuarios') {
        Usuario.findById(id, function(err, usuario) {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario No Existe',
                    error: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.modifiedBy = user;
            usuario.modifiedDate = date.toString();
            usuario.save(function(err, usuarioActualizado) {
                usuarioActualizado.password = '=)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, function(err, hospital) {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    error: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.modifiedBy = user;
            hospital.modifiedDate = date.toString();
            hospital.save(function(err, hospitalActualizado) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, function(err, medico) {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    error: { message: 'Medico no existe' }
                });
            }
            var pathViejo = './uploads/medicos/' + medico.img;
            // Si existe elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.modifiedBy = user;
            medico.modifiedDate = date.toString();
            medico.save(function(err, medicoActualizado) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
}
module.exports = app;