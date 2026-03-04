import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPANY_INFO } from "@/config/company";

const footerLinks = {
  shop: [
    { label: "All Fragrances", href: "/shop" },
    { label: "Best Sellers", href: "/shop?collection=best-sellers" },
    { label: "New Arrivals", href: "/shop?collection=new-arrivals" },
    { label: "Luxury Collection", href: "/shop?collection=luxury" },
    { label: "Gift Sets", href: "/shop?collection=gifts" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Ingredients", href: "/about#ingredients" },
    { label: "Sustainability", href: "/about#sustainability" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faq" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Track Order", href: "/track-order" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: COMPANY_INFO.social.facebook, label: "Facebook" },
  { icon: Instagram, href: COMPANY_INFO.social.instagram, label: "Instagram" },
  { icon: Twitter, href: COMPANY_INFO.social.twitter, label: "Twitter" },
  { icon: Youtube, href: COMPANY_INFO.social.youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#0F1115] text-white overflow-hidden pt-20 border-t border-white/5">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      {/* Newsletter Section */}
      <div className="relative container mx-auto px-4 mb-20">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl">
          <div className="max-w-xl text-center lg:text-left">
            <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              Elevate Your <span className="text-primary italic">Senses</span>.
            </h3>
            <p className="text-white/60 text-lg font-medium">
              Join our mailing list for exclusive early access to luxury collections and artisanal fragrance insights.
            </p>
          </div>
          <form className="w-full lg:max-w-md group">
            <div className="relative flex p-1.5 bg-white/5 dark:bg-white/10 border border-white/10 dark:border-white/20 rounded-2xl focus-within:border-primary/50 transition-all duration-300">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-none text-white placeholder:text-white/30 h-12 px-4 shadow-none focus-visible:ring-0"
                required
              />
              <Button variant="gold" className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 font-bold uppercase tracking-widest text-[11px]">
                Subscribe
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500">
                B
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-white tracking-tighter">
                  BHATKAR
                </span>
                <span className="block text-[10px] uppercase tracking-[0.4em] text-primary/70 font-bold">
                  PERFUMERY
                </span>
              </div>
            </Link>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Crafting exceptional artisanal fragrances with premium oils and heritage expertise since {COMPANY_INFO.established}.
              Discover the soul of Indian perfumery.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/5 dark:bg-white/10 flex items-center justify-center text-white/50 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300 border border-white/10 dark:border-white/20"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ivory/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ivory/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-ivory/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/30 font-medium">
              &copy; {new Date().getFullYear()} Bhatkar Perfumery. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
