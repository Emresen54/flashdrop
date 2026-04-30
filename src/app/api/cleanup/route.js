export const runtime = "nodejs";

import {
  S3Client,
  ListObjectsV2Command,
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

export async function GET() {
  try {
    const listResult = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET,
        Prefix: "meta/",
      })
    );

    const metaFiles = listResult.Contents || [];
    const now = Date.now();

    let deletedCount = 0;

    for (const metaFile of metaFiles) {
      try {
        const metaResult = await s3.send(
          new GetObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: metaFile.Key,
          })
        );

        const metadata = JSON.parse(await streamToText(metaResult.Body));

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
              Key: metaFile.Key,
            })
          );

          deletedCount++;
        }
      } catch (error) {
        console.error("Cleanup item error:", error);
      }
    }

    return Response.json({
      success: true,
      checked: metaFiles.length,
      deleted: deletedCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}