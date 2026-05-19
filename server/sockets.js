function sockets(io, socket, data) {
  
  // Det enda vi behöver ha kvar är hämtningen av språkfilerna
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

}

export { sockets };