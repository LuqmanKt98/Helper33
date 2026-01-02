import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Calendar,
  Sparkles,
  Upload,
  Loader2,
  Save,
  PersonStanding,
  Wand2,
  Video,
  Camera,
  RefreshCw,
  Zap,
  Scan,
  Leaf,
  TreePine,
  Flower,
  Sun
} from "lucide-react";
import { motion } from "framer-motion";
import { UserAvatar } from "@/entities/all";
import { InvokeLLM, UploadFile, GenerateImage } from "@/integrations/Core";

// Nature Sanctuary Avatar Studio
function AvatarCloningStudio({ userAvatar, onSave }) {
  const [avatarData, setAvatarData] = useState(userAvatar || {
    height_feet: 5,
    height_inches: 5,
    body_shape: "rectangle",
    skin_tone: "medium",
    hair_color: "brown",
    avatar_image_url: "",
    original_photo_url: "",
    original_video_url: "",
    cloned_avatar_url: "",
    body_measurements: {
      chest: 36,
      waist: 30,
      hips: 38,
      shoulders: 16
    }
  });
  
  const [isCloning, setIsCloning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cloneStep, setCloneStep] = useState(1);
  const [uploadMode, setUploadMode] = useState("photo");

  useEffect(() => {
    if (userAvatar && !isCloning && cloneStep === 1) {
      setAvatarData(userAvatar);
      if (userAvatar.cloned_avatar_url) {
        setCloneStep(4);
      }
    }
  }, [userAvatar, isCloning, cloneStep]);

  const handleMediaUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      if (file.type.startsWith('video/')) {
        setAvatarData(prev => ({ 
          ...prev, 
          original_video_url: file_url,
          original_photo_url: "",
          avatar_image_url: file_url,
          cloned_avatar_url: ""
        }));
      } else {
        setAvatarData(prev => ({ 
          ...prev, 
          original_photo_url: file_url,
          original_video_url: "",
          avatar_image_url: file_url,
          cloned_avatar_url: ""
        }));
      }
      setCloneStep(2);
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeBodyFromMedia = async () => {
    const mediaUrl = avatarData.original_video_url || avatarData.original_photo_url;
    if (!mediaUrl) {
      alert("Please upload a photo or video first.");
      return;
    }
    
    setIsCloning(true);
    try {
      const mediaType = avatarData.original_video_url ? "video" : "photo";
      const prompt = `Analyze this full-body ${mediaType} and estimate the person's body measurements and characteristics with gentle, caring observation. 

Based on the ${mediaType}, provide:
1. Body shape (rectangle, pear, apple, hourglass, or inverted_triangle)
2. Estimated measurements (chest, waist, hips, shoulders in inches) - provide reasonable numbers if not clear, ensure all are present.
3. Height estimate (feet and inches) - provide reasonable numbers.
4. Skin tone (very_light, light, medium, dark, very_dark)
5. Hair color description (e.g., brown, blonde, black, red)

Return as JSON with exact structure below. If any value cannot be confidently extracted, use a reasonable default.`;

      const response = await InvokeLLM({
        prompt,
        file_urls: [mediaUrl],
        response_json_schema: {
          type: "object",
          properties: {
            body_shape: { type: "string", enum: ["rectangle", "pear", "apple", "hourglass", "inverted_triangle", ""] },
            estimated_measurements: {
              type: "object",
              properties: {
                chest: { type: "number" },
                waist: { type: "number" },
                hips: { type: "number" },
                shoulders: { type: "number" }
              }
            },
            height_feet: { type: "number" },
            height_inches: { type: "number" },
            skin_tone: { type: "string", enum: ["very_light", "light", "medium", "dark", "very_dark", ""] },
            hair_color: { type: "string" }
          },
          required: ["body_shape", "estimated_measurements", "height_feet", "height_inches", "skin_tone", "hair_color"]
        }
      });

      if (response) {
        setAvatarData(prev => ({
          ...prev,
          body_shape: response.body_shape || prev.body_shape,
          height_feet: response.height_feet || prev.height_feet,
          height_inches: response.height_inches || prev.height_inches,
          skin_tone: response.skin_tone || prev.skin_tone,
          hair_color: response.hair_color || prev.hair_color,
          body_measurements: {
            chest: response.estimated_measurements?.chest || prev.body_measurements.chest,
            waist: response.estimated_measurements?.waist || prev.body_measurements.waist,
            hips: response.estimated_measurements?.hips || prev.body_measurements.hips,
            shoulders: response.estimated_measurements?.shoulders || prev.body_measurements.shoulders
          }
        }));
        setCloneStep(3);
      } else {
        throw new Error("No response from AI analysis.");
      }
    } catch (error) {
      console.error("Error analyzing media:", error);
      alert("Could not analyze the media automatically. Please adjust measurements manually.");
      setCloneStep(3);
    } finally {
      setIsCloning(false);
    }
  };

  const generateAvatarClone = async () => {
    const sourceMediaUrl = avatarData.original_video_url || avatarData.original_photo_url;
    if (!sourceMediaUrl) {
      alert("Please upload an original photo or video to base the clone on.");
      return;
    }

    setIsCloning(true);
    try {
      const prompt = `Create a high-quality, photorealistic digital avatar for virtual clothing try-ons. Transform this person into a professional fashion model while preserving their unique characteristics.

Original characteristics to maintain:
- Exact facial features and proportions
- Body shape: ${avatarData.body_shape}
- Height: ${avatarData.height_feet}'${avatarData.height_inches}"
- Skin tone: ${avatarData.skin_tone}
- Hair: ${avatarData.hair_color}
- Body measurements: Chest ${avatarData.body_measurements.chest}", Waist ${avatarData.body_measurements.waist}", Hips ${avatarData.body_measurements.hips}"

Requirements:
1. Full-body front view, professional fashion photography lighting
2. Clean, minimalist background (soft natural lighting, like a forest clearing)
3. Wearing simple, form-fitting neutral base clothing (tank top and fitted shorts/leggings)
4. Pose: arms slightly away from body, confident natural stance
5. High resolution, photorealistic quality suitable for virtual try-on overlays
6. Maintain the person's natural beauty while creating a professional model-quality image
7. Soft, natural environment lighting that complements the nature sanctuary theme

Style: Professional fashion photography, natural beauty, forest studio lighting, serene and elegant.`;

      const result = await GenerateImage({ 
        prompt,
        file_urls: [sourceMediaUrl]
      });
      
      setAvatarData(prev => ({ 
        ...prev, 
        cloned_avatar_url: result.url 
      }));
      setCloneStep(4);
      
    } catch (error) {
      console.error("Error generating avatar clone:", error);
      alert("Could not generate avatar clone. Please try again.");
    } finally {
      setIsCloning(false);
    }
  };

  const handleSave = () => {
    onSave(avatarData);
  };

  const resetProcess = () => {
    setCloneStep(1);
    setAvatarData(prev => ({
      ...prev,
      original_photo_url: "",
      original_video_url: "",
      cloned_avatar_url: "",
      avatar_image_url: ""
    }));
  };

  return (
    <div className="relative">
      {/* Nature Sanctuary Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-emerald-300/30 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-16 w-56 h-56 bg-gradient-to-br from-cyan-300/20 to-blue-300/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 left-1/3 w-48 h-48 bg-gradient-to-br from-green-300/25 to-emerald-300/20 rounded-full blur-2xl"></div>
      </div>

      <Card className="relative bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
        <CardHeader className="pb-4 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"></div>
          
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <PersonStanding className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Your Nature Avatar
              </span>
              <div className="flex items-center gap-1 mt-1">
                <Leaf className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-gray-600">Cultivated with care in your digital sanctuary</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="text-gray-600 leading-relaxed">
            Create a virtual reflection of yourself using photos or videos. Like tending a garden, we'll nurture your digital presence with gentle precision.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 space-y-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Avatar Preview - Nature Inspired */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 rounded-2xl p-6 flex items-center justify-center border border-emerald-200/30 shadow-inner">
                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-emerald-200/40 to-teal-200/30 rounded-full blur-sm"></div>
                <div className="absolute bottom-6 left-6 w-6 h-6 bg-gradient-to-br from-cyan-200/40 to-blue-200/30 rounded-full blur-sm"></div>
                
                {cloneStep === 4 && avatarData.cloned_avatar_url ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full h-full rounded-xl overflow-hidden shadow-lg"
                  >
                    <img src={avatarData.cloned_avatar_url} alt="Your Digital Self" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/80 to-transparent p-3">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Your nature avatar is ready!</span>
                      </div>
                    </div>
                  </motion.div>
                ) : avatarData.original_video_url ? (
                  <video 
                    src={avatarData.original_video_url} 
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                    controls
                    muted
                    loop
                  />
                ) : avatarData.original_photo_url ? (
                  <img src={avatarData.original_photo_url} alt="Your Photo" className="w-full h-full object-cover rounded-xl shadow-lg" />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="relative mb-4">
                      <PersonStanding className="w-20 h-20 mx-auto text-emerald-300" />
                      <Leaf className="w-6 h-6 absolute -top-2 -right-2 text-emerald-400 animate-pulse" />
                    </div>
                    <p className="text-emerald-700 font-medium">Your digital reflection awaits</p>
                    <p className="text-sm text-gray-500 mt-1">Upload a photo or video to begin</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Avatar Creation Steps - Nature Themed */}
            <div className="space-y-6">
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      cloneStep >= step 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        cloneStep > step ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Media Upload */}
              {cloneStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-xl border border-emerald-200/30">
                    <h4 className="font-medium text-emerald-900 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      📸 Nature Photography Guidelines
                    </h4>
                    <ul className="text-sm text-emerald-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <Leaf className="w-3 h-3 mt-0.5 text-emerald-600" />
                        Full-body, front-facing, standing naturally like a tree
                      </li>
                      <li className="flex items-start gap-2">
                        <Sun className="w-3 h-3 mt-0.5 text-emerald-600" />
                        Well-lit with natural lighting, plain background
                      </li>
                      <li className="flex items-start gap-2">
                        <TreePine className="w-3 h-3 mt-0.5 text-emerald-600" />
                        Arms slightly away from body, confident posture
                      </li>
                      <li className="flex items-start gap-2">
                        <Flower className="w-3 h-3 mt-0.5 text-emerald-600" />
                        Form-fitting or minimal clothing for best analysis
                      </li>
                    </ul>
                  </div>
                  
                  {/* Upload Type Toggle - Nature Styled */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      variant={uploadMode === "photo" ? "default" : "outline"}
                      onClick={() => setUploadMode("photo")}
                      className={`flex-1 ${uploadMode === "photo" ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Photo Portrait
                    </Button>
                    <Button
                      variant={uploadMode === "video" ? "default" : "outline"}
                      onClick={() => setUploadMode("video")}
                      className={`flex-1 ${uploadMode === "video" ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Nature Video
                    </Button>
                  </div>
                  
                  {/* Enhanced Upload Button */}
                  <div className="w-full">
                    <input
                      id="avatar-upload"
                      type="file"
                      accept={uploadMode === "photo" ? "image/*" : "video/*"}
                      className="hidden"
                      onChange={handleMediaUpload}
                      disabled={isUploading}
                    />
                    <label htmlFor="avatar-upload" className="w-full cursor-pointer inline-block">
                      <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-6 py-4 rounded-xl text-center font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-5 w-5" />
                            Nurturing your upload...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-5 w-5" />
                            Share Your {uploadMode === "photo" ? "Photo" : "Video"} with Nature's Garden
                            <Sparkles className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 2: AI Analysis */}
              {cloneStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-xl border border-emerald-200/30">
                    <div className="relative mb-4">
                      <Scan className="w-12 h-12 mx-auto text-emerald-600" />
                      <div className="absolute -top-1 -right-1">
                        <Leaf className="w-5 h-5 text-emerald-400 animate-bounce" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-emerald-900 mb-2">Nature's Analysis</h4>
                    <p className="text-emerald-700 text-sm mb-4">
                      Let our gentle AI observe and understand your natural form, just as nature recognizes each unique leaf.
                    </p>
                    <Button 
                      onClick={analyzeBodyFromMedia}
                      disabled={isCloning}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md text-white"
                    >
                      {isCloning ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Analyzing with care...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Begin Natural Analysis
                          <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-emerald-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/90 px-2 text-gray-500">Or</span></div>
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setCloneStep(3)}
                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Skip Analysis (Manual Adjustments)
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Measurements & Clone Generation */}
              {cloneStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-xl border border-emerald-200/30">
                    <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                      <Leaf className="w-4 h-4" />
                      Your Natural Measurements
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label className="text-emerald-800">Height</Label>
                        <div className="flex gap-2 mt-1">
                          <Select 
                            value={avatarData.height_feet?.toString()} 
                            onValueChange={val => setAvatarData(prev => ({...prev, height_feet: parseInt(val)}))}
                          >
                            <SelectTrigger className="w-20 border-emerald-200 focus:ring-emerald-400">
                              <SelectValue placeholder="Ft"/>
                            </SelectTrigger>
                            <SelectContent>
                              {[4,5,6,7].map(ft => (
                                <SelectItem key={ft} value={ft.toString()}>{ft}ft</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select 
                            value={avatarData.height_inches?.toString()} 
                            onValueChange={val => setAvatarData(prev => ({...prev, height_inches: parseInt(val)}))}
                          >
                            <SelectTrigger className="w-20 border-emerald-200 focus:ring-emerald-400">
                              <SelectValue placeholder="In"/>
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 12}, (_, i) => (
                                <SelectItem key={i} value={i.toString()}>{i}in</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-emerald-800">Body Shape</Label>
                        <Select 
                          value={avatarData.body_shape} 
                          onValueChange={val => setAvatarData(prev => ({...prev, body_shape: val}))}
                        >
                          <SelectTrigger className="mt-1 border-emerald-200 focus:ring-emerald-400">
                            <SelectValue/>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rectangle">Rectangle (Balanced)</SelectItem>
                            <SelectItem value="pear">Pear (Gentle Curves)</SelectItem>
                            <SelectItem value="apple">Apple (Natural Roundness)</SelectItem>
                            <SelectItem value="hourglass">Hourglass (Flowing Symmetry)</SelectItem>
                            <SelectItem value="inverted_triangle">Inverted Triangle (Strong Presence)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <Label className="text-emerald-800">Chest: {avatarData.body_measurements.chest}"</Label>
                        <Slider
                          value={[avatarData.body_measurements.chest]}
                          onValueChange={([val]) => setAvatarData(prev => ({
                            ...prev,
                            body_measurements: { ...prev.body_measurements, chest: val }
                          }))}
                          min={28}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-emerald-800">Waist: {avatarData.body_measurements.waist}"</Label>
                        <Slider
                          value={[avatarData.body_measurements.waist]}
                          onValueChange={([val]) => setAvatarData(prev => ({
                            ...prev,
                            body_measurements: { ...prev.body_measurements, waist: val }
                          }))}
                          min={22}
                          max={45}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-emerald-800">Hips: {avatarData.body_measurements.hips}"</Label>
                        <Slider
                          value={[avatarData.body_measurements.hips]}
                          onValueChange={([val]) => setAvatarData(prev => ({
                            ...prev,
                            body_measurements: { ...prev.body_measurements, hips: val }
                          }))}
                          min={30}
                          max={52}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={generateAvatarClone}
                      disabled={isCloning}
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg px-8 py-3 text-white font-medium"
                    >
                      {isCloning ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Cultivating your digital reflection...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Grow Your Nature Avatar
                          <Sparkles className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Complete */}
              {cloneStep === 4 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 rounded-xl border border-emerald-200/30">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Leaf className="w-6 h-6 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-emerald-900 mb-2">Your Nature Avatar Blossoms! 🌱</h4>
                    <p className="text-emerald-700 mb-4">
                      Your digital reflection is ready to try on outfits in your nature sanctuary closet.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md text-white"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Preserve in Your Garden
                      </Button>
                      <Button variant="outline" onClick={resetProcess} className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                        <RefreshCw className="mr-2 h-4 w-4"/>
                        Cultivate Anew
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DigitalCloset() {
  const [activeTab, setActiveTab] = useState("closet");
  const [userAvatar, setUserAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClosetData();
  }, []);

  const loadClosetData = async () => {
    try {
      const avatars = await UserAvatar.list('', 1);
      setUserAvatar(avatars[0] || null);
    } catch (error) {
      console.error("Error loading closet data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-teal-50/30 to-cyan-50/40 rounded-2xl"></div>
        <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg text-center">
          <TreePine className="w-12 h-12 text-emerald-500 animate-pulse mb-4 mx-auto" />
          <p className="text-emerald-700 font-medium">Growing your digital wardrobe sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Nature Sanctuary Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-emerald-300/20 via-teal-300/15 to-cyan-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 -right-32 w-80 h-80 bg-gradient-to-br from-teal-300/15 to-cyan-300/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-cyan-200/20 via-teal-200/10 to-transparent"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-gradient-to-br from-blue-300/15 to-indigo-300/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-400/60 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-teal-400/60 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce" style={{animationDelay: '3s', animationDuration: '5s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Nature-Themed Header */}
        <div className="text-center mb-12 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-full border border-emerald-200/50 mb-6 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <TreePine className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Digital Closet Sanctuary
            </span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            Your 
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent ml-3">
              Nature's Wardrobe
            </span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Cultivate your style in harmony with nature. Organize, plan, and virtually try on outfits in your personal digital sanctuary.
          </p>
        </div>

        {/* Enhanced Nature Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/70 backdrop-blur-xl border border-emerald-200/30 shadow-lg">
            <TabsTrigger 
              value="closet" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <TreePine className="w-4 h-4 mr-2" />
              Forest Closet
            </TabsTrigger>
            <TabsTrigger 
              value="outfits"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Seasonal Plans
            </TabsTrigger>
            <TabsTrigger 
              value="ai-styling"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Nature's Stylist
            </TabsTrigger>
            <TabsTrigger 
              value="avatar"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <PersonStanding className="w-4 h-4 mr-2" />
              Avatar Garden
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar" className="mt-8">
            <AvatarCloningStudio 
              userAvatar={userAvatar}
              onSave={async (avatarData) => {
                try {
                  let saved;
                  if (userAvatar) {
                    saved = await UserAvatar.update(userAvatar.id, avatarData);
                  } else {
                    saved = await UserAvatar.create(avatarData);
                  }
                  setUserAvatar(saved);
                  alert("🌱 Your nature avatar has been lovingly preserved in your garden!");
                } catch (error) {
                  console.error("Error saving avatar:", error);
                  alert("Could not save your avatar. Please try again.");
                }
              }}
            />
          </TabsContent>

          <TabsContent value="closet" className="mt-8">
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-200/30">
              <TreePine className="w-16 h-16 mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-700">Your forest closet is growing! Add clothing items to cultivate your wardrobe.</p>
            </div>
          </TabsContent>

          <TabsContent value="outfits" className="mt-8">
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-200/30">
              <Calendar className="w-16 h-16 mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-700">Plant seasonal outfit plans to bloom beautifully throughout the year.</p>
            </div>
          </TabsContent>

          <TabsContent value="ai-styling" className="mt-8">
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-emerald-200/30">
              <Sparkles className="w-16 h-16 mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-700">Let nature's wisdom guide your style choices with AI-powered recommendations.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}