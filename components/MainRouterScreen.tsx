import { displayMessageVibrationsSpeech } from "@/core/output";
import { checkUser } from "@/storage/profile";
import { theme } from "@/themes/colors";
import { CommunicationChannel } from "@/types/output";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BG = "#F2EBE0";
const BTN = "#1D3557";
const DIVIDER_COLOR = "#000";
// How far below the top edge the content of the top half starts (clears the camera notch)
const NOTCH_OFFSET = 60;

type FlowPhase =
  | "selection"
  | "simple-chat"
  | "profile-chat"
  | "history"
  | "user2-reply";

interface MessageLog {
  id: string;
  sender: "user1" | "user2";
  text: string;
  timestamp: number;
  isVoice: boolean;
}

export default function MainRouterScreen() {
  const [phase, setPhase] = useState<FlowPhase>("selection");

  // ---- Message storage ----
  // messagesRef is the authoritative list; always mutated synchronously before
  // any setPhase call so the history screen ALWAYS reads the final list.
  // renderTick is a plain counter whose only job is to re-render when the ref changes.
  const messagesRef = useRef<MessageLog[]>([]);
  const [renderTick, setRenderTick] = useState(0);
  const forceUpdate = () => setRenderTick((t) => t + 1);

  // ---- Turn cycling: user1 goes first, then user2, then user1, … ----
  // 'user1' means it is currently User 1's turn.
  const [currentTurn, setCurrentTurn] = useState<"user1" | "user2">("user1");

  const [textInputVal, setTextInputVal] = useState<string>("");
  const [user1TextInputVal, setUser1TextInputVal] = useState<string>("");

  // ---- Recording state via ref to avoid stale closures ----
  const isRecordingRef = useRef<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const [userDisabilities, setUserDisabilities] = useState<string[]>([]);
  const [isSyncingProfile, setIsSyncingProfile] = useState<boolean>(true);
  const [activeChatMode, setActiveChatMode] = useState<"simple" | "profile">(
    "simple",
  );

  const speakScreenLayout = (textToSay: string) => {
    console.log("=== AUDIO ANNOUNCEMENT ===:", textToSay);
    const assignedChannel: CommunicationChannel = "text-speech";
    try {
      displayMessageVibrationsSpeech(textToSay, assignedChannel);
    } catch (e) {
      console.log("Audio Output Driver Log:", e);
    }
  };

  // ==========================================
  // PROFILE SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    const fetchRegisteredProfileContext = async () => {
      try {
        const savedProfile = await checkUser();
        if (savedProfile) {
          const parsedDisabilities = Array.isArray(savedProfile)
            ? savedProfile
            : savedProfile.disabilities
              ? Array.from(savedProfile.disabilities)
              : [String(savedProfile)];
          setUserDisabilities(parsedDisabilities as string[]);
        } else {
          setUserDisabilities(["blind"]);
        }
      } catch (error) {
        console.error("Error reading profile registry payload:", error);
        setUserDisabilities(["blind"]);
      } finally {
        setIsSyncingProfile(false);
      }
    };
    fetchRegisteredProfileContext();
  }, []);

  const isUserBlind =
    userDisabilities.includes("blind") || userDisabilities.length === 0;
  const isUserDeaf = userDisabilities.includes("deaf");
  const isUserMute =
    userDisabilities.includes("mute") ||
    userDisabilities.includes("non-verbal");
  const isSevereIntersectionWIP = isUserBlind && isUserDeaf && isUserMute;

  // ==========================================
  // VOICE NAVIGATION ANNOUNCEMENTS
  // ==========================================
  useEffect(() => {
    if (isSyncingProfile) return;
    if (phase === "selection") {
      speakScreenLayout(
        "Главно меню за избор. Натиснете горната половина за обикновен диалог. Натиснете долната половина за профилен диалог.",
      );
    } else if (phase === "simple-chat") {
      speakScreenLayout(
        "Обикновен диалог за първи потребител. Горната половина е за въвеждане на текст. Долната половина е за гласов запис.",
      );
    } else if (phase === "profile-chat") {
      if (isSevereIntersectionWIP) {
        speakScreenLayout(
          "Профилен диалог. Функцията се разработва. Натиснете центъра за връщане назад.",
        );
      } else if (isUserBlind) {
        speakScreenLayout(
          "Профилен диалог за незрящи. Горната половина показва състоянието на записа. Долната половина е огромен бутон за гласов запис.",
        );
      } else {
        speakScreenLayout(
          "Профилен диалог. Натиснете центъра на екрана за изпращане на данни.",
        );
      }
    } else if (phase === "history") {
      speakScreenLayout(
        "Екран История. Горната половина показва съобщенията. Долната половина съдържа бутон за отговор.",
      );
    } else if (phase === "user2-reply") {
      speakScreenLayout(
        "Екран за отговор на втори потребител. Горната половина е за текст. Долната половина е за глас.",
      );
    }
  }, [phase, isSyncingProfile, isSevereIntersectionWIP, isUserBlind]);

  // ==========================================
  // COMMIT MESSAGE HELPER
  // Writes synchronously to the ref, then forces a re-render, then switches phase.
  // The history screen reads messagesRef.current directly so it always has the
  // complete list, regardless of React's batching order.
  // ==========================================
  const commitMessage = (
    sender: "user1" | "user2",
    text: string,
    isVoice: boolean,
  ) => {
    const newMessage: MessageLog = {
      id: Math.random().toString(36).substring(7),
      sender,
      text,
      timestamp: Date.now(),
      isVoice,
    };
    messagesRef.current = [...messagesRef.current, newMessage];
    // Flip the turn: after user1 sends → user2's turn; after user2 sends → user1's turn
    setCurrentTurn(sender === "user1" ? "user2" : "user1");
    forceUpdate();
    speakScreenLayout("Съобщението е запазено.");
    setPhase("history");
  };

  // ==========================================
  // VOICE RECORDING CONTROLLER
  // Reads/writes isRecordingRef so there is never a stale closure.
  // ==========================================
  const toggleVoiceRecording = (sender: "user1" | "user2") => {
    if (!isRecordingRef.current) {
      isRecordingRef.current = true;
      setIsRecording(true);
      speakScreenLayout("Записът започна. Говорете сега.");
    } else {
      isRecordingRef.current = false;
      setIsRecording(false);

      const timestamp = new Date().toLocaleTimeString("bg-BG", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const senderLabel = sender === "user1" ? "Потребител 1" : "Потребител 2";
      const transcribedText = `Гласово съобщение - ${senderLabel}, ${timestamp}`;

      commitMessage(sender, transcribedText, true);
    }
  };

  // ==========================================
  // TEXT MESSAGE HANDLER
  // ==========================================
  const handleConfirmMessage = (sender: "user1" | "user2", content: string) => {
    if (!content.trim()) return;
    commitMessage(sender, content, false);
  };

  // ==========================================
  // MODE SWITCH — resets everything when changing modes
  // ==========================================
  const switchToMode = (mode: "simple" | "profile") => {
    if (mode !== activeChatMode) {
      messagesRef.current = [];
      forceUpdate();
      isRecordingRef.current = false;
      setIsRecording(false);
      setUser1TextInputVal("");
      setTextInputVal("");
      setCurrentTurn("user1");
    }
    setActiveChatMode(mode);
    setPhase(mode === "simple" ? "simple-chat" : "profile-chat");
  };

  // ==========================================
  // Which phase to go to when "Отговор" is pressed in history.
  // Depends on whose turn it is.
  // ==========================================
  const goToCurrentTurnInput = () => {
    if (currentTurn === "user1") {
      setPhase(activeChatMode === "simple" ? "simple-chat" : "profile-chat");
    } else {
      setPhase("user2-reply");
    }
  };

  if (isSyncingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // ==========================================
  // PHASE 1: SELECTION
  // ==========================================
  if (phase === "selection") {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.halfSelection, { backgroundColor: BG }]}
          onPress={() => switchToMode("simple")}
        >
          <Text style={styles.selectionTitle}>Обикновен диалог</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.halfSelection, { backgroundColor: BG }]}
          onPress={() => switchToMode("profile")}
        >
          <Text style={styles.selectionTitle}>Профилен диалог</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================
  // PHASE 2: SIMPLE CHAT (User 1 turn)
  // TOP half — text input + send button (pushed below notch)
  // BOTTOM half — voice button
  // ==========================================
  if (phase === "simple-chat") {
    return (
      <View style={styles.container}>
        {/* TOP HALF — paddingTop pushes content below the camera */}
        <View
          style={[
            styles.half,
            {
              backgroundColor: BG,
              paddingTop: NOTCH_OFFSET,
              paddingHorizontal: 15,
            },
          ]}
        >
          <Text style={styles.halfLabel}>
            Въвеждане на Текст (Потребител 1)
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder="Напишете съобщение..."
            placeholderTextColor={theme.brand}
            value={user1TextInputVal}
            onChangeText={setUser1TextInputVal}
          />
          <TouchableOpacity
            style={[styles.halfButton, { backgroundColor: BTN }]}
            onPress={() => {
              handleConfirmMessage("user1", user1TextInputVal);
              setUser1TextInputVal("");
            }}
          >
            <Text style={styles.halfButtonText}>Изпрати текст</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* BOTTOM HALF */}
        <View
          style={[
            styles.half,
            { backgroundColor: BG, paddingTop: 20, paddingHorizontal: 15 },
          ]}
        >
          <Text style={styles.halfLabel}>Въвеждане на Глас (Потребител 1)</Text>
          <TouchableOpacity
            style={[
              styles.halfButton,
              { backgroundColor: isRecording ? "#E63946" : BTN },
            ]}
            onPress={() => toggleVoiceRecording("user1")}
          >
            <Text style={styles.halfButtonText}>
              {isRecording ? "Спри и изпрати" : "Започни запис на глас"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => setPhase("selection")}
          >
            <Text style={styles.backLinkText}>Назад към главното меню</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // PHASE 3: PROFILE CHAT (User 1)
  // ==========================================
  if (phase === "profile-chat") {
    if (isSevereIntersectionWIP) {
      return (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center", padding: 20 },
          ]}
        >
          <Text style={styles.wipText}>
            Функцията се разработва за този профил.
          </Text>
          <TouchableOpacity
            style={[styles.halfButton, { backgroundColor: BTN, marginTop: 20 }]}
            onPress={() => setPhase("selection")}
          >
            <Text style={styles.halfButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isUserBlind) {
      return (
        <View style={styles.container}>
          <View
            style={[
              styles.half,
              {
                backgroundColor: isRecording ? "#E63946" : BG,
                justifyContent: "center",
                alignItems: "center",
                paddingTop: NOTCH_OFFSET,
              },
            ]}
          >
            <Text style={styles.halfLabel}>
              {isRecording
                ? "Записът е активен..."
                : "Гласов режим (Потребител 1)"}
            </Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[
              styles.half,
              {
                backgroundColor: isRecording ? "#C32F3A" : BTN,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            onPress={() => toggleVoiceRecording("user1")}
          >
            <Text style={styles.halfButtonText}>
              {isRecording
                ? "Натиснете за КРАЙ и ИЗПРАЩАНЕ"
                : "Натиснете за СТАРТ на запис"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={[styles.halfLabel, { marginBottom: 20 }]}>
          Самостоятелен екран (Потребител 1)
        </Text>
        <TouchableOpacity
          style={[styles.halfButton, { backgroundColor: BTN }]}
          onPress={() =>
            handleConfirmMessage("user1", "Потребител 1 текстови данни")
          }
        >
          <Text style={styles.halfButtonText}>Изпрати данни</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================
  // PHASE 4: HISTORY
  // Reads messagesRef.current directly — always up to date even right after a commit.
  // TOP half — scrollable message log
  // BOTTOM half — "reply" button (goes to whoever's turn it is) + back to menu
  // ==========================================
  if (phase === "history") {
    const displayMessages = messagesRef.current;
    const turnLabel = currentTurn === "user1" ? "Потребител 1" : "Потребител 2";

    return (
      <View style={styles.container}>
        {/* TOP HALF: message list — pushed below notch */}
        <View
          style={[
            styles.half,
            {
              backgroundColor: BG,
              paddingTop: NOTCH_OFFSET,
              paddingHorizontal: 12,
            },
          ]}
        >
          <Text style={[styles.halfLabel, { marginBottom: 8 }]}>
            История на диалога
          </Text>
          <ScrollView
            style={styles.historyBox}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {displayMessages.length === 0 ? (
              <Text style={styles.logText}>Няма записани съобщения.</Text>
            ) : (
              displayMessages.map((msg) => (
                <View key={msg.id} style={styles.messageRow}>
                  <Text style={styles.messageSender}>
                    {msg.sender === "user1" ? "Потр. 1" : "Потр. 2"}
                    {msg.isVoice ? " (глас)" : " (текст)"}:
                  </Text>
                  <Text style={styles.logText}>{msg.text}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* BOTTOM HALF: actions */}
        <View
          style={[
            styles.half,
            {
              backgroundColor: BG,
              paddingTop: 20,
              paddingHorizontal: 15,
              justifyContent: "flex-start",
            },
          ]}
        >
          <Text style={[styles.halfLabel, { marginBottom: 12 }]}>
            Ред на: {turnLabel}
          </Text>
          <TouchableOpacity
            style={[styles.halfButton, { backgroundColor: BTN }]}
            onPress={goToCurrentTurnInput}
          >
            <Text style={styles.halfButtonText}>
              Въведи отговор ({turnLabel})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backLink, { marginTop: 14 }]}
            onPress={() => setPhase("selection")}
          >
            <Text style={styles.backLinkText}>Главно меню</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // PHASE 5: USER 2 REPLY
  // TOP half — text input + send button (pushed below notch)
  // BOTTOM half — voice button
  // ==========================================
  if (phase === "user2-reply") {
    return (
      <View style={styles.container}>
        {/* TOP HALF */}
        <View
          style={[
            styles.half,
            {
              backgroundColor: BG,
              paddingTop: NOTCH_OFFSET,
              paddingHorizontal: 15,
            },
          ]}
        >
          <Text style={styles.halfLabel}>
            Въвеждане на Текст (Потребител 2)
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder="Напишете отговор..."
            placeholderTextColor={theme.brand}
            value={textInputVal}
            onChangeText={setTextInputVal}
          />
          <TouchableOpacity
            style={[styles.halfButton, { backgroundColor: BTN }]}
            onPress={() => {
              handleConfirmMessage("user2", textInputVal);
              setTextInputVal("");
            }}
          >
            <Text style={styles.halfButtonText}>Изпрати текст</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* BOTTOM HALF */}
        <View
          style={[
            styles.half,
            { backgroundColor: BG, paddingTop: 20, paddingHorizontal: 15 },
          ]}
        >
          <Text style={styles.halfLabel}>Въвеждане на Глас (Потребител 2)</Text>
          <TouchableOpacity
            style={[
              styles.halfButton,
              { backgroundColor: isRecording ? "#E63946" : BTN },
            ]}
            onPress={() => toggleVoiceRecording("user2")}
          >
            <Text style={styles.halfButtonText}>
              {isRecording ? "Спри и изпрати" : "Започни запис на глас"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => setPhase("history")}
          >
            <Text style={styles.backLinkText}>Назад към хронологията</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG,
  },
  divider: {
    width: "100%",
    height: 3,
    backgroundColor: DIVIDER_COLOR,
  },
  halfSelection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  selectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#5B8FA8",
    textAlign: "center",
  },
  half: {
    width: "100%",
    height: "50%",
    alignItems: "center",
  },
  halfLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.brand,
    textAlign: "center",
    marginBottom: 8,
  },
  halfButton: {
    width: "95%",
    height: "50%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  halfButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  backLink: {
    marginTop: 10,
  },
  backLinkText: {
    color: theme.brand,
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  wipText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
  inputField: {
    width: "95%",
    backgroundColor: "rgba(165, 109, 109, 0.15)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#3153a3",
    borderWidth: 1,
    borderColor: "rgba(69, 47, 47, 0.4)",
    marginBottom: 8,
  },
  historyBox: {
    width: "95%",
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 6,
    padding: 10,
  },
  messageRow: {
    marginVertical: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#FFF",
    paddingLeft: 8,
  },
  messageSender: {
    color: "#1D3557",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
    opacity: 0.8,
  },
  logText: {
    color: "#1D3557",
    fontSize: 15,
  },
});
