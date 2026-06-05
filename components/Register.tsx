import ConfirmHaptic from '@/components/ConfirmHaptic';
import PromptChannel from '@/components/PromptChannel';
import RegisterForm from '@/components/RegisterForm';
import { CommunicationChannel } from '@/types/output';
import { useRef, useState } from 'react';


type Phase = 'prompting-channels' | 'registering' | 'haptic-handshake';

function useChannelDetection() {
    const [phase, setPhase] = useState<Phase>('prompting-channels');
    const channelRef = useRef<CommunicationChannel|null>(null);


    const onConfirm = (channel: CommunicationChannel) => {
        
        switch (channel) {
            case 'text-speech':
                setPhase('registering');
                break;
            case 'vibration':
                setPhase('haptic-handshake');
                break;
        }
        channelRef.current = channel;
    }


    return { phase, onConfirm, channelRef };
}


export default function Register( { 
    onRegister, 
} : {
    onRegister: () => void;
}
) {
    /*
    PHASE I:
        1. We check for any screen readers or things which might take the voice channels and fight with them
        2. If there is a screen reader we send the voice through announceForAccessibility() functions, otherwise we use expo-speech
    Phase II:
        PromptChannel.tsx
    PHASE III (only if user has at least one fast channel (text or voice, otherwise its auto-configured)):
        1. When the user sees the screen, he is greeted with the message: "За да започнете регистрацията си натиснете два пъти на екрана" (idle phase)
        2. Then when he clicks a total accumulated amount of two times: "Начало на регистрация" (registering phase)
        -----> `Натиснете веднъж на екрана, ако сте ${disability}` and this repeats three times -> "глухи", "неми", "слепи"
        3. Every window waits five seconds for the confirmation with one click, otherwise the answer is that the user doesn't have this disability
        4. In the end the user is prompted whether the picked disabilities are indeed right. If they are -> MainScreen, if they aren't (no action for 10 seconds)-> repeat the flow
    */

    // TODOS:
    // make timer start after full vibration and speak message
    // make vibration messages shorter, with just a few key words, by some sort of a built standard for this goal (not that necessary)


    // fix on register to render based on the account type -> nothing for only vibrations

    const { phase, onConfirm, channelRef } = useChannelDetection();

    switch (phase){
        case 'prompting-channels': return <PromptChannel onConfirm={onConfirm}/>;
        case 'haptic-handshake': return <ConfirmHaptic onRegister={onRegister}/>; // registers users who only accept vibrations
        case 'registering': return <RegisterForm onRegister={onRegister} channel={channelRef.current as CommunicationChannel}/>; // -> returns callback when done, takes in the available channels
    }

}