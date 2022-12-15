const mongoose= require('mongoose');
require('dotenv').config();

const clientDB = mongoose

.connect(`${process.env.URI}`) 
    .then((m) => {
        console.log('Conectado a la Base de Datos ')
        return m.connection.getClient();
    })
    .catch(e => console.log(`Errod al conectar` + e))

    module.exports =  clientDB