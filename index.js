const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { v4: uuidv4 } = require('uuid')

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.redirect(`${uuidv4()}`);
});

app.get('/room-full', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(Buffer.from('<h2>Room full ;(</h2>'));
});

app.get('/:room', (req, res) => {
    res.render('room', {roomID: req.params.room});
});

function preConnectSlotCheck(roomid){
  const rooms = io.sockets.adapter.rooms;
  const arr_room = [...rooms].map(([name, value]) => ({ name, value }));
  let arr_index;
  arr_room.forEach((room, index) => {
    if (room.name == roomid){
      arr_index = index;
    }
  })
  try{
    const arr_users = Array.from(arr_room[arr_index].value);
    return arr_users.length;
  }
  catch {
    return 0;
  }
  
  
}


function getEnemyData(map, id, roomid){
  const arr_room = [...map].map(([name, value]) => ({ name, value }));
  let arr_index;
  arr_room.forEach((room, index) => {
    if (room.name == roomid){
      arr_index = index;
    }
  })
  const arr_users = Array.from(arr_room[arr_index].value);
  const index = arr_users.indexOf(id);
  const x = arr_users.splice(index, 1);
  const enemy_socket = io.sockets.sockets.get(arr_users[0]);
  return enemy_socket.data.username;
}


io.on('connection', (socket) => {
    console.log('user connected: ' + socket.id);  
    socket.on('join-room', (ROOM_ID, USER_ID, USERNAME) => {
     let slots_left = preConnectSlotCheck(ROOM_ID);
     if (slots_left >= 2){
        console.log('no free slots!, disconnecting..');
        socket.emit('redirect', '/room-full');
        socket.disconnect();
        USER_ID = 'disconnected-client';
      }
      else{
        socket.join(ROOM_ID);
        socket.data.username = USERNAME;
        slots_left += 1;
      } 
      let enemy_username;
      if(slots_left == 2){
        enemy_username = getEnemyData(socket.adapter.rooms, socket.id, ROOM_ID);
      }     
      socket.to(ROOM_ID).emit('user-connected', {userid: USER_ID, username: USERNAME});
      socket.emit('connected', {slots_left: slots_left, enemy_username: enemy_username});

      
      socket.on('status-change', (STATUS) => {
        console.log(`Player: ${USER_ID}, status: ${STATUS}`);
        socket.to(ROOM_ID).emit('status-change', STATUS);
      });


      socket.on('initialize', () => {
        io.in(ROOM_ID).emit('data-collect');
      });

      socket.on('data-collect', (ENEMY_USER_ID, ENEMY_POINTS, ENEMY_USERNAME) => {
        socket.to(ROOM_ID).emit('start', {userid: ENEMY_USER_ID, points: ENEMY_POINTS, username: ENEMY_USERNAME});
      });


      socket.on('move', (msg) => {
        socket.to(ROOM_ID).emit('move', msg);
        socket.to(ROOM_ID).emit('turn', true);
      });

      socket.on('win', (msg) => {
        io.emit('win', msg);
      });
      
      socket.on('message', (msg) => {
        socket.to(ROOM_ID).emit('message', msg);
      });

      socket.on('disconnect', () => {
        console.log('user disconnected: ' + socket.id);
        socket.to(ROOM_ID).emit('user-disconnected', USER_ID);
      });
    });
  
  });

server.listen(3000, () => {
  console.log('listening on *:3000');
});