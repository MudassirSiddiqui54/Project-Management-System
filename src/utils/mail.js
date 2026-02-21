import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task manager",
            link: "https://taskmanager.com"
        }
    })
    //Email is generated not sent
    const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent)
    const emailHtml = mailGenerator.generate(options.mailGenContent)

   const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false // helps with some network issues
    }
});
    transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready');
    }
});

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }
    
    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email service failed silently.")
        console.error("Error: ", error)
    }
}

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! We are excited to have you on board.",
            action: {
                instructions: "To verify your emaial, please click on the following button.",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl
                }
            },
            outro: {
                text: "Need help or have questions? Just reply to this email, we would love to help."
            }
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of your account",
            action: {
                instructions: "To reset your password, please click on the following button.",
                button: {
                    color: "#22bc66",
                    text: "Reset password",
                    link: passwordResetUrl
                }
            },
            outro: {
                text: "Need help or have questions? Just reply to this email, we would love to help."
            }
        }
    }
}

export {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail}
