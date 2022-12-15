const Order = require("../models/orders");

const dashboardview = (req, res) =>{
  res.redirect('dashboard');

}
const dashboard = async (req, res) => {

    const formater = new Intl.NumberFormat('en-US', {
        style: "currency",
        currency: "USD",
    })
    // Array de datos 
    const data = []

    //Toma de la fecha de hoy para hacer la busqueda en mongo
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log(startOfToday)

    // construccion del array de datos con las busquedas en mongo
    data.total =  (await Order.find({ createdAt: { $gte: startOfToday } }).lean()).length
    data.pendientes =  (await Order.find({ testresult: "pendiente", createdAt: { $gte: startOfToday } }).lean()).length
    data.negativas =  (await Order.find({ testresult: "Negativo", createdAt: { $gte: startOfToday } }).lean()).length
    data.positivas =  (await Order.find({ testresult: "Positivo", createdAt: { $gte: startOfToday } }).lean()).length
    data.anuladas =  (await Order.find({ testresult: "Anulado", createdAt: { $gte: startOfToday } }).lean()).length
   
    // busqueda de ordenes aprobadas con pagos en bolivares y dolares
    data.facturadobs = (await Order.aggregate([
        {$match: {paymentStatus: "Aprobado",createdAt: { $gte: startOfToday }, currency: "bolivares"}},
        {$group: {_id: "$_id", total: {$sum: "$paymentAmaunt"}}}
      ]))
      data.facturadodolares = (await Order.aggregate([
        {$match: {paymentStatus: "Aprobado",createdAt: { $gte: startOfToday }, currency: "dolares"}},
        {$group: {_id: "$_id", total: {$sum: "$paymentAmaunt"}}}
      ]))
     
      // formateo como monedas
      data.totalfacturadobs = formater.format(data.facturadobs.reduce((n, {total}) => n + total, 0)).replace("$", "Bs. ")
      data.totalfacturadodolares = formater.format(data.facturadodolares.reduce((n, {total}) => n + total, 0)).replace("$", "$ ")
      
      console.log(data);
    
      //envio de la data a handlebars
      res.render('dashboard', { data })


}


module.exports = {
    dashboard,
    dashboardview
}