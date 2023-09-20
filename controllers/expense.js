
const Expense = require('../models/expense');

const User = require('../models/user');

const Downloadedfiles = require('../models/downloadedfiles');

const sequelize = require('../util/database');

const AWS = require('aws-sdk');

require('dotenv').config();

exports.postAddExpense = async (req, res, next) => {

    const t = await sequelize.transaction();

    try {
        const id = req.user.id;   //extracting the id from the global object req.user
        const description = req.body.description;
        const category = req.body.category;
        const amount = req.body.amount;
        if (amount == undefined || amount.length == 0) {
            return res.status(400).json({ success: false, message: "fields are not filled properly" });
        }
        const data = await Expense.create({ description: description, category: category, amount: amount, userId: id }, { transaction: t });
        const totalExpense = Number(req.user.totalExpense) + Number(amount);
        await User.update({ totalExpense: totalExpense }, { where: { id: req.user.id }, transaction: t })
        await t.commit()
        res.status(201).json({ newExpenseDetail: data });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ error: err })
    }

}

exports.getExpenses = async (req, res, next) => {

    try {
    
        const page = +req.query.page || 1;
        const pageSize = +req.query.pageSize || 0;
        const id = req.user.id; 
        const totalItems = await Expense.count({where : {userId: id}});

        const expenses = await Expense.findAll({
            where: { userId: id },
            offset: (page - 1) * pageSize,
            limit: pageSize
        });
        

        res.status(200).json({
            allExpenses: expenses,
            currentPage : page,
            hasNextPage: pageSize * page < totalItems,
            nextPage: page + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / pageSize)
        });

    } catch (err) {
        console.log('GET Expense is failing', JSON.stringify(err));
        res.status(401).json({ error: err })
    }
}

function uploadToS3(data, filename) {

    let s3bucket = new AWS.S3({
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET,
    });

    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {

        s3bucket.upload(params, (err, s3response) => {
            if (err) {
                console.log("Something Went Wrong!", err);
                reject(err);

            } else {
                resolve(s3response.Location);
            }
        })
    })

}

exports.downloadExpenses = async (req, res, next) => {

    const t = await sequelize.transaction();

    try {
        if (!req.user.ispremiumuser) {
            return res.status(401).json({ success: false, message: 'User is not a premium User' })
        }
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses);

        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const filenamesplit = filename.split('/');
        const downloadFileName = filenamesplit[1];
        const fileURL = await uploadToS3(stringifiedExpenses, filename);
        const createDownloadfiles = await Downloadedfiles.create({ fileURL: fileURL, userId: userId, fileName: downloadFileName }, { transaction: t });
        const prevDownloadedFiles = await Downloadedfiles.findAll({ where: { userId: userId } });
        await t.commit();
        res.status(200).json({ fileURL, prevDownloadedFiles, Success: true });

    } catch (err) {
        await t.rollback();
        console.log('Download Expense is failing', JSON.stringify(err));
        res.status(500).json({ error: err })
    }
}

exports.deleteExpense = async (req, res, next) => {

    const t = await sequelize.transaction();

    try {
        if (req.params.id == 'undefined') {
            console.log('Id is missing')
            return res.status(400).json({ err: 'Id is missing' });
        }

        const uId = req.params.id;
        const expense = await Expense.findByPk(uId);
        const amount = expense.amount;
        const totalExpense = Number(req.user.totalExpense) - Number(amount);
        await User.update({ totalExpense: totalExpense }, { where: { id: req.user.id }, transaction: t })
        await Expense.destroy({ where: { id: uId }, transaction: t });
        await t.commit()
        res.status(200).json({ success: true, message: "Expense Deleted" });

    } catch (err) {
        await t.rollback();
        console.log(err);
        res.status(500).json({ error: err })
    }
}

