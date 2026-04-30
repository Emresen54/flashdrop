"use client";

import { useState } from "react";

export default function UploadPage() {
  const [timer, setTimer] = useState("10m");
  const [files, setFiles] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const MAX_FILE_SIZE = 9 * 1024 * 1024 * 1024; // 9 GB


 const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  } catch (error) {
    console.error("Copy failed:", error);
  }
    };

  const handleUpload = async () => {
    if (files.length === 0 || uploading || generatedCode) return;

    setUploading(true);
    setError("");

    try {
      const createRes = await fetch("/api/create-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timer,
          files: files.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        }),
      });

      const transfer = await createRes.json();

      if (!transfer.success) {
        setError(transfer.error || "Upload preparation failed");
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const signedFile = transfer.files[i];

        const uploadRes = await fetch(signedFile.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${file.name}`);
        }
      }

      const completeRes = await fetch("/api/complete-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: transfer.code,
          timer,
          files: transfer.files,
        }),
      });

      const completeData = await completeRes.json();

      if (!completeData.success) {
        setError(completeData.error || "Could not complete upload");
        return;
      }

      setGeneratedCode(transfer.code);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between border-b border-orange-100 px-8 py-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold text-white">
            ⚡
          </div>
          <span className="text-2xl font-bold tracking-tight">FlashDrop</span>
        </a>

        <a
          href="/download"
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:border-orange-400 hover:text-orange-600"
        >
          Enter Code
        </a>
      </nav>

      <section className="flex min-h-[calc(100vh-89px)] items-center justify-center px-6">
        <div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl shadow-orange-100">
          <div className="mb-8">
            <p className="mb-3 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Upload
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Choose your file
            </h1>
            <p className="mt-3 text-neutral-500">
              Select a file and choose when it should automatically expire.
            </p>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-300 bg-orange-50 p-10 text-center transition hover:bg-orange-100">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white">
              ↑
            </div>

            <div className="font-semibold">
            {files.length > 0 ? `${files.length} file(s) selected` : "Click to select files"}
            </div>

            {files.length > 0 && (
            <div className="mt-3 space-y-1 text-sm text-neutral-500">
                {files.map((file) => (
                <p key={file.name}>{file.name}</p>
                ))}
            </div>
            )}
            <p className="mt-1 text-sm text-neutral-500">
              The file will be stored temporarily.
            </p>
            <input
            type="file"
            multiple
            className="hidden"
            disabled={uploading || generatedCode}
            onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || []);

                if (selectedFiles.length === 0) return;

                const tooLarge = selectedFiles.find(
                (file) => file.size > MAX_FILE_SIZE
                );

                if (tooLarge) {
                setError("Each file must be max 9 GB");
                e.target.value = "";
                setFiles([]);
                return;
                }

                setError("");
                setFiles(selectedFiles);
            }}
            />
          </label>
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-neutral-500">
              Auto delete after
            </p>

            <div className="grid grid-cols-4 gap-3 ">
              {["5m", "10m", "15m", "20m"].map((t) => (
                <button
                key={t}
                onClick={() => {
                    if (!generatedCode) {
                    setTimer(t);
                    }
                }}
                disabled={generatedCode}
                className={`rounded-xl py-3 text-sm font-semibold transition ${
                    timer === t
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                    : "bg-neutral-100 text-neutral-600 hover:bg-orange-50 hover:text-orange-600"
                } ${generatedCode ? "cursor-not-allowed" : ""}`}
                >
                {t}
                </button>
              ))}
            </div>
          </div>
            <button
            onClick={handleUpload}
            disabled={files.length === 0 || generatedCode || uploading}
            className="mt-8 w-full rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
            >
            {uploading ? "Uploading..." : generatedCode ? "Code Generated" : "Generate Code"}
            </button>
          
            {generatedCode && (
            <div className="mt-6 rounded-2xl bg-neutral-950 p-5 text-white">
                <p className="mb-2 text-sm text-neutral-400">Your code</p>
                <div className="flex items-center justify-between">
                <span className="text-3xl font-bold tracking-[0.25em] text-orange-400">
                    {generatedCode}
                </span>

                <button
                onClick={copyCode}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-orange-100"
                >
                {copied ? "Copied" : "Copy"}
                </button>
                </div>

                <p className="mt-4 text-sm text-neutral-400">
                File expires after {timer}.
                </p>
            </div>
            )}
        </div>
      </section>
    </main>
  );
}