var form = document.getElementById('expense-form');

form.addEventListener('submit', SaveToBackend);

async function SaveToBackend(event) {
    event.preventDefault();
    const description = event.target.description.value;
    const category = event.target.category.value;
    const amount = event.target.amount.value;
    const obj = {
        description,
        category,
        amount
    }
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post("http://34.234.148.249:3000/expense/add-expense", obj, { headers: { "Authorization": token } })
        const data = response.data.newExpenseDetail;
        showExpense(data);
    } catch (error) {
        document.body.innerHTML += `<h2>${error}</h2>`;
        console.log(error);
    }
}

let expensestoDisplay = document.getElementById('expensepreference');
expensestoDisplay.addEventListener('change', function () {

    const selectedValue = expensestoDisplay.value;
    saveExpensepreference(selectedValue);

});

function saveExpensepreference(expensepref) {

    localStorage.setItem('expensePreference', expensepref);
    showExpense(1);
}

async function showExpense(page) {

    try{
        const parentElem = document.getElementById('table-expenses')
        parentElem.innerHTML=' ';
        const table = document.createElement('table');
        table.className = "expense-table";
    
    
        const headerRow = document.createElement('tr');
        headerRow.className = "expense-table-header";
    
        const header1 = document.createElement('th');
        header1 .className = "expense-table-header-value";
        header1 .innerHTML = "Description";
    
        const header2 = document.createElement('th');
        header2.className = "expense-table-header-value";
        header2.innerHTML = "Category";
    
        const header3 = document.createElement('th');
        header3.className = "expense-table-header-value";
        header3.innerHTML = "Amount";
    
        const header4 = document.createElement('th');
        header4.className = "expense-table-header-value";
        header4.innerHTML = "Action";
    
        headerRow.appendChild(header1);
        headerRow.appendChild(header2);
        headerRow.appendChild(header3);
        headerRow.appendChild(header4);
        
        table.appendChild(headerRow);
        console.log(table);
    
        const token = localStorage.getItem('token');
        const expensepref = localStorage.getItem('expensePreference');
        const pageSize = expensepref;

        console.log(pageSize);
        console.log(expensepref);
        console.log(parseInt(expensepref))
       
        if (!page || page < 1) {
            page = 1;
        }
    
        const response = await axios.get(`http://34.234.148.249:3000/expense/getpageexpenses?page=${page}&pageSize=${pageSize}`, 
            { headers: { "Authorization": token }
        });
        const { currentPage, hasNextPage, nextPage, hasPreviousPage, previousPage, lastPage } = response.data;
        
        response.data.allExpenses.forEach((expData) => {

            const dataRow = document.createElement('tr');
            dataRow.className = "expense-table-data-value";

            const data1 = document.createElement('td');
            data1.id = "table-data1";
            data1.innerHTML = `${expData.description}`

            const data2 = document.createElement('td');
            data2.id = "table-data2";
            data2.innerHTML = `${expData.category}`;

            const data3 = document.createElement('td');
            data3.id = "table-data3";
            data3.innerHTML = `${expData.amount}`;

            const deleteButton = document.createElement('input');
            deleteButton.className = "del-btn";
            deleteButton.type = 'button';
            deleteButton.value = 'Delete';

            deleteButton.onclick = async () => {
                try{
                const token = localStorage.getItem('token');
                table.removeChild(dataRow);
                const res = await axios.delete(`http://34.234.148.249:3000/expense/delete-expense/${expData.id}`, {headers: { "Authorization": token } });
                }catch (err) {
                    document.body.innerHTML += "<h2>Something went Wrong</h2>";
                    console.log(err);
                }       
            }

            dataRow.appendChild(data1);
            dataRow.appendChild(data2);
            dataRow.appendChild(data3);
            dataRow.appendChild(deleteButton);

            table.appendChild(dataRow);
            parentElem.appendChild(table);
            console.log(parentElem);

            showPagination(currentPage,hasNextPage, nextPage, hasPreviousPage, previousPage);
        });

    }catch (err) {
     console.log(err);
    }   
       
}

function showPagination(currentPage,hasNextPage, nextPage, hasPreviousPage, previousPage) {

    const button = document.getElementById('page-button');
    if (!hasPreviousPage){
        button.innerHTML= `${currentPage} <button onclick="showExpense(${nextPage})"> > </button>`
    }

    else if (hasNextPage && hasPreviousPage) {

        button.innerHTML= `<button onclick="showExpense(${previousPage})"> <  </button> ${currentPage} <button onclick="showExpense(${nextPage})"> > </button>`;
    }

     else if (hasPreviousPage && !hasNextPage) {
        button.innerHTML= `<button onclick="showExpense(${previousPage})"> <  </button> ${currentPage}`;
    }
}

window.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem('token');

    if(!token){ // a stranger accessing the app via url  
        window.location.href="http://34.234.148.249:3000/SignUp/signup.html";
    }

    const decodedtoken = parseJwt(token);
    console.log(decodedtoken);
    const ispremiumuser = decodedtoken.ispremiumuser;
    console.log(ispremiumuser);

    

    if (ispremiumuser) {
        showLeaderboard();
        showpremiumusermessage();
        document.getElementById('filesdownloaded').style.visibility = "hidden";  
    } else { 
        document.getElementById('downloadexpense').style.visibility = "hidden"; 
        document.getElementById('ranks').style.visibility = "hidden";
        document.getElementById('filesdownloaded').style.visibility = "hidden";   
    }
});

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showLeaderboard() {

    document.getElementById('ranks').style.visibility = "hidden";
    const input = document.getElementById('leader');
    const inputElement = document.createElement("input");
    inputElement.type = 'button';
    inputElement.className = 'leaderboard-button';
    inputElement.value = 'Show Leaderboard';
    inputElement.id = "showleaderboard"
    inputElement.onclick = async () => {
        try {
            document.getElementById('showleaderboard').style.visibility = "hidden";
            const token = localStorage.getItem('token');
            const userLeaderBoardArray = await axios.get("http://34.234.148.249:3000/premium/showleaderboard", { headers: { "Authorization": token } })
            console.log(userLeaderBoardArray);

            const leaderboardElem = document.getElementById('ranks');
            leaderboardElem.style.visibility = "visible";
            leaderboardElem.innerHTML += '<h2> Leader Board </h2>'

            userLeaderBoardArray.data.forEach((userDetails) => {
                leaderboardElem.innerHTML += `<li> Name : ${userDetails.name} Total Expense : ${userDetails.total_cost || 0}`;
            })
        } catch (err) {
            console.log(err);
        }
    }
    input.appendChild(inputElement);


}

function showpremiumusermessage() {
    document.getElementById('rzp-btn').style.visibility = "hidden";
    document.getElementById('prm-msg').innerHTML = "You are a Premium User";
}

async function download() {

    try{
        document.getElementById('filesdownloaded').style.visibility = "visible";
        const token = localStorage.getItem('token');
        const response = await axios.get('http://34.234.148.249:3000/expense/download', { headers: { "Authorization": token } })
        
        if (response.status === 200) {
            console.log(response.data.prevDownloadedFiles)

            for (var i = 0; i < response.data.prevDownloadedFiles.length; i++) {
                showprevDownloadedFilesonScreen(response.data.prevDownloadedFiles[i])
            }
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download;
            a.click();
        } else {
            throw new Error(response.data.message)
        }
    }catch (err) {
        console.log(err);
    }       
}

function showprevDownloadedFilesonScreen(obj) {

    const parentElem = document.getElementById('filesdownloaded');
    const childElem = document.createElement('li');
    childElem.textContent = obj.fileName;
    childElem.style.cursor = 'pointer';
    childElem.onclick = () => {
        const childElem = document.createElement('a');
        childElem.href = obj.fileURL;
        childElem.download;
        childElem.click();
    }
    parentElem.appendChild(childElem);
}

document.getElementById('rzp-btn').onclick = async function (event) {

    try{
        const token = localStorage.getItem('token');
        const response = await axios.get("http://34.234.148.249:3000/purchase/premium-membership", { headers: { "Authorization": token } })
        
        const options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function (response) {
                try{
                    const res = await axios.post("http://34.234.148.249:3000/purchase/updatetransactionstatus", {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id
                    }, { headers: { "Authorization": token } }); //sending token is to update the ispremium attribute of the token after payment successful
                    console.log(res.data);
                    localStorage.setItem('token', res.data.token);// setting the updated token to the local storage
                    alert("You are a Premuim user now!");
                    showpremiumusermessage();
                    showLeaderboard();
                }catch (err){
                    console.log(err);
                } 
            }
        };
        const rzp1 = new Razorpay(options); // feeding the razorpay class constructor with keyid and orderid
        rzp1.open(); //to open the razorpay window
        event.preventDefault();
    
        rzp1.on('payment.failed', async function (response) {
            try{
                const res = await axios.post("http://34.234.148.249:3000/purchase/updatetransactionstatus", {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id // if transaction is failed no payment key is generated
                }, { headers: { "Authorization": token } });
                alert('Transaction FAILED!');
            }catch (err){
                console.log(err);
            }    
        });

    }catch (err){
        console.log(err);
    }  
    
}




