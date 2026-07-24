import { StyleSheet, Text, View } from "react-native";

import { AppColors, Radius } from "../../constants/theme";

type AvatarProps = {
  label: string;
  size?: number;
};

function colorForLabel(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = AppColors.avatarPalette;
  return palette[Math.abs(hash) % palette.length];
}

export function Avatar({ label, size = 40 }: AvatarProps) {
  const initial = label.trim().charAt(0).toUpperCase() || "?";
  const backgroundColor = colorForLabel(label || "?");

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor,
        },
      ]}>
      <Text style={[styles.label, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontWeight: "700",
  },
});
