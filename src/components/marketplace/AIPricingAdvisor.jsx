import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  Target,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users,
  ShoppingCart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AIPricingAdvisor({ productData, onApplyPrice }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [pricingStrategy, setPricingStrategy] = useState(null);
  const [customInputs, setCustomInputs] = useState({
    production_cost: 0,
    time_invested_hours: 0,
    target_profit_margin: 30,
    competitor_prices: ''
  });

  const { data: similarProducts = [] } = useQuery({
    queryKey: ['similarProducts', productData?.category],
    queryFn: async () => {
      if (!productData?.category) return [];
      const products = await base44.entities.MarketplaceProduct.filter({
        category: productData.category,
        status: 'active'
      });
      return products.slice(0, 10);
    },
    enabled: !!productData?.category
  });

  const analyzePricing = async () => {
    if (!productData?.product_name || !productData?.description) {
      toast.error('Please provide product name and description first');
      return;
    }

    setAnalyzing(true);
    
    try {
      const competitorPrices = similarProducts.map(p => p.price).filter(p => p > 0);
      const avgMarketPrice = competitorPrices.length > 0 
        ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length 
        : null;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert pricing strategist for digital marketplace products.

Product Details:
- Name: ${productData.product_name}
- Description: ${productData.description}
- Category: ${productData.category || 'digital product'}
- Type: ${productData.product_type || 'digital_download'}

Market Analysis:
- Similar Products Found: ${competitorPrices.length}
- Average Market Price: ${avgMarketPrice ? '$' + avgMarketPrice.toFixed(2) : 'Unknown'}
- Price Range: ${competitorPrices.length > 0 ? `$${Math.min(...competitorPrices)} - $${Math.max(...competitorPrices)}` : 'Unknown'}

Seller Inputs:
- Production Cost: $${customInputs.production_cost}
- Time Invested: ${customInputs.time_invested_hours} hours
- Target Profit Margin: ${customInputs.target_profit_margin}%
- Known Competitor Prices: ${customInputs.competitor_prices || 'None provided'}

Analyze this product and provide comprehensive pricing strategy recommendations:

1. **Recommended Price**: Single optimal price point with reasoning
2. **Price Range**: Min-max range for testing
3. **Pricing Strategy**: Which strategy to use (value-based, competitive, premium, penetration, psychological)
4. **Market Position**: How this positions against competitors (budget, mid-tier, premium)
5. **Price Justification**: Why customers will pay this price (value proposition)
6. **Bundle Opportunities**: Suggestions for bundles or upsells
7. **Discount Strategy**: When and how much to discount
8. **Launch Pricing**: Introductory pricing recommendations
9. **Risk Assessment**: Pricing risks and how to mitigate
10. **Revenue Projection**: Estimated monthly revenue at different price points

Consider:
- Digital products have no inventory costs
- Value perception vs actual cost
- Psychological pricing ($19.99 vs $20)
- Market saturation in this category
- Unique value propositions
- Target customer demographics
- Seasonal factors

Return detailed analysis in JSON format.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_price: { type: "number" },
            price_range: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" }
              }
            },
            pricing_strategy: { type: "string" },
            market_position: { type: "string" },
            price_justification: { type: "string" },
            bundle_opportunities: {
              type: "array",
              items: { type: "string" }
            },
            discount_strategy: { type: "string" },
            launch_pricing: {
              type: "object",
              properties: {
                introductory_price: { type: "number" },
                duration_days: { type: "number" },
                reasoning: { type: "string" }
              }
            },
            risk_assessment: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            revenue_projections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  price_point: { type: "number" },
                  estimated_monthly_sales: { type: "number" },
                  estimated_monthly_revenue: { type: "number" }
                }
              }
            },
            key_insights: {
              type: "array",
              items: { type: "string" }
            },
            competitive_advantages: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setPricingStrategy({
        ...response,
        market_data: {
          similar_products_count: competitorPrices.length,
          average_price: avgMarketPrice,
          price_range: competitorPrices.length > 0 ? {
            min: Math.min(...competitorPrices),
            max: Math.max(...competitorPrices)
          } : null
        },
        analyzed_at: new Date().toISOString()
      });

      toast.success('✨ Pricing analysis complete!');
    } catch (error) {
      console.error('Pricing analysis error:', error);
      toast.error('Failed to analyze pricing. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            AI Pricing Advisor
          </CardTitle>
          <CardDescription>
            Get data-driven pricing recommendations based on market analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Production Cost ($)</Label>
              <Input
                type="number"
                value={customInputs.production_cost}
                onChange={(e) => setCustomInputs({...customInputs, production_cost: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <Label className="text-sm">Time Invested (hours)</Label>
              <Input
                type="number"
                value={customInputs.time_invested_hours}
                onChange={(e) => setCustomInputs({...customInputs, time_invested_hours: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-sm">Target Profit Margin (%)</Label>
              <Input
                type="number"
                value={customInputs.target_profit_margin}
                onChange={(e) => setCustomInputs({...customInputs, target_profit_margin: parseFloat(e.target.value) || 30})}
                placeholder="30"
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label className="text-sm">Known Competitor Prices (optional)</Label>
              <Input
                value={customInputs.competitor_prices}
                onChange={(e) => setCustomInputs({...customInputs, competitor_prices: e.target.value})}
                placeholder="$19.99, $24.99, $29.99"
              />
            </div>
          </div>

          {/* Market Overview */}
          {similarProducts.length > 0 && (
            <Card className="bg-white border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Market Overview: {productData.category}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{similarProducts.length}</div>
                    <div className="text-xs text-gray-600">Similar Products</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${similarProducts.length > 0 
                        ? (similarProducts.reduce((sum, p) => sum + (p.price || 0), 0) / similarProducts.length).toFixed(2)
                        : '0'
                      }
                    </div>
                    <div className="text-xs text-gray-600">Avg Price</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {similarProducts.filter(p => p.total_sales > 0).length}
                    </div>
                    <div className="text-xs text-gray-600">Active Sellers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyze Button */}
          <Button
            onClick={analyzePricing}
            disabled={analyzing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white"
            size="lg"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Market Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze & Get Pricing Recommendations
              </>
            )}
          </Button>

          {/* Results */}
          {pricingStrategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Recommended Price */}
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="w-6 h-6" />
                      <h3 className="text-lg font-bold">Recommended Price</h3>
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      ${pricingStrategy.recommended_price?.toFixed(2)}
                    </div>
                    <p className="text-green-100 text-sm mb-4">
                      {pricingStrategy.pricing_strategy} • {pricingStrategy.market_position}
                    </p>
                    <Button
                      onClick={() => {
                        onApplyPrice(pricingStrategy.recommended_price);
                        toast.success('Price applied to product!');
                      }}
                      className="bg-white text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Apply This Price
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="insights" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white">
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="strategy">Strategy</TabsTrigger>
                  <TabsTrigger value="projections">Revenue</TabsTrigger>
                  <TabsTrigger value="risks">Risks</TabsTrigger>
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                  {/* Price Range */}
                  {pricingStrategy.price_range && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Recommended Price Range</h4>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-700">
                              ${pricingStrategy.price_range.min?.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">Minimum</div>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="h-2 bg-gradient-to-r from-yellow-400 via-green-500 to-blue-500 rounded-full"></div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-700">
                              ${pricingStrategy.price_range.max?.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-600">Maximum</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Insights */}
                  {pricingStrategy.key_insights && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Key Insights
                        </h4>
                        <ul className="space-y-2">
                          {pricingStrategy.key_insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Competitive Advantages */}
                  {pricingStrategy.competitive_advantages && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          Your Competitive Advantages
                        </h4>
                        <ul className="space-y-2">
                          {pricingStrategy.competitive_advantages.map((advantage, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-600 font-bold">•</span>
                              <span className="text-gray-700">{advantage}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="strategy" className="space-y-4">
                  {/* Pricing Justification */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Why This Price Works</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {pricingStrategy.price_justification}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Launch Pricing */}
                  {pricingStrategy.launch_pricing && (
                    <Card className="bg-orange-50 border-2 border-orange-200">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Launch Pricing Strategy
                        </h4>
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Introductory Price</span>
                            <span className="text-2xl font-bold text-orange-600">
                              ${pricingStrategy.launch_pricing.introductory_price?.toFixed(2)}
                            </span>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">
                            For first {pricingStrategy.launch_pricing.duration_days} days
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">
                          {pricingStrategy.launch_pricing.reasoning}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Bundle Opportunities */}
                  {pricingStrategy.bundle_opportunities && pricingStrategy.bundle_opportunities.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Bundle & Upsell Ideas</h4>
                        <ul className="space-y-2">
                          {pricingStrategy.bundle_opportunities.map((bundle, idx) => (
                            <li key={idx} className="text-sm text-gray-700 p-2 bg-purple-50 rounded-lg">
                              💡 {bundle}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Discount Strategy */}
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Discount Strategy</h4>
                      <p className="text-sm text-gray-700">
                        {pricingStrategy.discount_strategy}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="projections" className="space-y-4">
                  {/* Revenue Projections */}
                  {pricingStrategy.revenue_projections && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Revenue Projections
                        </h4>
                        <div className="space-y-3">
                          {pricingStrategy.revenue_projections.map((proj, idx) => {
                            const isRecommended = proj.price_point === pricingStrategy.recommended_price;
                            return (
                              <div
                                key={idx}
                                className={`p-4 rounded-lg border-2 ${
                                  isRecommended 
                                    ? 'bg-green-50 border-green-500' 
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">
                                      ${proj.price_point?.toFixed(2)}
                                    </div>
                                    {isRecommended && (
                                      <Badge className="bg-green-600 text-white">Recommended</Badge>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Est. Monthly Revenue</div>
                                    <div className="text-xl font-bold text-green-600">
                                      ${proj.estimated_monthly_revenue?.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  ~{proj.estimated_monthly_sales} sales/month
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="risks" className="space-y-4">
                  {/* Risk Assessment */}
                  {pricingStrategy.risk_assessment && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Risk Assessment & Mitigation
                        </h4>
                        <div className="space-y-3">
                          {pricingStrategy.risk_assessment.map((item, idx) => (
                            <div key={idx} className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
                              <div className="font-semibold text-orange-900 mb-1 text-sm">
                                ⚠️ {item.risk}
                              </div>
                              <div className="text-xs text-orange-800">
                                <strong>How to mitigate:</strong> {item.mitigation}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}