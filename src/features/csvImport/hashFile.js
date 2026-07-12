// SHA-256 of the raw file bytes, used to detect re-importing the exact same
// file into the same portfolio. Hex-encoded for easy storage/comparison.
export async function hashFile(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
