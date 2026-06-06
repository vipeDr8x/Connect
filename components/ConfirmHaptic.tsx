import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Pressable, Vibration, View } from "react-native";
import { useEffect, useState } from "react";
import { registerUser } from '@/storage/profile';
import { theme } from "@/themes/colors";


const vibrateInPattern = () => {
    Vibration.vibrate([400, 100], true);
}

type Phase = 'confirming' | 'registering';

export default function ConfirmHaptic({ 
    onRegister,
} : {
    onRegister: () => void,
}) {
    /*
    Display simple message in vibrations, wait for the confirmation that the user could feel signals by vibration

    1. Display: "bz bz bz bz bz" with little intervals in between so the user understands he needs to press the screen
    2. If succesful call the onConfirm, if not wait for it to be completed
    */

    const [phase, setPhase] = useState<Phase>('confirming');

    useEffect(() => {
        if (phase !== 'registering') return;
        const register = async () => {
            const result = await registerUser({disabilities: new Set(['deaf', 'blind', 'non-verbal'])})

            if (result) {
                Vibration.vibrate([200, 300, 200, 300]); // signifying success
                onRegister();

            } else {
                Vibration.vibrate([0, 600, 0, 600, 0, 600]); // signifying error
                register(); // what do we do????
            };
        }

        register();
    }, [phase])
    
    useEffect(() => {
        if (phase === "confirming") vibrateInPattern();
    }, [phase])
        
    return (
        <Pressable
            style={{ flex: 1, backgroundColor: theme.primary }}
            onPressIn={() => {
                Vibration.vibrate([0, 100]);
            }}
            onPress={() => {
                setPhase('registering');
            }}

        />
    );
}