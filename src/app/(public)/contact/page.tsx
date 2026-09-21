'use client';

import React, { useState } from 'react';
import { MWButton, MWInput, MWToast, MWFormError } from '@/components/primitives';
import { Mail, Phone, Clock, MapPin, Send, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Please fill in all required fields (Name, Email, Message).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setToastMessage('Thank you for reaching out. Our support team will get back to you shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="mw-container py-12 md:py-16">
      {/* Page Title */}
      <div className="mb-10 text-center md:text-left">
        <div className="text-xs font-bold text-[#1677FF] uppercase tracking-wider mb-1">
          Support & Inquiries
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0B1220] uppercase tracking-tight">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Have a question, feedback, or need verification assistance? Our team is here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Contact Info & Marketplaces */}
        <div className="flex flex-col gap-6">
          <div className="rounded-[22px] bg-white border border-[#DDE5EF] p-8 shadow-xs flex flex-col gap-6">
            <h2 className="text-lg font-black text-[#0B1220] uppercase tracking-wide">
              Direct Contact Details
            </h2>

            <div className="flex flex-col gap-4 text-xs sm:text-sm text-[#0B1220]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#667085] uppercase">Email Support</div>
                  <a href="mailto:muscle.weapon@gmail.com" className="font-bold hover:text-[#1677FF] transition-colors">
                    muscle.weapon@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#667085] uppercase">Phone Helpline</div>
                  <a href="tel:8816090309" className="font-bold hover:text-[#1677FF] transition-colors">
                    8816090309
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#667085] uppercase">Support Hours</div>
                  <div className="font-bold">Monday – Saturday: 10:00 AM – 7:00 PM IST</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#667085] uppercase">Region</div>
                  <div className="font-bold">India</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stronger Together Athlete Card (Screen 06 Specification) */}
          <div className="rounded-[22px] bg-gradient-to-r from-[#0B1220] via-[#122238] to-[#0757C8] p-6 text-white shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#1677FF] mb-1">
                Athlete Community
              </div>
              <div className="text-xl font-black uppercase tracking-tight">
                Stronger Together
              </div>
              <div className="text-xs text-white/70 mt-1">
                Dedicated support for every athlete&apos;s discipline and recovery.
              </div>
            </div>
          </div>

          {/* Official Marketplaces Card */}
          <div className="rounded-[22px] bg-white border border-[#DDE5EF] p-8 shadow-xs">
            <h2 className="text-base font-black text-[#0B1220] uppercase tracking-wide mb-4">
              Verified Marketplace Stores
            </h2>
            <div className="flex flex-col gap-3 text-xs">
              <a
                href="https://www.amazon.in/l/27943762031?ie=UTF8&marketplaceID=A21TJRUUN4KGV&product=B0B5WVQ3SN&me=A1YVXEMI1WMBFS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#F5F8FC] border border-[#DDE5EF] hover:border-[#1677FF] transition-colors font-bold text-[#0B1220]"
              >
                <span>Amazon India Official Store</span>
                <ExternalLink className="w-4 h-4 text-[#667085]" aria-hidden="true" />
              </a>

              <a
                href="https://www.flipkart.com/search?q=muscle%20weapon&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#F5F8FC] border border-[#DDE5EF] hover:border-[#1677FF] transition-colors font-bold text-[#0B1220]"
              >
                <span>Flipkart Official Store</span>
                <ExternalLink className="w-4 h-4 text-[#667085]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="rounded-[22px] bg-white border border-[#DDE5EF] p-8 shadow-xs">
          <h2 className="text-lg font-black text-[#0B1220] uppercase tracking-wide mb-6">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {formError && <MWFormError message={formError} />}

            <MWInput
              label="Your Full Name"
              placeholder="e.g. Rahul Sharma"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <MWInput
              label="Email Address"
              type="email"
              placeholder="e.g. rahul@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <MWInput
              label="Subject"
              placeholder="e.g. Verification Assistance / Product Query"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div className="flex flex-col gap-1.5 text-left">
              <label
                htmlFor="contact-message"
                className="text-xs font-semibold text-[#0B1220] tracking-wide flex items-center gap-1"
              >
                Message <span className="text-[#DC3545]">*</span>
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist you?"
                className="w-full bg-white text-[#0B1220] text-sm rounded-[14px] border border-[#DDE5EF] p-4 transition-all duration-200 placeholder:text-[#98A2B3] focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20"
              />
            </div>

            <MWButton
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
              className="mt-2"
            >
              Send Message
            </MWButton>
          </form>
        </div>
      </div>

      {toastMessage && (
        <MWToast
          type="success"
          message="Message Sent"
          description={toastMessage}
          isOpen={Boolean(toastMessage)}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
