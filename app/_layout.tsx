import "@/global.css";
import { posthog } from "@/lib/posthog";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import {
  PostHogErrorBoundary,
  PostHogProvider,
  type PostHogErrorBoundaryFallbackProps,
  usePostHog,
} from "posthog-react-native";
import { useEffect, useRef } from "react";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function PostHogErrorFallback({
  resetError,
}: PostHogErrorBoundaryFallbackProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6">
      <Text className="text-center text-lg font-semibold text-black">
        Something went wrong
      </Text>
      <Pressable
        className="rounded-full bg-primary px-6 py-3"
        onPress={resetError}
      >
        <Text className="font-semibold text-white">Try again</Text>
      </Pressable>
    </View>
  );
}

function PostHogIdentity({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const client = usePostHog();
  const identifiedUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      identifiedUserId.current = undefined;
      return;
    }

    if (identifiedUserId.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName;

    client.identify(user.id, {
      $set: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [client, user]);

  return <>{children}</>;
}

function PostHogScreenTracker() {
  const pathname = usePathname();
  const client = usePostHog();

  useEffect(() => {
    if (pathname) client.screen(pathname);
  }, [client, pathname]);

  return null;
}

function RootNavigator({ fontLoaded }: { fontLoaded: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (fontLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded, isLoaded]);

  if (!fontLoaded || !isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const navigator = <RootNavigator fontLoaded={fontLoaded} />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog} autocapture={{ captureScreens: false }}>
          <PostHogIdentity>
            <PostHogScreenTracker />
            <PostHogErrorBoundary fallback={PostHogErrorFallback}>
              {navigator}
            </PostHogErrorBoundary>
          </PostHogIdentity>
        </PostHogProvider>
      ) : (
        navigator
      )}
    </ClerkProvider>
  );
}
