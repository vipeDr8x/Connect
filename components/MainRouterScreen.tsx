import React, {useState } from "react"
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import ProfileChat from '@/chat/ProfileChat'
// import SimpleChat from '@/components/SimpleChat'
import { speak } from '@/core/output'
import { styles, BG } from '@/chat/styles/styles'
import * as Speech from 'expo-speech';
import SimpleChat from "@/chat/SimpleChat"


type FlowPhase =
    | "selection"
    | "simple-chat"
    | "profile-chat";


export default function MainRouterScreen() {
    /*
    1. There are two options in the MainRouterScreen.:
    -> simple-chat
    -> profile-chat
    */

    const [phase, setPhase] = useState<FlowPhase>("selection");

    switch (phase) {
        case 'selection':
            speak(
                "Главно меню за избор. Натиснете горната половина за обикновен диалог. Натиснете долната половина за профилен диалог.",
            );

            return (
                <View style={styles.container}>
                    <TouchableOpacity
                        style={[styles.halfSelection, { backgroundColor: BG }]}
                        onPress={() => setPhase('simple-chat')}
                    >
                        <Text style={styles.selectionTitle}>Обикновен диалог</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={[styles.halfSelection, { backgroundColor: BG }]}
                        onPress={() => setPhase('profile-chat')}
                    >
                        <Text style={styles.selectionTitle}>Профилен диалог</Text>
                    </TouchableOpacity>
                </View>
            );

        case 'simple-chat':
            return <SimpleChat onReturn={() => {
                Speech.stop();
                setPhase('selection')
            }}/>

        case 'profile-chat':
            return <ProfileChat onReturn={() => {
                Speech.stop();
                setPhase('selection')
            }} />

    }
}
