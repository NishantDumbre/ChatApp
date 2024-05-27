let reset = document.getElementById('reset')
let email = document.getElementById('email')

reset.addEventListener('click', sendResetURL)

let URL = 'http://localhost:3000'




async function sendResetURL(e) {
    e.preventDefault()

    let obj = {
        email: email.value,
    }

    if (!obj.email) {
        generalError()
    }
    else {
        let result = await axios.post(`${URL}/forgot-password`, obj)
        console.log(result.data)
        if (result.data.success == false) {
            const { failed } = result.data
            console.log(failed, 'failed')

            for (let data of failed) {
                specificError(data)
            }
        }
        else {
            console.log(result.data, 'pass')
            successMessage()
        }
    }
}



function specificError(data) {
    let errorContainer = document.getElementById(`${data.error}-error`)
    if (errorContainer) {
        let errorMessage = document.createElement('p')
        errorMessage.innerHTML = data.message
        errorMessage.className = 'error-message'

        errorContainer.appendChild(errorMessage)
        setTimeout(() => {
            errorMessage.remove()
        }, 1000);
    }
    else {
        alert('Someting went wrong. Please try again')
    }
}



function generalError() {
    let errorMessage = document.createElement('p')
    errorMessage.innerHTML = 'Please enter the email'
    errorMessage.className = 'error-message'
    let errorContainer = document.getElementById(`email-error`)
    errorContainer.appendChild(errorMessage)

    setTimeout(() => {
        errorMessage.remove()
    }, 1000);
}



function successMessage() {
    let errorMessage = document.createElement('p')
    errorMessage.innerHTML = 'Sent email. Redirecting you to login page'
    errorMessage.className = 'error-message'
    let errorContainer = document.getElementById(`email-error`)
    errorContainer.appendChild(errorMessage)

    setTimeout(() => {
        errorMessage.remove()
        window.location.href = '../views/login.html'
    }, 2000);
}