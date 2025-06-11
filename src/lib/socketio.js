import { io } from 'socket.io-client'

class Socket{
    constructor(){
        this.username;
        this.conected=false;
        this._socket=false;
        if(!Socket.instance){
             Socket.instance = this;
        } 

        return Socket.instance
    }

    connect(endpoint){
        if(!this._socket) this._socket= io(endpoint);
        this._socket.on('connect',()=>{
            console.log('cliente conectado con el servidor');
        })

        this._socket.on("disconnect", (reason) => {
            if (socket.active) {
                this.connect(endpoint)
              // temporary disconnection, the socket will automatically try to reconnect
            } else {
              // the connection was forcefully closed by the server or the client itself
              // in that case, `socket.connect()` must be manually called in order to reconnect
              console.log(reason);
            }
          });
    }

    setUserName(username){
        this._socket.emit('setUsername',username);
    }
}

const socket = new Socket();
export default socket
