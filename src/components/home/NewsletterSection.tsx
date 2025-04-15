'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically submit the email to your API
    // For demo purposes, we'll just simulate a successful subscription
    
    setSubmitted(true);
    setEmail('');
    
    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-16 md:py-20 bg-gradient-to-r from-primary/10 to-secondary/10"
    >
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="p-8 md:p-10 rounded-2xl border border-border bg-surface/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Newsletter Icon */}
            <div className="md:w-1/4 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-primary/10">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            {/* Newsletter Content */}
            <div className="md:w-3/4">
              <h2 className="text-2xl font-bold text-text mb-2 text-center md:text-left">
                Stay Updated
              </h2>
              <p className="text-text-muted mb-6 text-center md:text-left">
                Subscribe to our newsletter for updates on new papers, study resources, and tips
              </p>
              
              {submitted ? (
                <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
                  Thanks for subscribing! We'll be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full md:flex-1 px-4 py-3 rounded-lg border border-border
                            bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30
                            text-text placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg
                            hover:bg-primary-dark transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
              
              <p className="mt-4 text-xs text-text-muted text-center md:text-left">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}