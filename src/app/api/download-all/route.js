export const runtime = "nodejs";

import JSZip from "jszip";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function streamToBuffer(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function streamToText(stream) {
  const buffer = await streamToBuffer(stream);
  return buffer.toString("utf-8");
}

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return Response.json(
        { success: false, error: "No code provided" },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();
    const metaKey = `meta/${cleanCode}.json`;

    const metaResult = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: metaKey,
      })
    );

    const metadata = JSON.parse(await streamToText(metaResult.Body));

    if (Date.now() > metadata.expiresAt) {
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

    const zip = new JSZip();

    for (const file of metadata.files) {
      const fileResult = await s3.send(
        new GetObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: file.fileKey,
        })
      );

      const fileBuffer = await streamToBuffer(fileResult.Body);
      zip.file(file.fileName, fileBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new Response(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="flashdrop-${cleanCode}.zip"`,
      },
    });
  } catch (error) {
    console.error("Download all error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}