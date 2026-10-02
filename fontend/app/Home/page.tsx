"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import {
  FaWrench,
  FaCog,
  FaPlus,
  FaMinus,
  FaUndo,
  FaChevronUp,
  FaCheck,
  FaStar,
  FaBolt,
  FaPlusCircle,
} from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineCleaningServices } from "react-icons/md";
import { GiSwordsEmblem, GiShield, GiSparkles, GiLightningFlame } from "react-icons/gi";

interface NodeData {
  id: number;
  name: string;
  type: string;
  score: number;
  critical: number;
}

export default function Home() {
  // Vanguard Counter States
  const [level, setLevel] = useState<number>(0); // Starts at Grade 0
  const [activeNodeId, setActiveNodeId] = useState<number>(1);
  
  // Customizable Base Power for Grade 0, 1, 2, 3
  const [gradeBasePower, setGradeBasePower] = useState<Record<number, number>>({
    0: 6000,
    1: 8000,
    2: 10000,
    3: 13000,
  });

  // Starting VC Power is 6,000 at Grade 0
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: 1, name: "Vanguard (VC)", type: "Vanguard Circle", score: 6000, critical: 1 },
    { id: 2, name: "Rear-Guard Left", type: "Front Left RC", score: 0, critical: 1 },
    { id: 3, name: "Rear-Guard Right", type: "Front Right RC", score: 0, critical: 1 },
  ]);

  const [customStep, setCustomStep] = useState<number>(10000);
  const [overTriggerActive, setOverTriggerActive] = useState<boolean>(false);

  // Modal / Settings States
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showEditPresets, setShowEditPresets] = useState<boolean>(false);
  const [presetList, setPresetList] = useState<number[]>([5000, 10000, 15000, 50000]);

  // History log for Undo
  const [history, setHistory] = useState<{ nodeId: number; prevScore: number; prevCrit: number }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // GSAP Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // GSAP Entrance Animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 35, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "back.out(1.2)" }
      );
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  // Calculate actual step value taking OverTrigger (100M) into account
  const effectiveStep = overTriggerActive ? 100000000 : customStep;

  // Change Level / Grade (Capped at Max 3)
  const changeGrade = (newGrade: number) => {
    const targetGrade = Math.max(0, Math.min(3, newGrade));
    if (targetGrade === level) return;

    const oldBase = gradeBasePower[level] ?? 6000;
    const newBase = gradeBasePower[targetGrade] ?? 13000;
    const diff = newBase - oldBase;

    setLevel(targetGrade);
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === 1) {
          return { ...node, score: Math.max(0, node.score + diff) };
        }
        return node;
      })
    );

    // GSAP animation for VC Grade Up
    const vcButton = nodeRefs.current[0];
    if (vcButton) {
      gsap.fromTo(
        vcButton,
        { scale: 1.25, rotation: -8 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1.2, 0.4)" }
      );
    }

    showToast(`Ride ขึ้นเป็น Grade ${targetGrade} (VC Base Power: ${newBase.toLocaleString()})`);
  };

  // Handle Score Adjustments with GSAP Feedback
  const handleScoreChange = (type: "add" | "subtract") => {
    const delta = type === "add" ? effectiveStep : -effectiveStep;

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === activeNodeId) {
          setHistory((prev) => [
            { nodeId: node.id, prevScore: node.score, prevCrit: node.critical },
            ...prev.slice(0, 19),
          ]);
          return { ...node, score: Math.max(0, node.score + delta) };
        }
        return node;
      })
    );

    // GSAP Impact Animation on Active Node
    const targetButton = nodeRefs.current[activeNodeId - 1];
    if (targetButton) {
      gsap.fromTo(
        targetButton,
        { scale: type === "add" ? 1.15 : 0.9, y: type === "add" ? -6 : 6 },
        { scale: 1, y: 0, duration: 0.4, ease: "back.out(2)" }
      );
    }
  };

  // Handle Critical Adjustments with GSAP Feedback
  const handleCritChange = (type: "add" | "subtract") => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === activeNodeId) {
          const delta = type === "add" ? 1 : -1;
          const newCrit = Math.max(1, node.critical + delta);
          setHistory((prev) => [
            { nodeId: node.id, prevScore: node.score, prevCrit: node.critical },
            ...prev.slice(0, 19),
          ]);
          return { ...node, critical: newCrit };
        }
        return node;
      })
    );

    // GSAP pulse on active node
    const targetButton = nodeRefs.current[activeNodeId - 1];
    if (targetButton) {
      gsap.fromTo(
        targetButton,
        { scale: 1.12, rotation: 5 },
        { scale: 1, rotation: 0, duration: 0.35, ease: "back.out(2)" }
      );
    }
  };

  // Apply Persona Ride (+10,000 Power to all front units) with GSAP Stagger Wave
  const handlePersonaRide = () => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        score: node.score + 10000,
      }))
    );

    // GSAP Staggered Wave across all 3 nodes
    const activeButtons = nodeRefs.current.filter(Boolean);
    gsap.fromTo(
      activeButtons,
      { scale: 1.18, y: -8 },
      { scale: 1, y: 0, duration: 0.45, stagger: 0.1, ease: "back.out(1.8)" }
    );

    showToast("Persona Ride! +10,000 Power ให้ทุกยูนิต!");
  };

  // Toggle OverTrigger with GSAP Shake
  const handleToggleOverTrigger = () => {
    const nextState = !overTriggerActive;
    setOverTriggerActive(nextState);

    if (nextState) {
      const activeButtons = nodeRefs.current.filter(Boolean);
      gsap.fromTo(
        activeButtons,
        { x: -4 },
        { x: 4, duration: 0.07, repeat: 5, yoyo: true, ease: "sine.inOut" }
      );
    }
  };

  // Undo action
  const handleUndo = () => {
    if (history.length === 0) return;
    const lastAction = history[0];
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === lastAction.nodeId
          ? { ...n, score: lastAction.prevScore, critical: lastAction.prevCrit }
          : n
      )
    );
    setHistory((prev) => prev.slice(1));
    showToast("ย้อนกลับพลังสำเร็จ!");
  };

  // Reset all
  const handleResetAll = () => {
    const base0 = gradeBasePower[0] ?? 6000;
    setNodes([
      { id: 1, name: "Vanguard (VC)", type: "Vanguard Circle", score: base0, critical: 1 },
      { id: 2, name: "Rear-Guard Left", type: "Front Left RC", score: 0, critical: 1 },
      { id: 3, name: "Rear-Guard Right", type: "Front Right RC", score: 0, critical: 1 },
    ]);
    setLevel(0);
    setHistory([]);
    setShowSettings(false);

    // GSAP Reset Pulse
    gsap.fromTo(
      nodeRefs.current.filter(Boolean),
      { scale: 0.85, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.5)" }
    );

    showToast(`รีเซ็ตค่าพลัง Vanguard เริ่มต้นที่ Grade 0 (VC ${base0.toLocaleString()})`);
  };

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  return (
    <main className="min-h-screen min-h-dvh text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 font-sans selection:text-slate-950 relative overflow-y-auto">
      {/* Next.js Optimized Background Image */}
      <Image
        src="/vanguard_bg.png"
        alt="Vanguard Background"
        fill
        priority
        className="object-cover -z-10"
      />

      {/* Main Fight Counter Container with GSAP Ref */}
      <div
        ref={containerRef}
        className="w-full max-w-[94vw] min-[380px]:max-w-[370px] min-[440px]:max-w-[420px] sm:max-w-[450px] md:max-w-[480px] bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden flex flex-col relative z-10 my-auto shadow-amber-500/10"
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black shadow-xl shadow-amber-500/30 animate-bounce flex items-center gap-1.5 whitespace-nowrap">
            <FaCheck /> {toastMessage}
          </div>
        )}

        {/* TOP BAR / FIGHT HEADER */}
        <header className="px-3.5 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-amber-500/20 bg-slate-950/80">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowEditPresets(true)}
              title="ปรับแต่งปุ่มลัด"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-white transition-all active:scale-95 border border-amber-500/30 cursor-pointer"
            >
              <FaWrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="ตั้งค่า"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-white transition-all active:scale-95 border border-amber-500/30 cursor-pointer"
            >
              <FaCog className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {history.length > 0 && (
              <button
                onClick={handleUndo}
                title="ย้อนกลับ"
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 text-amber-400 transition-all active:scale-95 border border-amber-500/40 cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs"
              >
                <FaUndo className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Grade / Level Counter (Max Grade 3) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-bold">Grade (Max 3)</span>
              <span className="text-base sm:text-lg font-black text-amber-400 tracking-tight flex items-center gap-1">
                <GiSwordsEmblem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> Lv.{level}
              </span>
            </div>

            {/* Ride Up Button (Capped at Grade 3) */}
            <button
              onClick={() => changeGrade(level + 1)}
              disabled={level >= 3}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all border ${
                level >= 3
                  ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer border-yellow-200/40"
              }`}
            >
              <FaChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline mr-1" />
              {level >= 3 ? "Max Grade" : "Ride Up"}
            </button>
          </div>
        </header>

        {/* TRIANGLE VANGUARD CIRCLES SECTION */}
        <section className="p-4 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950 border-b border-amber-500/10 relative">
          <div className="flex items-center justify-between w-full mb-3 sm:mb-4 px-1 sm:px-2">
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/20">
              <GiShield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 tracking-wider">
                {activeNode.name}
              </span>
            </div>

            {/* Quick Grade Selection Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[0, 1, 2, 3].map((g) => (
                <button
                  key={g}
                  onClick={() => changeGrade(g)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black transition-all cursor-pointer ${
                    level === g
                      ? "bg-amber-400 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  G{g}
                </button>
              ))}
            </div>
          </div>

          {/* Triangle Fight Playmat Layout */}
          <div className="relative w-full max-w-[270px] sm:max-w-[300px] h-[240px] sm:h-[270px] flex items-center justify-center">
            
            {/* Connecting Triangle Glow Guide Lines */}
            <svg className="absolute inset-0 w-full h-full text-amber-500/20 pointer-events-none" viewBox="0 0 300 270">
              <polygon points="150,55 55,215 245,215" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* VANGUARD CIRCLE (VC - Top Node) */}
            <div className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 z-20">
              <VanguardCircle
                ref={(el) => { nodeRefs.current[0] = el; }}
                node={nodes[0]}
                isActive={activeNodeId === 1}
                isVC={true}
                onClick={() => setActiveNodeId(1)}
              />
            </div>

            {/* REAR-GUARD LEFT (RC-L - Bottom Left) */}
            <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 z-10">
              <VanguardCircle
                ref={(el) => { nodeRefs.current[1] = el; }}
                node={nodes[1]}
                isActive={activeNodeId === 2}
                isVC={false}
                onClick={() => setActiveNodeId(2)}
              />
            </div>

            {/* REAR-GUARD RIGHT (RC-R - Bottom Right) */}
            <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 z-10">
              <VanguardCircle
                ref={(el) => { nodeRefs.current[2] = el; }}
                node={nodes[2]}
                isActive={activeNodeId === 3}
                isVC={false}
                onClick={() => setActiveNodeId(3)}
              />
            </div>
          </div>
        </section>

        {/* MIDDLE POWER & CRITICAL CONTROL PANEL */}
        <section className="px-3.5 sm:px-5 py-3 sm:py-4 space-y-2.5 sm:space-y-3 bg-slate-950/80">
          
          {/* Critical Value Modifier Controls */}
          <div className="flex items-center justify-between bg-slate-900/90 p-2 sm:p-2.5 rounded-2xl border border-amber-500/30">
            <div className="flex items-center gap-1 sm:gap-1.5 px-1">
              <FaStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 truncate max-w-[170px] sm:max-w-none">
                Critical ({activeNode.name}):
              </span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 ml-1">
                {activeNode.critical}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => handleCritChange("subtract")}
                disabled={activeNode.critical <= 1}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs sm:text-sm flex items-center justify-center border border-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                -
              </button>
              <button
                onClick={() => handleCritChange("add")}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer border border-yellow-200/40"
              >
                +
              </button>
            </div>
          </div>

          {/* Persona Ride Trigger */}
          <div className="flex items-center justify-between bg-slate-900/60 p-2 sm:p-2.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] sm:text-xs font-bold text-slate-300 px-1 sm:px-2 flex items-center gap-1.5">
              <FaBolt className="w-3 h-3 text-yellow-400" /> Persona Ride:
            </span>
            <button
              onClick={handlePersonaRide}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <GiSparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" />
              +10,000 หน้ากระดาน
            </button>
          </div>

          {/* Power Preset Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {presetList.map((val, idx) => {
              const isSelected = customStep === val;
              return (
                <button
                  key={idx}
                  onClick={() => setCustomStep(val)}
                  className={`py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-2xl font-black text-xs transition-all duration-200 cursor-pointer border flex flex-col items-center justify-center relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25 scale-[1.02]"
                      : "bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border-slate-700/60"
                  }`}
                >
                  <span>+{val.toLocaleString()}</span>
                  <span className="text-[9px] opacity-80 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <FaPlusCircle className="w-2.5 h-2.5 text-amber-400" /> Power
                  </span>
                </button>
              );
            })}
          </div>

          {/* Glowing Vanguard Status Bar */}
          <div className="relative overflow-hidden rounded-xl p-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-lg shadow-amber-500/10">
            <div className="bg-slate-950 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[10px] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold text-[10px] sm:text-[11px]">
                Power ปรับเพิ่มขึ้นต่อการกด:
              </span>
              <span className="font-black text-amber-400 tracking-wider text-xs sm:text-sm">
                +{effectiveStep.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Modifier Triggers (OverTrigger 100M & +1 Critical) */}
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
            {/* OverTrigger Button */}
            <button
              onClick={handleToggleOverTrigger}
              className={`py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                overTriggerActive
                  ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]"
                  : "bg-slate-900/70 hover:bg-slate-800 text-slate-400 border-slate-700/60"
              }`}
            >
              <GiLightningFlame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse" />
              OverTrigger (100M)
            </button>

            {/* +1 Critical Button */}
            <button
              onClick={() => {
                handleCritChange("add");
                showToast(`+1 Critical ให้ ${activeNode.name}!`);
              }}
              className="py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-yellow-300 border-amber-400/60 hover:border-amber-400 shadow-md active:scale-95"
            >
              <FaStar className="w-3.5 h-3.5 text-amber-400" />
              +1 Critical
            </button>
          </div>
        </section>

        {/* BOTTOM VANGUARD POWER ADJUSTMENT BUTTONS (+ and -) */}
        <section className="p-3.5 sm:p-4 grid grid-cols-2 gap-3 sm:gap-3.5 bg-slate-950 border-t border-amber-500/20">
          {/* (+) Add Power */}
          <button
            onClick={() => handleScoreChange("add")}
            className="py-3.5 sm:py-4.5 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-yellow-300 text-slate-950 active:scale-[0.97] transition-all cursor-pointer shadow-xl shadow-amber-500/25 flex flex-col items-center justify-center border border-yellow-200/40 group"
          >
            <FaPlus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-1">
              เพิ่ม Power
            </span>
          </button>

          {/* (-) Reduce Power */}
          <button
            onClick={() => handleScoreChange("subtract")}
            className="py-3.5 sm:py-4.5 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 hover:from-rose-600 hover:to-red-400 text-white active:scale-[0.97] transition-all cursor-pointer shadow-xl shadow-rose-600/25 flex flex-col items-center justify-center border border-rose-300/30 group"
          >
            <FaMinus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-1">
              ลด Power
            </span>
          </button>
        </section>

      </div>

      {/* EDIT PRESETS MODAL */}
      {showEditPresets && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-[340px] sm:max-w-sm shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-2">
              <FaWrench /> แก้ไขปุ่ม Preset Power
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              กำหนดค่า Power สำหรับปุ่มลัด 4 ปุ่มได้ตามต้องการ:
            </p>

            <div className="space-y-2.5">
              {presetList.map((val, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 w-14 sm:w-16 font-bold">ปุ่ม {idx + 1}:</span>
                  <input
                    type="number"
                    defaultValue={val}
                    onChange={(e) => {
                      const newVals = [...presetList];
                      newVals[idx] = Number(e.target.value) || 0;
                      setPresetList(newVals);
                    }}
                    className="bg-slate-950 text-amber-400 border border-amber-500/40 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold flex-1 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEditPresets(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-[340px] sm:max-w-sm shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-2">
                <FaCog /> ตั้งค่า Vanguard Counter
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>

            {/* Set Vanguard Grade Level */}
            <div className="space-y-2 bg-slate-950 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 flex items-center gap-1">
                <GiSwordsEmblem /> เลือกระดับ Grade ของ Vanguard (Max 3):
              </span>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1">
                {[0, 1, 2, 3].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      changeGrade(g);
                      setShowSettings(false);
                    }}
                    className={`py-1.5 sm:py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer border ${
                      level === g
                        ? "bg-amber-400 text-slate-950 border-yellow-200 shadow-md scale-105"
                        : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
                    }`}
                  >
                    <span>Lv.{g}</span>
                    <span className="text-[8px] sm:text-[9px] font-normal opacity-80">
                      {(gradeBasePower[g] ?? 0).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Configure Base Power for each Grade */}
            <div className="space-y-2 bg-slate-950 p-3 sm:p-3.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <FaWrench className="w-3 h-3 text-amber-400" /> กำหนด Power พื้นฐานแต่ละ Grade (Lv.0 - Lv.3):
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[0, 1, 2, 3].map((g) => (
                  <div key={g} className="flex items-center gap-1.5 bg-slate-900 p-1.5 sm:p-2 rounded-xl border border-slate-800">
                    <span className="text-xs font-black text-amber-400 w-8 sm:w-9">Lv.{g}:</span>
                    <input
                      type="number"
                      value={gradeBasePower[g]}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setGradeBasePower((prev) => {
                          const updated = { ...prev, [g]: val };
                          if (level === g) {
                            setNodes((nodes) =>
                              nodes.map((n) => (n.id === 1 ? { ...n, score: val } : n))
                            );
                          }
                          return updated;
                        });
                      }}
                      className="bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold w-full focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResetAll}
                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MdOutlineCleaningServices className="w-4 h-4" /> รีเซ็ตเกมใหม่ (Grade 0 / VC {(gradeBasePower[0] ?? 6000).toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

// Subcomponent: Vanguard Circle Frame with Responsive sizing & GSAP Ref
const VanguardCircle = React.forwardRef<
  HTMLButtonElement,
  {
    node: NodeData;
    isActive: boolean;
    isVC: boolean;
    onClick: () => void;
  }
>(({ node, isActive, isVC, onClick }, ref) => {
  const scoreRef = useRef<HTMLSpanElement>(null);

  // GSAP Counter Pop Effect whenever score changes
  useEffect(() => {
    if (scoreRef.current) {
      gsap.fromTo(
        scoreRef.current,
        { scale: 1.35, color: "#f59e0b" },
        { scale: 1, color: "#fbbf24", duration: 0.45, ease: "elastic.out(1.2, 0.4)" }
      );
    }
  }, [node.score, node.critical]);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${
        isActive
          ? "bg-gradient-to-b from-amber-500 via-yellow-500 to-amber-700 shadow-2xl shadow-amber-500/40 scale-105 border-4 border-yellow-200"
          : isVC
          ? "bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border-2 border-amber-500/50"
          : "bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border-2 border-blue-500/30"
      }`}
    >
      {/* Circle Badge (VC or RC) */}
      <span
        className={`absolute -top-2 font-black text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md ${
          isActive
            ? "bg-slate-950 text-amber-400 border border-amber-400 animate-pulse"
            : isVC
            ? "bg-amber-500 text-slate-950"
            : "bg-slate-800 text-slate-300 border border-slate-700"
        }`}
      >
        {isVC ? "VC" : "RC"}
      </span>

      {/* Critical Indicator Badge inside Circle */}
      <div className="absolute -bottom-1.5 flex items-center gap-0.5 bg-slate-950 border border-amber-400 text-yellow-300 font-black text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-lg z-30">
        <span>Crit {node.critical}</span>
      </div>

      {/* Circle Name */}
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-200 mb-1">
        {node.name}
      </span>

      {/* Power Value Pill inside Circle with GSAP scoreRef */}
      <div className="bg-slate-950/90 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border border-white/10 shadow-inner max-w-[82px] sm:max-w-[95px] w-full text-center">
        <span ref={scoreRef} className="text-xs sm:text-sm font-black text-amber-400 tracking-tight font-mono inline-block">
          {node.score.toLocaleString()}
        </span>
      </div>
    </button>
  );
});

VanguardCircle.displayName = "VanguardCircle";