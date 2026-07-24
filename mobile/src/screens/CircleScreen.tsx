import { useCallback, useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import api from "../services/api";

type Member = {
  id: number;
  username: string;
  position: number;
  has_been_paid: boolean;
};

type Contribution = {
  id: number;
  username: string;
  amount: number;
  penalty: number;
  is_late: boolean;
};

type Round = {
  id: number;
  status: "OPEN" | "PENDING" | "CLOSED";
  contribution_amount: number;
  penalty_rate: number;
  deadline: string;
  final_payout_amount: number;
  payout_member: string;
  contributions: Contribution[];
};

type CircleDetail = {
  id: number;
  name: string;
  invite_code: string;
  member_count: number;
  admin: string;
  members: Member[];
  rounds: Round[];
};

export default function CircleScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();

  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyRoundId, setBusyRoundId] = useState<number | null>(null);

  const load = async () => {
    try {
      const [circleResponse, storedUsername] = await Promise.all([
        api.get(`circles/${id}/`),
        AsyncStorage.getItem("username"),
      ]);

      setCircle(circleResponse.data);
      setUsername(storedUsername);
    } catch (error) {
      Alert.alert("Error", "Could not load this circle");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const contribute = async (round: Round) => {
    setBusyRoundId(round.id);
    try {
      const response = await api.post(`rounds/${round.id}/contribute/`);
      Alert.alert("Contributed", `Paid ${response.data.total}`);
      await load();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error ?? "Could not contribute");
    } finally {
      setBusyRoundId(null);
    }
  };

  const approve = async (round: Round) => {
    setBusyRoundId(round.id);
    try {
      const response = await api.post(`rounds/${round.id}/approve/`);
      Alert.alert("Approved", `Final payout: ${response.data.final_payout}`);
      await load();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error ?? "Could not approve round");
    } finally {
      setBusyRoundId(null);
    }
  };

  if (loading || !circle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const isAdmin = circle.admin === username;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

      <Text style={styles.title}>{circle.name}</Text>
      <Text style={styles.subtitle}>Invite code: {circle.invite_code}</Text>

      <Text style={styles.sectionTitle}>Members</Text>
      {circle.members.map((member) => (
        <View key={member.id} style={styles.memberRow}>
          <Text style={styles.memberName}>
            {member.position}. {member.username}
            {member.username === circle.admin ? " (admin)" : ""}
          </Text>
          <Text style={member.has_been_paid ? styles.paid : styles.unpaid}>
            {member.has_been_paid ? "Paid out" : "Not paid yet"}
          </Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Rounds</Text>
      {circle.rounds.length === 0 && (
        <Text style={styles.empty}>No rounds yet.</Text>
      )}
      {circle.rounds.map((round) => {
        const isPayoutMember = round.payout_member === username;
        const alreadyContributed = round.contributions.some(
          (contribution) => contribution.username === username
        );
        const busy = busyRoundId === round.id;

        return (
          <View key={round.id} style={styles.roundCard}>
            <Text style={styles.roundHeader}>
              Round {round.id} · {round.status}
            </Text>
            <Text>Payout to: {round.payout_member}</Text>
            <Text>Amount: {round.contribution_amount}</Text>
            <Text>Deadline: {new Date(round.deadline).toLocaleString()}</Text>
            <Text>
              Contributions: {round.contributions.length}/{circle.member_count - 1}
            </Text>

            {round.status === "OPEN" && !isPayoutMember && !alreadyContributed && (
              <Pressable
                style={styles.actionButton}
                disabled={busy}
                onPress={() => contribute(round)}>
                <Text style={styles.actionButtonText}>
                  {busy ? "Contributing..." : "Contribute"}
                </Text>
              </Pressable>
            )}

            {round.status === "OPEN" && alreadyContributed && (
              <Text style={styles.paid}>You&apos;ve contributed to this round</Text>
            )}

            {isAdmin && round.status === "OPEN" && (
              <Pressable
                style={[styles.actionButton, styles.approveButton]}
                disabled={busy}
                onPress={() => approve(round)}>
                <Text style={styles.actionButtonText}>
                  {busy ? "Approving..." : "Approve round"}
                </Text>
              </Pressable>
            )}

            {round.status === "CLOSED" && (
              <Text style={styles.closed}>
                Closed · paid out {round.final_payout_amount}
              </Text>
            )}
          </View>
        );
      })}

    </ScrollView>
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

  title: {
    fontSize: 26,
    fontWeight: "600",
  },

  subtitle: {
    color: "#666",
    marginTop: 4,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
  },

  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },

  memberName: {
    fontSize: 15,
  },

  paid: {
    color: "#2e7d32",
  },

  unpaid: {
    color: "#999",
  },

  empty: {
    color: "#666",
  },

  roundCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    gap: 4,
  },

  roundHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  actionButton: {
    backgroundColor: "#208AEF",
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },

  approveButton: {
    backgroundColor: "#2e7d32",
  },

  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  closed: {
    color: "#666",
    marginTop: 8,
  },

});
