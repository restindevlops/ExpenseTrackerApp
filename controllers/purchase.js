const Razorpay = require('razorpay');

const jwt = require('jsonwebtoken');

require('dotenv').config()

const Order = require('../models/orders');

const sequelize = require('../util/database');

exports.getPurchasePremium = async (req,res,next) => {

    try{
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        console.log(rzp.orders.create); // rzp is an object of razorpay class with accounts,orders,payments,refunds etc as its methods.
      
        const amount = 2500; //amount is written in paise
        await rzp.orders.create({amount, currency:"INR"}, async (err,order) =>{ // rzp is an object of the Razorpay class with orders as one of its key
            // console.log(order)// an 'order' object with razorpay attributes is created with its own id and given input value for amount and currency 
            if (err){
                throw new Error (JSON.stringify(err))
            }
            console.log(rzp.orders.razorpay_payment_id);
            req.user.createOrder({orderid:order.id, status:"PENDING" }) //a new record for Order table is created with id of the order object as its orderid
            //  and 'PENDING' as its status
            return res.status(201).json({order,key_id:rzp.key_id})
        })
    } catch(err){
        res.status(403).json({message: "Something went Wrong", error:err})
    }
}

const generatetokenid = (id,name,ispremiumuser) => {   
    
    return jwt.sign({ userId:id, name:name, ispremiumuser:ispremiumuser}, 'thesecretkeyweassign') 
}

 exports. postUpdateTransactionStatus= async (req,res,next) => {

    const t = await sequelize.transaction(); 

    try{
        const {payment_id, order_id} = req.body;

        if(!payment_id){   //if transaction has failed, there is no payment id
            const order = await Order.findOne({where: {orderid:order_id}});
            const promise1 = order.update({status: 'FAILED'}, {transaction: t} );
            const promise2 = req.user.update({ispremiumuser: false}, {transaction: t});
    
            Promise.all([promise1, promise2]).then( async () =>{
                await t.commit();
                return res.status(202).json({success: false, message: "Transaction Failed"})
            }).catch((err) => {throw new Error(err)});
    
        }else{
            const order = await Order.findOne({where: {orderid:order_id}});
            const promise1 = order.update({paymentid: payment_id, status: 'SUCCESSFUL'}, {transaction: t});
            const promise2 = req.user.update({ispremiumuser: true}, {transaction: t});
    
            Promise.all([promise1, promise2]).then( async () =>{
                await t.commit();
                return res.status(202).json({success: true, message: "Transaction Successful", token: generatetokenid( req.user.id,undefined,req.user.ispremiumuser)})
            }).catch((err) => {throw new Error(err)});
        }
       

    } catch(err){
        await t.rollback();
        console.log(err);
        res.status(403).json({message: "Something went Wrong", error:err})
        }
}