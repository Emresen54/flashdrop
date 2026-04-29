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
        <div className="grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Secure. Fast. Temporary.
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Share files with a code.{" "}
              <span className="text-orange-500">Once.</span>
            </h1>

            <p className="mb-8 max-w-xl text-lg leading-8 text-neutral-600">
              Upload a file, get a temporary code, and let your friend download
              it from any device. After the download, the file gets deleted.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
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

          <div className="rounded-3xl bg-black p-6 shadow-2xl">
            <div className="rounded-2xl bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-semibold">Transfer Preview</span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
                  Active
                </span>
              </div>

              <div className="mb-6 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white">
                  ↑
                </div>
                <p className="font-semibold">project-file.zip</p>
                <p className="mt-1 text-sm text-neutral-500">Ready to share</p>
              </div>

              <div className="rounded-2xl bg-neutral-950 p-5 text-white">
                <p className="mb-2 text-sm text-neutral-400">Your code</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold tracking-[0.25em] text-orange-400">
                    K7P9Q2
                  </span>
                  <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
                    Copy
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-white">
                Auto delete after
              </p>

            <div className="mt-6 rounded-xl bg-neutral-900 px-5 py-4 text-white">
              <p className="text-sm text-neutral-400">Expires at</p>
              <p className="text-2xl font-bold text-orange-400">{minutes}:{seconds}</p>
            </div>
            </div>
            </div>
          </div>
      </section>
    </main>
  );
}