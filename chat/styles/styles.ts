import { theme } from "@/themes/colors";
import { StyleSheet } from "react-native";

export const DIVIDER_COLOR = "#000";
// How far below the top edge the content of the top half starts (clears the camera notch)
export const NOTCH_OFFSET = 60;
export const BTN = "#1D3557";
export const BG = "#FFF"; // sorry, forgot what that is!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.primary,
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
    color: theme.primary,
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
    color: theme.mainTextColor,
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
    color: theme.primary,
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  wipText: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
  },
  inputField: {
    width: "95%",
    backgroundColor: "rgba(255, 255, 255, 0)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: "#000000",
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
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
    opacity: 0.8,
  },
  logText: {
    color: "#ffffff",
    fontSize: 15,
  },
});
