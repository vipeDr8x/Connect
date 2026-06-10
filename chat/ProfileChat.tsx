import BlindUserInput from "@/chat/BlindUserInput";
import ChatHistory from "@/chat/ChatHistory";
import DefaultUserInput from "@/chat/DefaultUserInput";
import { speak } from "@/core/output";
import { useFetchUser } from "@/hooks/useFetchUser";
import { useMessageHandling } from "@/hooks/useMessageHandling";
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BTN, styles } from './styles/styles';
import { DialogPhase, MessageLog, Turn } from "./types";


export default function ProfileChat({ onReturn }: {
    onReturn: () => void;
}) {

    // ---- Message storage ----
    // messagesRef is the authoritative list; always mutated synchronously before
    // any setPhase call so the history screen ALWAYS reads the final list.
    // renderTick is a plain counter whose only job is to re-render when the ref changes.
    const messagesRef = useRef<MessageLog[]>([]);
    const [phase, setPhase] = useState<DialogPhase>('user1-reply');
    const [currentTurn, setCurrentTurn] = useState<Turn>("user1");
    const { commitMessage, handleConfirmMessage } = useMessageHandling({ messagesRef, setCurrentTurn, setPhase });

    const { profileReady, isUserBlind, isUserDeaf, isUserMute, isSevereIntersectionWIP } = useFetchUser();
    // future handling for isUserDeaf and isUserMute

    useEffect(() => {
        if (!profileReady) return;

        switch (phase) {
            case 'user1-reply':
                if (isSevereIntersectionWIP) {
                    speak(
                        "Профилен диалог. Функцията се разработва. Натиснете центъра за връщане назад.",
                    );
                } else if (isUserBlind) {
                    speak(
                        "Профилен диалог за незрящи. Горната половина показва състоянието на записа. Долната половина е огромен бутон за гласов запис.",
                    );
                } else {
                    speak(
                        "Профилен диалог. Натиснете центъра на екрана за изпращане на данни.",
                    );
                }
                break;

            case 'user2-reply':
                speak("Екран за отговор на втори потребител. Горната половина е за текст. Долната половина е за глас.");
                break;
            
            case 'history':
                speak("Екран История. Горната половина показва съобщенията. Долната половина съдържа бутон за отговор.");
                break;

        }
    }, [profileReady, isSevereIntersectionWIP, isUserBlind, phase])


    const onReturnFromMessage = () => {
        Speech.stop();
        setPhase('history');
    }


    switch (phase) {
        case 'user1-reply':
            if (isSevereIntersectionWIP) {
                return ( // TODO to make blind users have the option to enter braille
                    <View
                        style={[
                            styles.container,
                            { justifyContent: "center", alignItems: "center", padding: 20 },
                        ]}
                    >
                        <Text style={styles.wipText}>
                            Функцията се разработва за този профил.
                        </Text>
                        <TouchableOpacity
                            style={[styles.halfButton, { backgroundColor: BTN, marginTop: 20 }]}
                            onPress={() => onReturn()}
                        >
                            <Text style={styles.halfButtonText}>Назад</Text>
                        </TouchableOpacity>
                    </View>
                );
            }

            else if (isUserBlind) {
                // View needs to be compatible not only if he is blind (assuming ultimately he isn't non-verbal), but non-verbal, when we introduce braille input
                return <BlindUserInput onCommitMessage={commitMessage}/>
            }

            // lets the user1-reply with the not blind case fall through the same as user2-reply since the code is identical

        case 'user2-reply':
            return <DefaultUserInput
                sender={currentTurn}
                onCommitMessage={commitMessage}
                handleConfirmMessage={handleConfirmMessage}
                onBack={onReturnFromMessage}
            />

        case 'history':
            // ==========================================
            // PHASE 4: HISTORY
            // Reads messagesRef.current directly — always up to date even right after a commit.
            // TOP half — scrollable message log
            // BOTTOM half — "reply" button (goes to whoever's turn it is) + back to menu
            // ==========================================
            return <ChatHistory 
                displayMessages={messagesRef.current} 
                currentTurn={currentTurn} 
                onReply={() => setPhase(currentTurn === 'user1' ? 'user1-reply' : 'user2-reply')}
                onReturn={() => onReturn()}
                />
    }

}