const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.APP_SENDGRID_API);

const sendMail = async (email, subject, text, html) =>{
    try{
        const msg = {
            from : process.env.APP_HOST_EMAIL,
            to: email,
            subject,
            text,
            html,
        };
        await sgMail.send(msg);
        console.log("MAIL_SENT");
    } catch(error){
        console.log(error);
    }finally{
        return;
    }
}

module.exports = sendMail;