import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";
import toast from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const useWebRTC = () => {
  const { socket, authUser } = useAuthStore();
  const {
    callStatus,
    callType,
    callPartner,
    incomingSignal,
    callerSocketId,
    isMuted,
    isCameraOff,
    initiateCall,
    receiveCall,
    setCallConnected,
    setCallEnded,
    resetCall,
  } = useCallStore();

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // Cleanup helper to stop local media tracks and close peer connection
  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  // Initialize peer connection object
  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          to: targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        setCallEnded("Connection closed");
        cleanupCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, setCallEnded, cleanupCall]);

  // Request user media stream (audio/video)
  const getMediaStream = useCallback(async (isVideoCall) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("Failed to get local media stream:", err);
      toast.error("Could not access camera/microphone");
      throw err;
    }
  }, []);

  // Process queued ICE candidates after remote description is set
  const processPendingIceCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    while (pendingCandidatesRef.current.length > 0) {
      const candidate = pendingCandidatesRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    }
  }, []);

  // Initiate outgoing call
  const startCall = useCallback(
    async (targetUser, type = "video") => {
      if (!socket || !targetUser?._id) return;
      initiateCall(targetUser, type);

      try {
        const stream = await getMediaStream(type === "video");
        const pc = createPeerConnection(targetUser._id);

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call-user", {
          userToCall: targetUser._id,
          signalData: offer,
          callType: type,
          from: {
            _id: authUser._id,
            fullName: authUser.fullName,
            profilePic: authUser.profilePic,
          },
        });
      } catch (err) {
        toast.error("Failed to start call");
        resetCall();
        cleanupCall();
      }
    },
    [socket, authUser, initiateCall, getMediaStream, createPeerConnection, resetCall, cleanupCall]
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    if (!socket || !incomingSignal || !callPartner) return;

    try {
      const stream = await getMediaStream(callType === "video");
      const targetId = callPartner._id;
      const pc = createPeerConnection(targetId);

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));
      await processPendingIceCandidates();

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("accept-call", {
        to: targetId,
        signalData: answer,
      });

      setCallConnected();
    } catch (err) {
      console.error("Error accepting call:", err);
      toast.error("Failed to connect call");
      setCallEnded("Failed to connect");
      cleanupCall();
    }
  }, [
    socket,
    incomingSignal,
    callPartner,
    callType,
    getMediaStream,
    createPeerConnection,
    processPendingIceCandidates,
    setCallConnected,
    setCallEnded,
    cleanupCall,
  ]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (socket && callPartner?._id) {
      socket.emit("reject-call", {
        to: callPartner._id,
        reason: "Call declined",
      });
    }
    resetCall();
    cleanupCall();
  }, [socket, callPartner, resetCall, cleanupCall]);

  // End active or pending call
  const endCall = useCallback(() => {
    if (socket && callPartner?._id) {
      socket.emit("end-call", { to: callPartner._id });
    }
    setCallEnded();
    cleanupCall();
  }, [socket, callPartner, setCallEnded, cleanupCall]);

  // Toggle Mute
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Toggle Camera
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOff;
      });
    }
  }, [isCameraOff]);

  // Register Socket.io listeners for incoming signaling events
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      receiveCall(data);
    };

    const handleCallAccepted = async ({ signalData }) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          await processPendingIceCandidates();
          setCallConnected();
        } catch (err) {
          console.error("Error setting remote answer:", err);
        }
      }
    };

    const handleCallRejected = ({ reason }) => {
      toast.error(reason || "Call rejected");
      setCallEnded(reason);
      cleanupCall();
    };

    const handleIceCandidate = async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding remote ICE candidate:", err);
        }
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const handleCallEnded = () => {
      toast("Call ended", { icon: "📞" });
      setCallEnded();
      cleanupCall();
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [
    socket,
    receiveCall,
    setCallConnected,
    setCallEnded,
    cleanupCall,
    processPendingIceCandidates,
  ]);

  useEffect(() => {
    useCallStore.setState({ startCall, acceptCall, rejectCall, endCall });
  }, [startCall, acceptCall, rejectCall, endCall]);

  return {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    localVideoRef,
    remoteVideoRef,
  };
};
