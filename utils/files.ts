export const convertBytesToBase64 = (
  bytes: Uint8Array | null,
  mimeType: string = "image/png"
): string | null => {
  if (!bytes) return null;
  const base64 = btoa(String.fromCharCode(...bytes));
  return `data:${mimeType};base64,${base64}`;
};

export const convertBase64ToBytes = (base64: string): Uint8Array | null => {
  if (!base64) return null;
  const byteString = atob(base64.split(",")[1]);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  return bytes;
};
