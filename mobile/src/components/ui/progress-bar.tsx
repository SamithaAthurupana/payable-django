import { StyleSheet, View } from "react-native";

import { AppColors, Radius } from "../../constants/theme";

type ProgressBarProps = {
  progress: number;
  color?: string;
};

export function ProgressBar({ progress, color = AppColors.primary }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: AppColors.neutralSoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: Radius.pill,
  },
});
