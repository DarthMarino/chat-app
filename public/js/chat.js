const socket = io()

//Elements
const $messageaForm = document.querySelector("#message-form")
const $messageaFormInput = $messageaForm.querySelector('input')
const $messageaFormButton = $messageaForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')

socket.on('message', (message)=>{
    console.log(message)
})

$messageaForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageaFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{
        $messageaFormButton.removeAttribute('disabled')
        $messageaFormInput.value = ''
        $messageaFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Sent!')
    })
})

$sendLocationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        $sendLocationButton.setAttribute('disabled', 'disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () =>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})