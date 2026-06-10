export interface MessageLog {
    id: string;
    sender: "user1" | "user2";
    text: string;
    timestamp: number;
    isVoice: boolean;
}

export type Turn = 'user1' | 'user2';
export type DialogPhase = 'history' | 'user2-reply' | 'user1-reply';