import { Text } from 'react-native'
import { useEffect, useState } from 'react'
import SplashScreenView from '@/components/SplashScreen'
import MainScreen from '@/components/MainScreen'
import { checkUser } from '@/storage/profile'


export default function Index() {
    // Index page acts as a router for screens and not just displaying one static screen
    /* 
    1. We need to determine to which screen we are going to switch:
    - the profile registration
    - the MainScreen screen from MainScreen.tsx (user has an account)
    2. In order to do that, we need to access the AsyncStorage and check if the profile exists, but the loading process is covered by a splash screen
    3. We need to wait for the splash screen to be done (via callback function) and for the profile check to be done (both)
    4. After both things are determined, we need to show the right screen, which the phase signifies

    */

    type Phase = null | 'needs-register' | 'ready';

    const [phase, setPhase] = useState<Phase>(null);
    const [user, setUser] = useState<null|string|undefined>(undefined); // null or UserProfile (TODO)
    /* 
    null is set if there is no profile
    undefined signifies there isn't a result yet
    UserProfile signifies there is a registered user
    */
    const [isAnimationDone, setIsAnimationDone] = useState(false);
    
    useEffect(() => {
        const check = async () => {
            let result: null|string = await checkUser();

            setUser(result);
        }

        check();
    }, [])


    useEffect(() => {
        if (isAnimationDone && user !== undefined) {
            setPhase(user === null ? 'needs-register': 'ready');
        }
    }, [isAnimationDone, user])


    switch (phase){
        case 'needs-register':
            return <Text style={{fontSize: 40}}>TODO</Text>;
            
        case 'ready':
            return <MainScreen />;
    }
                
    return <SplashScreenView onFinishLoading={() => setIsAnimationDone(true)}/>
}

