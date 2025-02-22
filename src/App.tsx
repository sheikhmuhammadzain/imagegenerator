import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CardContainer, CardBody, CardItem } from "@/components/ui/card-3d";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Add as PlusIcon, 
  Remove as MinusIcon, 
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

const Spotlight = ({ className, fill }: SpotlightProps) => {
  return (
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
      {/* Sun Beam Effect */}
      <div className={cn(
        "absolute z-[1] w-[50%] opacity-50 transition-opacity duration-500",
        className,
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-yellow-500/10 before:to-transparent before:animate-beam",
        "after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-orange-500/10 after:to-transparent after:animate-beam-slow"
      )} />
    </>
  );
};

const STORAGE_KEY = 'sheikhoo_ai_history';

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

  // Load history from localStorage on mount
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

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imageHistory));
  }, [imageHistory]);

  // Initialize theme from localStorage
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
    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          steps: settings.steps,
          width: settings.width,
          height: settings.height,
          seed: settings.seed,
          cfg_scale: settings.cfgScale,
          samples: 1,
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            {
              text: negativePrompt,
              weight: -1
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const data = await response.json();
      const base64Image = data.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;
      setGeneratedImage(imageUrl);
      
      // Add to history
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt,
        negativePrompt,
        timestamp: Date.now(),
        settings: { ...settings }
      };
      setImageHistory(prev => [newImage, ...prev]);
      
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
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
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Generated Image',
          text: 'Check out this image I generated with AI!',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Success",
          description: "Image URL copied to clipboard!",
        });
      }
    } catch (error: unknown) {
      console.error('Share error:', error);
      toast({
        title: "Error",
        description: "Failed to share image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(
      "min-h-screen w-full relative flex items-center justify-center py-8 px-4 overflow-hidden transition-colors duration-300",
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gradient-to-b from-blue-50 to-white text-gray-900'
    )}>
      {/* Background Grid */}
      <div className={cn(
        "absolute inset-0",
        theme === 'dark'
          ? "bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)]"
          : "bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)]",
        "bg-[size:14px_24px]"
      )} />
      
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "fixed top-4 right-4 z-50 transition-colors",
          theme === 'dark'
            ? "text-gray-400 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        )}
      >
        {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </Button>

      {/* Spotlight Effect */}
      <Spotlight 
        className={cn(
          "top-[-20%] left-[-10%] h-[200%] transform rotate-12",
          theme === 'light' ? 'opacity-40' : 'opacity-30'
        )} 
        fill={theme === 'dark' ? 'white' : '#fbbf24'}
      />

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className={cn(
              "fixed right-0 top-0 h-screen w-80 backdrop-blur-xl border-l z-50 p-6 overflow-y-auto",
              theme === 'dark'
                ? "bg-black/90 border-white/10"
                : "bg-white/80 border-gray-200"
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={cn(
                  "text-xl font-semibold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  History
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className={cn(
                    theme === 'dark'
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <MenuIcon />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search history..."
                    value={searchHistory}
                    onChange={(e) => setSearchHistory(e.target.value)}
                    className={cn(
                      "bg-black/50 border-white/10 text-white placeholder:text-gray-500",
                      theme === 'dark'
                        ? "bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                    )}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={clearHistory}
                    className="shrink-0"
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredHistory.map((img) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-lg overflow-hidden bg-white/5 p-2"
                    >
                      <img
                        src={img.url}
                        alt={img.prompt}
                        className="w-full aspect-square object-cover rounded-md"
                      />
                      <div className="mt-2 space-y-2">
                        <p className={cn(
                          "text-white text-sm line-clamp-2",
                          theme === 'dark' ? "text-white" : "text-gray-900"
                        )}>
                          {img.prompt}
                        </p>
                        <div className="flex items-center gap-2 justify-between">
                          <div className="text-xs text-gray-400">
                            {new Date(img.timestamp).toLocaleDateString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => reloadPrompt(img)}
                              className={cn(
                                "h-7 w-7 bg-white/10 hover:bg-white/20",
                                theme === 'dark'
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-600 hover:text-gray-900"
                              )}
                            >
                              <ReloadIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => downloadImage(img.url)}
                              className={cn(
                                "h-7 w-7 bg-white/10 hover:bg-white/20",
                                theme === 'dark'
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-600 hover:text-gray-900"
                              )}
                            >
                              <DownloadIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => shareImage(img.url)}
                              className={cn(
                                "h-7 w-7 bg-white/10 hover:bg-white/20",
                                theme === 'dark'
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-600 hover:text-gray-900"
                              )}
                            >
                              <ShareIcon className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => deleteFromHistory(img.id)}
                              className={cn(
                                "h-7 w-7 bg-white/10 hover:bg-white/20",
                                theme === 'dark'
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-600 hover:text-gray-900"
                              )}
                            >
                              <DeleteIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {filteredHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      <p className="text-sm">No images found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full mx-auto space-y-8 relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className={cn(
              "text-6xl font-bold",
              theme === 'dark'
                ? "bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
                : "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400"
            )}>
              SheikhImg
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className={cn(
                theme === 'dark'
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <MenuIcon />
            </Button>
          </div>
          <p className={cn(
            theme === 'dark' ? "text-gray-400" : "text-gray-600"
          )}>
            Transform your imagination into reality with AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={cn(
            "backdrop-blur-xl border p-6 transition-colors duration-300 relative",
            theme === 'dark'
              ? "bg-black/50 border-white/10"
              : "bg-white/80 border-gray-200 shadow-lg",
            "after:absolute after:w-[80%] after:h-[80%] after:left-[10%] after:top-[10%] after:rounded-3xl after:z-[-1] after:opacity-30 after:blur-[100px]",
            theme === 'dark'
              ? "after:bg-blue-500/30"
              : "after:bg-blue-200/50"
          )}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={cn(
                  "text-xl font-semibold",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  Image Generator
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      theme === 'dark'
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    onClick={() => setShowSidebar(true)}
                  >
                    <HistoryIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      theme === 'dark'
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <SettingsIcon />
                  </Button>
                </div>
              </div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="space-y-2">
                  <label className={cn(
                    "text-sm font-medium flex items-center gap-2",
                    theme === 'dark' ? "text-gray-300" : "text-gray-700"
                  )}>
                    <PlusIcon className="h-4 w-4" />
                    Positive Prompt
                  </label>
                  <Input
                    placeholder="A detailed oil painting of a magical forest with glowing mushrooms..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={cn(
                      "transition-colors duration-300",
                      theme === 'dark'
                        ? "bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className={cn(
                    "text-sm font-medium flex items-center gap-2",
                    theme === 'dark' ? "text-gray-300" : "text-gray-700"
                  )}>
                    <MinusIcon className="h-4 w-4" />
                    Negative Prompt
                  </label>
                  <Input
                    placeholder="Things you don't want in the image..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className={cn(
                      "transition-colors duration-300",
                      theme === 'dark'
                        ? "bg-black/50 border-white/10 text-white placeholder:text-gray-500"
                        : "bg-white/50 border-gray-200 text-gray-900 placeholder:text-gray-400"
                    )}
                  />
                </div>

                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t border-white/10 pt-4"
                  >
                    <h3 className="text-sm font-medium text-gray-300">Advanced Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400">Width</label>
                        <Input
                          type="number"
                          value={settings.width}
                          onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                          className={cn(
                            "bg-black/50 border-white/10 text-white",
                            theme === 'dark'
                              ? "bg-black/50 border-white/10 text-white"
                              : "bg-white/50 border-gray-200 text-gray-900"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Height</label>
                        <Input
                          type="number"
                          value={settings.height}
                          onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                          className={cn(
                            "bg-black/50 border-white/10 text-white",
                            theme === 'dark'
                              ? "bg-black/50 border-white/10 text-white"
                              : "bg-white/50 border-gray-200 text-gray-900"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Steps</label>
                        <Input
                          type="number"
                          value={settings.steps}
                          onChange={(e) => setSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
                          className={cn(
                            "bg-black/50 border-white/10 text-white",
                            theme === 'dark'
                              ? "bg-black/50 border-white/10 text-white"
                              : "bg-white/50 border-gray-200 text-gray-900"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">CFG Scale</label>
                        <Input
                          type="number"
                          value={settings.cfgScale}
                          onChange={(e) => setSettings(prev => ({ ...prev, cfgScale: parseInt(e.target.value) }))}
                          className={cn(
                            "bg-black/50 border-white/10 text-white",
                            theme === 'dark'
                              ? "bg-black/50 border-white/10 text-white"
                              : "bg-white/50 border-gray-200 text-gray-900"
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={generateImage}
                  disabled={isLoading}
                  className={cn(
                    "w-full transition-colors duration-300",
                    theme === 'dark'
                      ? "bg-white hover:bg-white/90 text-black"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {isLoading ? (
                    <>
                      <CircularProgress size={16} className="mr-2" />
                      Generating
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Generate Image
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>

          <div className="space-y-6">
            {isLoading ? (
              <CardContainer className="w-full">
                <CardBody className="relative group/card w-auto h-auto">
                  <CardItem
                    translateZ={50}
                    className={cn(
                      "w-full aspect-square rounded-xl overflow-hidden relative",
                      theme === 'dark'
                        ? "bg-black/50"
                        : "bg-white/80",
                      "after:absolute after:w-[80%] after:h-[80%] after:left-[10%] after:top-[10%] after:rounded-3xl after:z-[-1] after:opacity-30 after:blur-[100px]",
                      theme === 'dark'
                        ? "after:bg-purple-500/30"
                        : "after:bg-purple-200/50"
                    )}
                  >
                    <motion.div
                      className="w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 animate-pulse" />
                      <div className="relative flex flex-col items-center gap-4">
                        <CircularProgress size={48} className="text-white" />
                        <p className="text-gray-400 text-sm">Crafting your vision...</p>
                      </div>
                    </motion.div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            ) : generatedImage ? (
              <CardContainer className="w-full">
                <CardBody className="relative group/card w-auto h-auto">
                  <CardItem
                    translateZ={50}
                    className={cn(
                      "w-full aspect-square rounded-xl overflow-hidden relative",
                      theme === 'dark'
                        ? "bg-black/50"
                        : "bg-white/80",
                      "after:absolute after:w-[80%] after:h-[80%] after:left-[10%] after:top-[10%] after:rounded-3xl after:z-[-1] after:opacity-30 after:blur-[100px]",
                      theme === 'dark'
                        ? "after:bg-purple-500/30"
                        : "after:bg-purple-200/50"
                    )}
                  >
                    <motion.div
                      className="relative w-full h-full"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => downloadImage(generatedImage)}
                          className={cn(
                            "bg-white/20 hover:bg-white/30",
                            theme === 'dark'
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => shareImage(generatedImage)}
                          className={cn(
                            "bg-white/20 hover:bg-white/30",
                            theme === 'dark'
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-gray-900"
                          )}
                        >
                          <ShareIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            ) : (
              <CardContainer className="w-full">
                <CardBody className="relative group/card w-auto h-auto">
                  <CardItem
                    translateZ={50}
                    className={cn(
                      "w-full aspect-square rounded-xl overflow-hidden border border-dashed relative",
                      theme === 'dark'
                        ? "border-white/10 bg-black/50"
                        : "border-gray-200 bg-white/80",
                      "after:absolute after:w-[80%] after:h-[80%] after:left-[10%] after:top-[10%] after:rounded-3xl after:z-[-1] after:opacity-30 after:blur-[100px]",
                      theme === 'dark'
                        ? "after:bg-purple-500/30"
                        : "after:bg-purple-200/50"
                    )}
                  >
                    <motion.div 
                      className="w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-gray-500 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p className="text-sm">Your creation will appear here</p>
                      </div>
                    </motion.div>
                  </CardItem>
                </CardBody>
              </CardContainer>
            )}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={cn(
            "text-sm",
            theme === 'dark' ? "text-gray-400" : "text-gray-600"
          )}>
            Developed with ❤️ by Zain Sheikh
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-gray-800/50",
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}
              onClick={() => window.open('https://github.com/sheikmuhammadzain', '_blank')}
            >
              <GitHubIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-gray-800/50",
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}
              onClick={() => window.open('https://www.linkedin.com/in/muhammad-zain-afzal-649209227/', '_blank')}
            >
              <LinkedInIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "hover:bg-gray-800/50",
                theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              )}
              onClick={() => window.open('https://zain-sheikh.vercel.app', '_blank')}
            >
              <WebsiteIcon className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default App;