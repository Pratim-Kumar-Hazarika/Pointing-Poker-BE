export enum MESSAGE_TYPES {
    SEND_MESSAGE= "SENDMESSAGE",
    SUBSCRIBE ="SUBSCRIBE",
    UNSUBSCRIBE= "UNSUBSCRIBE"
}
export type OutgoingMessage = {
    method:MESSAGE_TYPES.SEND_MESSAGE,
    data:{
        roomId:string;
        content:string;
        userId:string;
    }
}

export type SubscribeMessage = {
    method: MESSAGE_TYPES.SUBSCRIBE,
    params: string[] /// roomId
}

export type UnsubscribeMessage = {
    method: MESSAGE_TYPES.UNSUBSCRIBE,
    params: string[]/// roomId
}

export type IncomingMessage = SubscribeMessage | UnsubscribeMessage | OutgoingMessage;