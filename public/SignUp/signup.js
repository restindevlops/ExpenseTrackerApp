var form=document.getElementById('signup-form');

form.addEventListener('submit',SaveToBackend);

async function SaveToBackend(event){
    event.preventDefault();

    const name = event.target.username.value;
    const email = event.target.useremail.value;
    const password = event.target.password.value;

    const obj = {
       name,
       email,
       password
    }

    try {
        const response = await axios.post("http://34.234.148.249:3000/user/signup", obj);
        window.location.href="../Login/login.html"
        
       
    } catch (error) {
        alert("Something went Wrong :(");
        document.body.innerHTML+=`<h2>${error}</h2>`;
        console.log(error);
    }
   
}



    