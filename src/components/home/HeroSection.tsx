import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Flower2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onReady = () => {
      try {
        // Dispatch an event so any external controller can safely initialize
        window.dispatchEvent(new CustomEvent('videoControllerReady', { detail: { video: v } }));
      } catch (err) {
        // ignore
      }
    };

    v.addEventListener('loadedmetadata', onReady);
    // also try canplay as fallback
    v.addEventListener('canplay', onReady);

    return () => {
      v.removeEventListener('loadedmetadata', onReady);
      v.removeEventListener('canplay', onReady);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "brightness(0.9)" }}
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
        <source src="/videos/hero-bg.webm" type="video/webm" />
        {/* Fallback Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-charcoal/30" />
      </video>

      {/* Dark Overlay for Better Text Readability */}
      <div className="absolute inset-0 z-1 bg-gradient-to-r from-charcoal/5 via-transparent to-charcoal/5" />

      {/* Enhanced Floating Elements */}
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl z-2"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-56 h-56 rounded-full bg-accent/8 blur-3xl z-2"
      />
      
      {/* Decorative Circles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 right-1/4 w-1 h-1 bg-primary/40 rounded-full z-2"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-accent/40 rounded-full z-2"
      />

      <div className="container relative z-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Decorative Top Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
              <Flower2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">BHATKAR & CO.</span>
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs md:text-sm font-bold text-white">
                Premium Fragrances Crafted with Passion Since 1987
              </span>
            </span>
          </motion.div>

          {/* Main Heading with Enhanced Typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight mb-4">
              <span className="block text-foreground">Discover Your</span>
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Signature Scent
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          

          {/* CTA Buttons with Enhanced Styling */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button 
              variant="hero" 
              size="xl" 
              asChild
              className="group bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <Link to="/shop" className="flex items-center gap-2">
                Explore Fragrances
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="hero" 
              size="xl" 
              asChild
              className="group bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <Link to="/shop" className="flex items-center gap-2 text-white font-medium hover:text-primary transition-colors group">
                View All Collections
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>


            </Button>
          </motion.div>

          {/* Enhanced Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-3 gap-6 md:gap-12 pt-12 border-t border-primary/10"
          >
            {[
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl mb-2">{stat.icon}</div>
                <div className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Elegant Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-2 hover:border-primary/60 transition-colors">
            <motion.div
              animate={{ y: [2, 6, 2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-2 bg-gradient-to-b from-primary to-accent rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
