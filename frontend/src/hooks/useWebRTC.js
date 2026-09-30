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
  const remoteStreamRef = useRef(null);

  // Plain refs to hold the DOM elements (used inside ontrack/cleanup)
  const localVideoElRef = useRef(null);
  const remoteVideoElRef = useRef(null);

  const pendingCandidatesRef = useRef([]);

  // Callback ref for LOCAL video element.
  // When React mounts/unmounts the <video>, this fires and binds the stream.
  const localVideoRef = useCallback((node) => {
    localVideoElRef.current = node;
    if (node && localStreamRef.current) {
      node.srcObject = localStreamRef.current;
    }
  }, []);

  // Callback ref for REMOTE video element.
  // When React mounts the <video>, this fires and binds any pending remote stream.
  const remoteVideoRef = useCallback((node) => {
    remoteVideoElRef.current = node;
    if (node && remoteStreamRef.current) {
      node.srcObject = remoteStreamRef.current;
    }
  }, []);

  // Cleanup helper to stop local media tracks and close peer connection
  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
    if (localVideoElRef.current) localVideoElRef.current.srcObject = null;
    if (remoteVideoElRef.current) remoteVideoElRef.current.srcObject = null;
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

    // ontrack fires when the remote peer's media track arrives.
    // This can fire BEFORE VideoCallModal has rendered the <video> element
    // (especially on the receiver side), so we store the stream in a ref
    // and also try to attach it to the DOM element if it already exists.
    pc.ontrack = (event) => {
      const stream =
        event.streams && event.streams[0]
          ? event.streams[0]
          : (() => {
              if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
              }
              remoteStreamRef.current.addTrack(event.track);
              return remoteStreamRef.current;
            })();

      remoteStreamRef.current = stream;

      // If the <video> element exists right now, bind immediately
      if (remoteVideoElRef.current) {
        remoteVideoElRef.current.srcObject = stream;
      }
      // If the <video> element doesn't exist yet (VideoCallModal hasn't rendered),
      // the callback ref (remoteVideoRef) will bind it when the element mounts.
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
        video: isVideoCall
          ? { width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoElRef.current) {
        localVideoElRef.current.srcObject = stream;
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

  // Initiate outgoing call (caller side)
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

  // Accept incoming call (receiver side)
  const acceptCall = useCallback(async () => {
    if (!socket || !incomingSignal || !callPartner) return;

    try {
      const isVideoCall = callType === "video";
      const stream = await getMediaStream(isVideoCall);
      const targetId = callPartner._id;
      const pc = createPeerConnection(targetId);

      // Add local tracks to the connection so the caller receives our media
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set the caller's offer as our remote description.
      // This may trigger ontrack asynchronously.
      await pc.setRemoteDescription(new RTCSessionDescription(incomingSignal));
      await processPendingIceCandidates();

      // Create our answer and set it as local description
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send the answer back to the caller via signaling
      socket.emit("accept-call", {
        to: targetId,
        signalData: answer,
      });

      // Mark call as connected — this causes VideoCallModal to render.
      // The callback ref (remoteVideoRef) will bind remoteStreamRef when the
      // <video> element mounts, even if ontrack already fired above.
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

  // Toggle Mute — sync audio track enabled state
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  // Toggle Camera — sync video track enabled state
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
      // Caller receives the answer from the receiver
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
        // Queue candidates that arrive before remote description is set
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

  // Expose call actions on the Zustand store for ChatHeader to use
  useEffect(() => {
    useCallStore.setState({ startCall, acceptCall, rejectCall, endCall });
  }, [startCall, acceptCall, rejectCall, endCall]);

  return {
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    localVideoRef,   // callback ref — use directly as ref={localVideoRef}
    remoteVideoRef,   // callback ref — use directly as ref={remoteVideoRef}
  };
};
