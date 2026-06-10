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
<<<<<<< HEAD

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG,
  },
  divider: {
    width: "100%",
    height: 3,
    backgroundColor: DIVIDER_COLOR,
  },
  halfSelection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  selectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5B8FA8",
    textAlign: "center",
  },
  half: {
    width: "100%",
    height: "50%",
    alignItems: "center",
  },
  halfLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.brand,
    textAlign: "center",
    marginBottom: 8,
  },
  halfButton: {
    width: "95%",
    height: "50%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  halfButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  backLink: {
    marginTop: 10,
  },
  backLinkText: {
    color: theme.brand,
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  wipText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
  inputField: {
    width: "95%",
    backgroundColor: "rgba(165, 109, 109, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#3153a3",
    borderWidth: 1,
    borderColor: "rgba(69, 47, 47, 0.4)",
    marginBottom: 8,
  },
  historyBox: {
    width: "95%",
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 6,
    padding: 10,
  },
  messageRow: {
    marginVertical: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#FFF",
    paddingLeft: 8,
  },
  messageSender: {
    color: "#1D3557",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
    opacity: 0.8,
  },
  logText: {
    color: "#1D3557",
    fontSize: 15,
  },
});
=======
>>>>>>> 67913fcac51b0b128ad15a6f1341b57ab3c05fac
