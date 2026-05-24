import { Text, View, StyleSheet, Vibration } from "react-native";
// import { translateFromMorse, translateToMorse } from '@/core';
import * as Speech from 'expo-speech';
import { getMessageAsVibrationsArray } from '../core/output';


export default function Index() {
    /*
    1. Display message visually and with vibrations saying: "Натиснете два пъти на екрана, за да започнете да въвеждате морзов код!"
    2. When clicked two times (not sure if is better to have a range of five seconds for the click count to reset): "Вече можете да започнете да въвеждате морзов код!"
    3. After the morse code is fully entered by the user, to signal the message is fully entered, a large stop is made with no tapping on the screen (configurable in user settings on manually set in development version)
    4. A message is displayed for confirming the end of receiving the code: "Край на въвеждането на морзов код!"
    5. After taking the message, it gets translated back to vibrations, speech and text:
        - the text gets visualized and a message gets displayed: "За да започнете да въвеждате ново съобщение, натиснете два пъти в долната половина на екрана(, понеже в горната е визуализиран текст. (за слепи хора))"
    6. If it gets clicked a total of two times the flow gets repeated!
    */

    
    Vibration.vibrate(getMessageAsVibrationsArray('--.. ..-- / --..- / .--'));


    return (
    <View
      style={stlyes.container}
    >

    </View>
  );
}


const stlyes = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A9D8F'
    }
});