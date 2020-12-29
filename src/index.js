const express = require('express');
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { getUser, getUserInRoom, removeUser, addUser } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New websocket connection')
   
    socket.on('join', ({username, room}, callback) =>{
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
           return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage("ChatApp",'Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage("ChatApp",`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    } )
    
    socket.on('sendMessage', (sentMessage, callback)=>{
        
        const user = getUser(socket.id)
        
        const filter = new Filter()

        if(filter.isProfane(sentMessage)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, sentMessage))
        callback()
    })

    socket.on('sendLocation', (sentLocation, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${sentLocation.latitude},${sentLocation.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage("ChatApp",`${user.username} has left.`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})