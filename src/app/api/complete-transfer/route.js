export const runtime = "nodejs";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

function timerToMs(timer) {
  const minutes = Number(timer.replace("m", ""));
  return minutes * 60 * 1000;
}

export async function POST(req) {
  try {
    const { code, files, timer } = await req.json();

    if (!code || !files || files.length === 0) {
      return Response.json(
        { success: false, error: "Missing transfer data" },
        { status: 400 }
      );
    }

    const createdAt = Date.now();
    const expiresAt = createdAt + timerToMs(timer || "10m");

    const metadata = {
      code,
      files: files.map((file) => ({
        fileName: file.fileName,
        fileKey: file.fileKey,
        size: file.size,
        type: file.type,
      })),
      timer,
      createdAt,
      expiresAt,
    };

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: `meta/${code}.json`,
        Body: JSON.stringify(metadata),
        ContentType: "application/json",
      })
    );

    return Response.json({
      success: true,
      code,
      expiresAt,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}