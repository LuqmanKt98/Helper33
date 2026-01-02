import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InvokeLLM } from '@/integrations/Core';
import { Loader2, BookOpen, User, Youtube, Mic, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const fallbackData = {
  authors: [
    { name: 'Brené Brown', bio: 'A research professor and author known for her work on courage, vulnerability, shame, and empathy.', image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
    { name: 'James Clear', bio: 'An author and speaker focused on habits, decision-making, and continuous improvement.', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  ],
  books: [
    { title: 'Daring Greatly', author: 'Brené Brown', summary: 'A book that challenges us to be vulnerable and embrace imperfections to live a more wholehearted life.', cover_url: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=600&fit=crop' },
    { title: 'Atomic Habits', author: 'James Clear', summary: 'An easy-to-understand guide for making small, incremental changes that result in remarkable outcomes.', cover_url: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop' },
  ],
  media: [
    { title: 'Brené Brown: The Call to Courage', type: 'video', description: 'A Netflix special where Brown discusses what it takes to choose courage over comfort.', link: '#' },
    { title: 'The Habit-Building Masterclass with James Clear', type: 'podcast', description: 'A podcast episode that dives deep into the science of building and sticking to good habits.', link: '#' },
  ],
};

export default function AuthorsShowcase() {
  const [content, setContent] = useState({ authors: [], books: [], media: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await InvokeLLM({
          prompt: `Generate a list of 2 inspiring authors known for their life stories or self-improvement work, 2 popular books written by them, and 2 related media items (videos or podcasts). Provide realistic, inspiring content.`,
          response_json_schema: {
            type: "object",
            properties: {
              authors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    bio: { type: "string" },
                    image_url: { type: "string", format: "uri" },
                  },
                  required: ["name", "bio", "image_url"],
                },
              },
              books: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    author: { type: "string" },
                    summary: { type: "string" },
                    cover_url: { type: "string", format: "uri" },
                  },
                  required: ["title", "author", "summary", "cover_url"],
                },
              },
              media: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    type: { type: "string", enum: ["video", "podcast"] },
                    description: { type: "string" },
                    link: { type: "string", format: "uri" },
                  },
                  required: ["title", "type", "description", "link"],
                },
              },
            },
            required: ["authors", "books", "media"],
          },
        });

        if (response && response.authors && response.books && response.media) {
          setContent(response);
        } else {
          setContent(fallbackData);
        }
      } catch (error) {
        console.error('Failed to fetch author content:', error);
        setContent(fallbackData);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Featured Authors */}
      <section>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          Featured Authors
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {content.authors.map((author, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.2 }}>
              <Card className="p-4 flex items-start gap-4 h-full">
                <img src={author.image_url} alt={author.name} className="w-20 h-20 rounded-full object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{author.name}</h4>
                  <p className="text-sm text-gray-600">{author.bio}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Inspiring Books */}
      <section>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-500" />
          Inspiring Reads
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {content.books.map((book, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.2 }}>
              <Card className="p-4 flex items-start gap-4 h-full">
                <img src={book.cover_url} alt={book.title} className="w-24 h-36 object-cover rounded-md shadow-md" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{book.title}</h4>
                  <p className="text-sm font-medium text-gray-500 mb-2">by {book.author}</p>
                  <p className="text-sm text-gray-600">{book.summary}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Watch & Listen */}
      <section>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Youtube className="w-6 h-6 text-red-500" />
          Watch & Listen
        </h3>
        <div className="space-y-4">
          {content.media.map((item, index) => (
            <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.2 }}>
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1">
                    <Badge variant={item.type === 'video' ? 'destructive' : 'secondary'} className="mb-2">
                      {item.type === 'video' ? <Youtube className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <Button asChild variant="outline" className="mt-2 sm:mt-0 flex-shrink-0">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.type === 'video' ? 'Watch Now' : 'Listen Now'}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}