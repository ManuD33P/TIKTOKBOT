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
    const [urlMusic, setUrlMusic] = useState('');
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

    // Envuelve las funciones de manejo de conexión/desconexión en useCallback
    // si se usan como dependencias o dentro de efectos/otros callbacks.
    const handleConnect = useCallback(async () => {
        if (!username.trim()) {
            console.warn("Username is empty, cannot connect.");
            return;
        }
        console.log("Componente: handleConnect llamado, intentando setUserName...");
        setIsConnecting(true);
        // Llama a setUserName en el singleton. La lógica de emisión está dentro de la clase.
        socket.setUserName(username);
        // La actualización de isConnected a true ocurrirá en el listener 'tiktokConected'
        // o 'connect' manejado por el singleton y propagado a este componente.
    }, [username]); // Depende de username

    const handleDisconnect = useCallback(() => {
        console.log("Componente: handleDisconnect llamado.");
        // Llama al método disconnect del singleton si quieres desconectar manualmente
        // socket.disconnect(); // Descomentar si el botón "Desconectar" debe cerrar la conexión
        setIsConnected(false);
        setIsConnecting(false);
    }, []); // No depende de nada local

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
    }, []); // No depende de nada local

    const preferentsVolume = () => {
        const ref  =  audioRef.current
        if(ref) {
            ref.setVolume = 20;
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        if (preferents && socket.isConnected()) { // Verifica si el socket está conectado antes de emitir
            console.log("Componente: Emitiendo setPreferents...");
            socket.emit('setPreferents', { ...preferents, username });
            // alert('Cambios Guardados.'); // Considera usar un feedback menos intrusivo
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

    const playMusic = (id) => {
        return (
            <div>
                <Youtu ref={playerRef} id={id} />
            
            </div>
        );
    }

    // useEffect para gestionar listeners específicos del componente
    useEffect(() => {
        console.log('Componente: useEffect ejecutándose...');

        // 1. Inicializa el singleton Socket si no se ha hecho ya.
        //    La lógica interna de la clase Socket asegura que la instancia
        //    se cree y conecte solo una vez, y maneja la reconexión automática.
        //    Llamar a initialize() aquí es seguro en cada render, pero solo
        //    tendrá efecto la primera vez o si la instancia fue destruida.
        //    Idealmente, initialize() se llama una vez en el nivel más alto (ej. layout o context).
        //    Pero para que funcione dentro de este componente si es el punto de entrada, lo mantenemos aquí.
        socket.initialize('https://tiktokbot-server.onrender.com');

        // 2. Obtén la instancia real de socket.io-client del singleton.
        const ioClient = socket.getSocketInstance();

        // 3. Añadir listeners específicos de este componente usando los métodos del singleton.
        if (ioClient) {
            console.log('Componente: Añadiendo listeners específicos...');

            // Define los manejadores de eventos.
            // No necesitan useCallback si solo se usan dentro de este efecto
            // y sus dependencias son correctas.
            const handleNewComment = (audio) => {
                console.log('Componente: Recibido newComment');
                playAudio(audio.source); // playAudio es una dependencia
                setlistAudio((list) => [...list, audio.source]); // setlistAudio es una dependencia
            };

            const handleTiktokConnected = () => {
                console.log('Componente: Recibido tiktokConected');
                setIsConnected(true); // setIsConnected es una dependencia
                setIsConnecting(false); // También actualiza isConnecting aquí
            };

            const handleTiktokDisconnect = () => {
                console.log('Componente: Recibido tiktokDisconnect');
                // setIsConnected(false); // Esto lo maneja el listener 'disconnect' global en el singleton
                // handleConnect(); // Esta llamada aquí puede ser problemática.
                // Si el socket se desconecta, el singleton intentará reconectar.
                // El listener 'reconnect' en el singleton emitirá setUsername.
                // Si necesitas hacer algo en la UI al desconectar, hazlo aquí.
                // Si necesitas reconectar manualmente bajo ciertas condiciones,
                // esa lógica debería ser más explícita.
                // Por ahora, confiemos en la reconexión automática y el listener 'reconnect' del singleton.
                // Si necesitas actualizar la UI a "Desconectado" inmediatamente, usa setIsConnected(false);
            };

            const handleNewMusic = (url) => {
                console.log('Componente: Recibido newMusic');
                setUrlMusic(url); // setUrlMusic es una dependencia
            };

            // Listener para el evento 'disconnect' específico de este componente (para UI)
            const handleComponentDisconnect = (reason) => {
                console.log(`Componente: Recibido disconnect. Razón: ${reason}`);
                setIsConnected(false); // Actualiza el estado de UI
                setIsConnecting(false); // Asegura que el estado de conexión se resetee
                // handleDisconnect(); // Llama a tu función de UI si es necesario
            };

             // Listener para el evento 'reconnect' específico de este componente (para UI)
             // La emisión de setUsername ya la maneja el singleton en su listener 'reconnect'.
             const handleComponentReconnect = (attemptNumber) => {
                 console.log(`Componente: Recibido reconnect! Intento #${attemptNumber}`);
                 setIsConnected(true); // Actualiza el estado de UI
                 setIsConnecting(false); // Asegura que el estado de conexión se resetee
                 // Si necesitas hacer algo más en la UI al reconectar, hazlo aquí.
             };


            // Añadir listeners usando el método 'on' del singleton
            socket.on('newComment', handleNewComment);
            socket.on('tiktokConected', handleTiktokConnected);
            socket.on('tiktokDisconnect', handleTiktokDisconnect); // Listener para cuando TikTok se desconecta (no el socket)
            socket.on('newMusic', handleNewMusic);
            socket.on('disconnect', handleComponentDisconnect); // Listener para la desconexión del socket
            socket.on('reconnect', handleComponentReconnect); // Listener para la reconexión del socket

            // 4. Función de limpieza: Eliminar SÓLO los listeners que se añadieron en ESTA ejecución del efecto.
            return () => {
                console.log('Componente: Limpiando listeners específicos...');
                // Usar el método 'off' del singleton
                socket.off('newComment', handleNewComment);
                socket.off('tiktokConected', handleTiktokConnected);
                socket.off('tiktokDisconnect', handleTiktokDisconnect);
                socket.off('newMusic', handleNewMusic);
                socket.off('disconnect', handleComponentDisconnect);
                socket.off('reconnect', handleComponentReconnect);
            };
        } else {
            console.warn('Componente: Instancia de socket.io-client no disponible para añadir listeners.');
            // Esto podría ocurrir si initialize() falla o si hay un problema con el singleton.
        }

        // Dependencias del efecto:
        // Incluye todas las funciones y setters de estado usados dentro del efecto
        // que no provienen del singleton 'socket'.
    }, [playAudio, setlistAudio, setIsConnected, setUrlMusic, handleDisconnect]); // Asegúrate de incluir todas las dependencias relevantes

    // useEffect adicional para manejar la emisión inicial de setUsername
    // Esto es si quieres que el username se envíe tan pronto como esté disponible
    // y el socket esté conectado, no solo en la reconexión.
    // Sin embargo, la lógica en el singleton 'connect' y 'reconnect' ya cubre esto
    // si el username se establece en la instancia del singleton antes de la conexión/reconexión.
    // Si setUsername se llama *después* de la conexión inicial, la lógica en setUserName
    // de la clase Socket ya lo emite si está conectado.
    // Este efecto adicional podría ser redundante si la lógica del singleton es correcta.
    
    useEffect(() => {
        if (user) { // Verifica si hay username local, socket conectado, y singleton no tiene username
             console.log('Componente: Socket conectado y username disponible, emitiendo setUsername...');
             setUsername(user)
             socket.setUserName(user); // Esto también actualiza socket.username en el singleton
             setIsConnecting(true); // Asumiendo que setUsername inicia el proceso de conexión a TikTok
        }
    }, [user, setIsConnecting]); // Depende de username y setIsConnecting
    


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
                                disabled={isConnected || isConnecting} // Deshabilitar mientras está conectado o conectando
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
                                disabled={isConnecting || !username.trim()} // Deshabilitar si ya está conectando o username está vacío
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
                                            <Button type="submit" onClick={() => console.log('Cambios Guardados.')}> {/* Usar console.log en lugar de alert */}
                                                Guardar Cambios
                                            </Button>
                                            <DialogClose asChild> {/* Usar asChild para que el botón sea el trigger de cierre */}
                                                <Button type="button" variant="outline">Cerrar ventana</Button>
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
                                Array.isArray(listAudio) && listAudio.length > 0 ? ( // Corregir la condición para mostrar "No hay Mensajes"
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
            { playMusic(urlMusic) }
            { preferentsVolume() }
            
        </div>
    )
}
