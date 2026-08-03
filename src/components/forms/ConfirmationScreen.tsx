"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  NilavilakkuLamp,
  Sparkle,
} from "./FestiveElements";
import { CAMPAIGN_NAME } from "@/lib/brand";

interface ConfirmationScreenProps {
  entryId: string;
  name: string;
  modelName: string;
  customerLocation: string;

}

export function ConfirmationScreen({
  entryId,
  name,
  modelName,
  customerLocation,

}: ConfirmationScreenProps) {
  const [confetti] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.4,
      dur: 1.6 + Math.random() * 1.2,
      color: ['#EB0A1E', '#D4930A', '#FFD700', '#F5A623', '#fff', '#FF6B6B', '#FF8F00', '#FFF176'][i % 8],
      size: 6 + Math.floor(Math.random() * 5),
      shape: i % 3,
    }))
  );

  return (
    <div className="flex flex-col min-h-screen relative font-sans w-full max-w-[420px] mx-auto shadow-2xl overflow-hidden" style={{ background: '#FFF4E1' }}>
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {confetti.map(p => (
          <div
            key={p.id}
            className="confetti"
            style={{
              left: `${p.left}%`, top: 0,
              width: p.size, height: p.shape === 1 ? p.size * 1.6 : p.size,
              borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? 2 : 0,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
        className="relative overflow-hidden" 
        style={{ background: '#0E3A36' }}
      >
        <div className="h-9" />
        <div className="relative flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8">
              <Image src="/images/logo_for_customer_facing.webp" alt="Toyota Emblem" fill sizes="32px" className="object-contain" priority />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-white text-[16px] font-black tracking-[0.15em] leading-tight uppercase">NIPPON</p>
              <p className="text-white text-[16px] font-black tracking-[0.15em] leading-none uppercase">TOYOTA</p>
            </div>
          </div>
          <div className="pookalam-spin opacity-90 flex-shrink-0 relative" style={{ width: 64, height: 64 }}>
            <Image src="/images/pookalam.webp" alt="Onam pookalam" fill sizes="64px" className="object-cover" priority />
          </div>
        </div>
        <svg viewBox="0 0 390 22" className="w-full block" style={{ marginBottom: -1 }}>
          <path d="M0,22 C65,4 130,20 195,10 C260,0 325,18 390,6 L390,22 Z" fill="#FFF4E1" />
        </svg>
      </motion.div>

      {/* Success hero */}
      <div className="flex flex-col items-center pt-5 pb-2 relative z-10">
        <div className="flex items-end justify-center gap-6 mb-1">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <NilavilakkuLamp size={36} />
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0, rotate: -15, opacity: 0 }} 
            animate={{ scale: 1, rotate: 0, opacity: 1 }} 
            transition={{ delay: 0.1, type: "spring", bounce: 0.6, duration: 0.8 }}
            className="relative flex-shrink-0"
          >
            <div style={{ width: 88, height: 88, position: 'relative' }}>
              <Image src="/images/pookalam.webp" alt="" fill sizes="88px" className="object-cover opacity-80" priority />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                  style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)' }}
                >
                  <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
                    <motion.path 
                      initial={{ pathLength: 0 }} 
                      animate={{ pathLength: 1 }} 
                      transition={{ delay: 0.5, duration: 0.5 }}
                      d="M2 11L9.5 19L24 2" 
                      stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
            <NilavilakkuLamp size={36} />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center px-5 mt-3"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: '#F47C00' }}>
            {CAMPAIGN_NAME}
          </p>
          <h2 className="text-gray-900 text-[28px] font-black leading-tight">
            You&apos;re In! 🎉
          </h2>
          <p className="text-[13px] font-normal mt-1.5 leading-relaxed" style={{ color: '#78350F' }}>
            Thank you, <span className="font-extrabold text-[#0E3A36]">{name.split(' ')[0]}</span>!<br />
            Best of luck in the lucky draw.
          </p>
        </motion.div>
      </div>

      {/* Ticket card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.3 }}
        className="mx-4 mt-4 mb-4 rounded-3xl overflow-hidden shadow-2xl relative z-10" 
        style={{ border: '1.5px solid #FFD400' }}
      >
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#0E3A36' }}>
          <div>
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: '#FFD400' }}>Entry Ticket</p>
            <p className="text-white text-[12px] font-semibold mt-0.5">{CAMPAIGN_NAME}</p>
          </div>
          <div className="pookalam-spin flex-shrink-0 relative" style={{ width: 36, height: 36 }}>
            <Image src="/images/pookalam.webp" alt="" fill sizes="36px" className="object-cover" />
          </div>
        </div>

        <div className="flex items-center" style={{ background: '#ffffff' }}>
          <div className="w-4 h-6 rounded-r-full -ml-px flex-shrink-0" style={{ background: '#FFF4E1', border: '1.5px solid #FFD400', borderLeft: 'none' }} />
          <div className="flex-1 mx-1" style={{ borderTop: '2px dashed #FFD400' }} />
          <div className="w-4 h-6 rounded-l-full -mr-px flex-shrink-0" style={{ background: '#FFF4E1', border: '1.5px solid #FFD400', borderRight: 'none' }} />
        </div>

        <div className="px-5 pb-4 pt-3" style={{ background: '#ffffff' }}>
          <div className="text-center mb-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#9CA3AF' }}>Your Lucky Ticket</p>
            <div
              className="inline-block px-6 py-2.5 rounded-2xl"
              style={{ background: '#FFD400', border: '1.5px solid #F47C00' }}
            >
              <span className="text-[20px] font-black tracking-[0.05em] uppercase" style={{ color: '#0E3A36' }}>
                {entryId.slice(0, 8)}
              </span>
            </div>
          </div>

          <div className="h-px mb-4" style={{ background: '#FFD400' }} />

          <div className="space-y-3">
            {[
              { label: 'Name', value: name },
              { label: 'Vehicle', value: modelName || "None" },
              { label: 'Location', value: customerLocation },

            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider flex-shrink-0" style={{ color: '#9CA3AF' }}>{row.label}</span>
                {row.value ? (
                  <span className="text-[13px] font-bold text-gray-800 text-right leading-snug">{row.value}</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full" style={{ border: '1px solid #BBF7D0' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Confirmed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-center gap-2" style={{ background: '#FFD400' }}>
          <Sparkle size={12} color="#0E3A36" />
          <p className="text-[11px] font-bold" style={{ color: '#0E3A36' }}>Save this screenshot for reference</p>
          <Sparkle size={12} color="#0E3A36" />
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mx-4 mb-6 relative z-10"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: CAMPAIGN_NAME,
                text: `I just registered for the ${CAMPAIGN_NAME}!`,
                url: window.location.href,
              })
            }
          }}
          className="w-full py-4 rounded-2xl text-[14px] font-extrabold text-white transition-transform shadow-lg shadow-orange-900/20"
          style={{ background: '#F47C00' }}
        >
          Share 🎊
        </motion.button>
      </motion.div>

    </div>
  )
}
