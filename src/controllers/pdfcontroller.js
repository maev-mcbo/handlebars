const Order = require("../models/orders")
const puppeteer = require("puppeteer");
require('dotenv').config();

function getAge(date) {
    var today = new Date();
    var birthDate = new Date(date);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function isExpired(date) {

    var fechaOrden = new Date(date);
    var hoy = new Date();

    var difference = Math.abs(fechaOrden - hoy);
    days = difference / (1000 * 3600 * 24)

    if (days >= 3) { return 1 } else { return 0 }


}

const pdfmaker = async (req, res) => {

    const id = req.params.id
    try {
        const data = await Order.findOne({ _id: id }).lean();
        data.url = process.env.SCANURL + id

        const dob = data.dob
        data.age = getAge(dob)
        data.expired = isExpired(data.createdAt)
        
        const createdat =data.createdAt
        creationDate = new Date(createdat).toLocaleDateString()
        creationTime = new Date(createdat).toLocaleTimeString()
        data.fecha = creationDate
        data.hora = creationTime

        res.render("pdf", { data, layout: 'clean' })

    } catch (error) {
        console.log(error)
    }
}

const pdf = async (req, res) => {
    const id = req.params.id
    const url = `${process.env.HEROPATH}pdfmaker/${id}`
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const incognito = await browser.createIncognitoBrowserContext();
    const webPage = await incognito.newPage();
    await webPage.goto(url, {
        waitUntil: "networkidle2",
    });

    const pdf = await webPage.pdf({
        printBackground: true,
        format: "a4",
        landscape: true,
    });
    await browser.close();
    res.contentType("application/pdf");
    res.send(pdf);
}

module.exports = {
    pdfmaker,
    pdf
}