import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
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
    <View style={styles.container}>

      <Text style={styles.title}>Payable</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="LOGIN"
          onPress={login}
          disabled={!username || !password}
        />
      )}

      <Pressable onPress={() => router.push("/register")} style={styles.registerLink}>
        <Text style={styles.registerText}>Don&apos;t have an account? Register</Text>
      </Pressable>

    </View>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 6,
  },

  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },

  registerText: {
    color: "#208AEF",
  },

});
