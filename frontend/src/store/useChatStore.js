import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore} from "./useAuthStore.js"



export const useChatStore = create((set, get) => ({
    message: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessageLoading: false,


getUsers: async () => {
    set({isUserLoading :true});
    try{
        const res = await axiosInstance.get("/messages/user");
        set({users:res.data});
    } catch(error){
        toast.error(error.response?.data?.message || "Something went wrong");
    }finally{
        set({isUserLoading:false});
    }
},

getMessage: async (userId) => {
    set({isMessageLoading:true})
    try{
        const res = await axiosInstance.get(`/messages/${userId}`)
        set({message:res.data});
    } catch (error){
        toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
        set({isMessageLoading:false})
    }
},

sendMessage: async (messageData) => {
    const { selectedUser, message } = get();
    if (!selectedUser?._id) return;
    try{
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        set({ message: [...message, res.data] });

    }catch(error){
        toast.error(error.response?.data?.message || "Failed to send message");
        throw error;
    }
},

subscribeToMessages:()=>{
    const { selectedUser } = get();
    if (!selectedUser?._id) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage",(newMessage)=>{
        if (newMessage.senderId !== selectedUser._id) return;
        set({
            message:[...get().message,newMessage],
        });
    }); 
},

unsubscribeFromMessages:()=>{
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
},

setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
