import { colors } from "@/constants/theme";
import clsx from "clsx";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const AuthField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  invalid,
  secureTextEntry,
  keyboardType,
  autoComplete,
  textContentType,
  editable = true,
}: AuthFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="auth-field">
      <View className="flex-row items-center justify-between">
        <Text className="auth-label">{label}</Text>
        {secureTextEntry && (
          <Pressable onPress={() => setIsVisible((prev) => !prev)}>
            <Text className="auth-link">{isVisible ? "Hide" : "Show"}</Text>
          </Pressable>
        )}
      </View>
      <TextInput
        className={clsx("auth-input", (error || invalid) && "auth-input-error")}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={secureTextEntry && !isVisible}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        textContentType={textContentType}
        editable={editable}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
};

export default AuthField;
