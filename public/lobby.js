window.onload = () => {
    document.getElementById('join_btn').addEventListener('click', () => {
        let id = document.getElementById('id_text').value;
        join(id);
    });
    document.getElementById('create_btn').addEventListener('click', () => {
        create();
    });
}

function join(id){
    if(id.length < 5){
        return;
    }

    socket.emit('join', id);
}

function create(){
    socket.emit('create', 'test1234');
}