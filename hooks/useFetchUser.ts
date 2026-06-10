import { speak } from "@/core/output";
import { checkUser } from "@/storage/profile";
import { Disability } from "@/types/profile";
import { useEffect, useState } from "react";

export function useFetchUser() {
  // ==========================================
  // PROFILE SYNCHRONIZATION
  // ==========================================
  const [userDisabilities, setUserDisabilities] = useState<Disability[] | null>(
    null,
  );
  const [isSyncingProfile, setIsSyncingProfile] = useState<boolean>(true);

  useEffect(() => {
    const fetchRegisteredProfileContext = async () => {
      try {
        const profile = await checkUser();
        setUserDisabilities(profile?.disabilities ?? null);
      } catch (error) {
        console.error("Error reading profile registry payload:", error);
        setUserDisabilities(["blind"]);
        speak("Профилът не можа да се зареди. Активиран е режим за незрящи.");
      } finally {
        setIsSyncingProfile(false);
      }
    };
    fetchRegisteredProfileContext();
  }, []);

  const profileReady = !isSyncingProfile && userDisabilities !== null;
  const isUserBlind = profileReady && userDisabilities?.includes("blind");
  const isUserDeaf = profileReady && userDisabilities?.includes("deaf");
  const isUserMute = profileReady && userDisabilities?.includes("non-verbal");
  const isSevereIntersectionWIP = isUserBlind && isUserDeaf && isUserMute;

  useEffect(() => {
    if (profileReady) return;
    const t = setTimeout(() => {
      // couldn't load in time → assume most accessible UI
      setUserDisabilities((prev) => prev ?? ["blind"]);
      speak("Профилът не можа да се зареди. Активиран е режим за незрящи.");
    }, 8000);
    return () => clearTimeout(t);
  }, [profileReady]);

  return {
    profileReady,
    isUserBlind,
    isUserDeaf,
    isUserMute,
    isSevereIntersectionWIP,
  };
}
