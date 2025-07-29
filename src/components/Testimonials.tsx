import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Jane Doe",
    title: "Digital Artist",
    quote: "SheikhImg has revolutionized my creative process. The quality of the generated images is simply outstanding!",
  },
  {
    name: "John Smith",
    title: "Marketing Manager",
    quote: "We use SheikhImg for all our campaign visuals. It's fast, reliable, and incredibly easy to use.",
  },
  {
    name: "Sam Wilson",
    title: "Content Creator",
    quote: "I can now generate unique thumbnails and blog post images in seconds. A total game-changer for my workflow."
  }
];

interface TestimonialsProps {
  theme: 'dark' | 'light';
}

export const Testimonials = ({ theme }: TestimonialsProps) => {
  return (
    <div className="py-16">
      <h2 className={cn(
        "text-3xl font-bold text-center mb-10",
        theme === 'dark' ? "text-white" : "text-gray-900"
      )}>
        Loved by Creatives Everywhere
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            <Card className={cn(
              "p-6 h-full",
              theme === 'dark' ? "bg-black/50 border-white/10" : "bg-white/80 border-gray-200"
            )}>
              <p className={cn(
                "mb-4 text-base",
                theme === 'dark' ? "text-gray-300" : "text-gray-700"
              )}>"{testimonial.quote}"</p>
              <div className="mt-auto">
                <div className={cn(
                  "font-semibold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>{testimonial.name}</div>
                <div className={cn(
                  "text-sm",
                  theme === 'dark' ? "text-gray-400" : "text-gray-600"
                )}>{testimonial.title}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
