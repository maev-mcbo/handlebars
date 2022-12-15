const Order = require("../models/orders")
const { validationResult } = require('express-validator')
const qrcode = require("qrcode")
const transport = require('../nodemailer/transport')
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN); 

require('dotenv').config();


const readOrders = async (req, res) => {

    const filtro = req.query.filter
    console.log('el filtro es: ' + filtro)

    const inicio = req.query.startdate
    const fin= req.query.enddate

    console.log("Rango de busqueda: " + inicio + " hasta " + fin  );
    switch (filtro) {
        case "all":
            try {
                const orders = await Order.find().lean();
                orders.reverse()
                console.log(orders.length);
                res.render('orderlist', { orders });
            } catch (error) {
                req.flash('mensajes', [{ msg: error.message }])
                return res.redirect('orderlist')
            } break;
        case "pos":
            try {
                const orders = await Order.find({ testresult: "Positivo" }).lean();
                console.log(orders.length);
                
                if(orders.length == 0) throw Error("No hay ordenes Positivas")
                
                orders.reverse()
                console.log(orders);
                res.render('orderlist', { orders });
            } catch (error) {
                req.flash('mensajes', [{ msg: error.message }])
                return res.redirect('orderlist')
            } break;

        case "neg":
            try {
                const orders = await Order.find({ testresult: "Negativo" }).lean();
                if(orders.length == 0) throw Error("No hay ordenes Negativas")
                orders.reverse()
                res.render('orderlist', { orders });
            } catch (error) {
                req.flash('mensajes', [{ msg: error.message }])
                return res.redirect('orderlist')
            } break;
        case "pen":
            try {
                const orders = await Order.find({ testresult: "pendiente" }).lean();
                if(orders.length == 0) throw Error("No hay ordenes Pendientes")

                orders.reverse()
                res.render('orderlist', { orders });
            } catch (error) {
                req.flash('mensajes', [{ msg: error.message }])
                return res.redirect('orderlist')
            } break;
        case "anulado":
            try {
                const orders = await Order.find({ testresult: "Anulado" }).lean();
                if(orders.length == 0) throw Error("No hay ordenes Anuladas")

                orders.reverse()
                res.render('orderlist', { orders });
            } catch (error) {
                req.flash('mensajes', [{ msg: error.message }])
                return res.redirect('orderlist')
            } break;
            case "today" :
        
            try {
                // const hoy = new Date().toISOString().split('T')[0]
                // console.log(hoy)
                var now = new Date();
                var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                console.log(startOfToday)
                const orders = await Order.find({ createdAt: { $gte: startOfToday}}).lean()
                if(orders.length == 0) throw Error("Aun no hay ordenes para hoy")
                orders.reverse()
                console.log(orders)
                res.render('orderlist', { orders });
            } catch (error) {
                req.flash('mensajes', [{ msg: error.message }])
                return res.redirect('/order/orderlist')
            }

            break;
            default:
                try {
                    
                    // const hoy = new Date().toISOString().split('T')[0]
                     console.log("default")
                    const orders = await Order.find({ createdAt: { $gt: inicio , $lt: fin} }).lean()
                     if(orders.length == 0) throw Error("no se encontro nada en ese rango de fechas")
                    orders.reverse()
                    console.log(orders.length)
                    res.render('orderlist', { orders });
                } catch (error) {
                    req.flash('mensajes', [{ msg: error.message }])
                    return res.redirect('/order/orderlist?filter=all')
                }
                break;

    }

}

const orderFrom = (req, res) => {
    res.render('order')
}

const orderFromProcess = async (req, res) => {

    const errors = validationResult(req)
    if (errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        return res.redirect('/order')
    }

    const data = req.body
    console.log(data)
    try {
        const newOrder = await new Order(data)
        newOrder.save()
        req.flash('mensajes', [{ msg: "Se la creado una orden Exitosamente" }])
        res.redirect('/order/orderlist')

    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/order/orderlist')
    }

}


const OrderDetailView = async (req, res) => {
    const id = req.params.orderid
    //res.send( id)


    try {
        const ordendata = await Order.find({ _id: id }).lean();

        res.render("orderdetail", { ordendata  })
    }
    catch (error) {
        console.log('error ' + error)
    }

}

const deleteOrder = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        return res.redirect('/order/orderlist')
    }

    const { orderid } = req.params

    try {
        await Order.findByIdAndDelete(orderid)
        req.flash('mensajes', [{ msg: `Orden ${orderid} Eliminada Exitosamente` }])
        res.redirect('/order/orderlist')


    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/order/orderlist')
    }
}

const covidResultProcess = async (req, res) => {
    const id = req.params.id
    const covidresulta = req.body.covidresult

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('mensajes', errors.array())
        return res.redirect('/order/orderdetail' + id)
    }
    console.log('ESTE ES EL ID DE LA ORDEN' + req.params.id)
    console.log(' ESTE ES EL RESULTADO' + req.body.covidresulta)



    try {
        const newcovidresult = await Order.findOne({ _id: id })
        console.log('orden encontrada ' + newcovidresult)
        newcovidresult.testresult = covidresulta
        await newcovidresult.save()
        console.log('data guardada')

        if(covidresulta == "Anulado") throw Error(`Orden Anulada Exitosamente`)

        let info = await transport.sendMail({
            from: 'sgpc.maracaibo@gmail.com',
            to: newcovidresult.mail,
            subject: 'resultado',
            html: `<a href="${process.env.SCANURL + newcovidresult.id}">
                     ver tu resultado aqui</a>`,
            attachments: [{
                filename: `${newcovidresult.id + '_' + newcovidresult.fname + '_' + newcovidresult.lname}.pdf`,
                path: `${process.env.SCANURL + newcovidresult.id}`
            }
            ]
            
        })

        console.log("Message sent: %s", info.messageId);

        client.messages .create({ 
         body: `Su resultado esta listo, puede verlo en este enlace > ${process.env.SCANURL + newcovidresult.id}`, 
         from: 'whatsapp:+14155238886',       
         to: 'whatsapp:+584246207462',
         mediaUrl: `${process.env.SCANURL + newcovidresult.id}`
       }) 
      .then(message => console.log(message.sid)) 
      .done();

        req.flash('mensajes', [{ msg: `Resultado a sido cambiado a ${covidresulta} y correo enviado a ${newcovidresult.mail}` }])

        res.redirect('/order/orderdetail/' + id)

    } catch (error) {
        req.flash('mensajes', [{ msg: error.message }])
        return res.redirect('/order/orderdetail/' + id)
    }


    //res.send(req.body)
}

const paymentprocess = async (req, res) => {

    const id = req.params.id
        const { paymenteAmauntform, paymenteStatusform,currency } = req.body

    console.log('ESTE ES EL ID ' + id)
    console.log('CANTIDAD A PAGAR ' + paymenteAmauntform + ' ESTADO DEL PAGO ' + paymenteStatusform + " El tipo de moneda es: "+ currency)
    try {
        const dataorder = await Order.findOne({ _id: id })
        dataorder.paymentAmaunt = paymenteAmauntform
        dataorder.paymentStatus = paymenteStatusform
        dataorder.currency = currency
        await dataorder.save()
        res.redirect(`/order/orderdetail/${id}`)

    } catch (error) {
        console.log(error)
    }


}






module.exports = {
    orderFrom,
    orderFromProcess,
    readOrders,
    OrderDetailView,
    deleteOrder,
    covidResultProcess,
    paymentprocess

}