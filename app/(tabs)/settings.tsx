import images from "@/constants/images";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { useAuth, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const displayName = user?.fullName || user?.firstName || "Your account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email on file";
  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format("MMMM D, YYYY")
    : "Unknown";

  const completeSignOut = async () => {
    posthog?.capture("sign_out_completed");
    posthog?.reset();
    await signOut();
  };

  const onSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => void completeSignOut(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
        <View className="home-user">
          <Image
            source={
              user?.hasImage && user.imageUrl
                ? { uri: user.imageUrl }
                : images.avatar
            }
            className="home-avatar"
          />
          <Text numberOfLines={1} className="home-user-name">
            {displayName}
          </Text>
        </View>
      </View>

      <View className="list-head">
        <Text className="list-title">Account</Text>
      </View>

      <View className="sub-card bg-card">
        <View className="sub-details">
          <View className="sub-row">
            <View className="sub-row-copy">
              <Text className="sub-label">Email:</Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {email}
              </Text>
            </View>
          </View>
          <View className="sub-row">
            <View className="sub-row-copy">
              <Text className="sub-label">Member since:</Text>
              <Text
                className="sub-value"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {memberSince}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onSignOut}
        className="mt-6 items-center rounded-full bg-destructive py-4"
      >
        <Text className="font-sans-bold text-background">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default Settings;
