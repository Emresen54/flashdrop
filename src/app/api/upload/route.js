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

const MAX_FILE_SIZE = 9 * 1024 * 1024 * 1024; // 9 GB

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function timerToMs(timer) {
  const minutes = Number(timer.replace("m", ""));
  return minutes * 60 * 1000;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");
    const timer = formData.get("timer") || "10m";

    if (!files || files.length === 0) {
      return Response.json(
        { success: false, error: "No files uploaded" },
        { status: 400 }
      );
    }

    const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE);

    if (tooLarge) {
      return Response.json(
        {
          success: false,
          error: `File "${tooLarge.name}" is bigger than 9 GB`,
        },
        { status: 413 }
      );
    }

    const code = generateCode();
    const createdAt = Date.now();
    const expiresAt = createdAt + timerToMs(timer);

    const uploadedFiles = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `${code}/${safeFileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: fileKey,
          Body: buffer,
          ContentType: file.type || "application/octet-stream",
        })
      );

      uploadedFiles.push({
        fileName: file.name,
        fileKey,
        size: file.size,
        type: file.type || "application/octet-stream",
      });
    }

    const metadata = {
      code,
      files: uploadedFiles,
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
      files: uploadedFiles,
      timer,
      expiresAt,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}