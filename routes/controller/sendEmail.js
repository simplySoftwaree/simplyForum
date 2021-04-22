const nodemailer  =  require("nodemailer");
const config      = require("./config");

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    }
});

module.exports = async (clientEmail, subject, html) => {
    transporter.sendMail({
        from: config.email.myEmail,
        to: clientEmail,
        subject: subject,
        html: html
    });
}