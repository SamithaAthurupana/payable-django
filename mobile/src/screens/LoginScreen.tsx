import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { AppButton } from "../components/ui/button";
import { TextField } from "../components/ui/text-field";
import { AppColors, Radius } from "../constants/theme";
import api from "../services/api";
import { notify } from "../utils/alert";

export default function LoginScreen() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {

    setLoading(true);

    try {

      const response = await api.post("login/", {
        username,
        password,
      });

      await AsyncStorage.setMany({
        token: response.data.access,
        username,
      });

      router.replace("/circles");

    } catch (error) {

      notify("Error", "Invalid username or password");

    } finally {

      setLoading(false);

    }

  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">

        <View style={styles.badge}>
          <Text style={styles.badgeText}>CF</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to keep your circle on track</Text>

        <View style={styles.form}>
          <TextField
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <AppButton
            title="Log in"
            onPress={login}
            loading={loading}
            disabled={!username || !password}
          />
        </View>

        <Pressable onPress={() => router.push("/register")} style={styles.registerLink}>
          <Text style={styles.registerText}>
            Don&apos;t have an account? <Text style={styles.registerTextStrong}>Register</Text>
          </Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({

  flex: {
    flex: 1,
    backgroundColor: AppColors.background,
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  badge: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "center",
  },

  badgeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: AppColors.text,
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: AppColors.textMuted,
    marginTop: 6,
    marginBottom: 32,
  },

  form: {
    gap: 4,
  },

  registerLink: {
    marginTop: 28,
    alignItems: "center",
  },

  registerText: {
    color: AppColors.textMuted,
    fontSize: 14,
  },

  registerTextStrong: {
    color: AppColors.primary,
    fontWeight: "700",
  },

});
