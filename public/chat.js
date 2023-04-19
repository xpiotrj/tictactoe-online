function sendMessage(){
    let message = document.getElementById('message-text').value;
    updateChat("You", message)
    socket.emit('message', {author: USERNAME, message: message});
}


socket.on('message', msg => {
    updateChat(msg.author, msg.message);
});


