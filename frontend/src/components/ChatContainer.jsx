import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils.js";
import { useEffect ,useRef} from "react";
import ChatHeader  from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeleton/MessageSkeleton.jsx";




export const ChatContainer = () => {
    const { message, getMessage, isMessageLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    useEffect(() => {
        if (!selectedUser?._id) return;
        getMessage(selectedUser._id);
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [selectedUser?._id, getMessage, subscribeToMessages, unsubscribeFromMessages]);

useEffect(()=>{
    if(messageEndRef.current && message){
    messageEndRef.current.scrollIntoView({ behavior : "smooth"});}
},[message])

    if(isMessageLoading) {return(
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader/>
            <MessageSkeleton/>
            <MessageInput/>
        </div>
    )} ;

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader/>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {message.map((message) => (
                    <div 
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        ref={messageEndRef}
                    >
                        <div className="chat-image avatar">
                        <div className="size-10 rounded-full border">
                            <img src= {message.senderId === authUser._id ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"}
                            alt="profilepic"/>
                        </div>
                        
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">{formatMessageTime(message.createdAt)}</time> 
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"/>
                            )}
                            {message.text && <p>{message.text}</p>}

                        </div>

                    </div>
                ))}
            </div>
            <MessageInput/>
        </div>
    )
}
