"use client"

import { useState, useRef, useEffect,useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog,DialogTrigger,DialogClose,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogFooter } from "@/components/ui/dialog"
import { Bot, Music, User, Wifi, WifiOff, Play, Pause } from "lucide-react"
import socket from '@/lib/socketio'
import Youtu from "./youtube"
import Checkbox from "./checkbox"
export default function Component() {
  const [username, setUsername] = useState("")
  const [listAudio, setlistAudio ] = useState([]);
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [preferents, setPreferents] = useState({
    follow:true,
    shared:true,
    like:true
  })
  const [urlMusic, setUrlMusic] = useState('');
  const audioRef = useRef(null)
  const playerRef = useRef(null);

  const onChangePreferents = ({prop,value}) => {
    setPreferents((prev) => {
      return {
        ...prev,
        [prop]: value
      }
    });
  }
  const handleConnect = async () => {
    if (!username.trim()) return

    setIsConnecting(true)
    socket.setUserName(username)
    
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    if(preferents)  socket._socket.emit('setPreferents',({...preferents,username}));
  }
  const handleDisconnect = () => {
    setIsConnected(false)
    setIsConnecting(false);
  }

  const playAudio = async (audioUrl) => {
    try {
      const ref = audioRef.current;
      ref.src = audioUrl
      await ref.play()
    } catch (error) {
      console.error("Error al cargar el audio:", error);
    }
  };

  const handleVolumeChange = (event) => {
      if (playerRef.current) {
          playerRef.current.setVolume(event.target.value);
      }
  };

  const handleVolumeChangeBot = (event) => {
      if(audioRef.current){
          audioRef.current.volume = (event.target.value / 100 );
      }
  }

  const handlePauseChange = () => {
      if (playerRef.current){
           playerRef.current.pauseVideo()
      }
  }

  

  const handlePlayChange = () => {
    if(playerRef.current){
        playerRef.current.playVideo();
    }
  }
  const playMusic = (id) => {

    return (
      <div>
          <Youtu ref={playerRef} id={id} />
      </div>
  );
}



useEffect(() => {
  // Verifica si el objeto socket existe y si la instancia interna _socket no ha sido creada aún
  // Usamos socket?._socket para seguir la estructura de tu código original
  if (socket && !socket._socket) {
      console.log('Attempting to connect socket...');
      // Conecta el socket a la URL del servidor
      socket.connect('https://tiktokbot-server.onrender.com');

      // Una vez que socket.connect() es llamado, la instancia real del socket
      // debería estar disponible en socket._socket.
      // Añadimos los listeners a esta instancia.
      // Nota: Acceder a _socket es una implementación interna y podría cambiar.
      // Una forma más estándar sería usar socket.on(...) directamente si el objeto
      // 'socket' que pasas es la instancia del cliente de Socket.IO.
      // Asumiendo tu estructura actual:
      const currentSocket = socket._socket;

      if (currentSocket) {
          console.log('Socket instance found, adding listeners...');

          // Listeners existentes
          currentSocket.on('newComment', (audio) => {
              console.log('Received newComment');
              playAudio(audio.source);
              setlistAudio((list) => [...list, audio.source]);
          });

          currentSocket.on('tiktokConected', () => {
              console.log('Received tiktokConected');
              setIsConnected(true);
          });

          currentSocket.on('tiktokDisconnect', () => {
              console.log('Received tiktokDisconnect');
              // setIsConnected(false);
          });

          currentSocket.on('newMusic', (url) => {
              console.log('Received newMusic');
              setUrlMusic(url);
          });

          currentSocket.on("disconnect", () => {
              console.log('Received disconnect');
              // handleDisconnect();
              handleConnect(); 
          });

          currentSocket.on('PONG', () => console.log('Recibio un PONG'));

          // *** Lógica para la reconexión ***
          currentSocket.on('reconnect', () => {
              console.log('Socket reconnected!');
              // Verifica si existe un username en el estado local del componente
              // Asumimos que 'username' es una variable de estado accesible aquí (ej. de useState)
              if (username) {
                  console.log(`Setting username on reconnect: ${username}`);
                  // Llama al método setUserName en tu objeto socket
                  socket.setUserName(username);
              }
          });
          // *** Fin de la lógica de reconexión ***


          // Intervalo PING
          const pingInterval = setInterval(() => {
               // Solo emite PING si la instancia interna del socket existe y está conectada
               if (socket._socket && socket._socket.connected) {
                   socket._socket.emit('PING');
               }
          }, 5000);

          // Función de limpieza para remover listeners e intervalo
          return () => {
              console.log('Cleaning up socket listeners and interval...');
              // Verifica si la instancia interna del socket existe antes de remover listeners
              if (socket && socket._socket) {
                  const socketToClean = socket._socket;
                  socketToClean.off('newComment');
                  socketToClean.off('tiktokConected');
                  socketToClean.off('tiktokDisconnect');
                  socketToClean.off('newMusic');
                  socketToClean.off('disconnect');
                  socketToClean.off('PONG');
                  socketToClean.off('reconnect'); // Limpia el nuevo listener
              }
              clearInterval(pingInterval);
              // Opcional: Desconectar el socket al desmontar el componente.
              // Esto depende de si la conexión debe persistir o no.
              // Si el socket se gestiona globalmente (ej. en un Context), no desconectes aquí.
              // Si este componente es responsable de su ciclo de vida, desconecta.
              // socket?.disconnect(); // Usar con precaución
          };
      } else {
           console.error('Socket instance (_socket) not available immediately after connect call.');
           // Considera cómo manejar este caso si socket._socket no se popula de inmediato.
           // Podría requerir un enfoque diferente para añadir listeners.
      }
  } else if (socket && socket._socket) {
      console.log('Socket object exists and internal _socket instance is already present.');
      // Si el socket ya está conectado cuando el efecto se ejecuta,
      // asegúrate de que los listeners (incluido 'reconnect') se añadan
      // en la lógica que maneja la conexión inicial fuera de este efecto,
      // o añádelos aquí también si es necesario.
  } else {
       console.log('Socket object is null or undefined.');
  }

  // Dependencias del efecto:
  // Incluye 'socket', 'username' y todas las funciones/setters de estado usados dentro.
  // Asegúrate de que 'username' esté en las dependencias para que el efecto
  // se re-ejecute si 'username' cambia (aunque el listener 'reconnect' usará
  // el valor de 'username' del momento en que se añadió el listener, a menos que
  // uses una referencia o useCallback/useMemo para las funciones del listener).
  // Para este caso simple, incluir 'username' como dependencia es suficiente.
}, [socket, username, playAudio, setlistAudio, setIsConnected, handleConnect, handleDisconnect, setUrlMusic]); // Asegúrate de incluir todas las dependencias relevantes


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 flex gap-10 items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            TikTok Bot
          </CardTitle>
          <CardDescription>Conecta tu bot con un usuario de TikTok</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estado de conexión */}
          <div className="flex items-center justify-center">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={`flex items-center gap-2 px-3 py-1 ${
                isConnected
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  Conectado
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  Desconectado
                </>
              )}
            </Badge>
          </div>

          {/* Input para usuario de TikTok */}
          <div className="space-y-2">
            <Label htmlFor="tiktok-user" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Usuario de TikTok
            </Label>
            <div className="relative">
              <Input
                id="tiktok-user"
                type="text"
                placeholder="@usuario_tiktok"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isConnected}
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
            </div>
          </div>

          {/* Botón de conexión */}
          <div className="space-y-3">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Conectar Bot
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">¡Bot conectado exitosamente!</p>
                  <p className="text-green-600 text-sm mt-1">Usuario: @{username}</p>
                </div>

                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                >
                  Desconectar
                </Button>

                <Dialog 
                  
                >
                    <DialogTrigger
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Settings
                    </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Settings</DialogTitle>
                      <DialogDescription>Edit Settings</DialogDescription>
                    </DialogHeader>
                    <form className='grid gap-y-3' onSubmit={handleSubmit}>
                        <Label>
                          {
                            Checkbox(preferents.follow,onChangePreferents,"follow")
                          }
                           Agradecer cuando te siguen.</Label>
                        <Label>
                          
                          {
                            Checkbox(preferents.like,onChangePreferents,"like")
                          }
                           Agradecer cuando te dan me gusta.</Label>
                        <Label>
                          {
                            Checkbox(preferents.shared,onChangePreferents,"shared")
                          }
                           Agradecer cuando comparten la transmisión en vivo.
                        </Label>

                        
                        <Button type="submit" onClick={()=> alert('Cambios Guardados.')}>
                          Guardar Cambios
                        </Button>
                        <DialogClose>
                          Cerrar ventana
                        </DialogClose>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* Controles de audio (visibles para demostración) */}
          {isConnected && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2 text-sm">
                <Music className="w-4 h-4" />
                Controles de Audio
              </Label>
              <div className="flex gap-1.5 justify-center content-center">
                <div className="grid gap-2">
                <Label>
                  Volumen de voz
                </Label>
                <input type="range" min="0" max="100" step="1" onChange={handleVolumeChangeBot} /> 
                </div>
                <div className="grid gap-2">
                <Label>
                  Volumen de Música
                </Label>
                <div className="flex gap-1.5">
                <input type="range" min="0" max="100" step="1" onChange={handleVolumeChange} />
                <Pause onClick={handlePauseChange} />
                <Play onClick={handlePlayChange} />
                </div>
                </div>
              </div>
              {
                Array.isArray(listAudio) && listAudio.length && (
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => playAudio(listAudio[listAudio.length-1])} className="text-xs">
                   Último mensaje de chat.
                  </Button>
                {
                 listAudio.length > 1 ?  
                <Button size="sm" variant="outline" onClick={() => playAudio(listAudio[listAudio.length-2])} className="text-xs">
                  Ante último mensaje de chat.
                </Button> : 
                <></>
                }
                </div>
              ) || <p>No hay Mensajes</p>
             }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reproductor de audio invisible */}
      <audio ref={audioRef} style={{ display: "none" }} preload="none" />
      {
        urlMusic && playMusic(urlMusic)
      }
    </div>
  )
}
