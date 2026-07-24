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

import { router } from "expo-router";
import { AppButton } from "../components/ui/button";
import { TextField } from "../components/ui/text-field";
import { AppColors, Radius } from "../constants/theme";
import api from "../services/api";
import { notify } from "../utils/alert";

export default function RegisterScreen() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {

    setLoading(true);

    try {

      await api.post("register/", {
        username,
        password,
      });

      notify("Success", "Account created. Please log in.");
      router.replace("/login");

    } catch (error) {

      notify("Error", "Could not create account. Try a different username.");

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

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join or start a savings circle in minutes</Text>

        <View style={styles.form}>
          <TextField
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextField
            label="Password"
            placeholder="Choose a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <AppButton
            title="Create account"
            onPress={register}
            loading={loading}
            disabled={!username || !password}
          />
        </View>

        <Pressable onPress={() => router.replace("/login")} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextStrong}>Log in</Text>
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
    fontSize: 26,
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

  loginLink: {
    marginTop: 28,
    alignItems: "center",
  },

  loginText: {
    color: AppColors.textMuted,
    fontSize: 14,
  },

  loginTextStrong: {
    color: AppColors.primary,
    fontWeight: "700",
  },

});
