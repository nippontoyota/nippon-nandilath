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

interface ModelType {
  id: string;
  name: string;
}

interface EntryFormProps {
  branchId: string;
  branchName?: string;
  models: ModelType[];
}

const inputBase = (hasError: boolean) =>
  `w-full px-4 py-3.5 rounded-2xl text-[14px] font-medium border-2 transition-all bg-white outline-none text-[#C8102E] placeholder:text-gray-400 ` +
  (hasError
    ? 'border-red-400'
    : 'border-[#C8102E]/30 focus:border-[#C8102E] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.15)]')

const selectBase = (hasError: boolean) =>
  inputBase(hasError) + ' appearance-none cursor-pointer ' +
  (hasError ? 'text-red-700' : 'text-[#0E3A36]')

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-bold mb-1.5 tracking-[0.12em] uppercase" style={{ color: '#C8102E' }}>
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

export function EntryForm({ branchId, branchName, models }: EntryFormProps) {
  const campaignSubtitle = branchName ? `${branchName} Branch • ${CAMPAIGN_NAME}` : CAMPAIGN_NAME;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      name: "",
      phone: "",
      customerLocation: "",
      interestedInPurchase: undefined as any,
      modelId: "",
      branchId,
      confirm: false,
      honeypot: "",
    },
  });

  const interestedInPurchase = form.watch("interestedInPurchase");

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
    <div className="flex flex-col min-h-screen relative font-sans w-full max-w-[420px] mx-auto shadow-2xl overflow-hidden" style={{ background: '#FFF4E1' }}>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] h-[100dvh] w-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden"
            style={{ background: '#0E3A36' }}
          >
            <PetalRain />
            {[
              { top: '10%', left: '10%', size: 10, color: '#FFD700', delay: '0s' },
              { top: '20%', left: '80%', size: 8, color: '#FFA000', delay: '0.6s' },
              { top: '70%', left: '15%', size: 7, color: '#FFD700', delay: '1.1s' },
              { top: '80%', left: '85%', size: 9, color: '#FF8F00', delay: '0.3s' },
              { top: '40%', left: '75%', size: 6, color: '#FFD700', delay: '1.8s' },
            ].map((s, i) => (
              <div key={i} className="absolute twinkle" style={{ top: s.top, left: s.left, animationDuration: `${1.6 + i * 0.4}s`, animationDelay: s.delay }}>
                <Sparkle size={s.size} color={s.color} />
              </div>
            ))}

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
                <div className="flex flex-col items-center mt-3">
                  <p className="text-white text-[20px] font-black tracking-[0.15em] leading-tight uppercase">NIPPON</p>
                  <p className="text-white text-[20px] font-black tracking-[0.15em] leading-none uppercase">TOYOTA</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }} 
                className="mb-14 relative"
              >
                <div className="pookalam-spin shadow-2xl" style={{ width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,215,0,0.3)', position: 'relative' }}>
                  <Image src="/images/pookalam-generated.webp" alt="Loading" fill sizes="160px" className="object-cover" priority />
                </div>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }} 
                className={`w-full py-4 rounded-2xl text-[15px] font-black uppercase tracking-widest transition-all ${
              form.formState.isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#C8102E] text-white hover:bg-[#F47C00] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            }`}
              >
                Processing | പ്രോസസ്സ് ചെയ്യുന്നു
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }} 
                className="text-white/80 text-[13px] font-medium shimmer-gold"
              >
                Please wait while we secure your entry... | ദയവായി കാത്തിരിക്കുക...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-[#C8102E] overflow-hidden">
        <Image 
          src="/images/nandilath-nippon.png" 
          alt="Nandilath Nippon Banner" 
          width={1200}
          height={600}
          className="w-full h-auto scale-[1.05] sm:scale-105 origin-center" 
          priority 
        />
      </div>

      {/* Form card */}
      <div className="relative z-10 mx-4 mt-6 mb-8 rounded-3xl overflow-visible">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-3xl p-5 shadow-xl bg-white"
          style={{
            border: '1.5px solid #C8102E',
            boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
          }}
        >
          <input type="text" {...form.register("honeypot")} className="absolute -left-[9999px] opacity-0 pointer-events-none" tabIndex={-1} aria-hidden="true" />
          
          <Field label="Full Name" error={form.formState.errors.name?.message}>
            <input
              type="text"
              {...form.register("name")}
              className={inputBase(!!form.formState.errors.name)}
            />
          </Field>

          <Field label="Mobile Number" error={form.formState.errors.phone?.message}>
            <div className="flex gap-2">
              <div
                className="flex items-center justify-center gap-1.5 px-3.5 rounded-2xl border-2 border-[#C8102E]/30 bg-white text-[13px] font-bold text-[#C8102E] whitespace-nowrap shrink-0"
                style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}
              >
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                {...form.register("phone", {
                  onChange: (e) => e.target.value = e.target.value.replace(/\D/g, '')
                })}
                className={inputBase(!!form.formState.errors.phone) + ' !w-auto flex-1 min-w-0'}
              />
            </div>
          </Field>

          <Field label="Customer Location" error={form.formState.errors.customerLocation?.message}>
            <input
              type="text"
              {...form.register("customerLocation")}
              className={inputBase(!!form.formState.errors.customerLocation)}
            />
          </Field>

          <Field label="Interested in purchase?" error={form.formState.errors.interestedInPurchase?.message}>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {["Yes", "Maybe", "No"].map((option) => (
                <label key={option} className={`relative flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  interestedInPurchase === option 
                    ? 'border-[#C8102E] bg-[#C8102E] text-white shadow-lg scale-105' 
                    : 'border-[#C8102E]/30 bg-white text-[#C8102E] hover:border-[#C8102E]/50 hover:bg-[#FFF4E1]'
                }`}>
                  <input
                    type="radio"
                    value={option}
                    {...form.register("interestedInPurchase")}
                    className="sr-only"
                  />
                  <span className="text-[14px] font-bold">{option}</span>
                </label>
              ))}
            </div>
          </Field>

          <AnimatePresence>
            {interestedInPurchase === "Yes" && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
              >
                <div className="pt-2">
                  <Field label="Vehicle Model" error={form.formState.errors.modelId?.message}>
                    <SearchableSelect
                      options={models}
                      value={form.watch("modelId") || ""}
                      onChange={(val) => {
                        form.setValue("modelId", val, { shouldValidate: true });
                      }}
                      placeholder=""
                      hasError={!!form.formState.errors.modelId}
                    />
                  </Field>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 mb-6 bg-[#FFF4E1]/50 p-4 rounded-xl border border-[#C8102E]/30">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  {...form.register("confirm")}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border-2 border-[#C8102E]/40 bg-white peer-checked:bg-[#C8102E] peer-checked:border-[#C8102E] transition-all shadow-sm" />
                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-[11px] leading-relaxed font-medium text-[#C8102E] select-none">
                I confirm that the details provided are accurate and agree to the 
                <a href="#" className="text-[#F062A7] font-bold mx-1 hover:underline">Terms &amp; Conditions</a> 
                of the {CAMPAIGN_NAME}.
              </span>
            </label>
            {form.formState.errors.confirm && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-[11px] font-medium mb-3 flex items-center gap-1" 
                style={{ color: '#DC2626' }}
              >
                <span>⚠</span> {form.formState.errors.confirm.message}
              </motion.p>
            )}
          </div>

          {form.formState.errors.root && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[13px] text-[#DC2626] font-medium bg-red-50 p-3 rounded-lg border border-red-200 mt-2 mb-2"
            >
              {form.formState.errors.root.message}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-2xl text-white text-[15px] font-extrabold tracking-widest uppercase transition-transform"
            style={{ background: '#C8102E', opacity: loading ? 0.8 : 1 }}
          >
            {form.formState.isSubmitting ? "PROCESSING..." : "SUBMIT ENTRY"}
          </motion.button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5Z" fill="#D4930A" />
            </svg>
            <p className="text-[10px] font-medium" style={{ color: '#92400E' }}>
              Your information is secure with us
            </p>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5Z" fill="#D4930A" />
            </svg>
          </div>
        </form>
      </div>
    </div>
  )
}
