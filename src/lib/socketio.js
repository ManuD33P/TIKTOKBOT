import { io } from 'socket.io-client';

class Socket {
    constructor() {
        this.username = null; // Inicializar con null o undefined es más común
        this.conected = false; // Considera si esta propiedad es realmente necesaria si usas socket.connected
        this._socket = null; // Inicializar con null

        // Implementación del patrón Singleton
        if (!Socket.instance) {
            Socket.instance = this;
        }

        return Socket.instance;
    }

    connect(endpoint) {
        if (!this._socket) {
            console.log(`Connecting socket to ${endpoint}...`);
            // Instanciar el socket con opciones de reconexión explícitas
            this._socket = io(endpoint, {
                reconnection: true, // Habilitar reconexión automática (ya es el valor por defecto)
                reconnectionAttempts: Infinity, // Intentar reconectar indefinidamente
                reconnectionDelay: 1000, // Esperar 1 segundo antes del primer intento
                reconnectionDelayMax: 5000, // El retraso máximo entre intentos será de 5 segundos
                randomizationFactor: 0.5 // Factor de aleatorización para el retraso
            });

            // Listener para la conexión inicial o reconexiones exitosas
            this._socket.on('connect', () => {
                console.log('Cliente conectado con el servidor');
                this.conected = true; // Actualizar estado local si lo usas
                // Aquí podrías emitir 'setUsername' si el username ya está disponible
                // en la instancia de la clase Socket, en lugar de esperar al evento 'reconnect'
                // en el componente. Depende de dónde se establece 'this.username'.
                // if (this.username) {
                //     this.setUserName(this.username);
                // }
            });

            // Listener para la desconexión
            this._socket.on("disconnect", (reason) => {
                console.log(`Cliente desconectado. Razón: ${reason}`);
                this.conected = false; // Actualizar estado local si lo usas

                // *** SUGERENCIA: Eliminar o modificar esta lógica de reconexión manual ***
                // Si 'reconnection: true' está configurado, Socket.IO intentará reconectar
                // automáticamente. Llamar a this.connect(endpoint) aquí puede causar
                // comportamiento inesperado o duplicado.
                // La lógica para manejar la desconexión en el componente (ej. handleDisconnect)
                // debería ser suficiente para actualizar la UI.
                // La lógica para re-enviar el username debe ir en el evento 'reconnect'
                // en el componente (como hicimos antes) o aquí en el evento 'connect'
                // si el username está disponible en la instancia de la clase.

                // if (socket.active) { // 'socket.active' no es una propiedad estándar del cliente io
                //     this.connect(endpoint) // <-- Considera eliminar esta línea
                // } else {
                //   console.log(reason);
                // }
                // *** Fin de la SUGERENCIA ***
            });

            // Listener para errores de conexión (útil para depuración)
            this._socket.on('connect_error', (error) => {
                console.error('Error de conexión del socket:', error);
            });

            // Listener para errores de reconexión
             this._socket.on('reconnect_error', (error) => {
                console.error('Error de reconexión del socket:', error);
            });

             // Listener cuando se inicia un intento de reconexión
             this._socket.on('reconnecting', (attemptNumber) => {
                console.log(`Intentando reconectar... Intento #${attemptNumber}`);
            });

             // Listener cuando se cancela la reconexión (ej. después de maxAttempts)
             this._socket.on('reconnect_failed', () => {
                console.error('Reconexión fallida después de varios intentos.');
            });

        } else {
            console.log('Socket ya está instanciado.');
            // Si el socket ya existe, puedes querer asegurarte de que esté conectado
            // o manejar este caso según la lógica de tu aplicación.
            if (!this._socket.connected) {
                 console.log('Socket existente no conectado, intentando conectar...');
                 this._socket.connect(); // Llama a connect() en la instancia existente
            }
        }
    }

    setUserName(username) {
        this.username = username; // Opcional: guardar el username en la instancia de la clase
        if (this._socket && this._socket.connected) {
            console.log(`Emitiendo setUsername: ${username}`);
            this._socket.emit('setUsername', username);
        } else {
            console.warn('Socket no conectado, no se pudo emitir setUsername.');
            // Podrías guardar el username y emitirlo una vez que se conecte/reconecte
            // (ej. en el listener 'connect' o 'reconnect').
        }
    }

    // Método para obtener la instancia del socket si es necesario
    getSocketInstance() {
        return this._socket;
    }

    // Método para desconectar manualmente si es necesario
    disconnect() {
        if (this._socket && this._socket.connected) {
            console.log('Desconectando socket manualmente...');
            this._socket.disconnect();
        }
    }
}

const socket = new Socket();
export default socket;
