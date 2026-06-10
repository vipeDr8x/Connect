import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from '@/types/profile'

export async function checkUser(): Promise<UserProfile | null> {
    try {
        const result = await AsyncStorage.getItem('@user_profile');
        return result ? (JSON.parse(result) as UserProfile): null

    } catch (e) {
        // error reading value
        console.log("Error while loading user profile!");
        // implement error handling

        return null;

    }
}

export async function registerUser(user: UserProfile) {
    try {
        await AsyncStorage.setItem('@user_profile', JSON.stringify(user));

        return true;
    } catch (e) {
        // error reading value
        console.log("Error while saving user profile! " + e);
        // implement error handling

        return false;
    }
}