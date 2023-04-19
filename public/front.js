function changeTurn(turn){
    if(turn == true){
        document.getElementById('turn_info').innerHTML = 'twoja kolej';
    }
    else if(turn == false){
        document.getElementById('turn_info').innerHTML = 'kolej przeciwnika';
    }
    else if(turn == 'wait'){
        document.getElementById('turn_info').innerHTML = 'waitng for ready...';
    }
    else{
        document.getElementById('turn_info').innerHTML = turn;
    }
}


function switchButton(button_id, value){
    document.getElementById(button_id).style.display = value;
}

function hide_line(){
    const line = document.getElementById('line');
    line.style.display = "none";
}

function place_line(pos){
    const line = document.getElementById('line');
    const board = document.getElementById('board');
    line.style.display = 'block';
    const board_pos = board.getBoundingClientRect();
    //decode line pos
    switch (pos[0]) {
        case 'h':
            if(pos[1] == '+'){
                line.style.top = board_pos.top + 'px';
                line.style.left = board_pos.left + offset * 2.5 + 'px';
            }
            else if(pos[1] == '-'){
                line.style.top = board_pos.top + 'px';
                line.style.left = board_pos.left + offset / 2+ 'px';
            }
            else if(pos[1] == '0'){
                line.style.top = board_pos.top + 'px';
                line.style.left = board_pos.left + offset * 1.5 + 'px';
            }
            break;


        case 'v':
            if(pos[1] == '+'){
                line.style.top = board_pos.top + offset  + 'px';
                line.style.transform = 'rotate(90deg)';
                line.style.left = board_pos.left + 200 + 'px';
            }
            else if(pos[1] == '-'){
                line.style.transform = 'rotate(90deg)';
                line.style.top = board_pos.top - offset +'px';
                line.style.left = board_pos.left + 200 + 'px';
            }
            else if(pos[1] == '0'){
                line.style.transform = 'rotate(90deg)';
                line.style.top = board_pos.top + 'px';
                line.style.left = board_pos.left + 200 + 'px';
            }
            break;


        case 's':
            if(pos[1] == 'l'){
                line.style.transform = 'rotate(-45deg)';
                line.style.height = 400  + "px";
                line.style.top = board_pos.top +  'px';
                line.style.left = board_pos.left + 200 + 'px';
            }
            else{
                line.style.transform = 'rotate(45deg)';
                line.style.height = 400  + "px";
                line.style.top = board_pos.top +  'px';
                line.style.left = board_pos.left + 200 + 'px';
            }
            break;
    }
}


function restart_board(){
    const buttons = document.querySelectorAll('button');
        buttons.forEach((button) => {
            button.innerHTML = "";
        });
}

function update_counter(data){
    document.querySelector('#counter :nth-child(2)').innerHTML = data.enemy_username;
    document.getElementById('player_counter').innerHTML = data.points;
    document.getElementById('enemy_counter').innerHTML = data.enemy_points;
}

function switchPanelsTo(panel){
    if(panel == 'lobby'){
        document.getElementById('lobby').style.display = 'block';
        document.getElementById('game').style.display = 'none';
    }
    else if(panel == 'game'){
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game').style.display = 'block';
    }
}

function makeMove(index, char){
    const buttons = document.querySelectorAll('button');
    buttons[index].innerHTML = char;
}

function changeStatus(status){
    document.getElementById('ready_state').innerHTML = status.toString();
}

function lobby_controller(slots_taken, enemy_username){
    const enemy_slot = document.getElementById('enemy_name');
    let loader = document.getElementById('loader');
    let enemy = document.getElementById('enemy');

    if(slots_taken == 1){
        //only one player in lobby
        loader.style.display = 'block';
        enemy_slot.innerHTML = "";
    }
    else{
        //both players in lobby
        enemy.style = 'transform: rotateX(180deg)';
        loader.style.display = "none";
        enemy_slot.innerHTML = "<h2>Enemy found!</h2><img src='/icons8-user-100.png'></img>Enemy: " + enemy_username;
    }
}

function updateChat(author, message){
    let chatBox = document.getElementById("chat").children[0];
    let textBox = document.getElementById('message-text');
    textBox.value = "";
    chatBox.innerHTML += `<b>${author}: </b>${message}</br>`;
}

function switchStatsWindow(status, data){
    if(status){
        let stats_div = document.getElementById('stats');
        stats_div.style.display = 'flex';
        console.log('your points: ' + data.win_count);
        let dom_boards = '';
        document.getElementById('t_wins').innerHTML = data.win_count;
        document.getElementById('t_ties').innerHTML = data.tie_count;
        document.getElementById('t_lost').innerHTML = data.lost_count;
        document.getElementById('win_prec_span').innerHTML ='Win precentage: ' + data.win_precentage() + '%';
        data.games.forEach((game) => {
            dom_boards += `<div style="text-align: center;"><div class="board_small">`;
            game.board.forEach((tile) => {
                if(tile == 1){
                    tile = "X";
                }
                else if (tile == 0)
                {
                    tile = "O";
                }
                else{
                    tile = "";
                }
                dom_boards += `<div class="tile">${ tile }</div>`;
            });

            dom_boards += `</div>${ game.result }</div>`;
        });
        document.getElementById('games_played').innerHTML = dom_boards;
    }
    else{
        document.getElementById('stats').style.display = 'none';
    }
}