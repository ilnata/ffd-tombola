var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartellaSchema = new Schema({
    code: Number,
    sequence: [Number],
    string_sequence: String,
    cinquina_1: [Number],
    cinquina_2: [Number],
    cinquina_3: [Number]
});

cartellaSchema.path('string_sequence').index({ unique: true });

module.exports = mongoose.model('cartelle', cartellaSchema, 'cartelle');