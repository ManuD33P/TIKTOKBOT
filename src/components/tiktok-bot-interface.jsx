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
    console.log('dentro de la funcion esto es key', prop)
    console.log('esto es value dentro de la funcion', value)
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
    setUsername("")
  }

  const playAudio = async (audioUrl) => {
    try {
      const ref = audioRef.current;
      console.log('este es el urlAudio: ', audioUrl)
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
          <div className="flex gap-3">
          <Pause onClick={handlePauseChange} />
          <Play onClick={handlePlayChange} />
          </div>
      </div>
  );
}



 useEffect(()=>{
        if(!socket?._socket){
            socket?.connect('https://tiktokbot-server.onrender.com');

            socket._socket.on('newComment',(audio) =>{
               
                 playAudio(audio.source);
                 setlistAudio((list) => [...list, audio.source]);
               
            })

            socket._socket.on('tiktokConected',()=>{
                setIsConnected(true);
            })

            socket._socket.on('tiktokDisconnect', ()=>{
                setIsConnected(false);
            })

            socket._socket.on('newMusic', (url) => {
                setUrlMusic(url);
            })
            socket._socket.on("disconnect", () => {
                handleDisconnect()
            });

            socket._socket.on('PONG', ()=> console.log('Recibio un PONG'));
            setInterval(()=> socket._socket.emit('PING'),5000)


        }

      


 },[])
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
                <input type="range" min="0" max="100" step="1" onChange={handleVolumeChange} />
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
