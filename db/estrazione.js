var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartellaSchema = new Schema({
    number: Number
}, {timestamps: true});

cartellaSchema.path('number').index({ unique: true });

module.exports = mongoose.model('estrazione', cartellaSchema, 'estrazione');