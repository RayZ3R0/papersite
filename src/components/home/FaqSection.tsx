"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const faqs = [
  {
    id: 1,
    question: "How do I search for specific papers?",
    answer:
      "You can use the search bar at the top of the page to find papers by subject, unit, session, or year. You can also use filters to narrow down your search results.",
  },
  {
    id: 2,
    question: "Are all the papers free to access?",
    answer:
      "Yes, all papers and marking schemes on PaperNexus are completely free to access. We believe education resources should be available to everyone.",
  },
  {
    id: 3,
    question: "How often are new papers added?",
    answer:
      "We update our database regularly as new papers become available. The most recent papers are typically added within a few days of their release.",
  },
  {
    id: 4,
    question: "Can I download papers for offline use?",
    answer:
      "Yes, all papers can be downloaded as PDF files for offline use. Simply click on the paper link and it will open in a new tab where you can download it.",
  },
  {
    id: 5,
    question: "What subjects are available?",
    answer:
      "We currently offer papers for Chemistry, Physics, Biology, Mathematics, Economics, Business Studies, and Accounting. We're constantly expanding our collection.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const toggleFaq = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section ref={sectionRef} className="w-full py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Find answers to common questions about PaperNexus
          </p>

          {/* Consistent separator line */}
          <motion.div
            className="w-16 h-1 bg-primary rounded-full mx-auto mt-6"
            initial={{ width: 0, opacity: 0 }}
            animate={
              isInView ? { width: 64, opacity: 1 } : { width: 0, opacity: 0 }
            }
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          />
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between
                          bg-surface hover:bg-surface-alt transition-colors"
                aria-expanded={openId === faq.id}
              >
                <span className="font-medium text-text">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openId === faq.id ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <svg
                    className="w-5 h-5 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-surface-alt/30 text-text-muted border-t border-border/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
