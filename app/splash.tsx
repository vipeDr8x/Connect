import { useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

interface SplashProps {
  onFinishLoading?: () => void;
}

const useTheme = () => ({
  colors: {
    background: "#F5E5CC",
    text: "#FFFFFF",
  },
});

export default function SplashScreen({ onFinishLoading }: SplashProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const player = useVideoPlayer(
    require("../assets/images/logo-animation.mp4"),
    (p) => {
      p.loop = false;
      p.play();
    },
  );

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      if (onFinishLoading) {
        onFinishLoading();
      } else {
        router.replace("/");
      }
    });
    return () => subscription.remove();
  }, [player]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5E5CC",
    overflow: "hidden",
  },
  video: {
    width: width * 1.4,
    height: width * 0.8,
    marginLeft: width * 0.12,
  },
});
