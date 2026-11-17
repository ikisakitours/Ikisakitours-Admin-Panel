import type { Metadata } from "next";
import ManualGuideView from "./components/ManualGuideView";

export const metadata: Metadata = {
  title: "Admin Manual Guide",
  description:
    "Interactive step-by-step operations manual for Ikisaki Tours administrators covering tour packages, dynamic pricing tiers, itineraries, bookings, availability, and troubleshooting.",
};

export default function ManualGuidePage() {
  return (
    <main className="w-full min-h-screen py-4 px-2 sm:px-4">
      <ManualGuideView />
    </main>
  );
}
