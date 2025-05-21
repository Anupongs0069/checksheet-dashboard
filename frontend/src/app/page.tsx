// src/app/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainMenuPage from "./main-menu/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /main-menu แทน /login
    router.push("/main-menu");
  }, [router]);

  return (
    <main className="flex-grow flex items-center justify-center w-full min-h-screen bg-background text-foreground transition-colors duration-300">
      <MainMenuPage />
    </main>
  );
}
