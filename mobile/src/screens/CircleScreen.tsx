import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Avatar } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { AppButton } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ProgressBar } from "../components/ui/progress-bar";
import { AppColors, Radius } from "../constants/theme";
import api from "../services/api";
import { notify } from "../utils/alert";

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

const STATUS_VARIANT = {
  OPEN: "success",
  PENDING: "warning",
  CLOSED: "neutral",
} as const;

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
      notify("Error", "Could not load this circle");
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
      notify("Contributed", `Paid ${response.data.total}`);
      await load();
    } catch (error: any) {
      notify("Error", error?.response?.data?.error ?? "Could not contribute");
    } finally {
      setBusyRoundId(null);
    }
  };

  const approve = async (round: Round) => {
    setBusyRoundId(round.id);
    try {
      const response = await api.post(`rounds/${round.id}/approve/`);
      notify("Approved", `Final payout: ${response.data.final_payout}`);
      await load();
    } catch (error: any) {
      notify("Error", error?.response?.data?.error ?? "Could not approve round");
    } finally {
      setBusyRoundId(null);
    }
  };

  if (loading || !circle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={AppColors.primary} />
      </View>
    );
  }

  const isAdmin = circle.admin === username;
  const paidCount = circle.members.filter((m) => m.has_been_paid).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppColors.primary} />
      }>

      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Avatar label={circle.name} size={48} />
          <View style={styles.headerText}>
            <Text style={styles.title}>{circle.name}</Text>
            <Text style={styles.subtitle}>{circle.member_count} members</Text>
          </View>
        </View>
        <View style={styles.inviteRow}>
          <Text style={styles.inviteLabel}>Invite code</Text>
          <View style={styles.codeChip}>
            <Text style={styles.codeChipText}>{circle.invite_code}</Text>
          </View>
        </View>
        <View style={styles.payoutProgress}>
          <View style={styles.payoutProgressLabels}>
            <Text style={styles.payoutProgressLabel}>Payout rotation</Text>
            <Text style={styles.payoutProgressValue}>
              {paidCount}/{circle.member_count}
            </Text>
          </View>
          <ProgressBar
            progress={circle.member_count ? paidCount / circle.member_count : 0}
            color={AppColors.secondary}
          />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Members</Text>
      <Card style={styles.membersCard}>
        {circle.members.map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.memberRow,
              index === circle.members.length - 1 && styles.memberRowLast,
            ]}>
            <Avatar label={member.username} size={34} />
            <Text style={styles.memberName}>
              {member.position}. {member.username}
              {member.username === circle.admin ? "  " : ""}
            </Text>
            {member.username === circle.admin && <Badge label="Admin" variant="info" />}
            <View style={styles.memberStatus}>
              <Badge
                label={member.has_been_paid ? "Paid out" : "Not paid yet"}
                variant={member.has_been_paid ? "success" : "neutral"}
              />
            </View>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Rounds</Text>
      {circle.rounds.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.empty}>No rounds yet.</Text>
        </Card>
      )}
      {circle.rounds.map((round) => {
        const isPayoutMember = round.payout_member === username;
        const alreadyContributed = round.contributions.some(
          (contribution) => contribution.username === username
        );
        const busy = busyRoundId === round.id;
        const requiredContributions = Math.max(circle.member_count - 1, 1);
        const progress = round.contributions.length / requiredContributions;

        return (
          <Card key={round.id} style={styles.roundCard}>
            <View style={styles.roundHeaderRow}>
              <Text style={styles.roundHeader}>Round {round.id}</Text>
              <Badge label={round.status} variant={STATUS_VARIANT[round.status]} />
            </View>

            <View style={styles.roundDetailRow}>
              <Text style={styles.roundDetailLabel}>Payout to</Text>
              <Text style={styles.roundDetailValue}>{round.payout_member}</Text>
            </View>
            <View style={styles.roundDetailRow}>
              <Text style={styles.roundDetailLabel}>Amount</Text>
              <Text style={styles.roundDetailValue}>{round.contribution_amount}</Text>
            </View>
            <View style={styles.roundDetailRow}>
              <Text style={styles.roundDetailLabel}>Deadline</Text>
              <Text style={styles.roundDetailValue}>
                {new Date(round.deadline).toLocaleString()}
              </Text>
            </View>

            {round.status !== "CLOSED" && (
              <View style={styles.roundProgress}>
                <View style={styles.payoutProgressLabels}>
                  <Text style={styles.payoutProgressLabel}>Contributions</Text>
                  <Text style={styles.payoutProgressValue}>
                    {round.contributions.length}/{requiredContributions}
                  </Text>
                </View>
                <ProgressBar progress={progress} />
              </View>
            )}

            {round.status === "OPEN" && !isPayoutMember && !alreadyContributed && (
              <View style={styles.actionSpacer}>
                <AppButton
                  title={busy ? "Contributing..." : "Contribute"}
                  loading={busy}
                  onPress={() => contribute(round)}
                />
              </View>
            )}

            {round.status === "OPEN" && alreadyContributed && (
              <View style={styles.actionSpacer}>
                <Badge label="You've contributed to this round" variant="success" />
              </View>
            )}

            {isAdmin && round.status === "OPEN" && (
              <View style={styles.actionSpacer}>
                <AppButton
                  title={busy ? "Approving..." : "Approve round"}
                  variant="success"
                  loading={busy}
                  onPress={() => approve(round)}
                />
              </View>
            )}

            {round.status === "CLOSED" && (
              <View style={styles.actionSpacer}>
                <Badge label={`Closed · paid out ${round.final_payout_amount}`} variant="neutral" />
              </View>
            )}
          </Card>
        );
      })}

    </ScrollView>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
  },

  headerCard: {
    marginBottom: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: AppColors.text,
  },

  subtitle: {
    color: AppColors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },

  inviteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },

  inviteLabel: {
    color: AppColors.textMuted,
    fontSize: 13,
    fontWeight: "600",
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

  payoutProgress: {
    marginTop: 16,
  },

  payoutProgressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  payoutProgressLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: AppColors.textMuted,
  },

  payoutProgressValue: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.text,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.text,
    marginBottom: 10,
  },

  membersCard: {
    padding: 4,
    marginBottom: 20,
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },

  memberRowLast: {
    borderBottomWidth: 0,
  },

  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
    flex: 1,
  },

  memberStatus: {
    marginLeft: "auto",
  },

  emptyCard: {
    marginBottom: 12,
  },

  empty: {
    color: AppColors.textMuted,
  },

  roundCard: {
    marginBottom: 14,
    gap: 2,
  },

  roundHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  roundHeader: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.text,
  },

  roundDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },

  roundDetailLabel: {
    fontSize: 13,
    color: AppColors.textMuted,
  },

  roundDetailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: AppColors.text,
  },

  roundProgress: {
    marginTop: 10,
  },

  actionSpacer: {
    marginTop: 12,
  },

});
