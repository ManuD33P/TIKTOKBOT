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
    }

    setUserName(username){
        this._socket.emit('setUsername',username);
    }
}

const socket = new Socket();
export default socket
