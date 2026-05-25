import { translateFromMorse, translateToMorse } from '@/core/morse';
import * as Speech from 'expo-speech';
import { Vibration } from "react-native";
import { AccountType } from '@/types/profile'


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


export function displayMessageVibrationsSpeech(message: string, accountType: AccountType){
    const messageMorse = translateToMorse(message);

    // for now an account must have only one disability (TODO -> update to multiple)
    switch (accountType){
        case 'non-verbal':
        case 'blind':
            Speech.speak(message, {language: 'bg'});
            break;
        case 'deaf':
            Vibration.vibrate(getMessageAsVibrationsArray(messageMorse));
            break;
    }
        
}