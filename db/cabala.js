var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartellaSchema = new Schema({
    numero: Number,
    cabala: String

}, {timestamps: true});

module.exports = mongoose.model('numeri', cartellaSchema, 'numeri');