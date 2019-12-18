// import React, { Component } from 'react';
// import { View, Text } from 'react-native';
// import AppContainer from './src/AppContainer'
// export default class App extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//     };
//   }

//   render() {
//     return (
//       <AppContainer/>
//     );
//   }
// }
import React, { Component, useState} from "react";
import io from "socket.io-client";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from "react-native-webrtc";

export default App = () => {
  const [localStream, setLocalStream] = React.useState();
  const [remoteStream, setRemoteStream] = React.useState();
  _socket=io.connect('http://192.168.0.114:1280', { transports: ['websocket'] });

  onHandleChangeIDStream = text => {
    setInputIDStream(text);
  };
  const _btnStartLocalStream = async () => {
    const isFront = true;
    const devices = await mediaDevices.enumerateDevices();

    const facing = isFront ? "front" : "back";
    const videoSourceId = devices.find(
      device => device.kind === "videoinput" && device.facing === facing
    );
    const facingMode = isFront ? "user" : "environment";
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 500,
          minFrameRate: 20
        },
        facingMode,
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : []
      }
    };
    const newStream = await mediaDevices.getUserMedia(constraints);
    setLocalStream(newStream);
  };
  const _btnStartCall = async () => {
    const configuration = {
      iceServers: [{ url: "stun:stun.l.google.com:19302" }]
    };
    const localPC = new RTCPeerConnection(configuration);
    const remotePC = new RTCPeerConnection(configuration);

    localPC.onicecandidate = e => {
      if (e && e.candidate) {
        remotePC.addIceCandidate(e.candidate);
      }
    };

    remotePC.onaddstream = e => {
      if (e && e.stream && remoteStream !== e.stream) {
        setRemoteStream(e.stream);
      }
    };

    localPC.addStream(localStream);
    
    const offer = await localPC.createOffer();
    _socket.emit('send_ID',offer)
    _socket.on('receive_ID', async data => {
      await localPC.setLocalDescription(data);
      await remotePC.setRemoteDescription(localPC.localDescription);
      const answer = await remotePC.createAnswer();
      await remotePC.setLocalDescription(answer);
      await localPC.setRemoteDescription(remotePC.localDescription);
    })         


  };
  const btnClick = () => {
    if (!localStream) {
      return (
        <TouchableOpacity
          style={styles.buttonCall}
          onPress={() => _btnStartLocalStream()}
        >
          <Text style={{ color: "white" }}>Call</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.buttonCall}
          onPress={() => _btnStartCall()}
        >
          <Text style={{ color: "white" }}>Call to here</Text>
        </TouchableOpacity>
      );
    }
  };
  return (
    <View style={styles.congtainer}>
      {/* <RTCView streamURL={this.state.videoLocalURL} style={styles.congtainer} /> */}
      <RTCView
        streamURL={remoteStream && remoteStream.toURL()}
        style={styles.cameraBig}
      />
      <View style={styles.over}>
        <RTCView
          streamURL={localStream && localStream.toURL()}
          style={styles.cameraSmall}
        />
        {btnClick()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  congtainer: {
    flex: 1
    // borderWidth: 1,
    // borderColor: 'red',
    // backgroundColor:'blue'
  },
  over: {
    position: "absolute"
  },
  cameraBig: {
    flex: 1,
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "blue"
  },
  cameraSmall: {
    width: 80,
    height: 100,
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "blue",
    // marginTop: 50,
    marginLeft: 50,
    padding: 2
  },
  inputStream: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "red",
    color: "white"
  },
  buttonCall: {
    marginTop: 10,
    marginLeft: 10,
    backgroundColor: "red",
    padding: 10
  }
});
