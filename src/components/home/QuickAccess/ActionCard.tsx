"use client";

import { useRef } from "react";
import { QuickAction } from "@/types/actions";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

interface ActionCardProps {
  action: QuickAction;
}

export default function ActionCard({ action }: ActionCardProps) {
  const { icon: Icon } = action;
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position tracking for the shine effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smoothed versions for the light effect
  const smoothX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 300, damping: 30 });
  
  // Create CSS variables for the light position
  const lightX = useMotionTemplate`${smoothX}%`;
  const lightY = useMotionTemplate`${smoothY}%`;
  
  // Handle mouse move event on card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <Link href={action.href} className="block h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative h-full rounded-xl overflow-hidden group"
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Main card container */}
        <div className="absolute inset-0 bg-surface border border-border/40 rounded-xl" />
        
        {/* Color gradient backdrop - subtle and elegant */}
        <motion.div 
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 
            transition-opacity duration-300 
            ${action.color.gradientBg}
          `}
        />
        
        {/* Thin highlight top border */}
        <motion.div 
          className={`
            absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full
            ${action.color.highlight}
            opacity-0 group-hover:opacity-100
            transition-all duration-300
          `}
          animate={{
            left: ["10%", "5%", "10%"],
            right: ["10%", "5%", "10%"],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        />
        
        {/* Interactive spotlight effect */}
        <motion.div 
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(800px circle at ${lightX} ${lightY}, ${action.color.glow}, transparent 40%)`,
          }}
        />
        
        {/* Card content */}
        <div className="relative z-10 h-full flex flex-col p-5">
          {/* Icon */}
          <div className="mb-4 flex items-center">
            <motion.div
              className={`
                relative mr-3 flex-shrink-0
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                ${action.color.iconBg}
                shadow-sm
              `}
              whileHover={{ rotate: -5 }}
            >
              <Icon
                className={`
                  w-5 h-5
                  ${action.color.icon}
                  group-hover:scale-110
                  transition-transform duration-300
                `}
              />
            </motion.div>
            
            <h3
              className={`
                text-base font-medium
                ${action.color.text}
                transition-colors duration-300
              `}
            >
              {action.label}
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-sm text-text-muted group-hover:text-text/80 transition-colors duration-300 mb-2">
            {action.description}
          </p>
          
          {/* Floating arrow with line */}
          <div className="mt-auto pt-2 flex items-center">
            <div className={`h-px flex-grow ${action.color.line} opacity-0 group-hover:opacity-60 transition-opacity duration-300`} />
            <motion.div 
              className={`
                ml-3 w-6 h-6 rounded-md flex items-center justify-center
                ${action.color.actionBg}
                opacity-0 group-hover:opacity-100
                translate-x-2 group-hover:translate-x-0
                transition-all duration-300
              `}
            >
              <svg className={`w-3.5 h-3.5 ${action.color.actionIcon}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}