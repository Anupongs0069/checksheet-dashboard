// ./src/app/main-menu/machine-downtime/machinedown-returnedits/[id]/page.jsx

"use client";
import { useParams } from "next/navigation";
import ReturnForEdits from "@/app/components/DownTime/pages/ReturnForEdits";

export default function Page() {
  const { id } = useParams();
  return <ReturnForEdits id={id} />;
}