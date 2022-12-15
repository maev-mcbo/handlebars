const { validationResult } = require('express-validator')
const userSchema = require('../models/users')
const Puppeteer = require('puppeteer')


const readUsers = async (req, res) => {

    try {
        const users = await userSchema.find().lean();
        //res.json(users)
        //console.log(users);
        res.render('user', { users });
    } catch (error) {
        console.log('error ' + error)
    }
}

const addUserForm = (req, res) => {
    res.render('adduser')
}

const addUserProcess = async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        return res.redirect('/adduser')
    }
    console.log('111111111111111111')
    const data = {
        fname,
        lname,
        bdate,
        mail,
        passport,
    } = (req.body)

    try {
        const newuser = new userSchema(data)
        await newuser.save()
        res.redirect('/user')

        // TODO https://mongoosejs.com/docs/4.x/docs/validation.html

    } catch (error) {
        console.log('entra en el catch')
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('addUser')
    }



}


const deleteUser = async (req, res) => {
    const { id } = req.params
    console.log(id)
    try {
        await userSchema.findByIdAndDelete(id)
        res.redirect('/user')
    } catch (error) {
        console.log('error ' + error)
    }
}

const updateUserForm = (req, res) => {
    res.render('updateuser')
}

const updateUser = async (req, res) => {
    const id = req.params.id
    const data = {
        fname,
        lname,
        bdate,
        mail,
        passport,
    } = (req.body)
    try {
        await userSchema.findByIdAndUpdate(id, data);
        console.log('el id: ' + id + 'se ha actualizado con esta data => ' + JSON.stringify(data));
        res.redirect('/user')
    } catch (error) {
        console.log('error ' + error)

    }
}


module.exports = {
    readUsers,
    addUserProcess,
    deleteUser,
    updateUser,
    addUserForm,
    updateUserForm,
}