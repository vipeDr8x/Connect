import { getScreenReaderEnabled } from '@/accessibility/screenReader';
import { speak, stopVibrationsSpeech } from '@/core/output';
import { registerUser } from '@/storage/profile';
import { CommunicationChannel } from '@/types/output';
import { Disability } from '@/types/profile';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';


interface Stage {
    phase: RegisterPhase,
    disability: Disability,
    bulgarian: string
}

const STAGES: Stage[] = [ // this keeps the order of the queries for disabilities
    { phase: 'blind-prompt', disability: 'blind', bulgarian: 'не виждате' },
    { phase: 'deaf-prompt', disability: 'deaf', bulgarian: 'не чувате' },
    { phase: 'non-verbal-prompt', disability: 'non-verbal', bulgarian: 'не говорите' },
];

type Phase = 'idle' | 'registering' | 'confirming';
type RegisterPhase = 'idle' | 'blind-prompt' | 'non-verbal-prompt' | 'deaf-prompt';


export default function RegisterForm( { 
    onRegister,
    channel
} : {
    onRegister: () => void,
    channel: CommunicationChannel
}
){
    const [phase, setPhase] = useState<Phase>('idle');
    const [registerPhase, setRegisterPhase] = useState<RegisterPhase>('idle');
    const [timesPressed, setTimesPressed] = useState(0);
    const disabilitiesRef = useRef<Disability[]>([]);
    const idleReasonRef = useRef<string|null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
    const [screenText, setScreenText] = useState<string>();
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout>|null>(null);


    // v1: only probe-confirmed (sighted/hearing) users reach registration; deafblind get the holding state and a dedicated v2 flow.
    const announce = useCallback((message: string) => {
        Speech.stop(); // cut off anything mid-flight
        setScreenText(message);
        speak(message);
    }, []);


    useEffect(() => {
        switch (phase) {
            case 'idle':
                idleReasonRef.current === null ? 
                    announce("За да започнете регистрацията си натиснете два пъти на екрана"):
                    announce(`${idleReasonRef.current}\n За да опитате отново натиснете два пъти на екрана`)

                idleReasonRef.current = null;
                break;
            case 'registering':
                setRegisterPhase('blind-prompt');
                break;
            case 'confirming':
                let msg: string;

                if (disabilitiesRef.current.length === 0) {
                    msg = "нямате увреждания";
                } else if (disabilitiesRef.current.length > 2) {
                    const wordsBg = disabilitiesRef.current.map(x => STAGES.find((v) => v.disability === x)?.bulgarian);
                    msg = `${wordsBg.slice(0, -1).join(', ')} и ${wordsBg.at(-1)}`;
                }
                else {
                    msg = disabilitiesRef.current.map(x => STAGES.find((v) => v.disability === x)?.bulgarian).join(' и ');
                }

                announce(`За да потвърдите, че ${msg}, задръжте на екрана`);

                timerRef.current = setTimeout(() => {
                    idleReasonRef.current = "Не потвърдихте вашите увреждания";
                    setPhase('idle');
                    setRegisterPhase('idle');
                    setTimesPressed(0);
                    disabilitiesRef.current = [];
                    timerRef.current = null;
                }, 10000)

                return () => {clearTimeout(timerRef.current as ReturnType<typeof setTimeout>)}
        }
        }, [phase])


    function promptHelper(disability: string, registerPhase?: RegisterPhase, phase?: Phase) {
        // returns the timer id of the set timer for the time window

        announce(`Натиснете веднъж на екрана, ако ${disability}`);

        return setTimeout(() => {
            if (registerPhase) setRegisterPhase(registerPhase);
            if (phase) setPhase(phase);
        }, 6000)

    }

    useEffect(() => {
        if (registerPhase !== 'idle') {
            
            const stage = STAGES.find(s => s.phase === registerPhase) as Stage;
            let result = determineNextPhase(stage);

            const timerId = promptHelper(stage.bulgarian, result.nextRegisterPhase, result.nextPhase);
            return (() => {clearTimeout(timerId)});
        }
    }, [registerPhase])


    function selectDisabilityHelper(disability: Disability, registerPhase?: RegisterPhase, phase?: Phase) {
        disabilitiesRef.current = [...disabilitiesRef.current, disability];

        if (registerPhase) setRegisterPhase(registerPhase);
        if (phase) setPhase(phase);

    }


    useEffect(() => {
        if (phase === 'idle' && timesPressed === 2) {
            setPhase('registering');
            stopVibrationsSpeech();
            setTimesPressed(0);
        };
    }, [phase, timesPressed]);


    const determineNextPhase = (stage: Stage) => {
        const i = STAGES.indexOf(stage);
        const isLast = i === STAGES.length - 1;

        return {
            nextRegisterPhase: isLast ? undefined : STAGES[i + 1].phase,
            nextPhase: isLast ? ('confirming' as const) : undefined
        }
        
    }


    useEffect(() => {
        if (phase === 'registering' && timesPressed) {
            const stage = STAGES.find(s => s.phase === registerPhase) as Stage;

            let result = determineNextPhase(stage);

            selectDisabilityHelper(stage.disability, result.nextRegisterPhase, result.nextPhase);

            setTimesPressed(0);
        };

    }, [phase, timesPressed]);


    useEffect(() => {
        if (phase === 'confirming' && timesPressed === 2) {
            if (timerRef.current !== null) clearTimeout(timerRef.current);
    
    
                const register = async () => {
                    const result = await registerUser({disabilities: new Set(disabilitiesRef.current)})
            
                    if (result) {
                        onRegister();
                        
                    } else {
                        announce("Възникна грешка");
                        setPhase('idle'); // total restart
                    };
                }
                
                register();
                setTimesPressed(0); 
                };

        }, [phase, timesPressed]);



    return (
        <>
        <Pressable 
            onPress={() => {
                setTimesPressed(prev => prev + 1)
            }}
            accessibilityRole='button'
            accessibilityLabel={screenText}
            onPressIn={() => {
                if (silenceTimerRef !== null) clearTimeout(silenceTimerRef.current as ReturnType<typeof setTimeout>);
            }}
            onPressOut={() => {
                if (phase === 'registering' || timesPressed === 1) return;
                
                silenceTimerRef.current = setTimeout(() => {
                    announce("Натиснете още веднъж");
                }, 5000);
            }}
            style={{flex: 1}}>
            <View style={styles.container}>
                <Text style={styles.PromptText}>{screenText}</Text>
            </View>
        </Pressable>
        

        <Pressable // improve accessibility
                   // check if there is a screen reader then generate or just add the fields whatevers best
            onPress={() => {

            }}
            onLongPress={() => {

            }}
        >
            <Text>{screenText}</Text>
        </Pressable>

        </>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A9D8F', 
        padding: 20,
    },
    PromptText: {
        maxWidth: '85%',
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
    }
})

