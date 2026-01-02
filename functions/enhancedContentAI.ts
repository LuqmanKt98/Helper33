import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content_type, prompt, tone, audience, options } = await req.json();
        
        let systemPrompt = '';
        let responseSchema = {};
        
        switch (content_type) {
            case 'video':
                systemPrompt = `You are an expert video content creator. Create a compelling 60-second video script.
                Topic: ${prompt}
                Audience: ${audience || 'general audience'}
                Tone: ${tone}
                
                Structure the script with:
                - Hook (first 3 seconds to grab attention)
                - Introduction (establish topic)
                - Body (2-3 key points with examples)
                - Strong Call-to-Action
                
                Make it conversational and engaging.`;
                
                responseSchema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        hook: { type: "string" },
                        intro: { type: "string" },
                        body: { type: "string" },
                        cta: { type: "string" },
                        duration: { type: "string" },
                        visualSuggestions: { type: "array", items: { type: "string" } },
                        hashtags: { type: "array", items: { type: "string" } }
                    }
                };
                break;
                
            case 'post':
                systemPrompt = `You are a social media expert. Create an engaging post.
                Topic: ${prompt}
                Audience: ${audience || 'general audience'}
                Tone: ${tone}
                
                Include:
                - Attention-grabbing opening
                - 2-3 key points with emojis
                - Strong call-to-action
                - 5-10 relevant hashtags
                
                Keep it concise and shareable.`;
                
                responseSchema = {
                    type: "object",
                    properties: {
                        content: { type: "string" },
                        hashtags: { type: "array", items: { type: "string" } },
                        bestTimeToPost: { type: "string" },
                        platforms: { type: "array", items: { type: "string" } }
                    }
                };
                break;
                
            case 'blog':
                systemPrompt = `You are an SEO content writer. Create a comprehensive blog outline.
                Topic: ${prompt}
                Audience: ${audience || 'general audience'}
                Tone: ${tone}
                
                Include:
                - SEO-optimized title
                - Meta description (150-160 characters)
                - 5-7 H2 headings with subpoints
                - 3-5 FAQ questions and answers
                - Keywords to target
                
                Make it SEO-friendly and valuable.`;
                
                responseSchema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        metaDescription: { type: "string" },
                        keywords: { type: "array", items: { type: "string" } },
                        outline: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    heading: { type: "string" },
                                    points: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        faqs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" }
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'presentation':
                systemPrompt = `You are a presentation designer. Create a 10-slide presentation outline.
                Topic: ${prompt}
                Audience: ${audience || 'general audience'}
                Tone: ${tone}
                
                For each slide provide:
                - Slide title
                - 2-3 bullet points
                - Speaker notes
                
                Make it professional and impactful.`;
                
                responseSchema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        slides: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    slideNumber: { type: "number" },
                                    title: { type: "string" },
                                    points: { type: "array", items: { type: "string" } },
                                    notes: { type: "string" }
                                }
                            }
                        }
                    }
                };
                break;
                
            case 'design':
                systemPrompt = `You are a graphic designer. Create a design brief for social media graphics.
                Topic: ${prompt}
                Audience: ${audience || 'general audience'}
                Mood: ${tone}
                
                Include:
                - Main headline (short and punchy)
                - Sub-headline
                - Color palette (3-4 colors with hex codes)
                - Visual elements and composition
                - Typography suggestions
                - Image generation prompt for AI
                
                Make it visually compelling.`;
                
                responseSchema = {
                    type: "object",
                    properties: {
                        headline: { type: "string" },
                        subHeadline: { type: "string" },
                        colors: { type: "array", items: { type: "string" } },
                        visualElements: { type: "array", items: { type: "string" } },
                        typography: { type: "string" },
                        layout: { type: "string" },
                        imagePrompt: { type: "string" }
                    }
                };
                break;
                
            case 'ebook':
                systemPrompt = `You are a book author and editor. Create an e-book outline.
                Topic: ${prompt}
                Audience: ${audience || 'general audience'}
                Tone: ${tone}
                
                Include:
                - Title and subtitle
                - Introduction chapter
                - 5-7 main chapters with key points
                - Conclusion
                - Bonus resources
                
                Make it comprehensive and valuable.`;
                
                responseSchema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        subtitle: { type: "string" },
                        introduction: { type: "string" },
                        chapters: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    number: { type: "number" },
                                    title: { type: "string" },
                                    keyPoints: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        conclusion: { type: "string" },
                        bonusResources: { type: "array", items: { type: "string" } }
                    }
                };
                break;
                
            default:
                return Response.json({ error: 'Invalid content type' }, { status: 400 });
        }
        
        // Use Base44's InvokeLLM integration
        const content = await base44.integrations.Core.InvokeLLM({
            prompt: systemPrompt,
            response_json_schema: responseSchema
        });
        
        return Response.json({ 
            success: true,
            content: content 
        });
        
    } catch (error) {
        console.error('Error generating content:', error);
        return Response.json({ 
            error: error.message || 'Failed to generate content' 
        }, { status: 500 });
    }
});