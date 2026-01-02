
import React, { useState, useEffect, useCallback } from 'react';
import { SavedRecipe, MealPlan, GroceryList, User } from '@/entities/all';
import { spoonacular } from '@/functions/spoonacular';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  UtensilsCrossed,
  Search,
  Calendar,
  ShoppingCart,
  Heart,
  Clock,
  Users,
  ChefHat,
  Plus,
  Sparkles,
  Check,
  Star,
  Leaf,
  AlertCircle,
  ExternalLink,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FeatureGate } from '@/components/PlanChecker';
import SEO from '@/components/SEO';
import PantryManager from '@/components/meal_planner/PantryManager';

function MealPlannerContent() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  
  // Recipe Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [checkIngredient, setCheckIngredient] = useState(null); // New state for ingredient check function
  
  // Filters
  const [diet, setDiet] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [mealType, setMealType] = useState('');
  const [maxTime, setMaxTime] = useState('');
  
  // Saved Recipes
  const [savedRecipes, setSavedRecipes] = useState([]);
  
  // Meal Plans
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('dinner');
  
  // Grocery List
  const [groceryList, setGroceryList] = useState(null);
  const [isGeneratingGrocery, setIsGeneratingGrocery] = useState(false);

  const loadSavedRecipes = useCallback(async () => {
    try {
      const recipes = await SavedRecipe.list('-created_date');
      setSavedRecipes(recipes);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  }, []);

  const loadMealPlans = useCallback(async () => {
    try {
      const plans = await MealPlan.list('-date');
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  }, []);

  const loadGroceryList = useCallback(async () => {
    try {
      const lists = await GroceryList.filter({ status: 'active' }, '-created_date', 1);
      if (lists.length > 0) {
        setGroceryList(lists[0]);
      }
    } catch (error) {
      console.error('Error loading grocery list:', error);
    }
  }, []);

  const loadUserAndData = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await Promise.all([
        loadSavedRecipes(),
        loadMealPlans(),
        loadGroceryList()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [loadSavedRecipes, loadMealPlans, loadGroceryList]);

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  const searchRecipes = async () => {
    if (!searchQuery.trim() && !diet && !cuisine && !mealType) return;
    
    setIsSearching(true);
    setApiKeyError(false);
    try {
      const { data } = await spoonacular({
        action: 'searchRecipes',
        params: {
          query: searchQuery,
          diet,
          cuisine,
          type: mealType,
          maxReadyTime: maxTime ? parseInt(maxTime) : null,
          number: 12
        }
      });
      
      if (data.success && data.recipes) {
        setRecipes(data.recipes);
        console.log('Found recipes:', data.recipes.length);
      } else if (data.error && data.error.includes('Invalid API key')) {
        setApiKeyError(true);
        setRecipes([]);
      } else {
        console.error('No recipes found in response:', data);
        alert('No recipes found. Please try different search criteria.');
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      if (error.message && error.message.includes('Invalid API key')) {
        setApiKeyError(true);
        setRecipes([]);
      } else {
        alert('Failed to search recipes. Please try again.');
      }
    }
    setIsSearching(false);
  };

  const getRandomRecipes = async () => {
    setIsSearching(true);
    setApiKeyError(false);
    try {
      const tags = [];
      if (diet) tags.push(diet);
      if (cuisine) tags.push(cuisine);
      if (mealType) tags.push(mealType);
      
      const tagsString = tags.length > 0 ? tags.join(',') : '';
      
      console.log('Getting random recipes with tags:', tagsString);
      
      const response = await spoonacular({
        action: 'getRandomRecipes',
        params: {
          tags: tagsString,
          number: 12
        }
      });
      
      console.log('Full response from backend:', response);
      
      const { data } = response;
      
      if (!data) {
        console.error('No data in response');
        alert('Failed to load recipes. Please try again.');
        return;
      }
      
      console.log('Backend response data:', data);
      
      if (data.success === false) {
        if (data.error && data.error.includes('Invalid API key')) {
          setApiKeyError(true);
          setRecipes([]);
        } else {
          console.error('Backend returned error:', data.error);
          alert(`Could not load recipes: ${data.error || 'Unknown error'}. Please try again.`);
        }
        return;
      }
      
      if (data.recipes && Array.isArray(data.recipes) && data.recipes.length > 0) {
        console.log('Setting recipes:', data.recipes.length, 'recipes found');
        setRecipes(data.recipes);
      } else {
        console.error('No recipes in response or empty array:', data);
        alert('No recipes found. Try adjusting your filters or search again.');
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error getting random recipes:', error);
      if (error.message && error.message.includes('Invalid API key')) {
        setApiKeyError(true);
        setRecipes([]);
      } else {
        alert('Failed to load random recipes. Please check your internet connection and try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const viewRecipeDetails = async (recipe) => {
    try {
      const { data } = await spoonacular({
        action: 'getRecipeDetails',
        params: { recipeId: recipe.id }
      });
      
      if (data.success && data.recipe) {
        setSelectedRecipe(data.recipe);
        setShowRecipeDialog(true);
      } else {
        console.error('Failed to load recipe details:', data);
        alert('Failed to load recipe details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      alert('Failed to load recipe details. Please try again.');
    }
  };

  const saveRecipe = async (recipe) => {
    try {
      await SavedRecipe.create({
        spoonacular_id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        ready_in_minutes: recipe.readyInMinutes,
        servings: recipe.servings,
        source_url: recipe.sourceUrl,
        recipe_data: recipe,
        tags: recipe.dishTypes || []
      });
      
      await loadSavedRecipes();
      alert('Recipe saved successfully! ⭐');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const addToMealPlan = async (recipe, date, type) => {
    try {
      await MealPlan.create({
        date: date,
        meal_type: type,
        spoonacular_id: recipe.id,
        recipe_title: recipe.title,
        recipe_image: recipe.image,
        servings: recipe.servings || 4
      });
      
      await loadMealPlans();
      setShowAddMealDialog(false);
      alert('Added to meal plan! 🍽️');
    } catch (error) {
      console.error('Error adding to meal plan:', error);
      alert('Failed to add to meal plan. Please try again.');
    }
  };

  const generateGroceryList = async () => {
    setIsGeneratingGrocery(true);
    try {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const weekPlans = mealPlans.filter(plan => {
        const planDate = new Date(plan.date);
        const diffTime = Math.abs(planDate - startOfWeek);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      });
      
      const recipeIds = weekPlans.map(plan => plan.spoonacular_id).filter(Boolean);
      
      const { data } = await spoonacular({
        action: 'getGroceryList',
        params: { recipeIds }
      });
      
      if (data.success) {
        const newList = await GroceryList.create({
          week_start_date: startOfWeek.toISOString().split('T')[0],
          items: data.ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            aisle: ing.aisle,
            checked: false,
            in_pantry: checkIngredient ? checkIngredient(ing.name) : false // Check against pantry
          })),
          status: 'active'
        });
        
        setGroceryList(newList);
        setActiveTab('grocery');
      } else if (data.error && data.error.includes('Invalid API key')) {
        setApiKeyError(true);
      }
    } catch (error) {
      console.error('Error generating grocery list:', error);
      if (error.message && error.message.includes('Invalid API key')) {
        setApiKeyError(true);
      } else {
        alert('Failed to generate grocery list. Please try again.');
      }
    }
    setIsGeneratingGrocery(false);
  };

  const toggleGroceryItem = async (index) => {
    if (!groceryList) return;
    
    const updatedItems = [...groceryList.items];
    updatedItems[index].checked = !updatedItems[index].checked;
    
    try {
      await GroceryList.update(groceryList.id, { items: updatedItems });
      setGroceryList({ ...groceryList, items: updatedItems });
    } catch (error) {
      console.error('Error updating grocery item:', error);
    }
  };

  const getMealPlansForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.filter(plan => plan.date === dateStr);
  };

  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - current.getDay());
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <UtensilsCrossed className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Meal Planner</h1>
          </div>
          <p className="text-gray-600 mb-8">
            Plan nutritious meals that support your wellness journey.
          </p>

          {apiKeyError && (
            <Alert className="mb-6 bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Spoonacular API Key Required</AlertTitle>
              <AlertDescription className="text-orange-700">
                <p className="mb-3">To use the recipe search feature, you need to set up your Spoonacular API key:</p>
                <ol className="list-decimal list-inside space-y-2 mb-3">
                  <li>Go to <a href="https://spoonacular.com/food-api/console" target="_blank" rel="noopener noreferrer" className="underline font-semibold inline-flex items-center gap-1">
                    Spoonacular API Console <ExternalLink className="w-3 h-3" />
                  </a></li>
                  <li>Sign up for a free account (150 requests/day)</li>
                  <li>Copy your 32-character API key</li>
                  <li>Go to Base44 Dashboard → Settings → Environment Variables</li>
                  <li>Set <code className="bg-orange-100 px-1 rounded">SPOONACULAR_API_KEY</code> to your API key</li>
                  <li>Save and refresh this page</li>
                  <li>Note: If you run into "The daily limit of 150 requests has been reached." error, you will need to try again the next day or upgrade your Spoonacular account.</li>
                </ol>
                <p className="text-sm">For now, you can still use the saved recipes, meal planner, and grocery list features!</p>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Meal Plan
              </TabsTrigger>
              <TabsTrigger value="grocery" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Grocery List
              </TabsTrigger>
              <TabsTrigger value="pantry" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pantry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-orange-600" />
                    Find Recipes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for recipes... (e.g., 'chicken pasta', 'vegan dessert')"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchRecipes()}
                      className="flex-1"
                    />
                    <Button onClick={searchRecipes} disabled={isSearching} className="bg-orange-500 hover:bg-orange-600">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button onClick={getRandomRecipes} disabled={isSearching} variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Surprise Me
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3">
                    <Select value={diet} onValueChange={setDiet}>
                      <SelectTrigger>
                        <SelectValue placeholder="Diet" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Any Diet</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="glutenFree">Gluten Free</SelectItem>
                        <SelectItem value="ketogenic">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={cuisine} onValueChange={setCuisine}>
                      <SelectTrigger>
                        <SelectValue placeholder="Cuisine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Any Cuisine</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                        <SelectItem value="american">American</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={mealType} onValueChange={setMealType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Meal Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Any Meal</SelectItem>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                        <SelectItem value="dessert">Dessert</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={maxTime} onValueChange={setMaxTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Max Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Any Time</SelectItem>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {isSearching ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <ChefHat className="w-12 h-12 text-orange-500" />
                  </motion.div>
                  <p className="mt-4 text-gray-600">Finding delicious recipes...</p>
                </div>
              ) : recipes.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="cursor-pointer"
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all h-full">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              size="icon"
                              className="bg-white/90 hover:bg-white text-red-500 rounded-full shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveRecipe(recipe);
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4" onClick={() => viewRecipeDetails(recipe)}>
                          <h3 className="font-bold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {recipe.readyInMinutes} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {recipe.servings} servings
                            </div>
                          </div>
                          {recipe.vegetarian && (
                            <Badge className="mt-2 bg-green-100 text-green-800">
                              <Leaf className="w-3 h-3 mr-1" />
                              Vegetarian
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to discover amazing recipes?</h3>
                    <p className="text-gray-500 mb-4">Search for recipes or click "Surprise Me" for inspiration</p>
                    <Button onClick={getRandomRecipes} className="bg-orange-500 hover:bg-orange-600">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Show Me Random Recipes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved">
              {savedRecipes.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {savedRecipes.map(recipe => (
                    <Card key={recipe.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                        {recipe.rating && (
                          <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold">{recipe.rating}</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recipe.ready_in_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {recipe.servings} servings
                          </div>
                        </div>
                        {recipe.times_made > 0 && (
                          <div className="text-sm text-gray-500 mb-3">
                            Made {recipe.times_made} {recipe.times_made === 1 ? 'time' : 'times'}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            onClick={() => {
                              setSelectedRecipe(recipe.recipe_data);
                              setShowRecipeDialog(true);
                            }}
                          >
                            View Recipe
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRecipe(recipe.recipe_data);
                              setShowAddMealDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved recipes yet</h3>
                    <p className="text-gray-500 mb-4">Start discovering and saving recipes you love!</p>
                    <Button onClick={() => setActiveTab('discover')} className="bg-orange-500 hover:bg-orange-600">
                      <Search className="w-4 h-4 mr-2" />
                      Discover Recipes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="planner" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Weekly Meal Plan</h2>
                <Button
                  onClick={generateGroceryList}
                  disabled={isGeneratingGrocery}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Generate Shopping List
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-4">
                {getWeekDays().map((day, index) => {
                  const dayPlans = getMealPlansForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <Card
                      key={index}
                      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${
                        isToday ? 'ring-2 ring-orange-500' : ''
                      }`}
                    >
                      <CardHeader className="p-3 text-center">
                        <div className="text-sm font-semibold text-gray-600">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {day.getDate()}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {['breakfast', 'lunch', 'dinner'].map(type => {
                          const meal = dayPlans.find(p => p.meal_type === type);
                          return (
                            <div
                              key={type}
                              className="p-2 bg-gray-50 rounded-lg text-xs cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setSelectedDate(day);
                                setSelectedMealType(type);
                                setShowAddMealDialog(true);
                              }}
                            >
                              <div className="font-semibold text-gray-600 capitalize mb-1">{type}</div>
                              {meal ? (
                                <div className="flex items-start gap-2">
                                  {meal.recipe_image && (
                                    <img
                                      src={meal.recipe_image}
                                      alt={meal.recipe_title}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-gray-800 line-clamp-2">{meal.recipe_title}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-center py-2">
                                  <Plus className="w-4 h-4 mx-auto" />
                                  Add meal
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="grocery">
              {groceryList ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        Shopping List
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {groceryList.items.filter(i => i.checked).length} / {groceryList.items.length} items
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Week of {new Date(groceryList.week_start_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(
                      groceryList.items.reduce((acc, item) => {
                        const aisle = item.aisle || 'Other';
                        if (!acc[aisle]) acc[aisle] = [];
                        acc[aisle].push(item);
                        return acc;
                      }, {})
                    ).map(([aisle, items], aisleIndex) => (
                      <div key={aisle} className="mb-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-3 pb-2 border-b">
                          {aisle}
                        </h3>
                        <div className="space-y-2">
                          {items.map((item, itemIndex) => {
                            const globalIndex = groceryList.items.indexOf(item);
                            return (
                              <motion.div
                                key={globalIndex}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  item.checked ? 'bg-gray-50 opacity-60' : 'bg-white'
                                }`}
                                whileTap={{ scale: 0.98 }}
                              >
                                <button
                                  onClick={() => toggleGroceryItem(globalIndex)}
                                  className="flex-shrink-0"
                                >
                                  {item.checked ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                                  )}
                                </button>
                                <div className="flex-1">
                                  <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                    {item.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {item.amount} {item.unit}
                                    {item.in_pantry && (
                                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                        In Pantry
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No shopping list yet</h3>
                    <p className="text-gray-500 mb-4">Add meals to your plan and generate a shopping list</p>
                    <Button onClick={() => setActiveTab('planner')} className="bg-orange-500 hover:bg-orange-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Go to Meal Planner
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pantry Tab */}
            <TabsContent value="pantry">
              <PantryManager onCheckIngredient={setCheckIngredient} />
            </TabsContent>
          </Tabs>

          <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              {selectedRecipe && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedRecipe.title}</DialogTitle>
                    <DialogDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedRecipe.readyInMinutes} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedRecipe.servings} servings
                        </div>
                      </div>
                    </DialogDescription>
                  </DialogHeader>

                  {selectedRecipe.image && (
                    <img
                      src={selectedRecipe.image}
                      alt={selectedRecipe.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}

                  {selectedRecipe.summary && (
                    <div
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }}
                    />
                  )}

                  {selectedRecipe.extendedIngredients && (
                    <div>
                      <h3 className="font-bold text-lg mb-3">Ingredients</h3>
                      <ul className="space-y-2">
                        {selectedRecipe.extendedIngredients.map((ing, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            <span>{ing.original}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRecipe.analyzedInstructions && selectedRecipe.analyzedInstructions[0] && (
                    <div>
                      <h3 className="font-bold text-lg mb-3">Instructions</h3>
                      <ol className="space-y-3">
                        {selectedRecipe.analyzedInstructions[0].steps.map((step) => (
                          <li key={step.number} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                              {step.number}
                            </div>
                            <div className="flex-1 pt-1">{step.step}</div>
                            </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowRecipeDialog(false)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        saveRecipe(selectedRecipe);
                        setShowRecipeDialog(false);
                      }}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save Recipe
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRecipeDialog(false);
                        setShowAddMealDialog(true);
                      }}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Meal Plan
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Meal Plan</DialogTitle>
                <DialogDescription>
                  Choose when to make this recipe
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meal Type</label>
                  <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snack">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddMealDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedRecipe) {
                      addToMealPlan(
                        selectedRecipe,
                        selectedDate.toISOString().split('T')[0],
                        selectedMealType
                      );
                    }
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Add to Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  );
}

export default function MealPlanner() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Helper33 AI Meal Planner & Recipe Generator",
    "description": "AI-powered meal planning, recipe generation, and smart grocery lists. Create personalized meal plans based on dietary needs and preferences.",
    "applicationCategory": "LifestyleApplication",
    "featureList": [
      "AI Recipe Generation",
      "Personalized Meal Planning",
      "Smart Grocery Lists",
      "Dietary Restriction Support",
      "Nutrition Tracking",
      "Cooking Instructions",
      "Kitchen Pantry Management" // Added this feature
    ]
  };

  return (
    <>
      <SEO 
        title="AI Meal Planner & Recipe Generator - Smart Cooking Assistant | Helper33"
        description="AI-powered meal planning and recipe generation. Create personalized meal plans, get AI cooking assistance, generate recipes based on ingredients, and build smart grocery lists automatically."
        keywords="AI meal planner, AI recipe generator, AI cooking assistant, meal planning AI, recipe AI, AI nutrition, smart grocery list, AI diet planner, cooking AI, AI meal prep, personalized recipes, AI chef, healthy meal planning"
        structuredData={structuredData}
      />
      
      <FeatureGate
        featureKey="meal_planner"
        featureName="Meal Planner"
        featureDescription="Plan healthy family meals, search recipes, and create organized grocery lists."
      >
        <MealPlannerContent />
      </FeatureGate>
    </>
  );
}
