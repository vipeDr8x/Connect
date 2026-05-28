import { translateFromMorse } from "@/core/morse";
import { displayMessageVibrationsSpeech } from "@/core/output";
// import { useTheme } from "@/core/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaskedView from "@react-native-masked-view/masked-view";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const CONTENT_WIDTH = 280;

// flow is:
// opens the app -> a fade in animation hardcoded to exactly 4 seconds, then its checked if a profile exists, if it doenst onFinishLoading(false) is called, basically maybe redirecting to another screen for making one lets say
// this loading lasts at least 4 seconds because of the set timer (again hardcoded) and the loading doesnt visualize real loading time but 4 seconds.
// after the timer stops the result depending if the user exists is send
// the function returns the components of the design of the page 



function MainMorseScreen() {
  const accountType = "blind";
  type Phase = "idle" | "receiving" | "done";
  const { colors } = useTheme();

  const [phase, setPhase] = useState<Phase>("idle");
  const [timesPressed, setTimesPressed] = useState<number>(0);
  const pressStartRef = useRef<number | null>(null);
  const lastPressRef = useRef<number | null>(null);
  const [morseMessage, setMorseMessage] = useState<string>("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  let [translatedMorse, setTranslatedMorse] = useState<string | null>(null);

  useEffect(() => {
    if (phase === "done") {
      try {
        const result = translateFromMorse(morseMessage);
        setTranslatedMorse(result);

        displayMessageVibrationsSpeech(
          "Край на въвеждането на морзов код. Вие казахте: ",
          accountType,
        );
        displayMessageVibrationsSpeech(result, accountType);
      } catch (error) {
        let message: string;

        if (error instanceof Error) {
          message = error.message;
        } else {
          message = String(error);
        }

        message = message.replace("-", "тире");
        message = message.replace(".", "точка");

        displayMessageVibrationsSpeech(message, accountType);
      }

      displayMessageVibrationsSpeech(
        "За да започнете да въвеждате ново съобщение, натиснете два пъти на екрана",
        accountType,
      );
    } else if (phase === "idle") {
      displayMessageVibrationsSpeech(
        "Натиснете два пъти на екрана, за да започнете да въвеждате морзов код.",
        accountType,
      );
    }
  }, [phase]);

  useEffect(() => {
    if (timesPressed == 2) {
      displayMessageVibrationsSpeech(
        "Вече можете да започнете да въвеждате морзов код на екрана",
        accountType,
      );
      setMorseMessage("");
      setPhase("receiving");
      setTimesPressed(0);
      lastPressRef.current = null;
      setTranslatedMorse(null);
    }
  }, [timesPressed]);

  const onPressIn = () => {
    Vibration.vibrate([0, 400, 0, 400, 0, 400, 0, 400]);

    if (lastPressRef.current !== null) {
      const timePause = Date.now() - lastPressRef.current;

      if (timePause > 250 && timePause <= 1000) {
        setMorseMessage((prev) => prev + " ");
      } else if (timePause > 1000) {
        setMorseMessage((prev) => prev + " / ");
      }
    }
    pressStartRef.current = Date.now();
  };

  const onPressOut = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    Vibration.cancel();

    const now = Date.now();
    const duration = now - (pressStartRef.current as number);

    if (duration <= 200) {
      setMorseMessage((prev) => prev + ".");
    } else {
      setMorseMessage((prev) => prev + "-");
    }

    silenceTimerRef.current = setTimeout(() => {
      setPhase("done");
    }, 5000);

    lastPressRef.current = Date.now();
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={() => {
        phase === "idle" || phase === "done"
          ? setTimesPressed((prev) => prev + 1)
          : null;
      }}
      onPressIn={() => (phase === "receiving" ? onPressIn() : null)}
      onPressOut={() => (phase === "receiving" ? onPressOut() : null)}
    >
      <View
        style={[styles.upperHalf, { borderBottomColor: colors.borderBottom }]}
      >
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.infoBoxBg,
              borderColor: colors.borderColor,
            },
          ]}
        >
          <Text style={[styles.labelText, { color: colors.text }]}>
            Морз: {morseMessage || "..."}
          </Text>
          <Text style={[styles.labelText, { color: colors.text }]}>
            Превод:{" "}
            {phase === "done" && translatedMorse !== null
              ? translatedMorse
              : "..."}
          </Text>
        </View>
      </View>
      <View style={styles.lowerHalf} />
    </Pressable>
  );
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const handleLoadingFinish = (profileExists: boolean) => {
    setHasProfile(profileExists);
    setIsLoading(false);
  };

  if (isLoading) {
    return <SplashScreenView onFinishLoading={handleLoadingFinish} />;
  }

  return <MainMorseScreen />;
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF6EE",
    justifyContent: "center",
    alignItems: "center",
  },
  maskedView: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
  },
  maskContainer: {
    backgroundColor: "transparent",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    width: 160,
    height: 160,
    tintColor: "black",
  },
  connectText: {
    fontSize: 46,
    fontWeight: "900",
    color: "black",
    letterSpacing: 5,
    textAlign: "center",
  },
  backgroundFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  activeFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: CONTENT_WIDTH,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  upperHalf: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    borderBottomWidth: 3,
  },
  lowerHalf: {
    width: "100%",
    height: "50%",
  },
  infoBox: {
    padding: 20,
    borderWidth: 1.5,
    width: "100%",
    borderRadius: 8,
  },
  labelText: {
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "left",
  },
});