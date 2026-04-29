"use client";

import { useState } from "react";

export default function DownloadPage() {
  const [code, setCode] = useState("");
  const [foundFile, setFoundFile] = useState(false);

  const handleCheckCode = () => {
    if (code.length === 6) {
      setFoundFile(true);
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
          href="/upload"
          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold hover:border-orange-400 hover:text-orange-600"
        >
          Upload File
        </a>
      </nav>

      <section className="flex min-h-[calc(100vh-89px)] items-center justify-center px-6">
        <div className="w-full max-w-xl">
            {!foundFile && (
            <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl shadow-orange-100">
                <p className="mb-3 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                Download
                </p>

                <h1 className="text-4xl font-extrabold tracking-tight">
                Enter your code
                </h1>

                <p className="mt-3 text-neutral-500">
                Type the temporary code to view and download the shared file.
                </p>

                <input
                value={code}
                onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setFoundFile(false);
                }}
                maxLength={6}
                placeholder="K7P9Q2"
                className="mt-8 w-full rounded-2xl border border-neutral-300 px-5 py-5 text-center text-3xl font-bold tracking-[0.35em] outline-none transition focus:border-orange-500"
                />

                <button
                onClick={handleCheckCode}
                disabled={code.length < 6}
                className="mt-6 w-full rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:shadow-none"
                >
                Check Code
                </button>
            </div>
           )} 

          {foundFile && (
            <div className="mt-6 rounded-3xl bg-black p-6 shadow-2xl">
              <div className="rounded-2xl bg-white p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-semibold">File found</span>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
                    Active
                  </span>
                </div>

                <div className="mb-6 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white">
                    ↓
                  </div>

                  <p className="font-semibold">project-file.zip</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Ready to download
                  </p>
                </div>
                
                <div className="mb-5 rounded-2xl bg-neutral-950 p-5 text-white">
                <p className="mb-2 text-sm text-neutral-400">Your code</p>
                <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold tracking-[0.25em] text-orange-400">
                    {code}
                    </span>
                    <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
                    Verified
                    </span>
                </div>
                </div>

                <button className="mt-5 w-full rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}