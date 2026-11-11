import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export const SlideTabs = () => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [selected, setSelected] = useState(0);
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected]);

  return (
    <ul className="relative mx-auto flex w-fit rounded-full border border-emerald-500/20 bg-neutral-900/80 p-1 backdrop-blur-md">
      {["Home", "Pricing", "Features", "Docs", "Blog"].map((tab, i) => (
        <Tab
          key={tab}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          isSelected={selected === i}
          onClick={() => setSelected(i)}
        >
          {tab}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

interface TabProps {
  children: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
}

const Tab = React.forwardRef<HTMLLIElement, TabProps>(
  ({ children, isSelected, onClick }, ref) => {
    return (
      <li
        ref={ref}
        onClick={onClick}
        className={`relative z-10 block cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase transition-colors md:px-5 md:py-2.5 md:text-sm ${
          isSelected
            ? "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
            : "text-slate-400 hover:text-white"
        }`}
      >
        {children}
      </li>
    );
  }
);

Tab.displayName = "Tab";

interface CursorProps {
  position: {
    left: number;
    width: number;
    opacity: number;
  };
}

const Cursor = ({ position }: CursorProps) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 35,
      }}
      className="absolute z-0 h-7 rounded-full bg-gradient-to-r from-emerald-500/25 to-emerald-600/35 border border-emerald-400/60 shadow-[0_0_20px_rgba(52,211,153,0.35)] md:h-10"
    />
  );
};