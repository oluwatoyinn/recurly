import AuthField from "@/components/AuthField";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { isValidEmail, validatePassword } from "@/lib/utils";
import { useSignUp } from "@clerk/expo";
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

const fieldMessage = (
  field?: { message: string; longMessage?: string } | null,
) => field?.longMessage || field?.message;

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [localErrors, setLocalErrors] = useState<AuthFieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>();

  const isBusy = fetchStatus === "fetching";

  const validate = () => {
    const nextErrors: AuthFieldErrors = {};
    if (!isValidEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!validatePassword(password))
      nextErrors.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword)
      nextErrors.confirmPassword = "Passwords do not match.";
    setLocalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSignUp = async () => {
    setFormError(undefined);
    if (!validate()) return;

    const { error } = await signUp.password({
      emailAddress: email.trim().toLowerCase(),
      password,
    });
    if (error) return;

    if (signUp.status === "complete") {
      await signUp.finalize();
      posthog?.capture("sign_up_completed", { auth_method: "password" });
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) return;
    setPendingVerification(true);
  };

  const onVerify = async () => {
    setFormError(undefined);
    if (!code) {
      setLocalErrors({ code: "Enter the verification code." });
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return;

    if (signUp.status === "complete") {
      await signUp.finalize();
      posthog?.capture("email_verification_completed", {
        verification_method: "email_code",
      });
      return;
    }

    setFormError("This account needs additional verification.");
  };

  const onResendCode = async () => {
    setFormError(undefined);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) return;
    setFormError("A new code has been sent to your email.");
  };

  const globalError = fieldMessage(errors.global?.[0]) || formError;

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
            <Text className="auth-title">
              {pendingVerification ? "Check your email" : "Create your account"}
            </Text>
            <Text className="auth-subtitle">
              {pendingVerification
                ? `Enter the code we sent to ${email.trim()}`
                : "Start tracking and managing all your subscriptions in one place"}
            </Text>
          </View>

          <View className="auth-card">
            {pendingVerification ? (
              <View className="auth-form">
                <AuthField
                  label="Verification code"
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter 6-digit code"
                  error={
                    localErrors.code || fieldMessage(errors.fields.code)
                  }
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  editable={!isBusy}
                />

                {globalError ? (
                  <Text className="auth-error">{globalError}</Text>
                ) : null}

                <Pressable
                  onPress={onVerify}
                  disabled={isBusy}
                  className={
                    isBusy
                      ? "auth-button auth-button-disabled"
                      : "auth-button"
                  }
                >
                  <Text className="auth-button-text">
                    {isBusy ? "Verifying..." : "Verify email"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onResendCode}
                  disabled={isBusy}
                  className="auth-secondary-button"
                >
                  <Text className="auth-secondary-button-text">
                    Resend code
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <AuthField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  error={
                    localErrors.email ||
                    fieldMessage(errors.fields.emailAddress)
                  }
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isBusy}
                />
                <AuthField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  error={
                    localErrors.password ||
                    fieldMessage(errors.fields.password)
                  }
                  secureTextEntry
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!isBusy}
                />
                <AuthField
                  label="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  error={localErrors.confirmPassword}
                  secureTextEntry
                  autoComplete="password-new"
                  textContentType="newPassword"
                  editable={!isBusy}
                />

                {globalError ? (
                  <Text className="auth-error">{globalError}</Text>
                ) : null}

                <View nativeID="clerk-captcha" />

                <Pressable
                  onPress={onSignUp}
                  disabled={isBusy}
                  className={
                    isBusy
                      ? "auth-button auth-button-disabled"
                      : "auth-button"
                  }
                >
                  <Text className="auth-button-text">
                    {isBusy ? "Creating account..." : "Create account"}
                  </Text>
                </Pressable>
              </View>
            )}

            {!pendingVerification && (
              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in">
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
