"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Bot, Music, User, Wifi, WifiOff, Play, Pause } from "lucide-react"
import socket from '@/lib/socketio' // Asegúrate de que esta ruta sea correcta para tu singleton Socket
import Youtu from "./youtube"
import Checkbox from "./checkbox"

export default function Component({user}) {
    const [username, setUsername] = useState(user || "")
    const [listAudio, setlistAudio] = useState([]);
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [preferents, setPreferents] = useState({
        follow: true,
        shared: true,
        like: true
      })
      const [urlMusic, setUrlMusic] = useState([]);
      const [currentVideoId, setCurrentVideoId] = useState(null); // Estado para manejar el ID del video actual
      const audioRef = useRef(null)
      const playerRef = useRef(null);
  
const onChangePreferents = ({ prop, value }) => {
        setPreferents((prev) => {
            return {
                ...prev,
                [prop]: value
            }
        });
      }
  
      const handleConnect = useCallback(async () => {
          if (!username.trim()) {
              console.warn("Username is empty, cannot connect.");
return;
        }
          console.log("Componente: handleConnect llamado, intentando setUserName...");
          setIsConnecting(true);
          socket.setUserName(username);
      }, [username]); 
  
      const handleDisconnect = useCallback(() => {
          console.log("Componente: handleDisconnect llamado.");
          setIsConnected(false);
          setIsConnecting(false);
      }, []); 
  
      const playAudio = useCallback(async (audioUrl) => {
          try {
const ref = audioRef.current;
            if (ref) {
                ref.src = audioUrl;
                ref.volume = (60 / 100)
                await ref.play();
            }
        } catch (error) {
              console.error("Error al cargar el audio:", error);
          }
      }, []); 
  
      const preferentsVolume = () => {
          const ref  =  audioRef.current
if(ref) {
            ref.setVolume = 20;
        }
    }
      const handleSubmit = (event) => {
          event.preventDefault();
          if (preferents && socket.isConnected()) { 
              console.log("Componente: Emitiendo setPreferents...");
              socket.emit('setPreferents', { ...preferents, username });
          } else {
              console.warn("Socket no conectado, no se pudo emitir setPreferents.");
          }
}

    const handleVolumeChange = (event) => {
        if (playerRef.current) {
            playerRef.current.setVolume(event.target.value);
        }
    };

    const handleVolumeChangeBot = (event) => {
        if (audioRef.current) {
            audioRef.current.volume = (event.target.value / 100);
        }
    }

    const handlePauseChange = () => {
        if (playerRef.current) {
            playerRef.current.pauseVideo()
        }
    }

    const handlePlayChange = () => {
        if (playerRef.current) {
            playerRef.current.playVideo();
        }
    }

    const onChangeStateMusic = (state) => {
        switch(state){

            case -1:
              case 0:
                  if (urlMusic.length > 0) {
                      const nextVideoId = urlMusic.shift(); 
                      setCurrentVideoId(nextVideoId); 
                  }
                  break;
          }
      }
  
const playMusic = () => {
          return (
              <div>
                  <Youtu ref={playerRef} id={currentVideoId || urlMusic.shift()} cb={onChangeStateMusic} />
              </div>
          );
      }
  
      useEffect(() => {
          console.log('Componente: useEffect ejecutándose...');
          socket.initialize('https://tiktokbot-server.onrender.com');
          const ioClient = socket.getSocketInstance();
  
          if (ioClient) {
              console.log('Componente: Añadiendo listeners específicos...');
              const handleNewComment = (audio) => {
                  console.log('Componente: Recibido newComment');
                  playAudio(audio.source); 
                  setlistAudio((list) => [...list, audio.source]); 
              };
  
              const handleTiktokConnected = () => {
                  console.log('Componente: Recibido tiktokConected');
                  setIsConnected(true); 
                  setIsConnecting(false); 
              };
  
              const handleTiktokDisconnect = () => {
                  console.log('Componente: Recibido tiktokDisconnect');
              };
  
              const handleNewMusic = (url) => {
                  console.log('Componente: Recibido newMusic');
                  setUrlMusic((prev) => [...prev,url]); 
              };
  
              const handleComponentDisconnect = (reason) => {
                  console.log(`Componente: Recibido disconnect. Razón: ${reason}`);
                  setIsConnected(false); 
                  setIsConnecting(false); 
              };
  
              const handleComponentReconnect = (attemptNumber) => {
                  console.log(`Componente: Recibido reconnect! Intento #${attemptNumber}`);
                  setIsConnected(true); 
                  setIsConnecting(false); 
              };
  
              socket.on('newComment', handleNewComment);
              socket.on('tiktokConected', handleTiktokConnected);
              socket.on('tiktokDisconnect', handleTiktokDisconnect); 
              socket.on('newMusic', handleNewMusic);
              socket.on('disconnect', handleComponentDisconnect); 
              socket.on('reconnect', handleComponentReconnect); 
  
              return () => {
                  console.log('Componente: Limpiando listeners específicos...');
                  socket.off('newComment', handleNewComment);
                  socket.off('tiktokConected', handleTiktokConnected);
                  socket.off('tiktokDisconnect', handleTiktokDisconnect);
socket.off('newMusic', handleNewMusic);
                socket.off('disconnect', handleComponentDisconnect);
                socket.off('reconnect', handleComponentReconnect);
            };
          } else {
              console.warn('Componente: Instancia de socket.io-client no disponible para añadir listeners.');
          }
      }, [playAudio, setlistAudio, setIsConnected, setUrlMusic, handleDisconnect]); 
  
      useEffect(() => {
          if (user) { 
               console.log('Componente: Socket conectado y username disponible, emitiendo setUsername...');
               setUsername(user)
               socket.setUserName(user); 
               setIsConnecting(true); 
          }
      }, [user, setIsConnecting]); 
  
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
                                  disabled={isConnected || isConnecting} 
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
                                  disabled={isConnecting || !username.trim()} 
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

                                <Dialog>
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
                                                    Checkbox(preferents.follow, onChangePreferents, "follow")
                                                }
                                                Agradecer cuando te siguen.</Label>
                                            <Label>
                                                {
                                                    Checkbox(preferents.like, onChangePreferents, "like")
                                                }
                                                Agradecer cuando te dan me gusta.</Label>
                                            <Label>
                                                {
                                                    Checkbox(preferents.shared, onChangePreferents, "shared")
                                                }
                                                  Agradecer cuando comparten la transmisión en vivo.
                                              </Label>
                                              <Button type="submit" onClick={() => console.log('Cambios Guardados.')}> 
                                                  Guardar Cambios
                                              </Button>
                                              <DialogClose asChild> 
                                                  <Button type="button" variant="outline">Cerrar ventana</Button>
                                              </DialogClose>
                                          </form>
</DialogContent>
                                </Dialog>
          </div>
      )
  }</div>

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
                                  Array.isArray(listAudio) && listAudio.length > 0 ? (
                                      <div className="grid grid-cols-2 gap-2">
                                          <Button size="sm" variant="outline" onClick={() => playAudio(listAudio[listAudio.length - 1])} className="text-xs">
                                              Último mensaje de chat.
</Button>
                                        {
                                            listAudio.length > 1 &&
                                            <Button size="sm" variant="outline" onClick={() => playAudio(listAudio[listAudio.length - 2])} className="text-xs">
                                                Ante último mensaje de chat.
                                            </Button>
                                        }
                                    </div>
                                ) : <p className="text-center text-gray-500 text-sm">No hay Mensajes</p>
                            }
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reproductor de audio invisible */}
            <audio ref={audioRef} style={{ display: "none" }} preload="none" />
            { playMusic() }
            { preferentsVolume() }
            
        </div>
    )
}
