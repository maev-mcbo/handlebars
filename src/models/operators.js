const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcryptjs')

const operatorSchema = new Schema({
    username:{
        type: String,
        require: true,
        unique: true        
    },
    password:{
        type: String,
        require: true
    },
    mail:{
        type: String,
        require: true
    },
    tokenConfirm:{
        type: String,
        default: null
    },
    accountConfirm:{
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

operatorSchema.pre('save', async function(next){
    const prop = this
    if(!prop.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(prop.password,salt)
        prop.password = hash
        next();
    } catch (error) {
        console.log('error hash:  '  + error)
        next();
    }
    
    
})

operatorSchema.methods.comparePassword = async function(candidatePassword){
     const validpassword = await bcrypt.compare(candidatePassword, this.password)
     console.log('la contrasena es: '+ validpassword)
     return validpassword
}

const operator = mongoose.model('operators', operatorSchema);
module.exports = operator