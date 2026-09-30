import { Phone, PhoneOff, Video } from "lucide-react";
import { useCallStore } from "../store/useCallStore";

export const IncomingCallModal = ({ onAccept, onReject }) => {
  const { callStatus, callPartner, callType } = useCallStore();

  if (callStatus !== "incoming" || !callPartner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-base-100 border border-base-300 rounded-2xl p-6 shadow-2xl w-full max-w-sm flex flex-col items-center gap-4 text-center">
        {/* Caller Avatar with pulsing ring */}
        <div className="relative">
          <div className="size-24 rounded-full overflow-hidden border-4 border-primary shadow-lg">
            <img
              src={callPartner.profilePic || "/avatar.png"}
              alt={callPartner.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-content p-2 rounded-full shadow">
            {callType === "video" ? (
              <Video className="w-5 h-5" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-base-content">
            {callPartner.fullName}
          </h3>
          <p className="text-sm text-base-content/70 mt-1 flex items-center justify-center gap-1">
            Incoming {callType === "video" ? "Video" : "Audio"} Call...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={onReject}
            className="flex flex-col items-center gap-1 group"
            title="Decline"
          >
            <div className="size-14 rounded-full bg-error text-error-content flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <PhoneOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-base-content/70">Decline</span>
          </button>

          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-1 group"
            title="Accept"
          >
            <div className="size-14 rounded-full bg-success text-success-content flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform animate-bounce">
              <Phone className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-base-content/70">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
