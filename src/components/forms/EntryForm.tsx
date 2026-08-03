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
} from "./FestiveElements";
import { CAMPAIGN_NAME } from "@/lib/brand";

const TermsModal = ({ isOpen, onClose, onAccept }: { isOpen: boolean; onClose: () => void; onAccept: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-y-0 w-full max-w-[420px] left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-lg max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900 tracking-wide uppercase">Terms & Conditions</h2>
              <button 
                type="button"
                onClick={onClose}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-[14px] text-gray-600 leading-relaxed space-y-4">
              <p><strong>1. Program Details & Concept</strong></p>
              <p>1.1 These Terms and Conditions govern the &quot;Onam Lucky Draw Scheme&quot; organized jointly by <strong>Nandilath G-Mart</strong> and <strong>Nippon Motor Corporation Private Limited</strong>, wherein eligible customers can participate by completing a qualifying purchase at any Nandilath G-Mart outlet during the Program Period.</p>
              <p>1.2 The Program is subject to all applicable central and state laws and regulations of India.</p>
              <p>1.3 Winners will be selected through a randomized computerized system. The Organizers shall not be liable to explain the method by which any winner is chosen. The joint decision of Nandilath G-Mart and Nippon Motor Corporation Private Limited shall be final and binding in all matters related to this Program.</p>
              <p>1.4 Lucky draws are directed towards encouraging customer transactions and do not fall within the ambit of lotteries and are consequently not prohibited.</p>
              
              <p><strong>2. Program Period</strong></p>
              <p>2.1 The Program will run from <strong>1st August 2026 to 30th September 2026</strong> (both dates inclusive). Entries will strictly close at 11:59:59 PM on 30th September 2026.</p>
              <p>2.2 Only qualifying purchases that occur within the Program Period at authorized Nandilath G-Mart outlets will be considered eligible for entry.</p>

              <p><strong>3. Eligibility</strong></p>
              <p>3.1 The following categories of customers are eligible for the Program:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Any customer who makes a qualifying purchase at any Nandilath G-Mart outlet between 1st August 2026 and 30th September 2026.</li>
                <li>Customers who successfully register their entry via the official digital entry form before the deadline.</li>
              </ul>
              <p>3.2 A valid government-issued photo ID proof (Aadhaar Card, Voter ID, Passport, or Driving License) and the original purchase invoice from Nandilath G-Mart are required to claim the prize.</p>
              <p>3.3 This scheme is <strong>not applicable</strong> to bulk purchases, institutional orders, or corporate fleet purchases.</p>

              <p><strong>4. Prize Structure</strong></p>
              <p>4.1 The grand prize for this campaign is a <strong>Toyota Glanza</strong>.</p>
              <p>4.2 Prizes are <strong>non-transferable</strong> and cannot be exchanged, redeemed for cash, or converted to any other form of consideration.</p>
              <p>4.3 <strong>This scheme cannot be converted into cash and no refund or claim of any kind shall be made against this offer.</strong></p>
              <p>4.4 Prize images shown in any promotional material are for illustrative purposes only. The actual vehicle variant, color, and specifications may slightly vary depending on availability.</p>

              <p><strong>5. Winner Selection & Draw</strong></p>
              <p>5.1 The lucky draw will be conducted via a <strong>randomized computerized system</strong> from all eligible entries received during the Program Period.</p>
              <p>5.2 The draw will be conducted and live-streamed on <strong>Instagram Live</strong>. The draw date will be communicated to all participants via WhatsApp and official social media channels.</p>
              <p>5.3 Each participant is eligible to win <strong>only one prize</strong> during the Program Period. Duplicate entries using the same mobile number will be automatically disqualified.</p>
              <p>5.4 If a selected winner fails to claim their prize within the stipulated time and manner, the prize shall stand <strong>forfeited</strong> and no alternative compensation will be provided.</p>

              <p><strong>6. Prize Claim & Taxes</strong></p>
              <p>6.1 The winner must claim their prize from the designated Nippon Motor Corporation Private Limited outlet.</p>
              <p>6.2 The following documents are required at the time of prize collection:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Original Nandilath G-Mart purchase invoice / receipt.</li>
                <li>Self-attested copy of a valid government-issued photo ID.</li>
                <li>PAN Card.</li>
              </ul>
              <p>6.3 <strong>Taxes and Additional Costs:</strong> The grand prize is an ex-showroom vehicle. <strong>The winner shall be solely responsible for bearing all additional costs</strong>, including but not limited to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>RTO Registration charges.</li>
                <li>Road Tax.</li>
                <li>Vehicle Insurance.</li>
                <li>Tax Deducted at Source (TDS) under Section 194B of the Income Tax Act, 1961 (liable at <strong>30% of the prize value</strong>, or prevailing rate). A TDS certificate will be issued accordingly.</li>
              </ul>

              <p><strong>7. Publicity & Consent</strong></p>
              <p>7.1 By participating in this Program, participants grant Nandilath G-Mart and Nippon Motor Corporation Private Limited the right to use their name, photograph, video, and/or sound recording in any media for promotional purposes without any additional compensation.</p>
              <p>7.2 By accepting the prize, the winner unconditionally consents to the Organizers featuring their win in any marketing communication.</p>
              <p>7.3 Participants registered under NDNC / DND hereby give express consent to be contacted by Nandilath G-Mart, Nippon Motor Corporation Private Limited, or their partner agencies for purposes related to this Program.</p>

              <p><strong>8. General Conditions</strong></p>
              <p>8.1 The Organizers reserve the right to modify, suspend, extend, or cancel this Program at any time without prior notice. Any such decision shall be final and binding.</p>
              <p>8.2 Nandilath G-Mart, Nippon Motor Corporation Private Limited, their directors, officers, employees, and affiliates shall not be held liable for any loss, damage, injury, or claims arising from participation in this Program or acceptance of the prize.</p>
              <p>8.3 All disputes shall be subject to the exclusive jurisdiction of courts in <strong>Kochi, Kerala</strong>. The decision of the Organizers in all matters related to this Program shall be final and no further correspondence will be entertained.</p>
              <p>8.4 Mere participation does not guarantee a prize. Any fraudulent activity or misrepresentation shall result in immediate disqualification.</p>
              <p>8.5 This Program shall not be clubbed with any other ongoing offer or discount scheme unless explicitly stated.</p>
              <p>8.6 The Organizers shall not be held responsible for any technical failures, network issues, or delays in QR code scanning, WhatsApp delivery, or form submission.</p>
              <p>8.7 <strong>Force Majeure:</strong> The Organizers shall not be liable for failure to fulfill obligations due to circumstances beyond their reasonable control, including but not limited to floods, natural disasters, strikes, government orders, or cyber incidents.</p>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={onAccept}
                className="w-full py-3.5 rounded-xl text-white font-extrabold uppercase tracking-widest text-[14px] transition-transform hover:scale-[1.01] active:scale-95"
                style={{ background: '#C8102E' }}
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


const inputBase = (hasError: boolean) =>
  `w-full px-4 py-3.5 rounded-2xl text-[16px] font-medium border-2 transition-all bg-white outline-none text-gray-900 placeholder:text-gray-400 ` +
  (hasError
    ? 'border-red-400'
    : 'border-gray-200 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]')

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
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();

  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
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
      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        onAccept={() => {
          form.setValue("terms", true, { shouldValidate: true });
          setShowTerms(false);
        }}
      />

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

          <Field label="Email Address (Optional)" error={form.formState.errors.email?.message}>
            <input
              {...form.register("email")}
              type="email"
              disabled={loading}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]/20 focus:border-[#C8102E] transition-all disabled:opacity-50"
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
                <div className="w-7 h-7 rounded-md bg-white border-2 border-gray-300 peer-checked:bg-[#C8102E] peer-checked:border-[#C8102E] transition-all flex items-center justify-center text-transparent peer-checked:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-[13px] text-gray-500 font-medium leading-snug pt-1">
                I have read and agree to the <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }} className="text-[#C8102E] font-bold underline outline-none">Terms and Conditions</button> of this lucky draw, and I consent to receiving communications regarding my entry.
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
