const { Router } = require('express')
const router = Router();
const { body } = require('express-validator');

const {
    loginOperatorForm,
    registerOperatorFrom,
    registerOperatorProcess,
    loginOperatorProcess,
    confirmaccountprocess,
    logoutProcess
} = require('../controllers/authController')


router.get('/login', loginOperatorForm)

router.post('/login',[
    body('mail','Favor ingrese un correo valido')
        .normalizeEmail(),
    body('password','La contraseña no es valida')
        .isLength({min: 6})
        .trim()
        .escape()
],loginOperatorProcess)

router.get('/singup', registerOperatorFrom)

router.post('/singup',[
    body('username', 'Favor verificar usuario')
        .trim()
        .escape()
        .notEmpty(),
    body('mail','Favor Verificar el correo')
        .trim()
        .escape()
        .isEmail()
        .normalizeEmail()
        .notEmpty(),
    body('password','Favor verificar contraseña')
        .isLength({min: 6})
        .trim()
        .escape()
        .custom( (value, {req}) =>  {
            if (value !== req.body.repass){
                console.log( value + ' <> '+ req.body.repass)
                throw new Error('no coinciden las contraseñas')
            }else{
                return value;

            }
        })
],registerOperatorProcess)

router.get('/confirmaccount/:tokenConfirm',confirmaccountprocess )

router.get('/logout',logoutProcess)

module.exports = router
