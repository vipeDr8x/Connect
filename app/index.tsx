import MainScreen from '@/components/MainScreen'
import SplashScreen from '@/components/SplashScreen'
import { checkUser } from '@/storage/profile'
import { useEffect, useState } from 'react'
import { Text } from 'react-native'

export default function Index() {
  // Index page acts as a router for screens and not just displaying one static screen
  /* 1. We need to determine to which screen we are going to switch:
    - the profile registration
    - the MainScreen screen from MainScreen.tsx (user has an account)
    2. In order to do that, we need to access the AsyncStorage and check if the profile exists, but the loading process is covered by a splash screen
    3. We need to wait for the splash screen to be done (via callback function) and for the profile check to be done (both)
    4. After both things are determined, we need to show the right screen, which the phase signifies

    */

  type Phase = null | "needs-register" | "ready";

  const [user, setUser] = useState<null | string | undefined>(undefined); // null or UserProfile (TODO)
  /* null is set if there is no profile
    undefined signifies there isn't a result yet
    UserProfile signifies there is a registered user
    */
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    const check = async () => {
      let result: null | string = await checkUser();

      setUser(result);
    };

    check();
  }, []);

  let phase: Phase = null;
  if (isAnimationDone && user !== undefined) {
    phase = user === null ? "needs-register" : "ready";
  }

  switch (phase) {
    case "needs-register":
      return <Text style={{ fontSize: 40 }}>TODO</Text>;

    case "ready":
      return <MainScreen />;
  }

  return <SplashScreen onFinishLoading={() => setIsAnimationDone(true)} />;
}