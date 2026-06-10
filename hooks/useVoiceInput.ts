import { useState, useRef, useCallback, useEffect } from "react";
import { speak } from '@/core/output';
import { Turn } from "@/chat/types";
import { useAudioRecorder, RecordingPresets, AudioModule, setAudioModeAsync  } from 'expo-audio';
import { Vibration } from "react-native";
import { stopSpeech } from "@/core/output";

async function transcribe(uri: string): Promise<string> {
    const form = new FormData();
    form.append('file', { uri, name: 'speech.m4a', type: 'audio/m4a' } as any);
    form.append('model', 'whisper-large-v3');
    form.append('language', 'bg');

    const KEY = process.env.EXPO_PUBLIC_GROQ_KEY;

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}` },
        body: form,
    });
    console.log(res);
    if (!res.ok) throw new Error('STT failed');
    const data = await res.json();
    return data.text;
}

export default function useVoiceInput( { onCommitMessage }: {
    onCommitMessage: (sender: Turn, text: string, isVoice: boolean,) => void;
}) {
    
    // ---- Recording state via ref to avoid stale closures ----
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    
    // ==========================================
    // VOICE RECORDING CONTROLLER
    // Reads/writes isRecordingRef so there is never a stale closure.
    // ==========================================
    const toggleVoiceInput = useCallback(async (sender: Turn) => {
        Vibration.vibrate(50);
        stopSpeech();
        if (!isRecording) {
            const perm = await AudioModule.requestRecordingPermissionsAsync();
            if (!perm.granted) { speak("Няма достъп до микрофона."); return; }

            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true
            });

            await recorder.prepareToRecordAsync();
            recorder.record();
            setIsRecording(true);
        } else {
            await recorder.stop();

            await setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            setIsRecording(false);
            setIsTranscribing(true);
            speak("Обработка на записа.");
            try {
                const text = await transcribe(recorder.uri!);  // ← API call
                onCommitMessage(sender, text, true);
                console.log("here!!!");
            } catch (e){
                console.log(e);
                speak("Грешка при разпознаването. Опитайте отново.");
            } finally {
                setIsTranscribing(false);
            }
        }
    }, [isRecording, onCommitMessage]);

    return { isRecording, isTranscribing, toggleVoiceInput };
}