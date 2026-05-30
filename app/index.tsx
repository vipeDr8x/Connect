import { translateFromMorse } from '@/core/morse';
import { displayMessageVibrationsSpeech } from '@/core/output';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";


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
   const vibrationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null); //I added it to try and do infinite vibrations but I couldnt but maybe it will be useful later
   let [translatedMorse, setTranslatedMorse] = useState<string|null>(null);
   
   useEffect(() => {
       if (phase === 'done'){
           try {
                const result = translateFromMorse(morseMessage)
                setTranslatedMorse(result);

                displayMessageVibrationsSpeech("Край на въвеждането на морзов код. Вие казахте: ", accountType);
                displayMessageVibrationsSpeech(result, accountType);

            } catch (error){
                let message: string;

                if (error instanceof Error) {
                    message = error.message;
                } else {
                    message = String(error);
                }

                message = message.replace('-', 'тире');
                message = message.replace('.', 'точка');
                
                displayMessageVibrationsSpeech(message, accountType);
            }

           displayMessageVibrationsSpeech("За да започнете да въвеждате ново съобщение, натиснете два пъти на екрана", accountType);
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
            lastPressRef.current = null;
            setTranslatedMorse(null);
            
        }
        
    }, [timesPressed])
    
    
   const onPressIn = () => {
   if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
   
   
   Vibration.vibrate([0, 400, 0, 400, 0, 400, 0, 400], true); 

   pressStartRef.current = Date.now();
   
   if (lastPressRef.current !== null){
       const timePause = Date.now() - lastPressRef.current;
       
       if (timePause > 250 && timePause <= 1000) { 
           setMorseMessage(prev => prev + ' ')
       } else if (timePause > 1000){
           setMorseMessage(prev => prev + ' / ') 
       }
   }
   pressStartRef.current = Date.now();
   }
    
    const onPressOut = () => {
    Vibration.cancel(); 
    
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    
    const now = Date.now();
    const duration = now - (pressStartRef.current as number);
    
    if (duration <= 200) { 
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
        
            <View style={styles.upperHalf}>
            <View style={styles.infoBox}>
                <Text style={styles.labelText}>
                    Морз: {morseMessage || '...'}
                </Text>
                <Text style={styles.labelText}>
                    Превод: {phase === 'done' && translatedMorse !== null ? translatedMorse : '...'}
                </Text>
            </View>
        </View>

        
        <View style={styles.lowerHalf} />

        </Pressable>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2A9D8F'
    },
    upperHalf: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 25,
        borderBottomColor: 'black',
        borderBottomWidth: 3, 
    },
    lowerHalf: {
        width: '100%',
        height: '50%',
    },
    infoBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.25)', 
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        width: '100%',
    },
    labelText: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        marginVertical: 8,
        textAlign: 'left',
    }
});