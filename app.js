
const express = require('express');

const fs = require('fs');

const path = require ('path');

const sequelize= require('./util/database');

const cors = require('cors');

const dotenv = require('dotenv');

dotenv.config();

const app = express();

const helmet = require('helmet');

const morgan = require('morgan');

app.use(cors());

const userRoutes = require('./routes/user');

const expenseRoutes = require('./routes/expense');

const purchaseRoutes = require('./routes/purchase');

const premiumRoutes = require('./routes/premium');

const resetPasswordRoutes = require('./routes/resetpassword');

const User = require('./models/user');

const Expense = require('./models/expense');

const Order = require('./models/orders');

const Forgotpassword = require('./models/forgotpassword');

const Downloadedfiles = require('./models/downloadedfiles');

// const accessLogStream = fs.createWriteStream(
//     path.join(__dirname, 'access.log'),
//     { flags : 'a'}
// );

app.use(express.json());
// app.use(helmet());
// app.use(morgan('combined',{stream: accessLogStream}));

app.use('/user', userRoutes);

app.use('/expense', expenseRoutes);

app.use('/purchase', purchaseRoutes);

app.use('/premium', premiumRoutes);

app.use('/password', resetPasswordRoutes);

app.use((req,res) =>{
    res.sendFile(path.join(__dirname,`public/${req.url}`))
})

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(Downloadedfiles);
Downloadedfiles.belongsTo(User);

sequelize.sync()
.then(app.listen(process.env.PORT || 3000))
.catch(err=> console.log(err));