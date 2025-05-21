// src/app/main-menu/machinedown-dashboard/machinedown-assign/[id]/page.jsx

"use client";
import { useParams } from "next/navigation";
import AssignForm from "@/app/components/MachineDownDashboard/pages/AssignForm";

export default function Page() {
  const { id } = useParams();
  return <AssignForm id={id} />;
}