import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { Avatar } from "../components/ui/avatar";
import { AppButton } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { TextField } from "../components/ui/text-field";
import { AppColors, Radius } from "../constants/theme";
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
        <ActivityIndicator color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Circles</Text>
          <Text style={styles.headerSubtitle}>
            {circles.length} active circle{circles.length === 1 ? "" : "s"}
          </Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        data={circles}
        keyExtractor={(item) => String(item.id)}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>👥</Text>
            </View>
            <Text style={styles.empty}>
              You&apos;re not in any circles yet.{"\n"}Create one or join with an invite code.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/circle/${item.id}`)}>
            <Card style={styles.circleCard}>
              <Avatar label={item.name} size={44} />
              <View style={styles.circleInfo}>
                <Text style={styles.circleName}>{item.name}</Text>
                <Text style={styles.circleMeta}>
                  {item.member_count} member{item.member_count === 1 ? "" : "s"}
                </Text>
              </View>
              <View style={styles.codeChip}>
                <Text style={styles.codeChipText}>{item.invite_code}</Text>
              </View>
            </Card>
          </Pressable>
        )}
      />

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Start a new circle</Text>
        <TextField
          placeholder="e.g. Family Savings"
          value={newCircleName}
          onChangeText={setNewCircleName}
        />
        <AppButton
          title="Create circle"
          variant="primary"
          onPress={createCircle}
          disabled={busy || !newCircleName.trim()}
        />
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Join with an invite code</Text>
        <TextField
          placeholder="e.g. AB12CD"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
        />
        <AppButton
          title="Join circle"
          variant="secondary"
          onPress={joinCircle}
          disabled={busy || !inviteCode.trim()}
        />
      </Card>

    </View>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: AppColors.text,
  },

  headerSubtitle: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginTop: 2,
  },

  logoutButton: {
    backgroundColor: AppColors.dangerSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },

  logout: {
    color: AppColors.danger,
    fontWeight: "700",
    fontSize: 13,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 8,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: AppColors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyIconText: {
    fontSize: 28,
  },

  empty: {
    textAlign: "center",
    color: AppColors.textMuted,
    lineHeight: 20,
  },

  circleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  circleInfo: {
    flex: 1,
  },

  circleName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },

  circleMeta: {
    color: AppColors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },

  codeChip: {
    backgroundColor: AppColors.neutralSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },

  codeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.textMuted,
    letterSpacing: 0.5,
  },

  formCard: {
    marginTop: 12,
  },

  formTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 12,
  },

});
