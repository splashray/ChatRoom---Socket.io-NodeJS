const path = require('path')
const http = require('http')
const express = require("express")
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

//set static folder
app.use(express.static(path.join(__dirname , 'public')))

const botName = 'ChatCord Bot'

//Run when client connects
io.on('connection', socket =>{  

  // Join when client connects
  socket.on('joinRoom', ({username, room}) =>{
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    //Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))

    //Broadcast when a user connects
    socket.broadcast
    .to(user.room)
    .emit('message', formatMessage(botName,`${user.username} has joined the chat`))

    //Send users and room info
    io.to(user.room).emit('roomUsers', {
      room:user.room,
      users: getRoomUsers(user.room)
    })

  })
//format this aspect for current message when user leave

  //listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user.username, msg))  
  })

  //run when client disconnects
  socket.on('disconnect', ()=>{
    const user = userLeave(socket.id)
    if(user){
       io.emit('message',  formatMessage(botName, `${user.username} has left the chat`))
    }
  })



})

const port = process.env.PORT || 3000
server.listen(port, () => { console.log(`connected to backend - ${port}`)});

 