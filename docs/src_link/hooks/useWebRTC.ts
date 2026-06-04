import { useState, useRef, useCallback } from 'react';

type P2PStatus = 'idle' | 'signaling' | 'connecting' | 'connected' | 'disconnected' | 'failed';

interface UseWebRTCOptions {
  roomId: string;
  participantId: string;
  isRider: boolean;
  onMessage: (data: any) => void;
  sendSignal: (targetId: string, signalType: string, signal: any) => void;
}

export const useWebRTC = ({ roomId, participantId, isRider, onMessage, sendSignal }: UseWebRTCOptions) => {
  const [status, setStatus] = useState<P2PStatus>('idle');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const offerRef = useRef<RTCSessionDescriptionInit | null>(null);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const initPC = useCallback((targetId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]
    });

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setStatus('connected');
      } else if (pc.connectionState === 'disconnected') {
        setStatus('disconnected');
      } else if (pc.connectionState === 'failed') {
        setStatus('failed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        setStatus('failed');
      }
    };

    // Create data channel only for the Rider
    if (isRider) {
      const dataChannel = pc.createDataChannel('p2p');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log('Data channel opened');
      };

      dataChannel.onclose = () => {
        console.log('Data channel closed');
      };

      dataChannel.onmessage = (event) => {
        onMessage(event.data);
      };
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(targetId, 'ice-candidate', event.candidate);
      }
    };

    pcRef.current = pc;
    setStatus('connecting');
    return pc;
  }, [isRider, onMessage, sendSignal]);

  const createOffer = useCallback(async (targetId: string) => {
    if (!pcRef.current) {
      pcRef.current = initPC(targetId);
    }
    const pc = pcRef.current;
    const offer = await pc.createOffer();
    offerRef.current = offer;
    await pc.setLocalDescription(offer);
    sendSignal(targetId, 'offer', offer);
    return offer;
  }, [initPC, sendSignal]);

  const handleSignal = useCallback((targetId: string, signalType: string, signal: any) => {
    if (!pcRef.current) {
      pcRef.current = initPC(targetId);
    }
    const pc = pcRef.current;

    switch (signalType) {
      case 'offer':
        pc.setRemoteDescription(signal);
        pc.createAnswer()
          .then((answer) => pc.setLocalDescription(answer))
          .then(() => sendSignal(targetId, 'answer', pc.localDescription));
        break;
      case 'answer':
        pc.setRemoteDescription(signal);
        break;
      case 'ice-candidate':
        pc.addIceCandidate(signal);
        break;
      default:
        console.warn('Unknown signal type: ' + signalType);
    }
  }, [initPC, sendSignal]);

  // Send P2P message through data channel
  const sendP2P = useCallback((data: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(JSON.stringify(data));
      return true;
    } else {
      console.warn('Data channel not ready for sending');
      return false;
    }
  }, []);

  return {
    status,
    pcRef,
    dataChannelRef,
    cleanup,
    initPC,
    createOffer,
    handleSignal,
    sendP2P
  };
};
