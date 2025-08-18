import { S3Client } from "@aws-sdk/client-s3";
console.log("R2 Endpoint:", process.env.R2_ENDPOINT);
console.log("R2 Access Key ID:", process.env.R2_ACCESS_KEY_ID);
console.log("R2 Secret Access Key:", process.env.R2_SECRET_ACCESS_KEY);
export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
