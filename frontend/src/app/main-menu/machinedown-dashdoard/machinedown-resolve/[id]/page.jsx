// src/app/main-menu/machinedown-dashdoard/machinedown-resolve/[id]/page.jsx

"use client";
import { useParams } from "next/navigation";
import ResolveForm from "@/app/components/MachineDownDashboard/pages/ResolveForm";

export default function Page() {
  const { id } = useParams();
  return <ResolveForm id={id} />;
}