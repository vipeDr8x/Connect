import { getScreenReaderEnabled } from '@/accessibility/screenReader';
import { translateToMorse } from '@/core/morse';
import { CommunicationChannel } from '@/types/output';
import { Disability } from '@/types/profile';
import * as Speech from 'expo-speech';
import { AccessibilityInfo, Vibration } from "react-native";


export function getMessageAsVibrationsArray(messageInMorse: string): number[] {

    const VIBRATIONS_MAPPER = {'.': [100, 200], '-': [300, 250], ' ': 300, '/': 400} // all values are in ms, separations of words is -> ' / ' -> 400ms, not 200ms
    let vibrationsArr: number[] = [0];

    for (const code of messageInMorse) {
        switch (code) {
            case '.':
            case '-':
                vibrationsArr.push(...VIBRATIONS_MAPPER[code]);
                break;
            case ' ':
            case '/':
                vibrationsArr[vibrationsArr.length - 1] += VIBRATIONS_MAPPER[code];
                break;
        }
    }

    return vibrationsArr;

}

export function speak(message: string) {
    Speech.stop();
    console.log("=== AUDIO ANNOUNCEMENT ===:", message);
    getScreenReaderEnabled () ? AccessibilityInfo.announceForAccessibility(message):
        Speech.speak(message, {language: 'bg'});
}

export function displayMessageVibrationsSpeechSpecialized(message: string, accountType: Disability){
    const messageMorse = translateToMorse(message);

    // for now an account must have only one disability (TODO -> update to multiple)
    switch (accountType){
        case 'non-verbal':
        case 'blind':
            speak(message);
            break;
        case 'deaf':
            Vibration.vibrate(getMessageAsVibrationsArray(messageMorse));
            break;
    }
        
}

export function displayMessageVibrationsSpeech(message: string, channel: CommunicationChannel){
    const messageMorse = translateToMorse(message);

    if (channel === "text-speech") {
        speak(message);
        return;
    }

    const vibrationsArray = getMessageAsVibrationsArray(messageMorse);

    if (channel === 'vibration') {
        Vibration.vibrate(vibrationsArray);
        return;
    }

    speak(message);
    Vibration.vibrate(vibrationsArray);
    
    // return vibrationsArray.filter((v, i) => i % 2 !== 0).reduce((x, y) => x + y);
}

export function stopVibrationsSpeech(){
    Vibration.cancel();
    Speech.stop();
}

export function stopSpeech() {
    Speech.stop();
}