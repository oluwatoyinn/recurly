import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import "@/global.css";
import { useSubscriptions } from "@/lib/subscriptions-context";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const [query, setQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const { subscriptions } = useSubscriptions();

  const filteredSubscriptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return subscriptions;
    return subscriptions.filter((subscription) =>
      [subscription.name, subscription.category, subscription.plan]
        .filter((value): value is string => !!value)
        .some((value) => value.toLowerCase().includes(trimmed)),
    );
  }, [query, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 p-5"
      >
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View className="subs-header">
              <View>
                <Text className="subs-title">Subscriptions</Text>
                {/* <Text className="subs-subtitle">
                  {filteredSubscriptions.length} of{" "}
                  {HOME_SUBSCRIPTIONS.length} subscriptions
                </Text> */}
              </View>
              <TextInput
                className="subs-search"
                value={query}
                onChangeText={setQuery}
                placeholder="Search subscriptions..."
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          }
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((current) =>
                  current === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text className="home-empty-state">
              No subscriptions match your search.
            </Text>
          }
          contentContainerClassName="pb-30"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
