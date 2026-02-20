export function formatMessageTime(date){
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleTimeString('en-US',{
        hour :"2-digit",
        minute:"2-digit",
        hour12 :false,
    });
}
