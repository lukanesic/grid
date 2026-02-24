import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PREMIUM_FEATURES, UPGRADE_PLANS } from "../../../constants/data";

export default function UpgradeScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("free");

  // COMMENTED OUT FOR MVP - will be used when payment system is ready
  // const handleUpgrade = () => {
  //   // Handle upgrade logic here
  //   router.push("/_menu/subscriptionBilling");
  // };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={20} color="#F2F2F2" />
        </Pressable>
        <Text style={styles.headerTitle}>Planovi i cene</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.proBadge}>
            <Image
              source={require("../../../assets/logo/home-icon.png")}
              style={styles.proBadgeLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Pretplata</Text>
          <Text style={styles.heroSubtitle}>Podignite svoju padel igru</Text>
        </View>

        {/* Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Izaberi plan</Text>
          {UPGRADE_PLANS.map((plan) => (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.id === "premium" && styles.planCardDisabled,
              ]}
              onPress={() => plan.id === "free" && setSelectedPlan(plan.id)}
              disabled={plan.id === "premium"}
            >
              {plan.popular && plan.id === "free" && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>NAJPOPULARNIJE</Text>
                </View>
              )}
              {plan.id === "premium" && (
                <View
                  style={[styles.popularBadge, { backgroundColor: "#3867FF" }]}
                >
                  <Text style={styles.popularText}>USKORO</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text
                    style={[
                      styles.planName,
                      plan.id === "premium" && { color: "#8B8B8B" },
                    ]}
                  >
                    {plan.name}
                  </Text>
                  <Text
                    style={[
                      styles.planPeriod,
                      plan.id === "premium" && { color: "#6B6B6B" },
                    ]}
                  >
                    {plan.period}
                  </Text>
                  <View style={styles.planRadio}>
                    {selectedPlan === plan.id ? (
                      <View style={styles.radioSelected}>
                        <View style={styles.radioInner} />
                      </View>
                    ) : (
                      <View style={styles.radioUnselected} />
                    )}
                  </View>
                </View>
                <View style={styles.planPricing}>
                  <Text
                    style={[
                      styles.planPrice,
                      plan.id === "premium" && { color: "#8B8B8B" },
                    ]}
                  >
                    {plan.price}
                  </Text>
                  {plan.savings && plan.id !== "premium" && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>{plan.savings}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Šta dobijaš (uskoro)</Text>
          <View style={styles.featuresGrid}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <FontAwesome
                    name={feature.icon as any}
                    size={20}
                    color="#B8FF00"
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Šta korisnici kažu</Text>
          <View style={styles.testimonialCard}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome key={star} name="star" size={14} color="#B8FF00" />
              ))}
            </View>
            <Text style={styles.testimonialText}>
              &quot;Od kada koristim Pro verziju, mnogo lakše organizujem mečeve
              i pratim svoj napredak. Najbolja investicija!&quot;
            </Text>
            <Text style={styles.testimonialAuthor}>- Marko P.</Text>
          </View>
          <View style={styles.testimonialCard}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome key={star} name="star" size={14} color="#B8FF00" />
              ))}
            </View>
            <Text style={styles.testimonialText}>
              &quot;Napredna statistika mi je pomogla da poboljšam igru. Vidim
              tačno gde mogu još da radim.&quot;
            </Text>
            <Text style={styles.testimonialAuthor}>- Ana J.</Text>
          </View>
        </View>

        {/* Guarantee */}
        {/* <View style={styles.guaranteeCard}>
          <FontAwesome name="shield" size={32} color="#3867FF" />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>
              30 dana garancija povraćaja novca
            </Text>
            <Text style={styles.guaranteeSubtitle}>
              Ako niste zadovoljni, vratićemo vam novac bez pitanja
            </Text>
          </View>
        </View> */}

        {/* FAQ */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Često pitanja</Text>
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Mogu li otkazati pretplatu?</Text>
            <Text style={styles.faqAnswer}>
              Da, možete otkazati bilo kada. Zadržavate pristup do kraja
              plaćenog perioda.
            </Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>
              Šta se dešava nakon probnog perioda?
            </Text>
            <Text style={styles.faqAnswer}>
              Nakon 7 dana besplatnog perioda, automatski se naplaćuje izabrani
              plan. Možete otkazati pre isteka.
            </Text>
          </View>
        </View> */}
      </ScrollView>

      {/* Bottom CTA - COMMENTED OUT FOR MVP */}
      {/* <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {UPGRADE_PLANS.find((p) => p.id === selectedPlan)?.name}
          </Text>
          <Text style={styles.priceValue}>
            {UPGRADE_PLANS.find((p) => p.id === selectedPlan)?.price}
          </Text>
        </View>
        <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
          <Text style={styles.upgradeButtonText}>
            {selectedPlan === "free"
              ? "Nastavi sa Free planom"
              : "Započni 7 dana besplatno"}
          </Text>
        </Pressable>
        {selectedPlan === "premium" && (
          <Text style={styles.footerNote}>
            Nakon toga {UPGRADE_PLANS.find((p) => p.id === selectedPlan)?.price}{" "}
            / {UPGRADE_PLANS.find((p) => p.id === selectedPlan)?.period}
          </Text>
        )}
      </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  proBadge: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  proBadgeLogo: {
    width: 80,
    height: 80,
  },
  heroTitle: {
    color: "#F2F2F2",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    color: "#8B8B8B",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#B8FF00",
  },
  planCardDisabled: {
    opacity: 0.5,
    backgroundColor: "#0F0F0F",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#3867FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  popularText: {
    color: "#F2F2F2",
    fontSize: 10,
    fontWeight: "700",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  planPeriod: {
    color: "#8B8B8B",
    fontSize: 14,
  },
  planPricing: {
    alignItems: "flex-end",
  },
  planPrice: {
    color: "#F2F2F2",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  savingsBadge: {
    backgroundColor: "#B8FF00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    color: "#0B0B0B",
    fontSize: 11,
    fontWeight: "700",
  },
  planRadio: {
    marginTop: 12,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B8FF00",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#B8FF00",
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8B8B8B",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: "48%",
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(184, 255, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    color: "#F2F2F2",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  featureDescription: {
    color: "#8B8B8B",
    fontSize: 12,
    lineHeight: 16,
  },
  testimonialCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  testimonialText: {
    color: "#F2F2F2",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  testimonialAuthor: {
    color: "#8B8B8B",
    fontSize: 13,
    fontStyle: "italic",
  },
  guaranteeCard: {
    backgroundColor: "#121418",
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  guaranteeSubtitle: {
    color: "#8B8B8B",
    fontSize: 13,
    lineHeight: 18,
  },
  faqCard: {
    backgroundColor: "#121418",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  faqAnswer: {
    color: "#8B8B8B",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: "#0B0B0B",
    borderTopWidth: 1,
    borderTopColor: "#1E1F23",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    color: "#8B8B8B",
    fontSize: 15,
  },
  priceValue: {
    color: "#F2F2F2",
    fontSize: 20,
    fontWeight: "700",
  },
  upgradeButton: {
    backgroundColor: "#B8FF00",
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    marginVertical: 12,
  },
  upgradeButtonText: {
    color: "#0B0B0B",
    fontSize: 16,
    fontWeight: "700",
  },
  footerNote: {
    color: "#8B8B8B",
    fontSize: 12,
    textAlign: "center",
  },
});
