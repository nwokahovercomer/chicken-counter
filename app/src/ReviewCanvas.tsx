/**
 * ReviewCanvas.tsx
 *
 * Shows the frozen frame with the model's boxes on top, and handles the
 * corrections:
 *   - tap a green/amber box      -> remove it (turns red; tap again to restore)
 *   - tap a blue (hand-added) box -> delete it
 *   - tap empty space            -> add a chicken there
 *
 * Boxes are stored as fractions of the image, so they stay glued to the right
 * spot at any zoom level. 1x/2x/3x zoom exists because boxes in a dense flock
 * are tiny; pan by dragging when zoomed in.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, StyleSheet } from "react-native";
import type { Box } from "./types";
import { fit } from "./layout";

/** Model boxes below this confidence are drawn amber: "worth a second look". */
export const LOW_CONFIDENCE = 0.6;

export const BOX_COLORS = {
  model: "#2ECC71",
  low: "#F5B301",
  manual: "#3B82F6",
  removed: "#E74C3C",
};

function colorFor(b: Box) {
  if (b.removed) return BOX_COLORS.removed;
  if (b.source === "manual") return BOX_COLORS.manual;
  return (b.confidence ?? 1) < LOW_CONFIDENCE ? BOX_COLORS.low : BOX_COLORS.model;
}

type Props = {
  uri: string;
  aspect: number; // image width / height
  boxes: Box[];
  onToggle: (id: string) => void;
  onAddAt: (nx: number, ny: number) => void; // normalized 0..1 position of the tap
};

const ZOOMS = [1, 2, 3];

export default function ReviewCanvas({ uri, aspect, boxes, onToggle, onAddAt }: Props) {
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);

  const base = fit(viewport.w, viewport.h, aspect);
  const cw = base.w * zoom; // content (image) size at the current zoom
  const ch = base.h * zoom;

  return (
    <View
      style={styles.viewport}
      onLayout={(e) =>
        setViewport({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      {viewport.w > 0 && (
        <ScrollView
          horizontal
          nestedScrollEnabled
          bounces={false}
          showsHorizontalScrollIndicator={zoom > 1}
          contentContainerStyle={{ width: Math.max(viewport.w, cw) }}
        >
          <ScrollView
            nestedScrollEnabled
            bounces={false}
            showsVerticalScrollIndicator={zoom > 1}
            contentContainerStyle={{
              minHeight: viewport.h,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              style={{ width: cw, height: ch }}
              onPress={(e) => {
                const { locationX, locationY } = e.nativeEvent;
                if (typeof locationX !== "number" || typeof locationY !== "number") return;
                onAddAt(locationX / cw, locationY / ch);
              }}
            >
              <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <Image source={{ uri }} style={{ width: cw, height: ch }} resizeMode="stretch" />
              </View>

              {boxes.map((b) => {
                const color = colorFor(b);
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => onToggle(b.id)}
                    style={{
                      position: "absolute",
                      left: (b.cx - b.w / 2) * cw,
                      top: (b.cy - b.h / 2) * ch,
                      width: b.w * cw,
                      height: b.h * ch,
                      borderWidth: 2,
                      borderColor: color,
                      backgroundColor: b.removed ? "rgba(231,76,60,0.28)" : "transparent",
                    }}
                  />
                );
              })}
            </Pressable>
          </ScrollView>
        </ScrollView>
      )}

      <View style={styles.zoomRow}>
        {ZOOMS.map((z) => (
          <Pressable
            key={z}
            onPress={() => setZoom(z)}
            style={[styles.zoomBtn, zoom === z && styles.zoomBtnActive]}
          >
            <Text style={[styles.zoomText, zoom === z && styles.zoomTextActive]}>{z}×</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, width: "100%", backgroundColor: "#0B0F0D", borderRadius: 14, overflow: "hidden" },
  zoomRow: {
    position: "absolute", top: 8, right: 8, flexDirection: "row", gap: 6,
  },
  zoomBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  zoomBtnActive: { backgroundColor: "#fff" },
  zoomText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  zoomTextActive: { color: "#15402E" },
});
