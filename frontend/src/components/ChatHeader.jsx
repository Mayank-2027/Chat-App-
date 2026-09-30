import { Phone, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCallStore } from "../store/useCallStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { startCall } = useCallStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Audio Call Button */}
          <button
            onClick={() => startCall && startCall(selectedUser, "audio")}
            className="btn btn-ghost btn-circle btn-sm"
            title="Start Audio Call"
          >
            <Phone className="w-5 h-5 text-base-content/70 hover:text-primary transition-colors" />
          </button>

          {/* Video Call Button */}
          <button
            onClick={() => startCall && startCall(selectedUser, "video")}
            className="btn btn-ghost btn-circle btn-sm"
            title="Start Video Call"
          >
            <Video className="w-5 h-5 text-base-content/70 hover:text-primary transition-colors" />
          </button>

          {/* Close button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-circle btn-sm"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;