const { Router } =require('express')
const {body} = require('express-validator')
router = Router();
const userisvalid = require('../middlewares/userisvalid');

const {readUsers, 
    addUserProcess,
        deleteUser,
        updateUser,
        addUserForm,
        updateUserForm,
    } = require('../controllers/userControllers');

router.get('/',userisvalid, readUsers);

router.get('/adduser', userisvalid, addUserForm);
router.post('/adduser',[
    body("fname","Nombre invalido").trim().isLength({min: 3}),
    body("lname",'Apellido invalido').trim().isLength({min: 3}),
    body("bdate",'Fecha invalida').notEmpty().trim().isDate(),
    body("mail",'Correo Invalido').isEmail(),
    body("passport",'Pasaporte no puede estar vacio.').notEmpty().trim()
],userisvalid,addUserProcess);

router.get('/deleteUser/:id', userisvalid,deleteUser);
router.get('/updateUser/:id', userisvalid,updateUserForm);
router.post('/updateuser/:id', userisvalid,updateUser);




module.exports=router
