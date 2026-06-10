import { LONG_PRESS_MIN_LENGTH_MS } from "@/config";
import { speak, stopVibrationsSpeech } from "@/core/output";
import { registerUser } from "@/storage/profile";
import { theme } from "@/themes/colors";
import { Disability } from "@/types/profile";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    AccessibilityInfo,
    BackHandler,
    Pressable,
    StyleSheet,
    Text,
    Vibration,
} from "react-native";

interface Stage {
  phase: RegisterPhase;
  disability: Disability;
  bulgarian: string;
}

const STAGES: Stage[] = [
  // this keeps the order of the queries for disabilities
  { phase: "blind-prompt", disability: "blind", bulgarian: "не виждате" },
  { phase: "deaf-prompt", disability: "deaf", bulgarian: "не чувате" },
  {
    phase: "non-verbal-prompt",
    disability: "non-verbal",
    bulgarian: "не говорите",
  },
];
const FALLBACK_PER_SCREEN_TIME_MS = 6000;

type Phase = "unmounted" | "registering" | "confirming";
type RegisterPhase =
  | "unmounted"
  | "blind-prompt"
  | "non-verbal-prompt"
  | "deaf-prompt";

export default function RegisterForm({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("unmounted");
  const [registerPhase, setRegisterPhase] =
    useState<RegisterPhase>("unmounted");

  const timesPressedRef = useRef(0);
  const disabilitiesRef = useRef<Disability[]>([]);
  const unmountedReasonRef = useRef<string | null>(null); // signalizes if this process is an the first time or if it is repeating
  const recommendedTimeoutMsRef = useRef<number | null>(null);

  const [screenText, setScreenText] = useState<string>();

  const rejectConfirmation = () => {
    unmountedReasonRef.current = "Не потвърдихте вашите увреждания.";
    setPhase("unmounted");
    setRegisterPhase("unmounted");
    disabilitiesRef.current = [];
  };

  useEffect(() => {
    AccessibilityInfo.getRecommendedTimeoutMillis(
      FALLBACK_PER_SCREEN_TIME_MS,
    ).then((value) => {
      recommendedTimeoutMsRef.current = value;
    });
  }, []);

  const goBack = useCallback((): boolean => { // this functionality is for SR users only
    switch (phase) {
      case "confirming":
        rejectConfirmation();
        return true; // we handled it

      case "registering":
        // undo the last answer, step one prompt back
        const order = STAGES.map((s) => s.phase);

        const i = order.indexOf(registerPhase);
        disabilitiesRef.current = disabilitiesRef.current.slice(0, -1);
        if (i <= 0) {
          setPhase("unmounted");
          setRegisterPhase("unmounted");
        } else setRegisterPhase(order[i - 1]);

        return true;

      default:
        return false; // unmounted: let the OS do its normal back (leave the screen)
    }
  }, [phase, registerPhase]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", goBack);
    return () => sub.remove();
  }, [goBack]);

  // v1: only probe-confirmed (sighted/hearing) users reach registration; deafblind get the holding state and a dedicated v2 flow.
  const announce = useCallback((message: string) => {
    Speech.stop(); // cut off anything mid-flight
    setScreenText(message);
    speak(message);
  }, []);

  useEffect(() => {
    switch (phase) {
      case "unmounted":
        unmountedReasonRef.current === null
          ? announce(
              "За да започнете регистрацията си натиснете два пъти на екрана",
            )
          : announce(
              `${unmountedReasonRef.current}\n За да опитате отново натиснете два пъти на екрана`,
            );

        unmountedReasonRef.current = null;
        break;
      case "registering":
        setRegisterPhase("blind-prompt");
        break;
      case "confirming":
        let msg: string;

        if (disabilitiesRef.current.length === 0) {
          msg = "нямате увреждания";
        } else if (disabilitiesRef.current.length > 2) {
          const wordsBg = disabilitiesRef.current.map(
            (x) => STAGES.find((v) => v.disability === x)?.bulgarian,
          );
          msg = `${wordsBg.slice(0, -1).join(", ")} и ${wordsBg.at(-1)}`;
        } else {
          msg = disabilitiesRef.current
            .map((x) => STAGES.find((v) => v.disability === x)?.bulgarian)
            .join(" и ");
        }

        announce(
          `За да потвърдите, че ${msg}, задръжте на екрана. За да опитате отново натиснете два пъти на екрана.`,
        );
    }
  }, [phase]);

  function promptHelper(
    disability: string,
    registerPhase?: RegisterPhase,
    phase?: Phase,
  ) {
    announce(`Натиснете веднъж на екрана, ако ${disability}`);

    return setTimeout(() => {
      if (registerPhase) setRegisterPhase(registerPhase);
      if (phase) setPhase(phase);
    }, recommendedTimeoutMsRef.current || FALLBACK_PER_SCREEN_TIME_MS);
  }

  useEffect(() => {
    if (registerPhase !== "unmounted") {
      const stage = STAGES.find((s) => s.phase === registerPhase) as Stage;
      let result = determineNextPhase(stage);

      const timerId = promptHelper(
        stage.bulgarian,
        result.nextRegisterPhase,
        result.nextPhase,
      );
      return () => {
        clearTimeout(timerId);
      };
    }
  }, [registerPhase]);

  function selectDisabilityHelper(
    disability: Disability,
    registerPhase?: RegisterPhase,
    phase?: Phase,
  ) {
    disabilitiesRef.current = [...disabilitiesRef.current, disability];

    if (registerPhase) setRegisterPhase(registerPhase);
    if (phase) setPhase(phase);
  }

  const determineNextPhase = (stage: Stage) => {
    const i = STAGES.indexOf(stage);
    const isLast = i === STAGES.length - 1;

    return {
      nextRegisterPhase: isLast ? undefined : STAGES[i + 1].phase,
      nextPhase: isLast ? ("confirming" as const) : undefined,
    };
  };

  const handlePress = () => {
    switch (phase) {
      case "unmounted":
        if (++timesPressedRef.current >= 2) {
          timesPressedRef.current = 0;
          startFlow();
        }
        break;
      case "registering":
        timesPressedRef.current = 0;
        selectDisability(); // single tap selects
        break;
      case "confirming":
        if (++timesPressedRef.current >= 2) {
          timesPressedRef.current = 0;
          rejectConfirmation();
        }
        break;
    }
  };

  const confirmRegister = () => {
    Vibration.cancel(); // cancel the activated vibration to signalize the user has confirmed his register and confirm registration

    const register = async () => {
      const result = await registerUser({
        disabilities: disabilitiesRef.current,
      });

      if (result) {
        onRegister();
      } else {
        announce("Възникна грешка. Опитай пак.");
        setPhase("unmounted"); // total restart
      }
    };

    register();
  };

  const selectDisability = () => {
    const stage = STAGES.find((s) => s.phase === registerPhase) as Stage;

    let result = determineNextPhase(stage);

    selectDisabilityHelper(
      stage.disability,
      result.nextRegisterPhase,
      result.nextPhase,
    );
  };

  const startFlow = () => {
    setPhase("registering");
    stopVibrationsSpeech();
  };

  // maybe add big BACK button for SR users ? ask others opinion
  return (
    <Pressable
      accessible={true}
      accessibilityLabel={
        phase === "registering"
          ? "Confirm disability"
          : phase === "confirming"
            ? "Confirm registration"
            : "Start registration flow"
      }
      accessibilityRole="button"
      accessibilityActions={[
        {
          name: "activate",
          label:
            phase === "registering"
              ? "start-register-proccess" // either we begin registration flow
              : phase === "confirming"
                ? "confirm-disabilities" // or we confirm the result
                : "select-disability",
        }, // or we select the disability from the flow
        { name: "escape", label: "go-back" },
      ]}
      onAccessibilityAction={(event) => {
        switch (event.nativeEvent.actionName) {
          case "activate":
            switch (phase) {
              case "confirming":
                confirmRegister();
                break;

              case "registering":
                selectDisability();
                break;

              case "unmounted":
                startFlow();
                break;
            }

            break;

          case "escape":
            goBack();
        }
      }}
      style={styles.container}
      onPressIn={() => {
        if (phase === "confirming") Vibration.vibrate([0, 500], true);
        else Vibration.vibrate([0, 100]);
      }}
      onPress={() => {
        handlePress();
      }}
      onLongPress={() => {
        if (phase === "confirming") {
          confirmRegister();
        }
      }}
      onPressOut={() => {
        Vibration.cancel();
      }}
      delayLongPress={LONG_PRESS_MIN_LENGTH_MS}
    >
      <Text style={styles.PromptText}>{screenText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary,
    padding: 20,
  },
  PromptText: {
    maxWidth: "85%",
    color: theme.mainTextColor,
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
  },
});
