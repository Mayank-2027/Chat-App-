import {
  Mic,
  MicOff,
  PhoneOff,
  Video as VideoIcon,
  VideoOff,
  User,
} from "lucide-react";
import { useCallStore } from "../store/useCallStore";

export const VideoCallModal = ({
  localVideoRef,
  remoteVideoRef,
  onEndCall,
}) => {
  const {
    callStatus,
    callType,
    callPartner,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
  } = useCallStore();

  if (
    callStatus === "idle" ||
    callStatus === "incoming" ||
    !callPartner
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[85vh] bg-base-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-base-300">
        
        {/* Call Header */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden border border-white/30">
              <img
                src={callPartner.profilePic || "/avatar.png"}
                alt={callPartner.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">
                {callPartner.fullName}
              </h4>
              <p className="text-xs text-white/80 capitalize">
                {callStatus === "calling"
                  ? "Calling..."
                  : callStatus === "connected"
                  ? `${callType === "video" ? "Video" : "Audio"} Call`
                  : "Call Ended"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Video Screen Area */}
        <div className="relative flex-1 bg-neutral flex items-center justify-center overflow-hidden">
          {/* Remote Stream Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${
              callType === "audio" ? "hidden" : "block"
            }`}
          />

          {/* Audio-only or Calling placeholder */}
          {(callType === "audio" || callStatus === "calling") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral/90 gap-4 text-neutral-content">
              <div className="relative">
                <div className="size-28 sm:size-36 rounded-full overflow-hidden border-4 border-primary shadow-xl">
                  <img
                    src={callPartner.profilePic || "/avatar.png"}
                    alt={callPartner.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {callStatus === "calling" && (
                  <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75" />
                )}
              </div>
              <p className="text-lg font-medium text-white/90">
                {callStatus === "calling"
                  ? `Ringing ${callPartner.fullName}...`
                  : callPartner.fullName}
              </p>
            </div>
          )}

          {/* Local Stream Video (Floating PIP Inset) */}
          <div className="absolute bottom-20 right-4 z-20 size-28 sm:size-44 bg-base-300 rounded-2xl overflow-hidden border-2 border-base-100 shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                isCameraOff || callType === "audio" ? "hidden" : "block"
              }`}
            />
            {(isCameraOff || callType === "audio") && (
              <div className="w-full h-full flex items-center justify-center bg-base-200 text-base-content/70">
                <User className="size-8" />
              </div>
            )}
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-base-200 border-t border-base-300 flex items-center justify-center gap-6 z-20">
          {/* Mute Mic Button */}
          <button
            onClick={toggleMute}
            className={`btn btn-circle btn-lg ${
              isMuted ? "btn-error text-error-content" : "btn-neutral"
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Camera Toggle Button (Only for Video Call) */}
          {callType === "video" && (
            <button
              onClick={toggleCamera}
              className={`btn btn-circle btn-lg ${
                isCameraOff ? "btn-error text-error-content" : "btn-neutral"
              }`}
              title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isCameraOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <VideoIcon className="w-6 h-6" />
              )}
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="btn btn-circle btn-lg btn-error text-error-content shadow-lg hover:scale-105 transition-transform"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
