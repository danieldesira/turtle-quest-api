export const convertBytesToBase64 = (
  bytes: Uint8Array | null,
  mimeType: string = "image/png"
): string | null => {
  if (!bytes) {
    return null;
  }

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
};

export const convertBase64ToBytes = (base64: string): Uint8Array | null => {
  if (!base64) {
    return null;
  }

  const byteString = atob(base64.split(",")[1]);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  return bytes;
};
