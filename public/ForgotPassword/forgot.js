var form=document.getElementById('forgot-passsword');

form.addEventListener('submit',SaveToBackend);

async function SaveToBackend(event){
    event.preventDefault();

    const email = event.target.useremail.value;

    const frgotDetails = {email};

    try {
        const response = await axios.post("http://34.234.148.249:3000/password/forgotpassword", frgotDetails);
        alert(response.data.message);
        console.log(response.data);
        

    } catch (error) {
        alert("Something went Wrong :(");
        document.body.innerHTML+=`<h2>${error}</h2>`;
        console.log(error);
    }

    
    
}

