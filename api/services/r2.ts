import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "weur",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadToR2 = async (
  bucket: string,
  key: string,
  buffer: Buffer,
  contentType: string
) => {
  const r2Command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await r2.send(r2Command);
};

export const getR2Url = async (key: string) => {
  const r2Command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  });

  const profilePicUrl = await getSignedUrl(r2, r2Command, { expiresIn: 3600 });
  return profilePicUrl;
};

export const deleteR2Object = async (bucket: string, key: string) => {
  const r2Command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await r2.send(r2Command);
};
