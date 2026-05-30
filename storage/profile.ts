import AsyncStorage from "@react-native-async-storage/async-storage";


export async function checkUser() {
    try {
        const result = await AsyncStorage.getItem('@user_profile');
        return result !== null ? JSON.parse(result): null

    } catch (e) {
        // error reading value
        console.log("Error while loading user profile!");
        // implement error handling

        return null;

    }
}