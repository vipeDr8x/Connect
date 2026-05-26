import { PlayfairDisplay_500Medium, useFonts } from '@expo-google-fonts/playfair-display';
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';


export default function RootLayout() {
    const [loaded, error] = useFonts({
        "Playfair-Display-Regular": PlayfairDisplay_500Medium
    });

    useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }


    return <Stack screenOptions={{ headerShown: false }} />;
}
