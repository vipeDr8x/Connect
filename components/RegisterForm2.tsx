import { displayMessageVibrationsSpeech, stopVibrationsSpeech } from '@/core/output';
import { registerUser } from '@/storage/profile';
import { CommunicationChannel } from '@/types/output';
import { Disability } from '@/types/profile';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
    const timerRef = useRef<number|null>(null);
    const [screenText, setScreenText] = useState<string>();

    const toBulgarian = (d: Disability) => {
        switch (d){
            case 'blind': return 'не виждате'
            case 'deaf': return 'не чувате'
            case 'non-verbal': return 'не говорите'
        }
    }

    useEffect(() => {
        switch (phase) {
            case 'idle':
                displayMessageVibrationsSpeech("За да започнете регистрацията си натиснете два пъти на екрана", channel);
                setScreenText("За да започнете регистрацията си натиснете два пъти на екрана");
                break;
            case 'registering':
                displayMessageVibrationsSpeech("Начало на регистрация", channel);
                setScreenText("Начало на регистрация");
                setRegisterPhase('blind-prompt');
                break;
            case 'confirming':
                displayMessageVibrationsSpeech(За да потвърдите, че ${disabilitiesRef.current.map(x => toBulgarian(x)).join(' и ')}, натиснете два пъти на екрана, channel);

                timerRef.current = setTimeout(() => {
                    displayMessageVibrationsSpeech("Не потвърдихте вашите увреждания", channel);
                    setScreenText("Не потвърдихте вашите увреждания");
                    setPhase('idle');
                    setRegisterPhase('idle');
                    setTimesPressed(0);
                    disabilitiesRef.current = [];
                    timerRef.current = null;
                }, 10_000)
        }
        }, [phase])

    function promptHelper(disability: string, registerPhase?: RegisterPhase, phase?: Phase) {
        // returns the timer id of the set timer for the time window

        displayMessageVibrationsSpeech("Натиснете веднъж на екрана, ако ${disability}, channel"); // може да се формулира по-добре изречението
        setScreenText("Натиснете веднъж на екрана, ако ${disability}");

        return setTimeout(() => {
            if (registerPhase) setRegisterPhase(registerPhase);
            if (phase) setPhase(phase);
        }, 10000)

    }

    useEffect(() => {
        if (registerPhase !== 'idle') {
            for (let i=0; i < STAGES.length; i++) {
                let stage = STAGES[i];

                if (stage.phase === registerPhase) {
                    let nextRegisterPhase: undefined|RegisterPhase;
                    let nextPhase: undefined|Phase;

                    if (stage === STAGES.at(-1)) {
                        nextRegisterPhase = undefined;
                        nextPhase = 'confirming';
                    }
                    else {
                        nextRegisterPhase = STAGES[i + 1].phase;
                        nextPhase = undefined;
                    }

                    const timerId = promptHelper(stage.bulgarian, nextRegisterPhase, nextPhase);

                    return (() => {clearTimeout(timerId)});
                }
            }
        }
    }, [registerPhase])

    function selectDisabilityHelper(disability: Disability, registerPhase?: RegisterPhase, phase?: Phase) {
        disabilitiesRef.current = [...disabilitiesRef.current, disability];

        if (registerPhase) setRegisterPhase(registerPhase);
        if (phase) setPhase(phase);

    }

    useEffect(() => {
        if (phase === 'idle' && timesPressed === 2){
            setPhase('registering');
            stopVibrationsSpeech();

            setTimesPressed(0);
        }
    }, [phase, timesPressed]);

    useEffect(() => {
        if (phase === 'registering' && timesPressed){
            // for loop is almost identical to the other one
            for (let i=0; i < STAGES.length; i++) {
                let stage = STAGES[i];

                if (stage.phase === registerPhase) {
                    let nextRegisterPhase: undefined|RegisterPhase;
                    let nextPhase: undefined|Phase;

                    if (stage === STAGES.at(-1)) {
                        nextRegisterPhase = undefined;
                        nextPhase = 'confirming';
                    }
                    else {
                        nextRegisterPhase = STAGES[i + 1].phase;
                        nextPhase = undefined;
                    }

                    selectDisabilityHelper(stage.disability, nextRegisterPhase, nextPhase);
                }
            }

            setTimesPressed(0);
        }
    }, [phase, timesPressed]);

    useEffect(() => {
        if (phase === 'confirming' && timesPressed === 2){
            if (timerRef.current !== null) clearTimeout(timerRef.current);

            const register = async () => {
                const result = await registerUser({disabilities: new Set(disabilitiesRef.current)})

                if (result) {
                    displayMessageVibrationsSpeech("Регистрацията мина успешно", channel);
                    onRegister();

                } else {
                    displayMessageVibrationsSpeech("Възникна грешка.", channel);
                    setPhase('idle'); // total restart, could handle better though
                };
            }

            register();
            setTimesPressed(0);       
        }
        }, [phase, timesPressed]);

    const tap = Gesture.Tap().runOnJS(true).onStart(() => { // .runOnJS(true) just fixes an error with reanimated library
        setTimesPressed(prev => prev + 1);
    });

    // MAKE PRESSABLE FOR WHEN THERE IS A SCREENREADER

    return (
        <GestureDetector gesture={tap}>
            <View style={styles.container}>
                <Text>{
                    screenText
                    }</Text>
            </View>
        </GestureDetector>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A9D8F', 
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        width: '100%',
        borderRadius: 20
    },
    PromptText: {
        maxWidth: '75%',
        color: '#FFFFFF',
        fontSize: 53,
        fontWeight: 'bold',
        marginVertical: 8,
        textAlign: 'center',
    }
})