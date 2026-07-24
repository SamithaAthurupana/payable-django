import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import api from "../services/api";
import { notify } from "../utils/alert";

type Circle = {
  id: number;
  name: string;
  invite_code: string;
  member_count: number;
};

export default function CirclesListScreen() {

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newCircleName, setNewCircleName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCircles = async () => {
    try {
      const response = await api.get("circles/");
      setCircles(response.data);
    } catch (error) {
      notify("Error", "Could not load your circles");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadCircles().finally(() => setLoading(false));
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCircles();
    setRefreshing(false);
  };

  const createCircle = async () => {
    if (!newCircleName.trim()) return;

    setBusy(true);
    try {
      await api.post("circles/", { name: newCircleName.trim() });
      setNewCircleName("");
      await loadCircles();
    } catch (error) {
      notify("Error", "Could not create circle");
    } finally {
      setBusy(false);
    }
  };

  const joinCircle = async () => {
    if (!inviteCode.trim()) return;

    setBusy(true);
    try {
      await api.post("join/", { invite_code: inviteCode.trim().toUpperCase() });
      setInviteCode("");
      await loadCircles();
    } catch (error: any) {
      notify("Error", error?.response?.data?.error ?? "Could not join circle");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>My Circles</Text>
        <Pressable onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        data={circles}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            You&apos;re not in any circles yet. Create one or join with an invite code.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.circleRow}
            onPress={() => router.push(`/circle/${item.id}`)}>
            <View>
              <Text style={styles.circleName}>{item.name}</Text>
              <Text style={styles.circleMeta}>
                {item.member_count} member{item.member_count === 1 ? "" : "s"} · code {item.invite_code}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.form}>
        <TextInput
          placeholder="New circle name"
          value={newCircleName}
          onChangeText={setNewCircleName}
          style={styles.input}
        />
        <Button title="Create circle" onPress={createCircle} disabled={busy || !newCircleName.trim()} />
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="Invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          style={styles.input}
        />
        <Button title="Join circle" onPress={joinCircle} disabled={busy || !inviteCode.trim()} />
      </View>

    </View>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
  },

  logout: {
    color: "#c0392b",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#666",
  },

  circleRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },

  circleName: {
    fontSize: 17,
    fontWeight: "500",
  },

  circleMeta: {
    color: "#666",
    marginTop: 2,
  },

  form: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 12,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
  },

});
