import {useChatStore} from "../store/useChatStore.js";
import Sidebar from "../components/Sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import {ChatContainer} from "../components/ChatContainer.jsx"

const HomePage=()=>{

    const {selectedUser} = useChatStore();
    return(

    <div className="h-[calc(100vh-4rem)] bg-base-200">
        <div className="flex items-center justify-center h-full px-4 py-4">
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-full"> 
                <div className="flex h-full rounded-lg overflow-hidden">
                        <Sidebar/>

                        {!selectedUser ? <NoChatSelected/> : <ChatContainer/>}
                </div>
            </div>
        </div>
    </div>)
}
 
export default HomePage;
