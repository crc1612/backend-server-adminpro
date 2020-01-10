var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'El id hospital es un campo obligatorio'] },
    createDate: { type: Date, required: true },
    modifiedDate: { type: Date, required: true }
});

module.exports = mongoose.model('Medico', medicoSchema);