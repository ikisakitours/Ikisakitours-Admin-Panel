"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { ItineraryDocument } from "../types/itinerary.types";

interface ItineraryPreviewA4Props {
  document: ItineraryDocument;
  zoom?: number;
}

function cleanBulletText(text: string): string {
  if (!text) return "";
  return text.replace(/^[\s•\-\*▪▸\u2022\u25AA\u25B8\u25B6]+\s*/, "").trim();
}

export function ItineraryPreviewA4({ document: doc, zoom = 1 }: ItineraryPreviewA4Props) {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const isJa = doc.language === "ja";

  const tourName = isJa ? (doc.tourNameJa || doc.tourName) : doc.tourName;
  const tourDates = isJa ? (doc.tourDatesJa || doc.tourDates) : doc.tourDates;
  const remarks = isJa && doc.remarksJa && doc.remarksJa.length > 0 ? doc.remarksJa : doc.remarks;

  // Combine room types if multiple guests
  const roomTypesStr = doc.guests && doc.guests.length > 0
    ? Array.from(new Set(doc.guests.map((g) => g.roomType).filter(Boolean))).join(" / ") || "1TWN"
    : "1TWN";

  return (
    <div
      id="itinerary-preview-wrapper"
      style={
        isPrinting
          ? undefined
          : {
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }
      }
      className="transition-transform duration-150 ease-out print:!transform-none print:!m-0 print:!p-0 print:!w-full print:block"
    >
      {/* A4 Sheet Container */}
      <div
        id="itinerary-printable"
        className="w-[210mm] min-h-[297mm] mx-auto bg-white text-black font-sans p-[10mm] shadow-2xl border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:min-h-0 print:text-black print:bg-white"
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* ══════════════════════════════════════════════════════════
            HEADER SECTION (Matches Target Reference 100%)
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-start justify-between gap-6 pb-4">
          {/* Header Left: Clean Metadata Grid Box */}
          <div className="w-[470px] shrink-0">
            <table className="w-full text-left border-collapse border border-black text-[12.5px]">
              <tbody>
                {/* Row 1: Tour Name */}
                <tr className="border-b border-black">
                  <td className="py-1.5 px-3 font-bold border-r border-black w-[105px] text-black text-[12px]">
                    {isJa ? "ツアー名" : "Tour Name"}
                  </td>
                  <td colSpan={2} className="py-1.5 px-3 font-normal text-black uppercase text-[12.5px]">
                    {tourName || doc.referenceNo || "SRI LANKA TOUR ITINERARY"}
                  </td>
                </tr>

                {/* Row 2: Tour Date */}
                <tr className="border-b border-black">
                  <td className="py-1.5 px-3 font-bold border-r border-black w-[105px] text-black text-[12px]">
                    {isJa ? "旅行日程" : "Tour Date"}
                  </td>
                  <td colSpan={2} className="py-1.5 px-3 font-normal text-black text-[12.5px]">
                    {tourDates || "—"}
                  </td>
                </tr>

                {/* Row 3: Guest Name & Room Type Column */}
                <tr className="border-b border-black">
                  <td className="py-1.5 px-3 font-bold border-r border-black w-[105px] text-black align-top text-[12px]">
                    {isJa ? "お客様名" : "Guest Name"}
                  </td>
                  <td className="py-1.5 px-3 font-normal text-black border-r border-black text-[12.5px]">
                    {doc.guests && doc.guests.length > 0 ? (
                      <div className="space-y-0.5">
                        {doc.guests.map((g) => (
                          <div key={g.id} className="uppercase leading-tight">
                            {g.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="uppercase">VALUED GUEST</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2.5 font-normal text-black text-center w-[85px] align-middle text-[12px]">
                    {roomTypesStr}
                  </td>
                </tr>

                {/* Row 4: Flight Time */}
                <tr>
                  <td className="py-1.5 px-3 font-bold border-r border-black w-[105px] text-black align-top text-[12px]">
                    {isJa ? "フライト" : "Flight Time"}
                  </td>
                  <td colSpan={2} className="py-1.5 px-3">
                    {doc.flights && doc.flights.length > 0 ? (
                      <div className="space-y-1">
                        {doc.flights.map((f) => (
                          <div
                            key={f.id}
                            className="grid grid-cols-[70px_90px_75px_1fr] font-mono text-[12px] font-normal text-black leading-tight"
                          >
                            <span>{f.flightNo}</span>
                            <span>{f.route}</span>
                            <span>{f.date}</span>
                            <span>{f.time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11.5px]">—</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Header Right: Clean Brand Logo & Reference */}
          <div className="flex-1 flex flex-col items-end justify-start pt-0.5">
            <div className="relative w-44 h-14">
              <Image
                src={doc.companyInfo.logoUrl || "/Layout-Icons/logo-transparent.webp"}
                alt={doc.companyInfo.nameEn}
                fill
                className="object-contain object-right"
                priority
              />
            </div>
            <p className="text-[11px] font-normal text-black tracking-wider uppercase mt-1">
              {doc.companyInfo.nameEn || "IKISAKI TOURS (PRIVATE) LIMITED"}
            </p>
            {doc.referenceNo && (
              <p className="text-[10.5px] font-mono font-normal text-slate-700 mt-0.5">
                Ref: {doc.referenceNo}
              </p>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MAIN SCHEDULE TABLE (Matches Target Reference 100%)
            Header: BOLD (as marked in yellow by user)
            Content: NORMAL (unbolded as requested)
        ══════════════════════════════════════════════════════════ */}
        <div className="mt-2">
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              {/* Table Header: KEEP BOLD (Marked in Yellow) */}
              <tr className="border-b border-black text-[12.5px] font-bold text-black bg-white">
                <th className="py-2.5 px-3 border-r border-black w-[115px] text-center">
                  {isJa ? "日付" : "Date"}
                </th>
                <th className="py-2.5 px-4 border-r border-black">
                  {isJa ? "ツアー行程" : "Tour Content"}
                </th>
                <th className="py-2.5 px-3 w-[115px] text-center">
                  {isJa ? "お食事" : "Meals"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black">
              {doc.schedule && doc.schedule.length > 0 ? (
                doc.schedule.map((day, idx) => {
                  const dayTitle = isJa ? (day.rawJa?.title || day.title) : day.title;
                  const dayDateStr = isJa ? (day.rawJa?.dateStr || day.dateStr) : day.dateStr;
                  const dayActivities = isJa
                    ? (day.rawJa?.activities && day.rawJa.activities.length > 0 ? day.rawJa.activities : day.activities)
                    : day.activities;
                  const dayScenicStops = isJa
                    ? (day.rawJa?.scenicStops && day.rawJa.scenicStops.length > 0 ? day.rawJa.scenicStops : day.scenicStops)
                    : day.scenicStops;
                  const dayBullets = isJa && day.rawJa?.bullets && day.rawJa.bullets.length > 0
                    ? day.rawJa.bullets
                    : day.bullets;
                  const hotelName = isJa ? (day.rawJa?.hotelCheckIn || day.hotelCheckIn) : day.hotelCheckIn;

                  // Parse date into Date on top, and Day of Week in brackets below:
                  // e.g. "12TH MAR (THU)" -> dateMain="12TH MAR", dateSub="(THU)"
                  let dateMain = dayDateStr;
                  let dateSub = "";
                  if (dayDateStr && dayDateStr.includes("(")) {
                    const parts = dayDateStr.split("(");
                    dateMain = parts[0].trim();
                    dateSub = `(${parts[1]}`.trim();
                  }

                  const cleanActivities = (dayActivities || []).map(cleanBulletText).filter((a) => a.length > 0);
                  const cleanScenicStops = (dayScenicStops || []).map(cleanBulletText).filter((s) => s.length > 0);
                  const cleanBullets = (dayBullets || []).map(cleanBulletText).filter((b) => b.length > 0);

                  const isActivitiesHidden = day.hiddenSections?.includes("activities");
                  const isScenicHidden = day.hiddenSections?.includes("scenicStops");
                  const isBulletsHidden = day.hiddenSections?.includes("bullets");

                  return (
                    <tr
                      key={day.id || idx}
                      className="border-b border-black align-top break-inside-avoid page-break-inside-avoid"
                    >
                      {/* 1. Date Column (Centered, font-normal) */}
                      <td className="py-3 px-2 border-r border-black font-sans text-center align-top w-[115px]">
                        <div className="font-normal text-[12.5px] text-black leading-tight uppercase">
                          {dateMain}
                        </div>
                        {dateSub && (
                          <div className="text-[11.5px] font-normal text-black leading-tight uppercase mt-0.5">
                            {dateSub}
                          </div>
                        )}
                      </td>

                      {/* 2. Tour Content Column (font-normal typography, bullets, Hotel on bottom right) */}
                      <td className="py-3 px-4 border-r border-black align-top">
                        {/* Day Title / Headline (Lightly bolded - font-semibold per user request) */}
                        {dayTitle && (
                          <div className="font-semibold text-[13px] text-black mb-1.5 leading-snug">
                            {dayTitle}
                          </div>
                        )}

                        {/* Activities (bulleted list matching reference style) */}
                        {cleanActivities.length > 0 && !isActivitiesHidden && (
                          <div className="my-1">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-black leading-normal">
                              {cleanActivities.map((act, aIdx) => (
                                <span key={aIdx} className="inline-flex items-center gap-1 font-normal">
                                  <span>•</span>
                                  <span>{act}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Scenic Stops (bulleted list matching reference style) */}
                        {cleanScenicStops.length > 0 && !isScenicHidden && (
                          <div className="my-1">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-black leading-normal">
                              {cleanScenicStops.map((stop, sIdx) => (
                                <span key={sIdx} className="inline-flex items-center gap-1 font-normal">
                                  <span>•</span>
                                  <span>{stop}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tour Highlights & Day Notes */}
                        {cleanBullets.length > 0 && !isBulletsHidden && (
                          <ul className="space-y-1 text-[12px] text-black leading-snug my-1 pl-0.5 font-normal">
                            {cleanBullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1.5">
                                <span className="shrink-0">•</span>
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Custom Sections (Title + Description bullet points) */}
                        {(day.customSections || []).map((cSec) => {
                          const cTitle = isJa ? (cSec.titleJa || cSec.title) : cSec.title;
                          const cDesc = isJa ? (cSec.descriptionJa || cSec.description) : cSec.description;
                          const lines = (cDesc || "")
                            .split("\n")
                            .map(cleanBulletText)
                            .filter((l) => l.length > 0);

                          if (!cTitle && lines.length === 0) return null;

                          return (
                            <div key={cSec.id} className="my-1">
                              {cTitle && (
                                <div className="font-semibold text-[12px] text-black mb-0.5 leading-snug">
                                  {cTitle}
                                </div>
                              )}
                              {lines.length > 0 && (
                                <ul className="space-y-1 text-[12px] text-black leading-snug pl-0.5 font-normal">
                                  {lines.map((line, lIdx) => (
                                    <li key={lIdx} className="flex items-start gap-1.5">
                                      <span className="shrink-0">•</span>
                                      <span>{line}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}

                        {/* Hotel Check-In: Left label 'Hotel Check-in', right uppercase hotel name (font-normal) */}
                        {hotelName && (
                          <div className="mt-3.5 pt-1.5 flex items-baseline justify-between text-[12px]">
                            <span className="text-black font-normal">
                              {isJa ? "ホテルチェックイン" : "Hotel Check-in"}
                            </span>
                            <span className="font-normal text-black uppercase text-right">
                              {hotelName}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 3. Meals Column (B, L, D aligned strictly along the same vertical line, font-normal) */}
                      <td className="py-3 px-3 border-r-0 font-sans text-[12px] align-top w-[115px]">
                        <div className="space-y-1 font-normal text-black leading-tight flex flex-col items-start pl-3 text-left">
                          {/* Breakfast */}
                          {day.meals?.breakfast && day.meals.breakfast !== "NONE" && (
                            <div className="whitespace-nowrap">
                              {isJa
                                ? `朝 - ${day.meals.breakfast === "HOTEL" ? "ホテル" : day.meals.breakfast}`
                                : `B - ${day.meals.breakfast}`}
                            </div>
                          )}

                          {/* Lunch */}
                          {day.meals?.lunch && day.meals.lunch !== "NONE" && (
                            <div className="whitespace-nowrap">
                              {isJa
                                ? `昼 - ${day.meals.lunch === "CLIENT" ? "お客様負担" : day.meals.lunch === "HOTEL" ? "ホテル" : day.meals.lunch}`
                                : `L - ${day.meals.lunch}`}
                            </div>
                          )}

                          {/* Dinner */}
                          {day.meals?.dinner && day.meals.dinner !== "NONE" && (
                            <div className="whitespace-nowrap">
                              {isJa
                                ? `夕 - ${day.meals.dinner === "HOTEL" ? "ホテル" : day.meals.dinner}`
                                : `D - ${day.meals.dinner}`}
                            </div>
                          )}

                          {/* When all 3 are explicitly NONE */}
                          {(!day.meals?.breakfast || day.meals.breakfast === "NONE") &&
                            (!day.meals?.lunch || day.meals.lunch === "NONE") &&
                            (!day.meals?.dinner || day.meals.dinner === "NONE") && (
                              <div className="text-slate-500 font-normal whitespace-nowrap">
                                {isJa ? "なし" : "D - NONE"}
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400 italic text-[12px]">
                    No itinerary days configured. Click &ldquo;Add Day&rdquo; in the editor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ══════════════════════════════════════════════════════════
            REMARKS SECTION (Clean Bordered Box)
        ══════════════════════════════════════════════════════════ */}
        {(() => {
          const cleanRemarks = (remarks || []).map(cleanBulletText).filter((r) => r.length > 0);
          if (cleanRemarks.length === 0) return null;
          return (
            <div className="mt-4 border border-black p-3 text-[11.5px] break-inside-avoid page-break-inside-avoid">
              <span className="font-normal uppercase tracking-wider text-[11px] text-black block mb-1">
                {isJa ? "重要事項 & 旅行条件:" : "Important Remarks & Tour Conditions:"}
              </span>
              <ul className="space-y-0.5 text-[11.5px] text-black leading-relaxed font-normal">
                {cleanRemarks.map((r, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════
            FOOTER SECTION (Clean One-Line Details)
        ══════════════════════════════════════════════════════════ */}
        <div className="mt-4 pt-2 border-t border-black flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-black break-inside-avoid page-break-inside-avoid font-normal">
          <div className="space-y-0.5">
            <div className="text-black uppercase">
              {doc.companyInfo.nameEn || "Ikisaki Tours (Private) Limited"} • {doc.companyInfo.registrationNo} • {doc.companyInfo.sltdaNo}
            </div>
            <p>{doc.companyInfo.address}</p>
          </div>

          <div className="text-right space-y-0.5 font-mono">
            <p className="text-black">{doc.companyInfo.tel}</p>
            <p>{doc.companyInfo.email} | {doc.companyInfo.website}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
