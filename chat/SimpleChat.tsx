import { stopSpeech } from '@/core/output';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import ChatHistory from './ChatHistory';
import DefaultUserInput from './DefaultUserInput';
import { DialogPhase, MessageLog, Turn } from './types';


export default function SimpleChat({ onReturn }: {
    onReturn: () => void;
}) {

    // Only if it goes in production make code go into hook, otherwise just keep it since it will be removed (SimpleChat functionality)
    const messagesRef = useRef<MessageLog[]>([]);
    const [phase, setPhase] = useState<DialogPhase>('user1-reply');
    const [currentTurn, setCurrentTurn] = useState<Turn>("user1");
    const { commitMessage, handleConfirmMessage } = useMessageHandling({ messagesRef, setCurrentTurn, setPhase });

    useEffect(() => {
        stopSpeech();   // kill anything the previous screen left playing
    }, []);

    const onReturnFromMessage = () => {
        Speech.stop();
        setPhase('history');
    }

    switch (phase) {
        case 'user1-reply':
        case 'user2-reply':
            return <DefaultUserInput
                sender={currentTurn}
                onCommitMessage={commitMessage}
                handleConfirmMessage={handleConfirmMessage}
                onBack={onReturnFromMessage}
            />
        
        case 'history':
            return <ChatHistory 
                displayMessages={messagesRef.current} 
                currentTurn={currentTurn} 
                onReply={() => setPhase(currentTurn === 'user1' ? 'user2-reply': 'user1-reply')}
                onReturn={() => onReturn()}
                />

    }
}