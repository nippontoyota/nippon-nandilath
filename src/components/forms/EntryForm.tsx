"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrySchema, type EntryInput } from "@/schemas/entry";
import { submitEntry } from "@/app/actions/entry";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  PetalRain,
  Sparkle,
} from "./FestiveElements";
import { CAMPAIGN_NAME } from "@/lib/brand";



const inputBase = (hasError: boolean) =>
  `w-full px-4 py-3.5 rounded-2xl text-[16px] font-medium border-2 transition-all bg-white outline-none text-gray-900 placeholder:text-gray-400 ` +
  (hasError
    ? 'border-red-400'
    : 'border-gray-200 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]')

const selectBase = (hasError: boolean) =>
  inputBase(hasError) + ' appearance-none cursor-pointer ' +
  (hasError ? 'text-red-700' : 'text-[#0E3A36]')

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-bold mb-1.5 tracking-[0.12em] uppercase text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-[11px] font-medium mt-1.5 flex items-center gap-1" 
          style={{ color: '#DC2626' }}
        >
          <span>⚠</span> {error}
        </motion.p>
      )}
    </div>
  )
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  hasError,
  disabled
}: {
  options: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  hasError: boolean;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const selectedOption = options.find(o => o.id === value);
  const displayValue = isOpen ? search : (selectedOption?.name || "");

  const filteredOptions = options.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={displayValue}
        onFocus={() => {
          setIsOpen(true);
          setSearch("");
        }}
        onBlur={() => {
          // Delay closing so click events on options can fire
          setTimeout(() => setIsOpen(false), 200);
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          if (value) onChange(""); // clear selection if user types
        }}
        className={inputBase(hasError) + (disabled ? ' opacity-50 cursor-not-allowed' : '')}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown />
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-amber-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No options found.</div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents input onBlur from firing immediately
                  onChange(opt.id);
                  setSearch("");
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-sm cursor-pointer hover:bg-[#FFF4E1] ${value === opt.id ? 'bg-[#C8102E]/10 font-bold text-[#C8102E]' : 'text-[#C8102E]'}`}
              >
                {opt.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function EntryForm() {
  const campaignSubtitle = CAMPAIGN_NAME;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      terms: false,
      honeypot: "",
    },
  });



  const onSubmit = async (data: EntryInput) => {
    setLoading(true);
    form.clearErrors("root");
    
    const result = await submitEntry(data);
    
    if ("error" in result) {
      form.setError("root", { message: result.error as string });
      setLoading(false);
    } else if ("id" in result) {
      router.push(`/confirmation/${result.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative font-sans w-full max-w-[420px] mx-auto overflow-hidden bg-white">

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] h-[100dvh] w-screen flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center relative z-10 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }} 
                className="mb-14 flex flex-col items-center justify-center gap-3"
              >
                <div className="relative h-14 w-14">
                  <Image src="/images/logo_for_customer_facing.webp" alt="Toyota Emblem" fill sizes="56px" className="object-contain object-center" priority />
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }} 
                className="mb-14 relative"
              >
                <div className="w-16 h-16 border-4 border-gray-100 border-t-[#C8102E] rounded-full animate-spin"></div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }} 
                className="text-gray-900 text-[18px] font-black uppercase tracking-widest mb-2"
              >
                Processing
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }} 
                className="text-gray-500 text-[13px] font-medium"
              >
                Please wait while we secure your entry...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-white overflow-hidden">
        <Image 
          src="/images/nandilath-nippon-v3.png" 
          alt="Nandilath Nippon Banner" 
          width={1200}
          height={600}
          className="w-full h-auto scale-[1.05] sm:scale-105 origin-center" 
          priority 
        />
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full mt-6 mb-8 px-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col w-full"
        >
          <input type="text" {...form.register("honeypot")} className="absolute -left-[9999px] opacity-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
          
          <Field label="Full Name *" error={form.formState.errors.name?.message}>
            <input
              type="text"
              {...form.register("name")}
              className={inputBase(!!form.formState.errors.name)}
            />
          </Field>

          <Field label="Mobile Number *" error={form.formState.errors.phone?.message}>
            <input
              type="tel"
              maxLength={10}

              {...form.register("phone", {
                onChange: (e) => e.target.value = e.target.value.replace(/\D/g, '')
              })}
              className={inputBase(!!form.formState.errors.phone)}
            />
          </Field>

          <Field label="Address" error={form.formState.errors.address?.message}>
            <textarea
              rows={3}
              {...form.register("address")}
              className={inputBase(!!form.formState.errors.address) + " resize-none"}
            />
          </Field>



          {form.formState.errors.root && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[13px] text-[#DC2626] font-medium bg-red-50 p-3 rounded-lg border border-red-200 mt-2 mb-2"
            >
              {form.formState.errors.root.message}
            </motion.p>
          )}

          <div className="mt-4 px-1">
            <label className="flex items-start gap-3.5 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                <input 
                  type="checkbox" 
                  id="terms"
                  {...form.register("terms")}
                  className="peer sr-only"
                />
                <div className="w-7 h-7 rounded-md bg-white border-2 border-gray-300 peer-checked:bg-[#C8102E] peer-checked:border-[#C8102E] transition-all flex items-center justify-center">
                  <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-all scale-50 peer-checked:scale-100 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-[13px] text-gray-500 font-medium leading-snug pt-1">
                I have read and agree to the <span className="text-[#C8102E] font-bold">Terms and Conditions</span> of this lucky draw.
              </div>
            </label>
            {form.formState.errors.terms && (
              <p className="text-[12px] text-[#DC2626] font-medium mt-2 ml-[42px]">
                {form.formState.errors.terms.message}
              </p>
            )}
          </div>

          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white text-[15px] font-extrabold tracking-widest uppercase transition-transform"
              style={{ background: '#C8102E', opacity: loading ? 0.8 : 1 }}
            >
              {form.formState.isSubmitting ? "PROCESSING..." : "SUBMIT ENTRY"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}
