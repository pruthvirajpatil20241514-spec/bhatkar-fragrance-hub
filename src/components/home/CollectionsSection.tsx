import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collections } from "@/data/products";

// dynamically load any available collection images to avoid build errors if a file is missing
const rawImages = import.meta.globEager('/src/assets/generated/collection-*.png', { as: 'url' });

// normalize into a name → url map
const imageMap: Record<string, string> = {};
Object.entries(rawImages).forEach(([p, m]) => {
  const file = p.split('/').pop() || '';
  // modules loaded with `as: 'url'` return string directly
  imageMap[file] = (m as any) || '';
});

// fallback placeholder (a tiny transparent gif or solid color)
const placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const collectionImages = [
  imageMap['collection-women.png'] || placeholder,
  imageMap['collection-unisex.png'] || placeholder,
  imageMap['collection-men.png'] || placeholder,
];

export function CollectionsSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Curated Collections
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto px-4">
            Explore our thoughtfully curated collections, each telling a unique olfactory story
          </p>
        </motion.div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Link
                to={`/shop?collection=${collection.id}`}
                className="group block relative overflow-hidden rounded-xl aspect-[4/5] sm:aspect-[3/4]"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${collectionImages[index]})`,
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-ivory/70 text-sm uppercase tracking-wider mb-2">
                    {collection.products.length} Fragrances
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-ivory mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-ivory/80 text-sm mb-4">
                    {collection.description}
                  </p>
                  <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm font-medium">Explore Collection</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button variant="gold-outline" size="lg" asChild>
            <Link to="/shop">
              View More Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
