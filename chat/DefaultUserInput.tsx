import useVoiceInput from '@/hooks/useVoiceInput';
import { theme } from '@/themes/colors';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Turn } from './types';

const DIVIDER_COLOR = "#000";
const NOTCH_OFFSET = 60;
const BTN = "#1D3557";

export default function DefaultUserInput({ handleConfirmMessage, onBack, onCommitMessage, sender}: {
    sender: Turn;
    handleConfirmMessage: (sender: Turn, content: string) => void;
    onBack: () => void;
    onCommitMessage: (sender: Turn, text: string, isVoice: boolean) => void;
}) {
    
    
    const username = sender === 'user1' ? 'Потребител 1': 'Потребител 2';
    const { isRecording, toggleVoiceRecording } = useVoiceInput({ onCommitMessage });
    const [textInputVal, setTextInputVal] = useState<string>("");

    return (
        <View style={styles.container}>
            {/* TOP HALF */}
            <View
                style={[
                    styles.half,
                    {
                        backgroundColor: theme.primary,
                        paddingTop: NOTCH_OFFSET,
                        paddingHorizontal: 15,
                    },
                ]}
            >
                <Text style={styles.halfLabel}>
                    Въвеждане на Текст ({username})
                </Text>
                <TextInput
                    style={styles.inputField}
                    placeholder="Напишете отговор..."
                    placeholderTextColor={theme.brand}
                    value={textInputVal}
                    onChangeText={setTextInputVal}
                />
                <TouchableOpacity
                    style={[styles.halfButton, { backgroundColor: BTN }]}
                    onPress={() => {
                        handleConfirmMessage(sender, textInputVal);
                        setTextInputVal("");
                    }}
                >
                    <Text style={styles.halfButtonText}>Изпрати текст</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* BOTTOM HALF */}
            <View
                style={[
                    styles.half,
                    { backgroundColor: theme.primary, paddingTop: 20, paddingHorizontal: 15 },
                ]}
            >
                <Text style={styles.halfLabel}>Въвеждане на Глас ({username})</Text>
                <TouchableOpacity
                    style={[
                        styles.halfButton,
                        { backgroundColor: isRecording ? "#E63946" : BTN },
                    ]}
                    onPress={() => toggleVoiceRecording(sender)}
                >
                    <Text style={styles.halfButtonText}>
                        {isRecording ? "Спри и изпрати" : "Започни запис на глас"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => onBack()}
                >
                    <Text style={styles.backLinkText}>Назад към хронологията</Text>
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
