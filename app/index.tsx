import { translateFromMorse } from '@/core/morse';
import { displayMessageVibrationsSpeech } from '@/core/output';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, Vibration, View } from "react-native";
import MainScreen from '@/components/MainScreen';
import SplashScreenView from '@/components/SplashScreen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from 'expo-router';


async function checkUser() {
    try {
        const result = await AsyncStorage.getItem('@user_profile');
        return result !== null ? JSON.parse(result): null

    } catch (e) {
        // error reading value
        console.log("Error while loading user profile!");

    }
}

export default function Index() {
    // Index page acts as a router for screens and not just displaying one static screen
    /* 
    1. We need to determine to which screen we are going to switch:
    - the profile registration
    - the MainScreen screen from MainScreen.tsx (user has an account)
    2. In order to do that, we need to access the AsyncStorage and check if the profile exists, but the loading process is covered by a splash screen
    3. ...

    */

    return <SplashScreenView />
    // if (user !== null){ // checks if the profile exists
    //     return <MainScreen />;
    // }



}