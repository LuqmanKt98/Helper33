
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const SPOONACULAR_API_KEY = Deno.env.get("SPOONACULAR_API_KEY");
const BASE_URL = "https://api.spoonacular.com";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if API key exists
        if (!SPOONACULAR_API_KEY) {
            console.error('SPOONACULAR_API_KEY is not set in environment variables');
            return Response.json({ success: false, error: 'API key not configured.' });
        }

        // Debug: Log API key info (first/last 4 chars only for security)
        const keyPreview = SPOONACULAR_API_KEY.length > 8 
            ? `${SPOONACULAR_API_KEY.substring(0, 4)}...${SPOONACULAR_API_KEY.substring(SPOONACULAR_API_KEY.length - 4)}`
            : 'TOO_SHORT';
        console.log('API Key preview:', keyPreview);
        console.log('API Key length:', SPOONACULAR_API_KEY?.length);
        console.log('API Key has spaces:', SPOONACULAR_API_KEY.includes(' '));

        const { action, params } = await req.json();

        switch (action) {
            case 'testApiKey': {
                // Simple test endpoint
                const testUrl = `${BASE_URL}/recipes/random?number=1&apiKey=${SPOONACULAR_API_KEY.trim()}`;
                console.log('Testing API key with:', testUrl.replace(SPOONACULAR_API_KEY, 'HIDDEN'));
                
                const response = await fetch(testUrl);
                const responseText = await response.text();
                
                console.log('Test response status:', response.status);
                console.log('Test response:', responseText.substring(0, 200));
                
                if (!response.ok) {
                    return Response.json({ 
                        success: false, 
                        error: `API test failed with status ${response.status}: ${responseText}`,
                        recipes: [] 
                    });
                }
                
                const data = JSON.parse(responseText);
                return Response.json({ success: true, message: 'API key is working!', data });
            }

            case 'searchRecipes': {
                const { query, diet, intolerances, cuisine, type, maxReadyTime, number = 12, addRecipeNutrition } = params;
                
                const searchParams = new URLSearchParams({
                    apiKey: SPOONACULAR_API_KEY.trim(),
                    query: query || '',
                    number: number.toString(),
                    addRecipeInformation: 'true',
                    fillIngredients: 'true'
                });

                if (addRecipeNutrition) searchParams.append('addRecipeNutrition', 'true');
                if (diet) searchParams.append('diet', diet);
                if (intolerances) searchParams.append('intolerances', intolerances);
                if (cuisine) searchParams.append('cuisine', cuisine);
                if (type) searchParams.append('type', type);
                if (maxReadyTime) searchParams.append('maxReadyTime', maxReadyTime.toString());

                const url = `${BASE_URL}/recipes/complexSearch?${searchParams}`;
                console.log('Fetching:', url.replace(SPOONACULAR_API_KEY, 'API_KEY_HIDDEN'));

                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Search API error:', response.status, errorText);
                    return Response.json({ 
                        success: false, 
                        error: `API returned ${response.status}: ${errorText}`,
                        recipes: [] 
                    });
                }
                
                const data = await response.json();
                console.log('Search recipes response:', data);
                
                return Response.json({ success: true, recipes: data.results || [] });
            }

            case 'getRecipeDetails': {
                const { recipeId } = params;
                
                const url = `${BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY.trim()}&includeNutrition=true`;
                console.log('Fetching recipe details for ID:', recipeId);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Recipe details API error:', response.status, errorText);
                    return Response.json({ 
                        success: false, 
                        error: `API returned ${response.status}`,
                        recipe: null 
                    });
                }
                
                const data = await response.json();
                
                return Response.json({ success: true, recipe: data });
            }

            case 'generateMealPlan': {
                const { timeFrame = 'day', targetCalories, diet, exclude } = params;
                
                const searchParams = new URLSearchParams({
                    apiKey: SPOONACULAR_API_KEY.trim(),
                    timeFrame
                });

                if (targetCalories) searchParams.append('targetCalories', targetCalories.toString());
                if (diet) searchParams.append('diet', diet);
                if (exclude) searchParams.append('exclude', exclude);

                const url = `${BASE_URL}/mealplanner/generate?${searchParams}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Meal plan API error:', response.status, errorText);
                    return Response.json({ 
                        success: false, 
                        error: `API returned ${response.status}`,
                        mealPlan: null 
                    });
                }
                
                const data = await response.json();
                
                return Response.json({ success: true, mealPlan: data });
            }

            case 'getGroceryList': {
                const { recipeIds } = params;
                
                if (!recipeIds || recipeIds.length === 0) {
                    return Response.json({ success: true, ingredients: [] });
                }

                const recipeDetailsUrl = `${BASE_URL}/recipes/informationBulk?ids=${recipeIds.join(',')}&includeNutrition=false&apiKey=${SPOONACULAR_API_KEY.trim()}`;
                
                const response = await fetch(recipeDetailsUrl);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Bulk recipe info API error:', response.status, errorText);
                    return Response.json({ 
                        success: false, 
                        error: `API returned ${response.status}: ${errorText}`,
                        ingredients: [] 
                    });
                }
                
                const recipes = await response.json();
                const ingredientMap = new Map();
                
                recipes.forEach(recipe => {
                    if (recipe.extendedIngredients && Array.isArray(recipe.extendedIngredients) && recipe.extendedIngredients.length > 0) {
                        const totalRecipeCost = (recipe.pricePerServing * recipe.servings) / 100; // Price is in cents
                        const costPerIngredient = totalRecipeCost / recipe.extendedIngredients.length;

                        recipe.extendedIngredients.forEach(ing => {
                            if (!ing.name) return;

                            const name = ing.name.toLowerCase();
                            const unit = (ing.unit || 'item').toLowerCase();
                            const key = `${name}|${unit}`;
                            
                            const price = costPerIngredient || 0;

                            if (ingredientMap.has(key)) {
                                const existing = ingredientMap.get(key);
                                existing.amount = (existing.amount || 0) + (ing.amount || 0);
                                existing.price = (existing.price || 0) + price;
                            } else {
                                ingredientMap.set(key, {
                                    name: ing.name,
                                    amount: ing.amount || 1,
                                    unit: ing.unit || 'item',
                                    aisle: ing.aisle,
                                    price: price,
                                });
                            }
                        });
                    }
                });
                
                const groceryList = Array.from(ingredientMap.values());
                
                return Response.json({ success: true, ingredients: groceryList });
            }

            case 'searchByIngredients': {
                const { ingredients, number = 12 } = params;
                
                const searchParams = new URLSearchParams({
                    apiKey: SPOONACULAR_API_KEY.trim(),
                    ingredients: ingredients.join(','),
                    number: number.toString(),
                    ranking: '1',
                    ignorePantry: 'true'
                });

                const url = `${BASE_URL}/recipes/findByIngredients?${searchParams}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Search by ingredients API error:', response.status, errorText);
                    return Response.json({ 
                        success: false, 
                        error: `API returned ${response.status}`,
                        recipes: [] 
                    });
                }
                
                const data = await response.json();
                
                return Response.json({ success: true, recipes: data });
            }

            case 'getNutrition': {
                const { recipeId } = params;
                
                const url = `${BASE_URL}/recipes/${recipeId}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY.trim()}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Nutrition API error:', response.status, errorText);
                    return Response.json({ 
                        success: false, 
                        error: `API returned ${response.status}`,
                        nutrition: null 
                    });
                }
                
                const data = await response.json();
                
                return Response.json({ success: true, nutrition: data });
            }

            case 'getRandomRecipes': {
                const { tags, number = 10 } = params;
                
                const searchParams = new URLSearchParams({
                    apiKey: SPOONACULAR_API_KEY.trim(),
                    number: number.toString()
                });

                if (tags) {
                    searchParams.append('tags', tags);
                }

                const url = `${BASE_URL}/recipes/random?${searchParams}`;
                console.log('Fetching random recipes with params:', searchParams.toString().replace(SPOONACULAR_API_KEY, 'API_KEY_HIDDEN'));
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Random recipes API error:', response.status, errorText);
                    
                    if (response.status === 401) {
                        return Response.json({ 
                            success: false, 
                            error: 'Invalid API key. Please check your Spoonacular API key at https://spoonacular.com/food-api/console',
                            recipes: [] 
                        });
                    }
                    
                    return Response.json({ 
                        success: false, 
                        error: `API error: ${response.status} - ${errorText}`,
                        recipes: [] 
                    });
                }
                
                const data = await response.json();
                console.log('Random recipes API response status:', response.status);
                console.log('Random recipes count:', data.recipes?.length || 0);
                
                if (data.recipes && Array.isArray(data.recipes)) {
                    return Response.json({ 
                        success: true, 
                        recipes: data.recipes 
                    });
                } else {
                    console.error('Unexpected response format:', data);
                    return Response.json({ 
                        success: false, 
                        error: 'Unexpected response format from Spoonacular',
                        recipes: [] 
                    });
                }
            }

            default:
                return Response.json({ error: 'Invalid action', success: false }, { status: 400 });
        }

    } catch (error) {
        console.error('Spoonacular function error:', error);
        return Response.json({ 
            error: error.message || 'Internal server error',
            success: false,
        }, { status: 500 });
    }
});
