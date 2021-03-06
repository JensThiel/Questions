const nodemailer = require('nodemailer');
const User = require("./models/user");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'questions.howest@gmail.com',
        pass: 'JensHowest123'
    }
});

module.exports = {
    sendMail: function (tags) {
        tags.forEach(tag => {
            User.find({'subscriptions': tag}).then(users => {
                users.forEach(user => {
                    let mailOptions = {
                        from: 'questions.howest@gmail.com',
                        to: user.email,
                        subject: "Questions: new Question!",
                        text: 'Greetings ' + user.alias + ',\n \n there is a new question available within ' + tag + '.  \n If you wish to unsubscribe from this tag click the following link: http://questions.dev/removesub/' + tag + ' \n \n Have fun questioning! \n \n The Questionteam'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                })
            })
        })
    },
    sendMailForvotes: function(user,threadId){
        let mailOptions = {
            from: 'questions.howest@gmail.com',
            to: user.email,
            subject: "Your question is popular",
            text: 'Greetings ' + user.alias + ',\n \n Your thread has now over 15 upvotes, http://questions.dev:3000/thread/'+threadId
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
};


