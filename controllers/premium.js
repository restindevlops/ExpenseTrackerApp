const User= require('../models/user');

const Expense = require('../models/expense');

const sequelize = require('../util/database');

const getUserLeaderboard = async (req,res) => { 

 try{
    const leaderboardofusers = await User.findAll({
      
        order:[['totalExpense', 'ASC']]

    })
    res.status(200).json(leaderboardofusers);
}catch (err){
    console.log(err);
    res.status(500).json(err);
}

}

//brute-force Solution
// const getUserLeaderboard = async (req,res) => { 

//     try{
//        const users = await User.findAll();
//        const expenses = await Expense.findAll();
//        const userAggregatedExpenses = {};
//        expenses.forEach((expense)=> {
//         if(userAggregatedExpenses[expense.userId]){
//             userAggregatedExpenses[expense.userId] += expense.amount;
//         }else{
//             userAggregatedExpenses[expense.userId] = expense.amount;
//         }
//         });
//         const userLeaderBoardDetails = [];
//         users.forEach((user)=>{
//             userLeaderBoardDetails.push({name:user.name, total_cost: userAggregatedExpenses[user.id] ||0 })
//         })
//         userLeaderBoardDetails.sort((a,b)=> a.total_cost - b.total_cost);
//         res.status(200).json(userLeaderBoardDetails);
//    }catch (err){
//        console.log(err);
//        res.status(500).json(err);
//    }
   
// }


// Using joins. but this is ommitted because the total expense for millions of users with multiple expenses is calculated in just a fly
// making the app very slow. To overcome this situation we store the total expense to a seperate colomn at the time of addition of expenses itself.
// const getUserLeaderboard = async (req,res) => { 

//     try{
//        const users = await User.findAll({
//         attributes:['id' , 'name', [sequelize.fn('sum',sequelize.col('amount')), 'total_cost']],
//         include: [
//             {
//                 model: Expense,
//                 attributes:[]
//             }
//         ],
//         group:['user.id'],
//         order:[['total_cost','ASC']]
//        });
    
//        res.status(200).json(users);
//     }catch (err){
//        console.log(err);
//        res.status(500).json(err);
//     }
   
// }

module.exports = {
    getUserLeaderboard
}
