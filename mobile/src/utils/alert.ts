import { Alert, Platform } from "react-native";

export function notify(title: string, message: string) {
  if (Platform.OS === "web") {
    // react-native-web's Alert.alert() is a no-op, so fall back to window.alert
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}
