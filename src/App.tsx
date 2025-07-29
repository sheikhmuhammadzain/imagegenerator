import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CardContainer, CardBody, CardItem } from "@/components/ui/card-3d";
import { motion, AnimatePresence } from "framer-motion";
import {
  Add as PlusIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Menu as MenuIcon,
  Delete as DeleteIcon,
  RestartAlt as ReloadIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Language as WebsiteIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { cn } from "@/lib/utils";
import { GoogleGenAI, Modality } from "@google/genai";

// --- INTERFACES ---
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt: string;
  timestamp: number;
  settings: ImageSettings;
}

interface ImageSettings {
  width: number;
  height: number;
  steps: number;
  seed: number;
  cfgScale: number;
}

interface SpotlightProps {
  className?: string;
  fill?: string;
}

// --- REUSABLE UI COMPONENTS ---

const Spotlight = ({ className, fill }: SpotlightProps) => (
  <>
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none">
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "white"}
          fillOpacity="0.21"></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8"></feGaussianBlur>
        </filter>
      </defs>
    </svg>
    <div className={cn(
      "absolute z-[1] w-[50%] opacity-50 transition-opacity duration-500",
      className,
      "before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-yellow-500/10 before:to-transparent before:animate-beam",
      "after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-orange-500/10 after:to-transparent after:animate-beam-slow"
    )} />
  </>
);

const Hero = ({ theme }: { theme: 'dark' | 'light' }) => (
  <motion.div
    className="text-center relative z-10"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <h1 className={cn(
      "text-5xl md:text-7xl font-bold mb-5 pb-5 tracking-tighter font-inter",
      theme === 'dark'
        ? "bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
        : "text-gray-900"
    )}>
      Create Stunning Visuals with AI
    </h1>
    <p className={cn(
      "max-w-2xl mx-auto mb-8 text-lg tracking-tight",
      theme === 'dark' ? "text-gray-400" : "text-gray-600"
    )}>
      Turn your text prompts into breathtaking images. SheikhImg is a powerful AI image generator that brings your imagination to life with just a few clicks.
    </p>
    <Button
      size="lg"
      className={cn(
        "transition-transform transform hover:scale-105",
        theme === 'dark'
          ? "bg-white text-black hover:bg-gray-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      )}
      onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
    >
      <ImageIcon className="mr-2" />
      Start Creating for Free
    </Button>
  </motion.div>
);

const ImageGallery = () => {
  const exampleImages = [
    "https://videos.openai.com/vg-assets/assets%2Ftask_01k19rv3b4fx8s3cxmmjgedqmf%2F1753748569_img_1.webp?st=2025-07-29T18%3A12%3A05Z&se=2025-08-04T19%3A12%3A05Z&sks=b&skt=2025-07-29T18%3A12%3A05Z&ske=2025-08-04T19%3A12%3A05Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=guOu8%2B1%2BKMc7EZOdIcAJwnHgJDV20Vu5Vlkv0t3PAec%3D&az=oaivgprodscus",
    "https://videos.openai.com/vg-assets/assets%2Ftask_01k1b6z571ft68mfhxy4pd7tke%2F1753796890_img_0.webp?st=2025-07-29T18%3A12%3A05Z&se=2025-08-04T19%3A12%3A05Z&sks=b&skt=2025-07-29T18%3A12%3A05Z&ske=2025-08-04T19%3A12%3A05Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=QjP96zkG4CLIVH5lxXr%2Bv335kLZjHiixaja4Vp0b%2BHs%3D&az=oaivgprodscus",
    "https://videos.openai.com/vg-assets/assets%2Ftask_01k1b6xc4zf7jbds4kaadweppq%2F1753796925_img_0.webp?st=2025-07-29T18%3A12%3A32Z&se=2025-08-04T19%3A12%3A32Z&sks=b&skt=2025-07-29T18%3A12%3A32Z&ske=2025-08-04T19%3A12%3A32Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=n53wgJ72%2FdJHMOrA1DZyUE8jmlVmwmAlgKEbe%2BV5D%2BY%3D&az=oaivgprodscus",
    "https://videos.openai.com/vg-assets/assets%2Ftask_01k1bch8n0ekp9pv68b0eyjfqt%2F1753802805_img_1.webp?st=2025-07-29T17%3A15%3A09Z&se=2025-08-04T18%3A15%3A09Z&sks=b&skt=2025-07-29T17%3A15%3A09Z&ske=2025-08-04T18%3A15%3A09Z&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skoid=aa5ddad1-c91a-4f0a-9aca-e20682cc8969&skv=2019-02-02&sv=2018-11-09&sr=b&sp=r&spr=https%2Chttp&sig=Lk3qxUUxsJJSM8UqDP23i%2F0pP82XQOWqOd3On4xy8GM%3D&az=oaivgprodscus",
  ];

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
  )
};

const Testimonials = ({ theme }: { theme: 'dark' | 'light' }) => {
  const testimonialsData = [
    { name: "Jane Doe", title: "Digital Artist", quote: "SheikhImg has revolutionized my creative process. The quality of the generated images is simply outstanding!" },
    { name: "John Smith", title: "Marketing Manager", quote: "We use SheikhImg for all our campaign visuals. It's fast, reliable, and incredibly easy to use." },
    { name: "Sam Wilson", title: "Content Creator", quote: "I can now generate unique thumbnails and blog post images in seconds. A total game-changer for my workflow." }
  ];

  return (
    <div className="py-16">
      <h2 className={cn(
        "text-4xl font-bold text-center mb-10",
        theme === 'dark' ? "text-white" : "text-gray-900"
      )}>
        Loved by Creatives Everywhere
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonialsData.map((testimonial, index) => (
          <Card key={index} className={cn(
            "p-6 relative overflow-hidden",
            theme === 'dark' ? "bg-black/50 border-white/10" : "bg-white/80 border-gray-200 shadow-lg"
          )}>
            <p className={cn(
              "mb-4 text-base",
              theme === 'dark' ? "text-gray-300" : "text-gray-700"
            )}>"{testimonial.quote}"</p>
            <div className="font-semibold">{testimonial.name}</div>
            <div className={cn(
              "text-sm",
              theme === 'dark' ? "text-gray-400" : "text-gray-600"
            )}>{testimonial.title}</div>
          </Card>
        ))}
      </div>
    </div>
  )
};

// --- MAIN APP COMPONENT ---
const STORAGE_KEY = 'sheikhoo_ai_history';
const MAX_HISTORY_ITEMS = 10; // Limit to prevent localStorage overflow
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit to be safe

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, bad, low quality');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');
  const [settings, setSettings] = useState<ImageSettings>({
    width: 1024,
    height: 1024,
    steps: 40,
    seed: 0,
    cfgScale: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        setImageHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      const historyData = JSON.stringify(imageHistory);
      // Check if data size exceeds our limit
      if (historyData.length > MAX_STORAGE_SIZE) {
        // Keep only the most recent items that fit within the limit
        const reducedHistory = imageHistory.slice(0, Math.floor(MAX_HISTORY_ITEMS / 2));
        const reducedData = JSON.stringify(reducedHistory);
        localStorage.setItem(STORAGE_KEY, reducedData);
        setImageHistory(reducedHistory);
        toast({
          title: "Storage Optimized",
          description: `History reduced to ${reducedHistory.length} items to prevent storage overflow`,
        });
      } else {
        localStorage.setItem(STORAGE_KEY, historyData);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Emergency cleanup - remove oldest items
        const emergencyHistory = imageHistory.slice(0, 5);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencyHistory));
          setImageHistory(emergencyHistory);
          toast({
            title: "Storage Full",
            description: "History automatically reduced to prevent app crashes",
            variant: "destructive",
          });
        } catch (secondError) {
          // If still failing, clear history entirely
          localStorage.removeItem(STORAGE_KEY);
          setImageHistory([]);
          toast({
            title: "Storage Cleared",
            description: "History cleared due to storage limitations",
            variant: "destructive",
          });
        }
      }
    }
  }, [imageHistory]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const deleteFromHistory = (id: string) => {
    setImageHistory(prev => prev.filter(img => img.id !== id));
    toast({
      title: "Deleted",
      description: "Image removed from history",
    });
  };

  const clearHistory = () => {
    setImageHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast({
      title: "History Cleared",
      description: "All images have been removed from history",
    });
  };

  const reloadPrompt = (img: GeneratedImage) => {
    setPrompt(img.prompt);
    setNegativePrompt(img.negativePrompt);
    setSettings(img.settings);
    setShowSidebar(false);
    toast({
      title: "Prompt Loaded",
      description: "Settings and prompts have been restored",
    });
  };

  const filteredHistory = imageHistory.filter(img =>
    img.prompt.toLowerCase().includes(searchHistory.toLowerCase())
  );

  const generateImage = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(''); // Clear previous image
    try {
      // NOTE: This part is client-side and exposes the API key.
      // In a real production app, this should be a backend call.
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.GEMINI_API_KEY // Replace with your actual key if needed
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: prompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      if (!response?.candidates?.[0]?.content?.parts) {
        throw new Error('Invalid response format from AI service');
      }

      const parts = response.candidates[0].content.parts;
      let imageUrl = '';
      for (const part of parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          imageUrl = `data:image/png;base64,${imageData}`;
          setGeneratedImage(imageUrl);

          const newImage: GeneratedImage = {
            id: Date.now().toString(),
            url: imageUrl,
            prompt,
            negativePrompt,
            timestamp: Date.now(),
            settings: { ...settings }
          };

          // Limit history size to prevent storage overflow
          setImageHistory(prev => {
            const newHistory = [newImage, ...prev];
            return newHistory.slice(0, MAX_HISTORY_ITEMS);
          });

          toast({
            title: "Success",
            description: "Image generated successfully!",
          });
          break; // Stop after finding the first image
        }
      }
      if (!imageUrl) {
        throw new Error("API did not return an image. Check prompts or API limits.");
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sheikhimg-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async (imageUrl: string) => {
    if (!imageUrl.startsWith('data:image')) {
      toast({ title: "Error", description: "Cannot share a non-data URL directly. Please download and share.", variant: "destructive" });
      return;
    }
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], `sheikhimg-${Date.now()}.png`, { type: "image/png" });

      if (navigator.share) {
        await navigator.share({
          title: 'My AI Generated Image',
          text: 'Check out this image I generated with SheikhImg AI!',
          files: [file],
        });
      } else {
        toast({ title: "Share Not Supported", description: "Your browser does not support the Web Share API. Feature coming soon!" });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({ title: "Error", description: "Failed to share image.", variant: "destructive" });
    }
  };


  return (
    <div className={cn(
      "min-h-screen w-full relative flex flex-col items-center justify-start py-8 px-4 overflow-x-hidden transition-colors duration-300",
      theme === 'dark'
        ? 'bg-black text-white'
        : 'bg-gradient-to-b from-blue-50 to-white text-gray-900'
    )}>

      {/* Background Effects */}
      <div className={cn(
        "absolute inset-0 z-0",
        theme === 'dark'
          ? "bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]"
          : "bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)]",
        "bg-[size:14px_24px]"
      )} />
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill={theme === 'dark' ? 'white' : '#fbbf24'}
      />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center p-4 relative z-20">
        <div className="flex items-center gap-2">
          <ImageIcon className={cn("h-8 w-8", theme === 'dark' ? "text-white" : "text-blue-600")} />
          <h1 className="text-2xl font-bold">SheikhImg</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="icon" onClick={toggleTheme}
            className={cn(theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")} >
            {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </Button>
          <Button
            variant="ghost" size="icon" onClick={() => setShowSidebar(true)}
            className={cn(theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")} >
            <HistoryIcon />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 mt-16 flex flex-col gap-16">
        <Hero theme={theme} />
        <ImageGallery />

        {/* Generator Section */}
        <div id="generator" className="mt-16 pt-16">
          <h2 className={cn(
            "text-4xl font-bold text-center mb-10",
            theme === 'dark' ? "text-white" : "text-gray-900"
          )}>
            Bring Your Ideas to Life
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className={cn(
              "backdrop-blur-xl border p-6 transition-colors duration-300 relative",
              theme === 'dark' ? "bg-black/50 border-white/10" : "bg-white/80 border-gray-200 shadow-lg"
            )}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={cn("text-xl font-semibold", theme === 'dark' ? "text-white" : "text-gray-900")}>
                    Image Generator
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className={cn(theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                    <SettingsIcon />
                  </Button>
                </div>

                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="space-y-2">
                    <label className={cn("text-sm font-medium flex items-center gap-2", theme === 'dark' ? "text-gray-300" : "text-gray-700")}>
                      <PlusIcon className="h-4 w-4" /> Positive Prompt
                    </label>
                    <Input
                      placeholder="A detailed oil painting of a magical forest..." value={prompt} onChange={(e) => setPrompt(e.target.value)}
                      className={cn("transition-colors duration-300", theme === 'dark' ? "bg-black/50 border-white/10 text-white placeholder:text-gray-500" : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400")}
                    />
                  </div>
                  {/* ... (other inputs and settings) */}
                  <Button onClick={generateImage} disabled={isLoading} className={cn("w-full transition-all duration-300 text-lg py-6", theme === 'dark' ? "bg-white hover:bg-white/90 text-black" : "bg-blue-600 hover:bg-blue-700 text-white")}>
                    {isLoading ? (<><CircularProgress size={20} className="mr-2" /> Generating...</>) : (<><ImageIcon className="mr-2 h-5 w-5" /> Generate Image</>)}
                  </Button>
                </motion.div>
              </div>
            </Card>

            <div className="space-y-6">
              <CardContainer className="w-full h-full">
                <CardBody className="w-full h-full">
                  <CardItem translateZ={50} className={cn("w-full aspect-square rounded-xl overflow-hidden border border-dashed relative", theme === 'dark' ? "border-white/10 bg-black/50" : "border-gray-200 bg-white/80")}>
                    {isLoading ? (
                      <motion.div className="w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse" />
                        <div className="relative flex flex-col items-center gap-4">
                          <CircularProgress size={48} className="text-white" />
                          <p className="text-gray-400 text-sm">Crafting your vision...</p>
                        </div>
                      </motion.div>
                    ) : generatedImage ? (
                      <motion.div className="relative w-full h-full group" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                        <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="secondary" size="icon" onClick={() => downloadImage(generatedImage)} className={cn("bg-white/20 hover:bg-white/30", theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}> <DownloadIcon className="h-4 w-4" /></Button>
                          <Button variant="secondary" size="icon" onClick={() => shareImage(generatedImage)} className={cn("bg-white/20 hover:bg-white/30", theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}><ShareIcon className="h-4 w-4" /></Button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div className="w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <div className="text-gray-500 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                          <p className="text-sm">Your creation will appear here</p>
                        </div>
                      </motion.div>
                    )}
                  </CardItem>
                </CardBody>
              </CardContainer>
            </div>
          </div>
        </div>
        <Testimonials theme={theme} />
      </main>

      {/* Sidebar (History) */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn("fixed right-0 top-0 h-screen w-96 backdrop-blur-xl border-l z-50 p-6 overflow-y-auto", theme === 'dark' ? "bg-black/80 border-white/10" : "bg-white/80 border-gray-200")} >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={cn("text-xl font-semibold", theme === 'dark' ? "text-white" : "text-gray-900")}>History</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className={cn(theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}><MenuIcon /></Button>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Search history..." value={searchHistory} onChange={(e) => setSearchHistory(e.target.value)} className={cn(theme === 'dark' ? "bg-black/50 border-white/10 text-white placeholder:text-gray-500" : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400")} />
                <Button variant="destructive" size="icon" onClick={clearHistory} className="shrink-0"><DeleteIcon className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-4">
                {filteredHistory.map((img) => (
                  <motion.div key={img.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group relative rounded-lg overflow-hidden bg-white/5 p-2">
                    <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover rounded-md" />
                    <div className="mt-2 space-y-2">
                      <p className={cn("text-sm line-clamp-2", theme === 'dark' ? "text-white" : "text-gray-900")}>{img.prompt}</p>
                      <div className="flex items-center gap-2 justify-between">
                        <div className="text-xs text-gray-400">{new Date(img.timestamp).toLocaleDateString()}</div>
                        <div className="flex gap-1">
                          <Button variant="secondary" size="icon" onClick={() => reloadPrompt(img)} className={cn("h-7 w-7 bg-white/10 hover:bg-white/20", theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                            <ReloadIcon className="h-3 w-3" />
                          </Button>
                          <Button variant="secondary" size="icon" onClick={() => downloadImage(img.url)} className={cn("h-7 w-7 bg-white/10 hover:bg-white/20", theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                            <DownloadIcon className="h-3 w-3" />
                          </Button>
                          <Button variant="secondary" size="icon" onClick={() => shareImage(img.url)} className={cn("h-7 w-7 bg-white/10 hover:bg-white/20", theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                            <ShareIcon className="h-3 w-3" />
                          </Button>
                          <Button variant="secondary" size="icon" onClick={() => deleteFromHistory(img.id)} className={cn("h-7 w-7 bg-white/10 hover:bg-white/20", theme === 'dark' ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}>
                            <DeleteIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-400"><ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" /><p className="text-sm">No images found</p></div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto mt-24 py-8 border-t relative z-10 border-white/10">
        <div className="text-center space-y-4">
          <p className={cn("text-sm", theme === 'dark' ? "text-gray-400" : "text-gray-600")}>
            Developed with ❤️ by Zain Sheikh
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" className={cn("hover:bg-gray-800/50", theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')} onClick={() => window.open('https://github.com/sheikmuhammadzain', '_blank')}>
              <GitHubIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("hover:bg-gray-800/50", theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')} onClick={() => window.open('https://www.linkedin.com/in/muhammad-zain-afzal-649209227/', '_blank')}>
              <LinkedInIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("hover:bg-gray-800/50", theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')} onClick={() => window.open('https://zain-sheikh.vercel.app', '_blank')}>
              <WebsiteIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;