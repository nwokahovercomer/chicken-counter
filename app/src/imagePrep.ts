import * as ImageManipulator from "expo-image-manipulator";

const MAX_WIDTH = 1600;

export type PreparedImage = {
  uri: string;    // the re-encoded image — this is what gets shown on the review screen
  base64: string; // what gets uploaded
  width: number;
  height: number;
};

/**
 * Shrinks a phone photo to at most 1600px wide and re-encodes it as JPEG.
 * Pass the photo's original width so the resize actually happens (v1 never
 * passed it, so photos were uploaded at full size). The review screen shows
 * `uri`, not the original photo, so what the user sees is exactly the image
 * the model saw and the box positions line up.
 */
export async function prepareImage(uri: string, width?: number): Promise<PreparedImage> {
  const actions: ImageManipulator.Action[] =
    width && width > MAX_WIDTH ? [{ resize: { width: MAX_WIDTH } }] : [];

  const out = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });

  if (!out.base64) throw new Error("Could not encode the image.");
  return { uri: out.uri, base64: out.base64, width: out.width, height: out.height };
}
