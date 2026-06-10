import { 
    View, 
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity
 } from 'react-native';

import { theme } from '@/themes/colors';
import { MessageLog, Turn } from './types';

const NOTCH_OFFSET = 60;
const DIVIDER_COLOR = "#000";


export default function ChatHistory({ displayMessages, currentTurn, onReply, onReturn }:
    {
        displayMessages: MessageLog[];
        currentTurn: Turn;
        onReply: () => void;
        onReturn: () => void;
    }
) {
    const turnLabel = currentTurn === "user1" ? "Потребител 1" : "Потребител 2";

    return (
        <View style={styles.container}>
            {/* TOP HALF: message list — pushed below notch */}
            <View
                style={[
                    styles.half,
                    {
                        backgroundColor: theme.primary,
                        paddingTop: NOTCH_OFFSET,
                        paddingHorizontal: 12,
                    },
                ]}
            >
                <Text style={[styles.halfLabel, { marginBottom: 8 }]}>
                    История на диалога
                </Text>
                <ScrollView
                    style={styles.historyBox}
                    contentContainerStyle={{ paddingBottom: 8 }}
                >
                    {displayMessages.length === 0 ? (
                        <Text style={styles.logText}>Няма записани съобщения.</Text>
                    ) : (
                        displayMessages.map((msg) => (
                            <View key={msg.id} style={styles.messageRow}>
                                <Text style={styles.messageSender}>
                                    {msg.sender === "user1" ? "Потр. 1" : "Потр. 2"}
                                    {msg.isVoice ? " (глас)" : " (текст)"}:
                                </Text>
                                <Text style={styles.logText}>{msg.text}</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            <View style={styles.divider} />

            {/* BOTTOM HALF: actions */}
            <View
                style={[
                    styles.half,
                    {
                        backgroundColor: theme.primary,
                        paddingTop: 20,
                        paddingHorizontal: 15,
                        justifyContent: "flex-start",
                    },
                ]}
            >
                <Text style={[styles.halfLabel, { marginBottom: 12 }]}>
                    Ред на: {turnLabel}
                </Text>
                <TouchableOpacity
                    style={[styles.halfButton, { backgroundColor: theme.primary }]}
                    onPress={() => onReply()}
                >
                    <Text style={styles.halfButtonText}>
                        Въведи отговор ({turnLabel})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.backLink, { marginTop: 14 }]}
                    onPress={() => onReturn()}
                >
                    <Text style={styles.backLinkText}>Главно меню</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.primary,
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
        color: "#FFF",
        textAlign: "center",
    },
    inputField: {
        width: "95%",
        backgroundColor: "rgba(255, 255, 255, 0)",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: "#000000",
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
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 13,
        marginBottom: 2,
        opacity: 0.8,
    },
    logText: {
        color: "#ffffff",
        fontSize: 15,
    },
});
