import { useCallback } from 'react';
import { speak } from '@/core/output';
import { MessageLog, Turn, DialogPhase } from '@/chat/types';


export function useMessageHandling({ messagesRef, setCurrentTurn, setPhase }: {
    messagesRef: React.RefObject<MessageLog[]>;
    setCurrentTurn: React.Dispatch<React.SetStateAction<Turn>>;
    setPhase: React.Dispatch<React.SetStateAction<DialogPhase>>;
}) {
    // ==========================================
    // COMMIT MESSAGE HELPER
    // Writes synchronously to the ref, then switches phase.
    // The history screen reads messagesRef.current directly so it always has the
    // complete list, regardless of React's batching order.
    // ==========================================
    const commitMessage = useCallback(
    (sender: Turn, text: string, isVoice: boolean) => {
        const newMessage: MessageLog = {
            id: Math.random().toString(36).substring(7),
            sender,
            text,
            timestamp: Date.now(),
            isVoice,
        };
        messagesRef.current = [...messagesRef.current, newMessage];
        setCurrentTurn(sender === "user1" ? "user2" : "user1");
        speak("Съобщението е запазено.");
        setPhase("history");
    },
    [],
);

    //   ==========================================
    //   TEXT MESSAGE HANDLER
    //   ==========================================
    const handleConfirmMessage = (sender: Turn, content: string) => {
        if (!content.trim()) return;
        commitMessage(sender, content, false);
    };

    return { commitMessage, handleConfirmMessage };
    
}