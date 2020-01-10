var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    modifiedBy: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    createDate: { type: Date, required: true },
    modifiedDate: { type: Date, required: true }
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);