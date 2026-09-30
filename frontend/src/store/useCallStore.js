import { create } from "zustand";

export const useCallStore = create((set, get) => ({
  callStatus: "idle", // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
  callType: "video", // 'video' | 'audio'
  callPartner: null, // { _id, fullName, profilePic }
  incomingSignal: null,
  callerSocketId: null,
  isMuted: false,
  isCameraOff: false,

  initiateCall: (user, type = "video") => {
    set({
      callStatus: "calling",
      callType: type,
      callPartner: user,
      incomingSignal: null,
      callerSocketId: null,
      isMuted: false,
      isCameraOff: type === "audio", // turn off camera by default if audio call
    });
  },

  receiveCall: ({ from, signalData, callType, callerSocketId }) => {
    // Only accept incoming call if currently idle
    if (get().callStatus !== "idle") return;

    set({
      callStatus: "incoming",
      callPartner: from,
      incomingSignal: signalData,
      callType: callType || "video",
      callerSocketId,
      isMuted: false,
      isCameraOff: callType === "audio",
    });
  },

  setCallConnected: () => {
    set({ callStatus: "connected" });
  },

  setCallEnded: (reason) => {
    set({ callStatus: "ended" });
    setTimeout(() => {
      get().resetCall();
    }, 2000);
  },

  resetCall: () => {
    set({
      callStatus: "idle",
      callType: "video",
      callPartner: null,
      incomingSignal: null,
      callerSocketId: null,
      isMuted: false,
      isCameraOff: false,
    });
  },

  toggleMute: () => {
    set((state) => ({ isMuted: !state.isMuted }));
  },

  toggleCamera: () => {
    set((state) => ({ isCameraOff: !state.isCameraOff }));
  },
}));
