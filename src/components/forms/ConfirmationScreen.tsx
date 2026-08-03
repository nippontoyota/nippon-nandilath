"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CAMPAIGN_NAME } from "@/lib/brand";

interface ConfirmationScreenProps {
  entryId: string;
  name: string;
  customerLocation: string;
}

export function ConfirmationScreen({
  entryId,
  name,
  customerLocation,
}: ConfirmationScreenProps) {
  return (
    <div className="flex flex-col min-h-screen relative font-sans w-full max-w-[420px] mx-auto bg-white overflow-hidden">
      
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
        className="relative overflow-hidden bg-white border-b border-gray-100" 
      >
        <div className="h-9" />
        <div className="relative flex items-center justify-center px-5 pb-4">
          <div className="flex items-center">
            <div className="relative h-12 w-36">
              <Image src="/images/gopu-nandilath.png" alt="Gopu Nandilath" fill sizes="144px" className="object-contain object-left" priority />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success hero */}
      <div className="flex flex-col items-center pt-8 pb-4 relative z-10">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.1, type: "spring", bounce: 0.5, duration: 0.6 }}
          className="mb-4"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: '#C8102E' }}>
            <svg width="28" height="24" viewBox="0 0 26 22" fill="none">
              <motion.path 
                initial={{ pathLength: 0 }} 
                animate={{ pathLength: 1 }} 
                transition={{ delay: 0.4, duration: 0.5 }}
                d="M2 11L9.5 19L24 2" 
                stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" 
              />
            </svg>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center px-5"
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 text-gray-500">
            {CAMPAIGN_NAME}
          </p>
          <h2 className="text-gray-900 text-[28px] font-black leading-tight">
            You&apos;re In!
          </h2>
          <p className="text-[14px] font-medium mt-2 leading-relaxed text-gray-600">
            Thank you, <span className="font-extrabold text-gray-900">{name.split(' ')[0]}</span>!<br />
            Best of luck in the lucky draw.
          </p>
        </motion.div>
      </div>

      {/* Ticket card */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.3 }}
        className="mx-4 mt-2 mb-4 rounded-3xl overflow-hidden relative z-10 bg-white" 
        style={{ border: '2px solid #F3F4F6', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}
      >
        <div className="px-5 py-4 flex flex-col items-center border-b border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Your Lucky Ticket</p>
          <div className="inline-block px-6 py-2 rounded-xl bg-white border-2 border-gray-100">
            <span className="text-[22px] font-black tracking-[0.05em] uppercase text-[#C8102E]">
              {entryId.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4 bg-white">
          <div className="space-y-4">
            {[
              { label: 'Name', value: name },
              { label: 'Address', value: customerLocation },
            ].map(row => (
              <div key={row.label} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{row.label}</span>
                {row.value ? (
                  <span className="text-[14px] font-bold text-gray-900 leading-snug">{row.value}</span>
                ) : (
                  <span className="text-[14px] font-bold text-gray-400 leading-snug">Not provided</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3.5 flex items-center justify-center bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 tracking-wide">Save this screenshot for reference</p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mx-4 mt-auto mb-8 relative z-10"
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
          className="w-full py-4 rounded-2xl text-[14px] font-extrabold text-white transition-transform"
          style={{ background: '#C8102E' }}
        >
          Share with Friends
        </motion.button>
      </motion.div>

    </div>
  )
}
