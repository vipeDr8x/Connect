import { Stack, SplashScreen } from "expo-router";
import { useEffect } from 'react';
import { useFonts, PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';


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
