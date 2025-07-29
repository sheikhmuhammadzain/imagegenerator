import { motion } from "framer-motion";

const exampleImages = [
  // Add URLs to some stunning pre-generated images
  "https://images.unsplash.com/photo-1682687220198-88d0bde744d1?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682687220208-22d71b26f593?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682687220166-4f4bf47c5936?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1682687220159-1e7a57a1d17a?q=80&w=2070&auto=format&fit=crop",
];

export const ImageGallery = () => {
  return (
    <div className="relative z-10 mt-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exampleImages.map((src, index) => (
          <motion.div
            key={index}
            className="rounded-lg overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <img 
              src={src} 
              alt={`Example AI-generated image ${index + 1}`} 
              className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-300" 
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
