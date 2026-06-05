import { use, useEffect, useRef, useState } from 'react';
import { Vibration, View, Text, AccessibilityInfo, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { CommunicationChannel } from '@/types/output';
import { speak } from '@/core/output'
import { LONG_PRESS_MIN_LENGTH_MS } from '@/config/index';


const PROMPT_MESSAGE = "Задръжте с пръст на екрана";

export default function PromptChannel({
    onConfirm
}: {
    onConfirm: (channel: CommunicationChannel) => void;
}) {
    /*
    1. We start with a message sent through voice and text: "Задръжте с пръст на екрана"
    2. If this isn't triggered then we default to the vibration channel
    3. This way we get a channel for fast users and vibrations only for slow once, so they don't slow down the process in the registration
    */

    const [timeoutMilis, setTimeoutMilis] = useState<number|null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
    const decided = useRef(false);

    useEffect(() => {
        AccessibilityInfo.getRecommendedTimeoutMillis(6000).then(setTimeoutMilis);
        speak(PROMPT_MESSAGE);
    }, [])

    useEffect(() => {
        if (timeoutMilis === null) return;
        timerRef.current = setTimeout(() => {
            if (decided.current) return;
            decided.current = true;
            onConfirm('vibration');
        }, timeoutMilis)

        return () => { if (timerRef.current !== null) clearTimeout(timerRef.current);}
    }, [timeoutMilis])


    const longHold = Gesture.LongPress()
        .onBegin(() => {
            if (timerRef.current !== null) clearTimeout(timerRef.current); // a timer must have been initialized by now, but it is possible to be a little lagged
            Vibration.vibrate([0, 500], true); // two seconds vibration
            }
        )
        .minDuration(LONG_PRESS_MIN_LENGTH_MS)
        .onStart(() => {
            Vibration.cancel();
            if (decided.current) return;
            decided.current = true;
            decided.current = true;
            onConfirm('text-speech');
        })
        .onFinalize(() => {
            Vibration.cancel();

            if (!decided.current){
                timerRef.current = setTimeout(() => {
                    if (decided.current) return;
                    decided.current = true;
                    onConfirm('vibration');
                }, timeoutMilis ?? 6000) // timeoutMillis could possibly not be assigned 

                return () => {clearTimeout(timerRef.current as ReturnType<typeof setTimeout>)};
            }
            
        }).runOnJS(true);
    
    return (
        <GestureDetector gesture={longHold}>
            <View style={styles.container} collapsable={false}>
                <Text style={styles.PromptText}>
                    {PROMPT_MESSAGE}
                </Text>
            </View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A9D8F', 
        padding: 20,
    },
    PromptText: {
        maxWidth: '75%',
        color: '#FFFFFF',
        fontSize: 53,
        fontWeight: 'bold',
        textAlign: 'center',
    }
})