export const runtime = "nodejs";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const MAX_FILE_SIZE = 9 * 1024 * 1024 * 1024;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

export async function POST(req) {
  try {
    const { files, timer } = await req.json();

    if (!files || files.length === 0) {
      return Response.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const tooLarge = files.find((file) => file.size > MAX_FILE_SIZE);

    if (tooLarge) {
      return Response.json(
        { success: false, error: `${tooLarge.name} is bigger than 9 GB` },
        { status: 413 }
      );
    }

    const code = generateCode();

    const signedFiles = await Promise.all(
      files.map(async (file) => {
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileKey = `${code}/${safeFileName}`;

        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: fileKey,
          ContentType: file.type || "application/octet-stream",
        });

        const uploadUrl = await getSignedUrl(s3, command, {
          expiresIn: 60 * 15,
        });

        return {
          fileName: file.name,
          fileKey,
          size: file.size,
          type: file.type || "application/octet-stream",
          uploadUrl,
        };
      })
    );

    return Response.json({
      success: true,
      code,
      timer,
      files: signedFiles,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}