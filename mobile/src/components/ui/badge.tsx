import { StyleSheet, Text, View } from "react-native";

import { AppColors, Radius } from "../../constants/theme";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

type BadgeProps = {
  label: string;
  variant?: Variant;
};

const VARIANT_STYLES: Record<Variant, { bg: string; fg: string }> = {
  success: { bg: AppColors.successSoft, fg: AppColors.success },
  warning: { bg: AppColors.warningSoft, fg: AppColors.warning },
  danger: { bg: AppColors.dangerSoft, fg: AppColors.danger },
  info: { bg: AppColors.primarySoft, fg: AppColors.primaryDark },
  neutral: { bg: AppColors.neutralSoft, fg: AppColors.textMuted },
};

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
