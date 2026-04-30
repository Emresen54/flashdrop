"use client";

import { useState, useEffect } from "react";

export default function Home() {
const [openTimer, setOpenTimer] = useState(false);
const [expiresAt, setExpiresAt] = useState("");
const [timeLeft, setTimeLeft] = useState(600); // 10 dk = 600 saniye
const [dark, setDark] = useState(false);
const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
const seconds = String(timeLeft % 60).padStart(2, "0");

useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

  return (
    <main className="min-h-screen bg-white text-black">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white font-bold">
            ⚡
          </div>
          <span className="text-2xl font-bold tracking-tight">FlashDrop</span>
        </div>

        <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600">
          One-time file sharing
        </span>
      </nav>

      <section className="flex min-h-[calc(100vh-89px)] items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Secure. Fast. Temporary.
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Share files with a code.{" "}
              <span className="text-orange-500">Once.</span>
            </h1>

            <p className="mb-8  text-lg leading-8 text-neutral-600">
              Upload a file, get a temporary code, and let your friend download
              it from any device. After the download, the file gets deleted.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <a
                href="/upload"
                className="rounded-xl bg-orange-500 px-7 py-4 text-center font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Upload File
              </a>

              <a
                href="/download"
                className="rounded-xl border border-neutral-300 px-7 py-4 text-center font-semibold text-black transition hover:border-orange-400 hover:text-orange-600"
              >
                Enter Code
              </a>
            </div>
          </div>
          </div>
      </section>
    </main>
  );
}