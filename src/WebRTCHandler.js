import io from 'socket.io-client'
import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc'

const configuration = {
    "iceServers": [
        { url: "stun:stun.l.google.com:19302" },
        { url: 'stun:stun1.l.google.com:19302' },
        { url: 'turn:numb.viagenie.ca', username: "nat.chung1@gmail.com", credential: "2roixdui" }
    ]
}

export default class WebRTCHandler {

    constructor(callback) {
        console.log(`WebRTCHandler constructor`)
        this.localStream = null
        this._pcPeers = {}
        this._socket = io.connect('http://192.168.0.114:1280', { transports: ['websocket'] });
        // this._socket.on('exchange', this._socketOnExchange.bind(this))
        // this._socket.on('leave', this._socketOnLeave.bind(this))
        // this._socket.on('connect', this._socketOnConnect.bind(this))
    }


    _setUp_webrtc=()=>{
        
    }
    

   
    connect(id){        
        this._socket.emit('join',id)
        console.log(id)
    }

    disconnect(onDisconnected){
        this._callback.onDisconnected = onDisconnected
        for( socketId in this._pcPeers){
            this._socketOnLeave(socketId)
        }
    }
}