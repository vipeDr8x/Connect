import { theme } from '@/themes/colors';
import { View, StyleSheet, Text } from 'react-native';

export default function BlankScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.PromptText}>Sorry, this functionality is still in development!</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.primary, 
        padding: 20,
    },
    PromptText: {
        color: '#FFFFFF',
        fontSize: 53,
        fontWeight: 'bold',
        textAlign: 'center',
    }
})