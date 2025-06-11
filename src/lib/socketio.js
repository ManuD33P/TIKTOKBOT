import { io } from 'socket.io-client';

class Socket {
    constructor() {
        // Implementación del patrón Singleton
        if (!Socket.instance) {
            this._socket = null; // La instancia real de socket.io-client
            this.username = null; // Para almacenar el username globalmente si es necesario
            this.isConnected = false; // Para rastrear el estado de conexión

            Socket.instance = this;
        }

        return Socket.instance;
    }

    // Método para inicializar y conectar el socket.
    // Debería llamarse una vez al inicio de tu aplicación (ej. en el componente raíz o un Context).
    initialize(endpoint) {
        if (!this._socket) {
            console.log(`Socket: Inicializando y conectando a ${endpoint}...`);
            this._socket = io(endpoint, {
                reconnection: true, // Habilitar reconexión automática
                reconnectionAttempts: Infinity, // Intentar reconectar indefinidamente
                reconnectionDelay: 1000, // Esperar 1 segundo antes del primer intento
                reconnectionDelayMax: 5000, // Retraso máximo de 5 segundos
                randomizationFactor: 0.5, // Factor de aleatorización
                // transports: ['websocket'], // Opcional: forzar WebSockets
            });

            // Añadir listeners GLOBALES gestionados por el singleton
            this._socket.on('connect', () => {
                console.log('Socket: Cliente conectado con el servidor');
                this.isConnected = true;
                // Emitir username si ya está disponible en la instancia del singleton
                if (this.username) {
                     console.log(`Socket: Emitiendo setUsername en conexión inicial: ${this.username}`);
                     this._socket.emit('setUsername', this.username);
                }
            });

            this._socket.on('disconnect', (reason) => {
                console.log(`Socket: Cliente desconectado. Razón: ${reason}`);
                this.isConnected = false;
                // Socket.IO con reconnection: true intentará reconectar automáticamente
            });

            this._socket.on('reconnect', (attemptNumber) => {
                 console.log(`Socket: Cliente reconectado! Intento #${attemptNumber}`);
                 this.isConnected = true;
                 // Emitir username aquí en reconexión exitosa
                 if (this.username) {
                     console.log(`Socket: Emitiendo setUsername en reconexión: ${this.username}`);
                     this._socket.emit('setUsername', this.username);
                 }
            });

            this._socket.on('connect_error', (error) => {
                console.error('Socket: Error de conexión:', error);
                this.isConnected = false;
            });

            this._socket.on('reconnect_error', (error) => {
                console.error('Socket: Error de reconexión:', error);
            });

            this._socket.on('reconnecting', (attemptNumber) => {
                console.log(`Socket: Intentando reconectar... Intento #${attemptNumber}`);
            });

            this._socket.on('reconnect_failed', () => {
                console.error('Socket: Reconexión fallida después de varios intentos.');
                this.isConnected = false;
            });

            // Listener global para PONG si es parte del heartbeat
             this._socket.on('PONG', ()=> console.log('Socket: Recibio un PONG'));

             // Gestionar el intervalo PING en el singleton si es a nivel de aplicación
             // Si el servidor ya maneja heartbeats, este PING manual podría no ser necesario.
             // Si lo mantienes, asegúrate de limpiarlo al desconectar/destruir el singleton.
             this._pingInterval = setInterval(() => {
                 if (this._socket && this._socket.connected) {
                     // console.log('Socket: Emitting PING'); // Descomentar para ver los PINGs
                     this._socket.emit('PING');
                 }
             }, 5000);


        } else {
            console.log('Socket: Instancia ya inicializada.');
            // Si ya existe, asegurar que esté conectado si no lo está
            if (!this._socket.connected) {
                 console.log('Socket: Instancia existente no conectada, intentando conectar...');
                 this._socket.connect(); // Llamar connect() en la instancia existente
            }
        }
    }

    // Método para establecer el nombre de usuario y emitirlo
    setUserName(username) {
        this.username = username; // Almacenar en el singleton
        if (this._socket && this._socket.connected) {
            console.log(`Socket: Emitiendo setUsername: ${username}`);
            this._socket.emit('setUsername', username);
        } else {
            console.warn('Socket: No conectado, no se pudo emitir setUsername. Almacenando username para después.');
            // Los listeners 'connect' o 'reconnect' lo emitirán cuando sea posible
        }
    }

    // Método para emitir eventos personalizados desde los componentes
    emit(event, data) {
        if (this._socket && this._socket.connected) {
            this._socket.emit(event, data);
        } else {
            console.warn(`Socket: No conectado, no se pudo emitir evento "${event}".`);
        }
    }

    // Método para que los componentes añadan listeners específicos
    on(event, listener) {
        if (this._socket) {
            this._socket.on(event, listener);
        } else {
            console.warn(`Socket: No inicializado, no se pudo añadir listener para "${event}".`);
        }
    }

     // Método para que los componentes eliminen listeners específicos
    off(event, listener) {
        if (this._socket) {
            this._socket.off(event, listener);
        } else {
            console.warn(`Socket: No inicializado, no se pudo eliminar listener para "${event}".`);
        }
    }

    // Método para obtener la instancia real de socket.io-client
    getSocketInstance() {
        return this._socket;
    }

    // Método para verificar el estado de conexión
    isConnected() {
        return this._socket ? this._socket.connected : false;
    }

    // Método para desconectar manualmente (si es necesario al cerrar la app, por ejemplo)
    disconnect() {
        if (this._socket && this._socket.connected) {
            console.log('Socket: Desconectando manualmente...');
            this._socket.disconnect();
        }
        // Limpiar el intervalo PING si se gestiona aquí
        if (this._pingInterval) {
            clearInterval(this._pingInterval);
            this._pingInterval = null;
        }
    }
}

const socket = new Socket();
export default socket;
