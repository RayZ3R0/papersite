'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    text: "PaperVoid has been an incredibly helpful resource for my A-Level studies. The search feature makes finding past papers so much easier!",
    author: "Alex K.",
    role: "A-Level Student"
  },
  {
    id: 2,
    text: "As a teacher, I recommend PaperVoid to all my students. The organized collection of papers and mark schemes has improved our exam preparation.",
    author: "Sarah M.",
    role: "Chemistry Teacher"
  },
  {
    id: 3,
    text: "Having all these resources in one place has saved me countless hours. The interface is intuitive and the papers are well categorized.",
    author: "James T.",
    role: "Physics Student"
  }
];

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  
  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 md:py-24 bg-surface"
    >
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
            What Users Are Saying
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Hear from students and teachers who use PaperVoid
          </p>
        </motion.div>
        
        <div className="relative px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10"></div>
                <div className="text-primary text-xl font-bold">{testimonials[activeIndex].author.charAt(0)}</div>
              </div>
              
              <p className="text-lg md:text-xl italic text-text mb-6 max-w-3xl mx-auto">
                "{testimonials[activeIndex].text}"
              </p>
              
              <div className="mb-8">
                <p className="font-medium text-text">{testimonials[activeIndex].author}</p>
                <p className="text-text-muted text-sm">{testimonials[activeIndex].role}</p>
              </div>
              
              <div className="flex justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === activeIndex ? 'bg-primary' : 'bg-border'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       bg-surface-alt border border-border flex items-center justify-center
                       text-text hover:text-primary hover:border-primary/30 transition-colors"
            aria-label="Previous testimonial"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                       bg-surface-alt border border-border flex items-center justify-center
                       text-text hover:text-primary hover:border-primary/30 transition-colors"
            aria-label="Next testimonial"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}