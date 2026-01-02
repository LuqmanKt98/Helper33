
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InvokeLLM } from '@/integrations/Core';
import { Loader2, Palette, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const getSeasonalTheme = () => {
    const month = new Date().getMonth();
    if (month >= 8 && month <= 10) return "Fall & Halloween"; // Sep, Oct, Nov
    if (month === 11 || month <= 1) return "Winter & Christmas"; // Dec, Jan, Feb
    if (month >= 2 && month <= 4) return "Spring & Easter"; // Mar, Apr, May
    return "Summer & Outdoor"; // Jun, Jul, Aug
};

// Enhanced fallback data with diverse Halloween & Fall lifestyle content
const getFallbackProjects = (theme) => {
  const fallbackProjects = [
    {
      id: 'diy-halloween-costume-witch',
      project_title: 'Enchanting DIY Witch Costume',
      project_description: 'Create a magical witch costume using thrift store finds and simple sewing techniques. Perfect for Halloween parties or trick-or-treating with kids.',
      detailed_instructions: `Materials: Black dress or skirt, black cape or fabric, witch hat, makeup, accessories

Step 1: Find a basic black dress or long skirt as your base
Step 2: Create a cape using black fabric or repurpose an old sheet
Step 3: Distress the edges for a weathered look using sandpaper
Step 4: Add dramatic makeup with dark eyeshadow and bold lipstick
Step 5: Accessorize with jewelry, a broomstick, and spell book
Step 6: Practice your best witch cackle!`,
      difficulty_level: 'Beginner',
      estimated_time: '2-3 hours',
      materials_needed: ['Black dress/skirt', 'Black fabric', 'Witch hat', 'Makeup', 'Accessories', 'Thread', 'Scissors'],
      project_image_url: 'https://images.unsplash.com/photo-1509557965043-36e4a811ba37?w=500&h=400&fit=crop',
      influencer_name: 'Spooky Sarah',
      influencer_handle: '@HalloweenCrafts',
      profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Layer different textures for a more authentic look',
        'Use liquid latex for realistic scars and warts',
        'Thrift stores are goldmines for costume pieces',
        'Practice your character voice ahead of time'
      ]
    },
    {
      id: 'pumpkin-spice-fall-treats',
      project_title: 'Ultimate Pumpkin Spice Treats Collection',
      project_description: 'Master the art of fall baking with these irresistible pumpkin spice recipes. From cookies to lattes, embrace the season with delicious homemade treats.',
      detailed_instructions: `Recipes include: Pumpkin Spice Cookies, PSL, Pumpkin Bread, Spiced Donuts

PUMPKIN SPICE COOKIES:
Step 1: Mix 2 cups flour, 1 tsp pumpkin spice, 1/2 tsp baking soda
Step 2: Cream butter and sugars, add pumpkin puree and egg
Step 3: Combine wet and dry ingredients
Step 4: Roll into balls and bake at 375°F for 12 minutes
Step 5: Cool and enjoy with milk or coffee

Plus recipes for homemade pumpkin spice lattes and mini pumpkin breads!`,
      difficulty_level: 'Intermediate',
      estimated_time: '3-4 hours',
      materials_needed: ['Pumpkin puree', 'Pumpkin spice blend', 'Flour', 'Butter', 'Eggs', 'Sugar', 'Baking tools'],
      project_image_url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&h=400&fit=crop',
      influencer_name: 'Baker Emma',
      influencer_handle: '@FallFlavors',
      profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Make your own pumpkin spice blend for better flavor',
        'Use real pumpkin puree, not pie filling',
        'Chill cookie dough for easier handling',
        'Store treats in airtight containers for freshness'
      ]
    },
    {
      id: 'haunted-house-front-porch',
      project_title: 'Spooky Front Porch Haunted House Setup',
      project_description: 'Transform your front porch into a haunted house entrance that will thrill trick-or-treaters. Create an immersive Halloween experience with lighting, sound, and decorations.',
      detailed_instructions: `Materials: Halloween decorations, string lights, fog machine, speakers, props

Step 1: Create a color scheme (orange, black, purple)
Step 2: Hang fake spider webs in corners and doorways
Step 3: Place carved pumpkins with LED candles
Step 4: Add a fog machine for mysterious atmosphere
Step 5: Set up motion-activated decorations and sounds
Step 6: Create a spooky pathway with solar lights
Step 7: Add final touches like tombstones and skeletons`,
      difficulty_level: 'Intermediate',
      estimated_time: '4-6 hours',
      materials_needed: ['Halloween decorations', 'String lights', 'Fog machine', 'Carved pumpkins', 'Spider webs', 'Motion sensors'],
      project_image_url: 'https://images.unsplash.com/photo-1571650235346-db0d47d4986b?w=500&h=400&fit=crop',
      influencer_name: 'Haunted Holly',
      influencer_handle: '@SpookyHomeDecor',
      profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Test all electronics before Halloween night',
        'Use battery-powered candles for safety',
        'Layer different heights for visual interest',
        'Consider your neighbors when planning sound effects'
      ]
    },
    {
      id: 'cozy-fall-living-room',
      project_title: 'Cozy Fall Living Room Makeover',
      project_description: 'Transform your living space into a warm autumn sanctuary. Learn how to incorporate seasonal colors, textures, and scents to create the perfect fall atmosphere.',
      detailed_instructions: `Materials: Fall pillows, throws, candles, seasonal decor, warm lighting

Step 1: Switch to warm-toned lighting (amber bulbs)
Step 2: Add throw pillows in rust, gold, and deep orange
Step 3: Layer soft blankets in different textures
Step 4: Incorporate natural elements like pinecones and branches
Step 5: Light autumn-scented candles (cinnamon, apple, vanilla)
Step 6: Add seasonal artwork or garlands
Step 7: Create cozy reading nooks with extra cushions`,
      difficulty_level: 'Beginner',
      estimated_time: '2-3 hours',
      materials_needed: ['Throw pillows', 'Blankets', 'Candles', 'Natural elements', 'Seasonal decor', 'Warm light bulbs'],
      project_image_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=500&h=400&fit=crop',
      influencer_name: 'Cozy Claire',
      influencer_handle: '@SeasonalSpaces',
      profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Layer textures for visual and tactile interest',
        'Use battery-operated candles with timers',
        'Incorporate seasonal scents throughout the day',
        'Switch back to lighter colors gradually in spring'
      ]
    },
    {
      id: 'ghost-couple-costume',
      project_title: 'Adorable Ghost Couple Costume',
      project_description: 'Create matching ghost costumes perfect for couples or best friends. Simple, sweet, and surprisingly stylish for Halloween parties or photos.',
      detailed_instructions: `Materials: White sheets, scissors, fabric paint, accessories

Step 1: Measure and cut two white sheets to desired length
Step 2: Mark and cut eye holes at appropriate heights
Step 3: Use fabric paint to add unique details or expressions
Step 4: Practice walking without tripping on the fabric
Step 5: Add accessories like bow ties, pearls, or flowers
Step 6: Plan coordinated poses for photos
Step 7: Create a "couples story" for your characters`,
      difficulty_level: 'Beginner',
      estimated_time: '1-2 hours',
      materials_needed: ['White sheets', 'Scissors', 'Fabric paint', 'Measuring tape', 'Accessories', 'Black marker'],
      project_image_url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=500&h=400&fit=crop',
      influencer_name: 'Costume Couple',
      influencer_handle: '@TogetherCostumes',
      profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Choose different sheet sizes for height variation',
        'Practice walking together beforehand',
        'Use glow-in-the-dark paint for nighttime fun',
        'Add subtle personality details to each ghost'
      ]
    },
    {
      id: 'fall-harvest-tablescape',
      project_title: 'Stunning Fall Harvest Tablescape',
      project_description: 'Design an Instagram-worthy fall dining table that celebrates the harvest season. Perfect for Thanksgiving dinners, fall parties, or seasonal family meals.',
      detailed_instructions: `Materials: Table runner, pumpkins, candles, fall foliage, charger plates, napkins

Step 1: Start with a neutral table runner in burlap or linen
Step 2: Create a centerpiece using mini pumpkins and gourds
Step 3: Add varying heights with pillar candles in glass holders
Step 4: Incorporate fresh or silk fall foliage
Step 5: Layer place settings with charger plates
Step 6: Fold napkins in creative autumn-themed shapes
Step 7: Add final touches like scattered acorns or pinecones`,
      difficulty_level: 'Intermediate',
      estimated_time: '2-3 hours',
      materials_needed: ['Table runner', 'Mini pumpkins', 'Candles', 'Fall foliage', 'Charger plates', 'Napkins', 'Natural accents'],
      project_image_url: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=500&h=400&fit=crop',
      influencer_name: 'Table Stylist Mia',
      influencer_handle: '@SeasonalTablescapes',
      profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Use odd numbers of items for better visual balance',
        'Vary textures and heights throughout the table',
        'Test candle arrangements before guests arrive',
        'Keep centerpieces low enough for conversation'
      ]
    },
    {
      id: 'pumpkin-carving-techniques',
      project_title: 'Advanced Pumpkin Carving Techniques',
      project_description: 'Master the art of pumpkin carving with professional techniques. Create stunning jack-o-lanterns that go beyond basic triangle eyes and jagged smiles.',
      detailed_instructions: `Materials: Pumpkins, carving tools, templates, LED lights, preservation spray

Step 1: Choose the right pumpkin (firm, good shape, flat bottom)
Step 2: Clean out all pulp and seeds thoroughly
Step 3: Transfer your design using templates or stencils
Step 4: Use different carving depths for shading effects
Step 5: Carve from the center outward to avoid breaks
Step 6: Add LED lights or candles for illumination
Step 7: Apply preservation spray to extend life`,
      difficulty_level: 'Advanced',
      estimated_time: '3-5 hours',
      materials_needed: ['Pumpkins', 'Carving tools', 'Templates', 'LED lights', 'Preservation spray', 'Newspaper'],
      project_image_url: 'https://images.unsplash.com/photo-1570618404439-b1eb8763e0b2?w=500&h=400&fit=crop',
      influencer_name: 'Pumpkin Pro Pete',
      influencer_handle: '@CarvedCreations',
      profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Keep carved areas moist with petroleum jelly',
        'Use different tools for various line thicknesses',
        'Save seeds for roasting - waste nothing!',
        'Display in cool, dry areas for longevity'
      ]
    },
    {
      id: 'autumn-wreath-workshop',
      project_title: 'Luxurious Autumn Door Wreath Workshop',
      project_description: 'Create a show-stopping fall wreath using premium materials and advanced techniques. This gorgeous piece will be the envy of your neighborhood.',
      detailed_instructions: `Materials: Grapevine base, silk flowers, ribbon, preserved leaves, pine cones, wire

Step 1: Secure a high-quality grapevine wreath base
Step 2: Plan your color palette (deep reds, golds, oranges)
Step 3: Attach larger elements first (main flowers, branches)
Step 4: Fill in with medium elements (leaves, smaller flowers)
Step 5: Add fine details (berries, small pine cones)
Step 6: Create a stunning bow with wired ribbon
Step 7: Attach hanging mechanism and weatherproof spray`,
      difficulty_level: 'Intermediate',
      estimated_time: '4-5 hours',
      materials_needed: ['Grapevine base', 'Silk autumn flowers', 'Wired ribbon', 'Preserved leaves', 'Pine cones', 'Floral wire'],
      project_image_url: 'https://images.unsplash.com/photo-1572478284761-6946ab12dd0b?w=500&h=400&fit=crop',
      influencer_name: 'Wreath Artist Luna',
      influencer_handle: '@SeasonalWreaths',
      profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Invest in high-quality silk flowers for realism',
        'Work in good lighting to see color combinations',
        'Step back frequently to assess overall balance',
        'Store carefully to reuse next year'
      ]
    },
    {
      id: 'fall-comfort-food-menu',
      project_title: 'Ultimate Fall Comfort Food Menu',
      project_description: 'Plan and prepare a complete fall comfort food menu perfect for cozy family dinners. Features seasonal ingredients and warming spices.',
      detailed_instructions: `Menu: Butternut squash soup, herb-roasted chicken, maple glazed carrots, apple crisp

BUTTERNUT SQUASH SOUP:
Step 1: Roast cubed butternut squash with olive oil and salt
Step 2: Sauté onions, garlic, and ginger until fragrant  
Step 3: Combine with roasted squash and vegetable broth
Step 4: Simmer and blend until smooth and creamy
Step 5: Season with sage, thyme, salt, and pepper
Step 6: Garnish with pumpkin seeds and cream swirl

Complete menu includes timing guide and prep-ahead tips!`,
      difficulty_level: 'Intermediate',
      estimated_time: '5-6 hours',
      materials_needed: ['Butternut squash', 'Chicken', 'Fall vegetables', 'Herbs and spices', 'Apples', 'Baking ingredients'],
      project_image_url: 'https://images.unsplash.com/photo-1571197917695-64fb4c24e4ae?w=500&h=400&fit=crop',
      influencer_name: 'Chef Autumn',
      influencer_handle: '@FallFlavors',
      profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face',
      tips_and_tricks: [
        'Prep vegetables the day before',
        'Use a slow cooker for hands-off cooking',
        'Make extra soup for easy weekday meals',
        'Pair with seasonal wines or cider'
      ]
    }
  ];

  return fallbackProjects;
};

export default function InfluencerShowcase() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const seasonalTheme = getSeasonalTheme();
        
        // Enhanced request for Halloween and Fall lifestyle content
        const response = await InvokeLLM({
          prompt: `Create 8 trending Halloween and Fall lifestyle projects for ${seasonalTheme} season, covering a diverse range including: DIY Halloween costumes, spooky decorations, fall cooking/baking, cozy home decor, pumpkin projects, and seasonal crafts. Return a JSON object with a "projects" array. Each project should have: project_title (catchy and specific), project_description (2 engaging sentences), difficulty_level (Beginner/Intermediate/Advanced), estimated_time (realistic timeframe), influencer_name (creative name), and influencer_handle (with @ symbol).`,
          response_json_schema: {
            type: "object",
            properties: {
              projects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    project_title: { type: "string" },
                    project_description: { type: "string" },
                    difficulty_level: { type: "string" },
                    estimated_time: { type: "string" },
                    influencer_name: { type: "string" },
                    influencer_handle: { type: "string" }
                  },
                  required: ["project_title", "project_description", "difficulty_level", "estimated_time", "influencer_name", "influencer_handle"]
                }
              }
            },
            required: ["projects"]
          }
        });
        
        if (response && response.projects && response.projects.length > 0) {
          // Enhanced images for Halloween and Fall themes
          const fallImages = [
            'https://images.unsplash.com/photo-1509557965043-36e4a811ba37?w=500&h=400&fit=crop', // Halloween
            'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&h=400&fit=crop', // Pumpkin treats
            'https://images.unsplash.com/photo-1571650235346-db0d47d4986b?w=500&h=400&fit=crop', // Halloween decor
            'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=500&h=400&fit=crop', // Cozy fall
            'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=500&h=400&fit=crop', // Ghost costume
            'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=500&h=400&fit=crop', // Fall table
            'https://images.unsplash.com/photo-1570618404439-b1eb8763e0b2?w=500&h=400&fit=crop', // Pumpkin carving
            'https://images.unsplash.com/photo-1572478284761-6946ab12dd0b?w=500&h=400&fit=crop', // Fall wreath
            'https://images.unsplash.com/photo-1571197917695-64fb4c24e4ae?w=500&h=400&fit=crop'  // Fall food
          ];

          const profileImages = [
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          ];
          
          // Enhance the simplified data with additional details and themed images
          const enhancedProjects = response.projects.map((project, index) => ({
            ...project,
            id: `ai-project-${index}-${Date.now()}`,
            detailed_instructions: `This ${project.difficulty_level} level Halloween and Fall project takes approximately ${project.estimated_time} to complete.

Materials needed vary by project but typically include seasonal supplies and basic crafting tools.

Step 1: Gather all materials and prepare your workspace
Step 2: Follow the specific techniques for this ${seasonalTheme} project  
Step 3: Take your time with detail work for best results
Step 4: Add personal touches to make it uniquely yours
Step 5: Display, wear, or serve your beautiful fall creation!
Step 6: Share photos with friends and on social media
Step 7: Enjoy the cozy, spooky, or delicious results!`,
            materials_needed: ['Seasonal supplies', 'Crafting materials', 'Basic tools', 'Halloween/Fall decorations'],
            project_image_url: fallImages[index % fallImages.length],
            profile_picture_url: profileImages[index % profileImages.length],
            tips_and_tricks: [
              'Plan ahead and gather all materials first',
              'Don\'t be afraid to add your own creative touches',
              'Take photos of your process for next year',
              'Share your creations on social media for inspiration!'
            ]
          }));
          
          setProjects(enhancedProjects);
        } else {
          throw new Error('No projects returned from API');
        }

      } catch (error) {
        console.error('Failed to fetch influencer projects:', error);
        
        // Use enhanced fallback data
        const seasonalTheme = getSeasonalTheme();
        const fallbackData = getFallbackProjects(seasonalTheme);
        setProjects(fallbackData);
        
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p>No inspirational projects found.</p>
        <p className="text-sm">Check back soon for new content!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden group hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              <div className="relative">
                <img
                  src={project.project_image_url}
                  alt={project.project_title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to a generic fall-themed image if the generated URL fails
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <img 
                    src={project.profile_picture_url} 
                    alt={project.influencer_name} 
                    className="w-8 h-8 rounded-full border-2 border-white"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face';
                    }}
                  />
                  <div>
                    <p className="text-white text-sm font-semibold">{project.influencer_name}</p>
                    <p className="text-white/80 text-xs">{project.influencer_handle}</p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty_level)}`}>
                    {project.difficulty_level}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{project.project_title}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3 flex-grow line-clamp-3">{project.project_description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{project.estimated_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>Trending</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleViewProject(project)}
                  className="w-full mt-auto"
                >
                  View Tutorial
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Project Detail Modal */}
      <Dialog open={showProjectDetail} onOpenChange={setShowProjectDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {selectedProject?.project_title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              {/* Creator Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={selectedProject.profile_picture_url} 
                  alt={selectedProject.influencer_name} 
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face';
                  }}
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedProject.influencer_name}</h4>
                  <p className="text-gray-600 text-sm">{selectedProject.influencer_handle}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProject.difficulty_level)}`}>
                    {selectedProject.difficulty_level}
                  </span>
                </div>
              </div>

              {/* Project Image */}
              <div className="relative">
                <img
                  src={selectedProject.project_image_url}
                  alt={selectedProject.project_title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop';
                  }}
                />
              </div>

              {/* Project Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Time Required
                  </h3>
                  <p className="text-gray-600">{selectedProject.estimated_time}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Difficulty</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedProject.difficulty_level)}`}>
                    {selectedProject.difficulty_level}
                  </span>
                </div>
              </div>

              {/* Materials Needed */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Materials & Tools Needed</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {selectedProject.materials_needed?.map((material, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-sm">{material}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Step-by-Step Instructions</h3>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {selectedProject.detailed_instructions}
                  </div>
                </div>
              </div>

              {/* Tips & Tricks */}
              {selectedProject.tips_and_tricks?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">💡 Pro Tips</h3>
                  <div className="space-y-2">
                    {selectedProject.tips_and_tricks.map((tip, index) => (
                      <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                        <p className="text-sm text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => setShowProjectDetail(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Could add to favorites, share, etc.
                    alert('Added to your favorites!');
                  }}
                  className="flex-1"
                >
                  Save Project
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
