let name = document.getElementById('name')
let email = document.getElementById('email')
let phone = document.getElementById('phone')
let password = document.getElementById('password')

let signup = document.getElementById('signup')

signup.addEventListener('click', createUser)

let URL = 'http://localhost:3000'

async function createUser(e) {
    e.preventDefault()

    let obj = {
        name: name.value,
        email: email.value,
        phone: phone.value,
        password: password.value
    }

    if (!obj.name || !obj.email || !obj.phone || !obj.password) {
        generalError()
    }

    let result = await axios.post(`${URL}/signup`, obj)
    if (result.data.success == false) {
        const { failed } = result.data.failed
        const { reason } = result.data.reason

        for (let data of failed) {
            specificError(data)
        }
    }
    else {
        console.log(result.data)
        //window.location.href = './login.html'
    }
}


function specificError(data){
    let errorMessage = document.createElement('p')
            errorMessage.innerHTML = reason
            errorMessage.color = 'red'
            let errorContainer = document.getElementById(`${data}-error`)
            errorContainer.appendChild(errorMessage)
            setTimeout((errorContainer) => {
                errorContainer.remove() 
             }, 1000);
}


function generalError(){
    let errorMessage = document.createElement('p')
        errorMessage.innerHTML = 'Please fill all fields'
        errorMessage.color = 'red'
        let errorContainer = document.getElementById(`password-error`)
        errorContainer.appendChild(errorMessage)

        setTimeout(() => {
           errorContainer.remove() 
        }, 1000);
}