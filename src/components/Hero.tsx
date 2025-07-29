import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from '@mui/icons-material';

interface HeroProps {
  theme: 'dark' | 'light';
  onGetStarted: () => void;
}

export const Hero = ({ theme, onGetStarted }: HeroProps) => {
  return (
    <motion.div
      className="text-center relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <h1 className={cn(
        "text-5xl md:text-7xl font-bold mb-4",
        theme === 'dark'
          ? "bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
          : "text-gray-900"
      )}>
        Create Stunning Visuals with AI
      </h1>
      <p className={cn(
        "max-w-2xl mx-auto mb-8 text-lg",
        theme === 'dark' ? "text-gray-400" : "text-gray-600"
      )}>
        Turn your text prompts into breathtaking images. SheikhImg is a powerful AI image generator that brings your imagination to life with just a few clicks.
      </p>
      <Button
        size="lg"
        onClick={onGetStarted}
        className={cn(
          "transition-transform transform hover:scale-105",
          theme === 'dark'
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        <ImageIcon className="mr-2" />
        Start Creating for Free
      </Button>
    </motion.div>
  );
};
