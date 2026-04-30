export const runtime = "nodejs";

import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function streamToText(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf-8");
}

export async function POST(req) {
  try {
    const { code, fileIndex = 0 } = await req.json();

    if (!code) {
      return Response.json(
        { success: false, error: "No code provided" },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const metaKey = `meta/${cleanCode}.json`;

    let metadata;

    try {
      const metaResult = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: metaKey,
        })
      );

      const metaText = await streamToText(metaResult.Body);
      metadata = JSON.parse(metaText);
    } catch {
      return Response.json(
        { success: false, error: "File not found or expired" },
        { status: 404 }
      );
    }

    const now = Date.now();

    if (now > metadata.expiresAt) {
      for (const file of metadata.files || []) {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: file.fileKey,
          })
        );
      }

      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: metaKey,
        })
      );

      return Response.json(
        { success: false, error: "Files expired and were deleted" },
        { status: 410 }
      );
    }

    const selectedFile = metadata.files?.[fileIndex];

    if (!selectedFile) {
      return Response.json(
        { success: false, error: "Selected file not found" },
        { status: 404 }
      );
    }

    const fileResult = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: selectedFile.fileKey,
      })
    );

    return new Response(fileResult.Body, {
      headers: {
        "Content-Type": selectedFile.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${selectedFile.fileName}"`,
        "X-File-Name": selectedFile.fileName,
        "X-File-Count": String(metadata.files.length),
        "X-Files": encodeURIComponent(JSON.stringify(metadata.files)),
        "X-Expires-At": String(metadata.expiresAt),
      },
    });
  } catch (error) {
    console.error("Download error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}