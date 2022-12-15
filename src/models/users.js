const mongoose = require('mongoose')
const {Schema} = mongoose

const usersSchema = new Schema({
    fname:{
        type: String,
        require: true
    },
    lname:{
        type: String,
        require: true
    },
    bdate:{
        type: String,
        require: true
    },
    mail:{
        type: String,
        require: true
    },
    passport:{
        type: String,
        require: true
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', usersSchema);
module.exports = User