import { useState, useRef } from "react";
import { speak } from '@/core/output';
import { Turn } from "@/chat/types";

export default function useVoiceInput( { onCommitMessage }: {
    onCommitMessage: (sender: Turn, text: string, isVoice: boolean,) => void;
}) {
    
    // ---- Recording state via ref to avoid stale closures ----
    const isRecordingRef = useRef<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);

    // ==========================================
    // VOICE RECORDING CONTROLLER
    // Reads/writes isRecordingRef so there is never a stale closure.
    // ==========================================
    const toggleVoiceRecording = (sender: Turn) => {
        if (!isRecordingRef.current) {
            speak("Записът започна. Говорете сега.");
        }
        else {
            const timestamp = new Date().toLocaleTimeString("bg-BG", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const senderLabel = sender === "user1" ? "Потребител 1" : "Потребител 2";
            const transcribedText = `Гласово съобщение - ${senderLabel}, ${timestamp}`;

            onCommitMessage(sender, transcribedText, true);
        }

        isRecordingRef.current = !isRecordingRef.current;
        setIsRecording(isRecordingRef.current);
    };

    return { isRecording, toggleVoiceRecording };

}