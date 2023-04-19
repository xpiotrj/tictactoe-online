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

const offset = 400 * 0.33;

let isPlayersTurn;
        let char;
        let name;

        window.onload = () => {
            document.getElementById("restart").addEventListener('click', () => {
            document.location.reload();
        });
            const buttons = document.querySelectorAll('button');
            buttons.forEach((button) => {
                button.addEventListener('click', () => { move(button) });
            }); 
        };

        //new code with multiplayer
        var socket = io();

        function move(button){
            if(isPlayersTurn == false){
                return;
            }

            if(button.innerHTML != ""){
                return;
            }

            button.innerHTML = char;
            
            turn = !turn;
            socket.emit('move', {position: button.parentElement.getAttribute("data-index"), char: char});

            if (check() != false){
                var check1 = check();
                socket.emit('win', {data: check1[1], player_name: name, char: char});
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

        socket.on('setup', (msg) => {
            const buttons = document.querySelectorAll('button');
            const counter = document.getElementById('counter');
            counter.innerHTML = `${msg.name} (${msg.char}): 0 | Enemy (?): 0`;
            buttons.forEach((button) => {
                button.innerHTML = "";
            });
            char = msg.char;
            name = msg.name;
            isPlayersTurn = msg.turn;
            let info;
            if(msg.turn){ info = "Twoja kolej..." } else { info = "Poczekaj na swoją kolej..." };
            document.getElementById("turn_info").innerHTML = info;
            console.log(msg);
        });

        socket.on('turn', (msg) => {
            isPlayersTurn = msg;
            let info;
            if(msg){ info = "Twoja kolej..." } else { info = "Poczekaj na swoją kolej..." };
            document.getElementById("turn_info").innerHTML = info;
        });

        socket.on('move', (msg) => {
            const buttons = document.querySelectorAll('button');
            buttons[msg.position].innerHTML = msg.char;
        });

        socket.on('win', (msg) => {
            place_line(msg.data);
        });

function place_line(pos){
    const line = document.getElementById('line');
    const board = document.getElementById('board');
    line.style.display = 'block';
    const board_pos = board.getBoundingClientRect();
    console.log(board_pos);
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


