import AuthField from "@/components/AuthField";
import "@/global.css";
import { isValidEmail } from "@/lib/utils";
import { useSignIn } from "@clerk/expo";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();

  const isBusy = fetchStatus === "fetching";

  const validate = () => {
    const nextErrors: AuthFieldErrors = {};
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Enter your password.";
    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSignIn = async () => {
    setFormError(undefined);
    if (!validate()) return;

    const { error } = await signIn.password({
      emailAddress: email.trim().toLowerCase(),
      password,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize();
      return;
    }

    setFormError("Additional verification is required for this account.");
  };

  const serverError =
    errors.fields.identifier || errors.fields.password || errors.global?.[0];
  const genericError = serverError
    ? "Invalid email or password."
    : formError;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>
            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to continue managing your subscriptions
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              <AuthField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                error={localErrors.email}
                invalid={!!serverError}
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                editable={!isBusy}
              />
              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                error={localErrors.password}
                invalid={!!serverError}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                editable={!isBusy}
              />

              {genericError ? (
                <Text className="auth-error">{genericError}</Text>
              ) : null}

              <Pressable
                onPress={onSignIn}
                disabled={isBusy}
                className={
                  isBusy ? "auth-button auth-button-disabled" : "auth-button"
                }
              >
                <Text className="auth-button-text">
                  {isBusy ? "Signing in..." : "Sign in"}
                </Text>
              </Pressable>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
