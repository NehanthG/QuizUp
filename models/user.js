const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
        password:{
        type:String,
        required:true
        },
    score:{
        type:Number,
        default:0
    },
    attemptedQuestions:[{
        type:Schema.Types.ObjectId,
        ref:'questions'
    }]

})

module.exports = mongoose.model('user',userSchema);