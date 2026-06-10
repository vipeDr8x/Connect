import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@/themes/colors';
import { styles, NOTCH_OFFSET, BTN } from './styles/styles';
import useVoiceInput from '@/hooks/useVoiceInput';
import { Turn } from './types';

export default function BlindUserInput( { onCommitMessage }: {
    onCommitMessage: (sender: Turn, text: string, isVoice: boolean,) => void;
} ) {

    const { isRecording, toggleVoiceRecording } = useVoiceInput({ onCommitMessage });

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.half,
                    {
                        backgroundColor: isRecording ? "#E63946" : theme.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingTop: NOTCH_OFFSET,
                    },
                ]}
            >
                <Text style={styles.halfLabel}>
                    {isRecording
                        ? "Записът е активен..."
                        : "Гласов режим (Потребител 1)"}
                </Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
                style={[
                    styles.half,
                    {
                        backgroundColor: isRecording ? "#C32F3A" : BTN,
                        justifyContent: "center",
                        alignItems: "center",
                    },
                ]}
                onPress={() => toggleVoiceRecording("user1")}
            >
                <Text style={styles.halfButtonText}>
                    {isRecording
                        ? "Натиснете за КРАЙ и ИЗПРАЩАНЕ"
                        : "Натиснете за СТАРТ на запис"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}