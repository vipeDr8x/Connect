import { useState, useRef, useEffect } from 'react';
import { Text, Pressable, StyleSheet, Vibration } from "react-native";
import { displayMessageVibrationsSpeech } from '@/core/output';
import { translateFromMorse } from '@/core/morse';


export default function Index() {
    /*
    1. Display message visually and with vibrations saying: "Натиснете два пъти на екрана, за да започнете да въвеждате морзов код!"
    2. When clicked two times (not sure if is better to have a range of five seconds for the click count to reset): "Вече можете да започнете да въвеждате морзов код!"
    3. After the morse code is fully entered by the user, to signal the message is fully entered, a large stop is made with no tapping on the screen (configurable in user settings on manually set in development version)
    4. A message is displayed for confirming the end of receiving the code: "Край на въвеждането на морзов код!"
    5. After taking the message, it gets translated back to vibrations, speech and text:
    - the text gets visualized and a message gets displayed: "За да започнете да въвеждате ново съобщение, натиснете два пъти на екрана(, понеже в горната е визуализиран текст. (за слепи хора))"
    6. The flow gets repeated!
    */
   const accountType = 'blind'; // hardcoded for now
   
   type Phase = 'idle' | 'receiving' | 'done';

   
   const [phase, setPhase] = useState<Phase>('idle');
   const [timesPressed, setTimesPressed] = useState<number>(0);
   const pressStartRef = useRef<number|null>(null);
   const lastPressRef = useRef<number|null>(null);
   const [morseMessage, setMorseMessage] = useState<string>('');
   const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   let translatedMorse: string = '';

   try{
       translatedMorse = translateFromMorse(morseMessage);
   } catch (error){
        console.log("Този символ е невалиден"); // Implement to show message and restart flow on invalid symbol
        // setPhase('idle');
   }
   
   useEffect(() => {
       if (phase === 'done'){
           displayMessageVibrationsSpeech("Край на въвеждането на морзов код. Вие казахте: ", accountType);
           displayMessageVibrationsSpeech(translatedMorse, accountType);
           displayMessageVibrationsSpeech("За да започнете да въвеждате ново съобщение, натиснете два пъти на екрана", accountType);
           
           lastPressRef.current = null;
        }
        else if (phase === 'idle'){
            displayMessageVibrationsSpeech("Натиснете два пъти на екрана, за да започнете да въвеждате морзов код.", accountType);
        }
    }, [phase])

    
    useEffect(() => {
        if (timesPressed == 2) {
            displayMessageVibrationsSpeech("Вече можете да започнете да въвеждате морзов код на екрана", accountType);
            setMorseMessage('');
            setPhase('receiving');
            setTimesPressed(0);
            
        }
        
    }, [timesPressed])
    
    
    const onPressIn = () => {
        Vibration.vibrate([0, 400, 0, 400, 0, 400, 0, 400, ]);
        
        
        if (lastPressRef.current !== null){
            const timePause = Date.now() - lastPressRef.current;
            
            
            // 250ms considered the max pause between the symbols of one letter,
            // 1000ms considered max for between letters
            // any more than that is considered a pause for separating words
            // would be better to use ENUMS
            
            if (timePause > 250 && timePause <= 1000) { 
                setMorseMessage(prev => prev + ' ')
            } else if (timePause > 1000){
                setMorseMessage(prev => prev + ' / ') // separator for between words
            }
            
            
        }
        pressStartRef.current = Date.now();
    }
    
    const onPressOut = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
        Vibration.cancel();
        
        const now = Date.now();
        const duration = now - (pressStartRef.current as number); // onPressOut will always be triggered after onPressIn
        
        if (duration <= 200) { // configurable value in user settings on register or while using app
            setMorseMessage(prev => prev + '.');
        } else {
            setMorseMessage(prev => prev + '-')
        }
        
        silenceTimerRef.current = setTimeout(() => {
            setPhase('done');
        }, 5000);
        
        lastPressRef.current = Date.now();
        
    }
    
    
    return (
        <Pressable
        style={styles.container}
        onPress={() => {
        (phase === 'idle' || phase === 'done') ? setTimesPressed(prev => prev + 1): null
      }}
      onPressIn={() => phase === 'receiving' ? onPressIn(): null}
      onPressOut={() => phase === 'receiving' ? onPressOut(): null}
    >
        <Text style={styles.morseText}>{phase === 'done' ? `Вие казахте:\n ${translatedMorse}`: morseMessage}</Text>

    </Pressable>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A9D8F'
    },
    morseText: {
        width: '100%',
        height: '50%',
        paddingTop: 80,
        textAlign: 'center',
        color: '#FFF',
        fontSize: 36,
        borderBottomColor: 'black',
        borderBottomWidth: 3,
        paddingLeft: 30,
        paddingRight: 30,
        fontFamily: 'Playfair-Display-Regular'
    }
});