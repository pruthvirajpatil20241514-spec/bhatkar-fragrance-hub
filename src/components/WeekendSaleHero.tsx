import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function getNextSaturday() {
  const now = new Date();
  const day = now.getDay();
  const diff = (6 - day + 7) % 7 || 7;
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + diff);
  nextSaturday.setHours(0, 0, 0, 0);
  return nextSaturday;
}

export function WeekendSaleHero() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  function getTimeRemaining() {
    const target = getNextSaturday();
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-gradient-to-br from-black via-neutral-900 to-black text-white py-14 md:py-20 px-4 flex flex-col items-center justify-center text-center overflow-hidden">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold mb-3 md:mb-4 leading-tight"
      >
        Weekend Luxury Sale
      </motion.h1>

      {/* Subtitle */}
      <p className="text-neutral-400 mb-8 md:mb-10 tracking-wide text-sm sm:text-base md:text-lg max-w-xl">
        Exclusive offers dropping soon. Don’t miss it.
      </p>

      {/* Countdown */}
      <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-6 md:gap-10 text-center w-full max-w-lg sm:max-w-none justify-center">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white/10 dark:bg-white/20 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 sm:px-6 sm:py-4 text-xl sm:text-2xl md:text-4xl font-bold shadow-xl w-full">
              {String(item.value).padStart(2, "0")}
            </div>
            <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400">
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Background SALE Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute text-[100px] sm:text-[150px] md:text-[250px] font-black select-none pointer-events-none"
      >
        SALE
      </motion.div>

    </section>
  );
}