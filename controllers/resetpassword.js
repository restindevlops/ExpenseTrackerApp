const uuid = require('uuid');

const sgMail = require('@sendgrid/mail');

const bcrypt = require('bcrypt');

const User = require('../models/user');

const Forgotpassword = require('../models/forgotpassword');

const sequelize = require('../util/database');

const forgotpassword = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        const { email } =  req.body;
        const user = await User.findOne({where : { email }});

        if(user){
            const id = uuid.v4();
            await user.createForgotpassword({ id , active: true },  { transaction: t })
               
            sgMail.setApiKey(process.env.MAIL_API_KEY)

            const msg = {
                to: email, 
                from: 'restincraji@gmail.com', 
                subject: 'Reset Password',
                html: `<a href="http://34.234.148.249:3000/password/resetpassword/${id}">Click here to reset the password</a>`
            }

            const response = await sgMail.send(msg);
            await t.commit();
            return res.status(response[0].statusCode).json({message: 'Password reset link is sent to your mail ', sucess: true})
        }else {
            throw new Error("User doesn't exist")
        }
    } catch(err){
        await t.rollback();
        console.log(err)
        return res.json({message: "Something went Wrong", error:err, success: false });
    }

}

const resetpassword = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        const id =  req.params.id;
        const forgotpasswordrequest = await Forgotpassword.findOne({where : {id}});

        if(forgotpasswordrequest){

            await forgotpasswordrequest.update({active: false}, {transaction:t});
            await t.commit();
            res.status(200).send(`<html>

                                    <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                            console.log('called')
                                        }
                                    </script>

                                    <style>

                                    body{
                                        padding:0;
                                        margin: 0;
                                        font-family: sans-serif;
                                        background-color:rgb(175, 205, 224);
                                       
                                    }

                                    .header{
                                        text-align: center; 
                                        background-color:#2d82bb;
                                        padding:10px;
                                        margin:0;
                                        color:#fff;
                                        font-size: 10px;
                                    }
                                
                                    .reset-password-form{
                                        width:40rem;
                                        box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.3);
                                        background: white;
                                        padding:20px;
                                        margin:8% auto 0;
                                    }
                                    
                                    .reset-password-form h2{
                                        color:#3489aa;
                                        font-size: 18px;
                                        margin-bottom: 10px;
                                        text-align: center;
                                    }
                                    
                                    .reset-password-form label{
                                        margin-left: 4rem;  
                                        font-size: 15px;
                                    }
                                    
                                    .reset-password-form input{
                                        padding:5px;
                                        margin:20px 2px;
                                        width:50%;
                                        border: 1px solid #999;
                                        border-radius: 5px;
                                    }  
                                    
                                    .reset-password-form button{
                                        color:#fff;
                                        width:15%;
                                        padding:10px;
                                        border-radius:5px;
                                        font-size: 15px;
                                        margin:0 10px;
                                        border:none;
                                        outline:none;
                                        cursor:pointer;
                                        background-color: #1c8adb;
                                    }
                                    .reset-password-form button:hover,
                                    .reset-password-form button:active {
                                      background-color: rgb(8, 123, 168);
                                      color: #ffffff;
                                    }
                                    </style>
                                    <title> Reset Password </title>

                                    <div class ="header"><h1>Expense Tracker App</h1></div>
                                    <div class ="reset-password-form">
                                        <h2>Enter New Password</h2> 
                                        <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Password : </label>
                                        <input name="newpassword" type="password" required></input>
                                        <button type="submit">Reset</button>
                                        </form>
                                    </div>
                                </html>`
                            );
                             
            res.end();
        }

    }catch(err){
        await t.rollback();
        console.log(err)
        return res.json({message: "Something went Wrong", error:err, success: false });
    }
    
}

const updatepassword =  async (req, res) => {

    const t = await sequelize.transaction();

    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        const resetpasswordrequest = await Forgotpassword.findOne({ where : { id: resetpasswordid }});
        const user = await User.findOne({where: { id : resetpasswordrequest.userId}});

        if(user) {

                //encrypt the password
                const saltRounds = 10;
                bcrypt.hash(newpassword,saltRounds, async(err, hash)=>{
                if(err){
                        console.log(err);
                        throw new Error(err);
                }
                await user.update({ password: hash }, {transaction:t});
                await t.commit();
                res.status(200).send(`<html>
                                <script>
                                    function formsubmitted(e){
                                        e.preventDefault();
                                    }
                                </script>
                                <h2>New Password is Successfully Updated</h2>
                                <a href="http://34.234.148.249:3000/Login/login.html">Back to Login Page</a>
                            </html>`)
                res.end();
                });
        } else{
            return res.status(404).json({ error: 'No user Exists', success: false})
        }
            
    } catch(error){
        await t.rollback();
        return res.status(403).json({ error, success: false } )
    }

}


module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
}