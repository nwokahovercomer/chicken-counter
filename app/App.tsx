import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import ReviewCanvas, { BOX_COLORS, LOW_CONFIDENCE } from "./src/ReviewCanvas";
import { prepareImage } from "./src/imagePrep";
import { detectChickensWithRetry } from "./src/api";
import { loadEntries, saveEntries } from "./src/storage";
import { fit } from "./src/layout";
import type { Box, Entry } from "./src/types";

type Phase = "live" | "detecting" | "review";
type Review = { uri: string; aspect: number; modelCount: number };

const COLORS = {
  deepGreen: "#15402E",
  green: "#1F6E43",
  greenLight: "#5E9C78",
  tint: "#EAF5EC",
  gold: "#F5B301",
  text: "#1B2A22",
  muted: "#6B7A72",
  danger: "#C0392B",
  border: "#D7E8DC",
};

const CAMERA_ASPECT = 3 / 4; // portrait 4:3, what the camera captures

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export default function App() {
  return (
    <SafeAreaProvider>
      <ChickenCounter />
    </SafeAreaProvider>
  );
}

function ChickenCounter() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Phase>("live");
  const [review, setReview] = useState<Review | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [area, setArea] = useState({ w: 0, h: 0 });

  const idCounter = useRef(0);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = () => `b${Date.now()}-${idCounter.current++}`;

  // --- persistence: the running total survives the app being closed --------
  useEffect(() => {
    loadEntries().then((e) => {
      setEntries(e);
      setLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (loaded) saveEntries(entries);
  }, [entries, loaded]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission();
  }, [permission]);

  const total = entries.reduce((sum, e) => sum + e.count, 0);

  // --- derived numbers for the review screen -------------------------------
  const activeCount = boxes.filter((b) => !b.removed).length;
  const addedCount = boxes.filter((b) => b.source === "manual").length;
  const removedCount = boxes.filter((b) => b.source === "model" && b.removed).length;

  function flash(msg: string) {
    setBanner(msg);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(null), 2200);
  }

  // --- detection ---------------------------------------------------------------
  async function detectFrom(uri: string, originalWidth?: number) {
    try {
      const prepared = await prepareImage(uri, originalWidth);
      const result = await detectChickensWithRetry(prepared.base64);

      // Box positions are relative to the image the model received, so use
      // the size it reports (falling back to the size we sent).
      const W = result.imageWidth ?? prepared.width;
      const H = result.imageHeight ?? prepared.height;

      const found: Box[] = result.boxes.map((b) => ({
        id: nextId(),
        cx: clamp(b.x / W, 0, 1),
        cy: clamp(b.y / H, 0, 1),
        w: b.width / W,
        h: b.height / H,
        confidence: b.confidence,
        source: "model",
        removed: false,
      }));

      setBoxes(found);
      setReview({ uri: prepared.uri, aspect: W / H, modelCount: found.length });
      setPhase("review");
    } catch (e) {
      setPhase("live");
      Alert.alert("Detection failed", e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function detectFromCamera() {
    if (phase !== "live") return;
    setPhase("detecting"); // lock the UI first so a double-tap can't capture twice
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.9 });
      if (!photo?.uri) throw new Error("The camera didn't return a photo. Try again.");
      await detectFrom(photo.uri, photo.width);
    } catch (e) {
      setPhase("live");
      Alert.alert("Couldn't capture", e instanceof Error ? e.message : "Try again.");
    }
  }

  async function detectFromGallery() {
    if (phase !== "live") return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (result.canceled || !result.assets?.[0]) return;
    setPhase("detecting");
    await detectFrom(result.assets[0].uri, result.assets[0].width);
  }

  // --- corrections ---------------------------------------------------------------
  function toggleBox(id: string) {
    setBoxes((prev) =>
      prev.flatMap((b) => {
        if (b.id !== id) return [b];
        if (b.source === "manual") return []; // hand-added boxes are simply deleted
        return [{ ...b, removed: !b.removed }]; // model boxes can be rejected and restored
      })
    );
  }

  function addBoxAt(nx: number, ny: number) {
    if (!review) return;
    setBoxes((prev) => {
      // Size the new box like a typical detected chicken in this frame.
      const model = prev.filter((b) => b.source === "model" && !b.removed);
      const w = median(model.map((b) => b.w)) ?? 0.05;
      const h = median(model.map((b) => b.h)) ?? w * review.aspect;
      return [
        ...prev,
        {
          id: nextId(),
          cx: clamp(nx, 0, 1),
          cy: clamp(ny, 0, 1),
          w,
          h,
          confidence: null,
          source: "manual",
          removed: false,
        },
      ];
    });
  }

  function leaveReview() {
    setReview(null);
    setBoxes([]);
    setPhase("live");
  }

  function rescan() {
    if (addedCount > 0 || removedCount > 0) {
      Alert.alert("Discard this count?", "The chickens you added and removed in this view will be lost.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: leaveReview },
      ]);
    } else {
      leaveReview();
    }
  }

  function addToTotal() {
    if (!review || activeCount === 0) return;
    const entry: Entry = {
      id: `${Date.now()}`,
      count: activeCount,
      modelCount: review.modelCount,
      added: addedCount,
      removed: removedCount,
      createdAt: Date.now(),
    };
    setEntries((prev) => [entry, ...prev]);
    flash(`+${activeCount} added to total`);
    leaveReview();
  }

  // --- history -----------------------------------------------------------------------
  function deleteEntry(id: string) {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    Alert.alert("Delete this count?", `This removes ${e.count} chickens from the total.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => setEntries((prev) => prev.filter((x) => x.id !== id)) },
    ]);
  }

  function clearAll() {
    Alert.alert("Clear all counts?", `This resets the total from ${total} to 0. It can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: () => setEntries([]) },
    ]);
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    return (
      d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }) +
      "  " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  }

  const cam = fit(area.w, area.h, CAMERA_ASPECT);
  const correctedCount = entries.filter((e) => e.added > 0 || e.removed > 0).length;

  // --- UI ----------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header: the running total is always visible */}
      <LinearGradient
        colors={[COLORS.deepGreen, COLORS.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            Chicken <Text style={{ color: COLORS.gold }}>Counter</Text>
          </Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalNumber}>{total}</Text>
            <Text style={styles.totalLabel}>total chickens</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.historyBtn} onPress={() => setShowHistory(true)}>
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={styles.historyBtnText}>{entries.length}</Text>
        </TouchableOpacity>
      </LinearGradient>

      {banner && (
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.bannerText}>{banner}</Text>
        </View>
      )}

      {phase !== "review" ? (
        <>
          {/* Live camera */}
          <View
            style={styles.body}
            onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          >
            {!permission ? (
              <ActivityIndicator color={COLORS.green} />
            ) : !permission.granted ? (
              <View style={styles.permBox}>
                <Text style={styles.permText}>Camera access is needed to count chickens.</Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
                  <Text style={styles.primaryBtnText}>Grant permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: cam.w, height: cam.h, borderRadius: 16, overflow: "hidden" }}>
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
                <View style={styles.hintPill} pointerEvents="none">
                  <Text style={styles.hintText}>Frame the whole group, then tap Detect</Text>
                </View>
                {phase === "detecting" && (
                  <View style={styles.detectingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.detectingText}>Finding chickens…</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.sideBtn, phase !== "live" && styles.disabled]}
              disabled={phase !== "live"}
              onPress={detectFromGallery}
            >
              <Ionicons name="images-outline" size={24} color={COLORS.green} />
              <Text style={styles.sideBtnText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.detectBtn, (phase !== "live" || !permission?.granted) && styles.disabled]}
              disabled={phase !== "live" || !permission?.granted}
              onPress={detectFromCamera}
            >
              <Ionicons name="scan-outline" size={22} color="#fff" />
              <Text style={styles.detectBtnText}>Detect</Text>
            </TouchableOpacity>

            <View style={styles.sideBtn} />
          </View>
        </>
      ) : (
        review && (
          <>
            {/* Review & correct */}
            <View style={[styles.body, { padding: 8 }]}>
              <ReviewCanvas
                uri={review.uri}
                aspect={review.aspect}
                boxes={boxes}
                onToggle={toggleBox}
                onAddAt={addBoxAt}
              />
            </View>

            <View style={styles.panel}>
              <View style={styles.countRow}>
                <Text style={styles.countBig}>{activeCount}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.countLabel}>chickens in this view</Text>
                  <Text style={styles.countDetail}>
                    Model found {review.modelCount}
                    {addedCount > 0 ? `  ·  you added ${addedCount}` : ""}
                    {removedCount > 0 ? `  ·  you removed ${removedCount}` : ""}
                  </Text>
                </View>
              </View>

              <View style={styles.legend}>
                <LegendDot color={BOX_COLORS.model} label="Found" />
                <LegendDot color={BOX_COLORS.low} label={`Unsure (<${Math.round(LOW_CONFIDENCE * 100)}%)`} />
                <LegendDot color={BOX_COLORS.manual} label="Added" />
                <LegendDot color={BOX_COLORS.removed} label="Removed" />
              </View>
              <Text style={styles.tip}>Tap a box to remove it · tap empty space to add a chicken</Text>

              <View style={styles.reviewActions}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={rescan}>
                  <Ionicons name="refresh-outline" size={18} color={COLORS.green} style={{ marginRight: 6 }} />
                  <Text style={styles.secondaryBtnText}>Rescan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1.4 }, activeCount === 0 && styles.disabled]}
                  disabled={activeCount === 0}
                  onPress={addToTotal}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>Add to total</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )
      )}

      {/* History */}
      <Modal visible={showHistory} animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <View style={[styles.historyScreen, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Counts</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Ionicons name="close" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.historyTotal}>
            Total: <Text style={{ fontWeight: "800", color: COLORS.deepGreen }}>{total}</Text> chickens
          </Text>
          {entries.length > 0 && (
            <Text style={styles.historySub}>
              You corrected the model in {correctedCount} of {entries.length} count
              {entries.length > 1 ? "s" : ""}.
            </Text>
          )}

          <FlatList
            data={entries}
            keyExtractor={(e) => e.id}
            style={{ marginTop: 12 }}
            ListEmptyComponent={<Text style={styles.empty}>No counts yet. Detect a group and tap "Add to total".</Text>}
            renderItem={({ item, index }) => (
              <View style={styles.entryRow}>
                <Text style={styles.entryCount}>{item.count}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryTitle}>Count {entries.length - index}</Text>
                  <Text style={styles.entryMeta}>
                    {formatTime(item.createdAt)}  ·  model {item.modelCount}
                    {item.added > 0 ? ` +${item.added}` : ""}
                    {item.removed > 0 ? ` −${item.removed}` : ""}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteEntry(item.id)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            )}
          />

          {entries.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
              <Text style={styles.clearBtnText}>Clear all counts</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { borderColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12,
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
  },
  headerTitle: { color: "#fff", fontSize: 14, fontWeight: "700", opacity: 0.9 },
  totalRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 },
  totalNumber: { color: "#fff", fontSize: 38, fontWeight: "800" },
  totalLabel: { color: "#D7EEDD", fontSize: 14 },
  historyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  historyBtnText: { color: "#fff", fontWeight: "700" },

  banner: {
    position: "absolute", top: 96, alignSelf: "center", zIndex: 10,
    backgroundColor: COLORS.deepGreen, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  bannerText: { color: "#fff", fontWeight: "700" },

  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12 },

  hintPill: {
    position: "absolute", bottom: 12, alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  hintText: { color: "#fff", fontSize: 12 },
  detectingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center", gap: 10,
  },
  detectingText: { color: "#fff", fontWeight: "600" },

  permBox: { alignItems: "center", gap: 14, padding: 24 },
  permText: { color: COLORS.text, textAlign: "center", fontSize: 15 },

  controls: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 24, paddingBottom: 12, paddingTop: 4,
  },
  sideBtn: { width: 64, alignItems: "center", gap: 2 },
  sideBtnText: { color: COLORS.green, fontSize: 12, fontWeight: "600" },
  detectBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.green,
    paddingHorizontal: 36, paddingVertical: 16, borderRadius: 999,
    shadowColor: COLORS.green, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  detectBtnText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  disabled: { opacity: 0.4 },

  panel: {
    backgroundColor: COLORS.tint, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14,
  },
  countRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  countBig: { fontSize: 52, fontWeight: "800", color: COLORS.deepGreen },
  countLabel: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  countDetail: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 12, height: 12, borderWidth: 2, borderRadius: 2 },
  legendText: { fontSize: 11, color: COLORS.muted },
  tip: { fontSize: 11, color: COLORS.muted, marginTop: 6 },
  reviewActions: { flexDirection: "row", gap: 10, marginTop: 12 },

  primaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  secondaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: COLORS.green, paddingVertical: 14, borderRadius: 12,
  },
  secondaryBtnText: { color: COLORS.green, fontWeight: "700", fontSize: 15 },

  historyScreen: { flex: 1, backgroundColor: "#fff", padding: 18 },
  historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  historyTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  historyTotal: { fontSize: 16, color: COLORS.text, marginTop: 8 },
  historySub: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  empty: { color: COLORS.muted, marginTop: 24, textAlign: "center" },
  entryRow: {
    flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  entryCount: { fontSize: 26, fontWeight: "800", color: COLORS.deepGreen, minWidth: 54 },
  entryTitle: { fontWeight: "700", color: COLORS.text },
  entryMeta: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  clearBtn: { alignItems: "center", paddingVertical: 12 },
  clearBtnText: { color: COLORS.danger, fontWeight: "700" },
});
