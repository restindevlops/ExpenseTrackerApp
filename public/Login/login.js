var form=document.getElementById('login-form');

form.addEventListener('submit',SaveToBackend);

async function SaveToBackend(event){
    event.preventDefault();

    const email = event.target.useremail.value;
    const password = event.target.password.value;

    const loginDetails = {
       email,
       password
    }

    try {
        const response = await axios.post("http://34.234.148.249:3000/user/login", loginDetails);
        alert(response.data.message);
        console.log(response.data);
        
        localStorage.setItem('token', response.data.token);

        window.location.href="../Expense/expense.html"
       
    } catch (error) {
        alert("Something went Wrong :(");
        document.body.innerHTML+=`<h2>${error}</h2>`;
        console.log(error);
    }
   
}


    