const socket = io()

//Elements
const $messagesForm = document.querySelector("#message-form")
const $messagesFormInput = $messagesForm.querySelector('input')
const $messagesFormButton = $messagesForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messagesTemplate = document.querySelector('#message-template').innerHTML
const messageLocationTemplate = document.querySelector('#messageLocation-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    const scrolledToTheBottomZone = 10


    if (containerHeight - newMessageHeight <= scrollOffset +scrolledToTheBottomZone) {
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messagesTemplate, {
        username:message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(messageLocationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messagesForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messagesFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{
        $messagesFormButton.removeAttribute('disabled')
        $messagesFormInput.value = ''
        $messagesFormInput.focus()
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

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})