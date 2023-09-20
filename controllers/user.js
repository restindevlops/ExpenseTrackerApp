const User= require('../models/user');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const sequelize = require('../util/database');

require('dotenv').config();

exports.postSignUp = async (req,res,next) => {

    const t = await sequelize.transaction();

    try{
        const name=req.body.name;
        const email=req.body.email;
        const password=req.body.password;

        if(!name ||!email||!password){
            return res.status(400).json({error: "Fields are not filled"});
        }
        const saltrounds=10;
        bcrypt.hash(password, saltrounds,async (err, hash) => {
        console.log(err);
        await User.create({name:name, email:email, password:hash},{transaction:t});
        await t.commit();
        res.status(201).json({message:"User Successfully Created"});

        })    
    } catch(err){
        await t.rollback();
        res.status(500).json({error:"User Already Exist"});
    
    }
}

function generatetokenid (id,name,ispremiumuser) {   //function to generate  secret token for the id and name so that the user 
    //can access and manage only his own expenses and not of other users

    return jwt.sign({ userId:id, name:name, ispremiumuser:ispremiumuser}, process.env.TOKEN_SECRET) //assigning the token for the users with a secret key
}


exports.postLogin = async (req,res,next) => {

    try{
        const email=req.body.email;
        const password=req.body.password;

        if(!email||!password){
            return res.status(400).json({error: "Fields are not filled"});
        }

        const user = await User.findAll({where:{email:email}});

        if(user.length > 0){ //if the user array is not empty, email exists in db.
            bcrypt.compare(password, user[0].password, (err,result) => {
                if(err){ //error from bcrypt.compare
                    throw new Error('Something is wrong');
                }
                if(result === true){ //if bcrypt.compare is success with correct password  
                    res.status(200).json({success: true, message:"User logged in Successfully",
                     token: generatetokenid(user[0].id, user[0].name, user[0].ispremiumuser)});
                    //token is generated for the user's name and id with a secret key
                }
                else{ //if bcrypt.compare is success with incorrect password  
                    return res.status(400).json({success: false, message:"Password is incorrect"})
                }
            })
        }else{ //if user array is empty, email does not exists in db.
            return res.status(404).json({success: false, message:"User does not exist"})
        }       
    }catch(err){
        res.status(500).json({error:err});
    }

}




