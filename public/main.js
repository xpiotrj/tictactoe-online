/*
h - horizontal
v- certical
s - half by

+ - add
0 - center
- - substract
l - rotate left
r - rotate right
*/
class Game {
    constructor(win_count, lost_count, tie_count){
        this.win_count = win_count;
        this.lost_count = lost_count;
        this.tie_count = tie_count;
        this.games = [];
    }

    add_game(game, result){
        this.games.push({board: game, result: result});
    }

    win_precentage() {
        let games_played = this.win_count + this.lost_count;
        let res = (this.win_count / games_played) * 100;
        return res;
    }

    games_played_count() {
        let games_played = this.win_count + this.lost_count;
        return games_played;
    }

}

const offset = 400 * 0.33;
var socket = io();
let status = false;
let GAME_OBJ;
let turn = false;
let USER_ID = Math.floor(Math.random() * 500);
let USERNAME = 'Player#' + USER_ID.toString();
let char;
let points = -1;


function move(button){
    if(turn == false){
        return;
    }

    if(button.innerHTML != ""){
        return;
    }

    makeMove(button.parentElement.getAttribute('data-index'), char);
    turn = !turn;
    changeTurn(turn);
    socket.emit('move', {position: button.parentElement.getAttribute("data-index"), char: char});

    //chuj wie jak to działa ale działa nie ruszać
    if (check() != false){
        var check1 = check();
        const buttons = document.querySelectorAll('button');
        let ar = [];
        buttons.forEach((button) => { 
            if (button.innerHTML == "O"){
                ar.push(0);
            }
            else if (button.innerHTML == "X"){
                ar.push(1);
            }
            else{
                ar.push("-");
            }
        });
        socket.emit('win', {data: check1[1], username: USERNAME, userid: USER_ID, char: char, board: ar});
    }
}

function check(){
    const buttons = document.querySelectorAll('button');
    let ar = [];
    buttons.forEach((button) => { 
        if (button.innerHTML == "O"){
            ar.push(0);
        }
        else if (button.innerHTML == "X"){
            ar.push(1);
        }
        else{
            ar.push("-");
        }
     });

     if(ar.indexOf('-') == -1){
        return [true,'t'];
     }

     //vertical win
     if(ar[0] == ar[1] && ar[1] == ar[2] && ar[0] != '-'){
        return [true, 'v-'];
     }
     if(ar[3] == ar[4] && ar[4] == ar[5] && ar[5] != '-'){
        return [true, 'v0'];
     }
     if(ar[6] == ar[7] && ar[7] == ar[8] && ar[8] != '-'){
        return [true, 'v+'];
     }

     //horizontal win
     if(ar[0] == ar[3] && ar[3] == ar[6] && ar[6] != '-'){
        return [true, 'h-'];
     }
     if(ar[1] == ar[4] && ar[4] == ar[7] && ar[7] != '-'){
        return [true, 'h0'];
     }
     if(ar[2] == ar[5] && ar[5] == ar[8] && ar[8] != '-'){
        return [true, 'h+'];
     }

     //skos
     if(ar[0] == ar[4] && ar[4] == ar[8] && ar[8] != '-'){
        return [true, 'sl'];
     }
     if(ar[2] == ar[4] && ar[4] == ar[6] && ar[6] != '-'){
        return [true, 'sr'];
     }
     return false;
}


window.onload = () => {
    const buttons = document.querySelectorAll('button');
        buttons.forEach((button) => {
            button.addEventListener('click', () => { move(button) });
        }); 
    socket.emit('join-room', ROOM_ID, USER_ID, USERNAME);
    document.getElementById('rematch_btn').addEventListener('click', () => {
        USER_ID = Math.floor(Math.random() * 500);
        status = !status;
        changeStatus(status);
        socket.emit('status-change', status);
    });
    document.getElementById('close_stats_btn').addEventListener('click', () => {
        switchStatsWindow(false, GAME_OBJ);
    });
    document.getElementById('send-message-btn').addEventListener('click', () => {
        sendMessage();
    });
    document.getElementById('show_stats_btn').addEventListener('click', () => {
        switchStatsWindow(true, GAME_OBJ);
    });
    document.getElementById('ready_btn').addEventListener('click', () => {  
        status = !status
        changeStatus(status);
        socket.emit('status-change', status);   
    });
};

socket.on('user-connected', enemy => {
    //when other user joined
   if(enemy.userid == 'disconnected-client'){
        return;
    }
    lobby_controller(2, enemy.username);
});

socket.on('connected', (data) => {
    //when you joined
    console.log('Joined as: ' + USER_ID + ', players in lobby: ' + data.slots_left);
    lobby_controller(data.slots_left, data.enemy_username);
});

socket.on('status-change', enemy_status => {
    if(enemy_status == true && status == true){
        socket.emit('initialize');
    }
});

socket.on('data-collect', () => {
    USERNAME = document.getElementById('username_text').value;
    if(USERNAME.length < 5){
        USERNAME = 'Player' + USER_ID.toString();
    }
    if(points == -1){
        GAME_OBJ = new Game(0, 0, 0);
        points = 0;
    }
    socket.emit('data-collect', USER_ID, points, USERNAME);
});


socket.on('start', (ENEMY) => {
    switchButton('rematch_btn', 'none');
    hide_line();
    restart_board();
    update_counter({username: USERNAME, id: USER_ID, points: points, enemy_username: ENEMY.username, enemy_id: ENEMY.userid, enemy_points: ENEMY.points});
    char = "O";
    if(ENEMY.userid < USER_ID){
        turn = true;
        char = "X";
    }   
    changeTurn(turn);
    console.log('GAME STARTED!!');
    switchPanelsTo('game');
});

socket.on('move', (msg) => {
    makeMove(msg.position, msg.char);
});

socket.on('turn', (msg) => {
    turn = msg;
    changeTurn(turn);
});

socket.on('win', (msg) => {
    turn = false;
    if(msg.data == 't'){
        console.log('Tie!'); 
        changeTurn('Remis');
        GAME_OBJ.tie_count += 1;
        GAME_OBJ.add_game(msg.board, 'tie');
    }
    else{
    place_line(msg.data);
    changeTurn('Przegrałeś...');
    console.log('Round won by: ' + msg.userid);
    if(msg.userid == USER_ID){
        points++;
        GAME_OBJ.win_count = points;
        changeTurn('Wygrałeś...');
        GAME_OBJ.add_game(msg.board, 'win');
    }
    else{
        GAME_OBJ.lost_count += 1;
        GAME_OBJ.add_game(msg.board, 'lost');
    }
    }
    status = false; 
    switchButton('rematch_btn', 'block');
});

socket.on('redirect', (destination) => {
    window.location.href = destination;
})

socket.on('user-disconnected', id => {
    lobby_controller(1, 'x');
    if(document.getElementById('game').style.display == 'block'){
        alert('enemy left! game stopped!');
        document.location.reload(true);
    }
    console.log("user disconnected: " + id);
});



