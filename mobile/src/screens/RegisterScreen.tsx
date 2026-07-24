import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import api from "../services/api";

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

      Alert.alert("Success", "Account created. Please log in.");
      router.replace("/login");

    } catch (error) {

      Alert.alert("Error", "Could not create account. Try a different username.");

    } finally {

      setLoading(false);

    }

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Create account</Text>

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
          title="REGISTER"
          onPress={register}
          disabled={!username || !password}
        />
      )}

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
    fontSize: 24,
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

});
