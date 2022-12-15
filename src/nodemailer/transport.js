const nodemailer =require('nodemailer')
require('dotenv').config();

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: `${process.env.NODEMAILERUSER}`,
      pass: `${process.env.NODEMAILERPASS}`,
    }
  });

  module.exports = (transport)