import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { AppColors, Radius } from "../../constants/theme";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
};

const VARIANT_STYLES: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: AppColors.primary, fg: "#fff" },
  secondary: { bg: AppColors.primarySoft, fg: AppColors.primaryDark },
  success: { bg: AppColors.success, fg: "#fff" },
  danger: { bg: AppColors.dangerSoft, fg: AppColors.danger },
  ghost: { bg: "transparent", fg: AppColors.primary, border: AppColors.border },
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const colors = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.bg,
          borderWidth: colors.border ? 1 : 0,
          borderColor: colors.border,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <Text style={[styles.text, { color: colors.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
});
