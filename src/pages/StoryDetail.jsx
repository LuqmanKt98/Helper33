
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, ScrollText, ChevronsUp, ChevronsDown, Lock, Crown, Clock } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

const stories = {
  'ruby-dobry': {
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'The Morning I Knew',
    image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    category: 'Grief & Resilience',
    gradient: 'from-blue-600 to-indigo-600',
    readTime: '6 min read',
    content: "I woke up early that morning in the hospital room—Sacha curled up beside me in his little hospital bed, the beeping of machines steady in the background. It was somewhere around 4 or maybe 5 a.m.—the kind of waking where your body rises before your spirit does, and for a few fleeting seconds, you forget what you're carrying.\n\nMy phone hadn't charged properly, but it still flickered to life. A YouTube video had auto-played through the night. The title flashed in bold: Your life is about to change. I don't know why I clicked it, but I did. I caught just enough to hear a prayer—one that felt oddly placed, yet strangely timed:\n\nLet your will be done. Protect what I can't see. Guide what I can't hold.\n\nSo I whispered it too, quietly, holding Sacha's warm hand in mine.\n\nYuriy had promised he'd come that morning.\n\nHe was home.\n\nSacha had been admitted for a few days, and Yuriy had stayed behind to rest after a long week. He told me, I'll be there tomorrow morning. As soon as I'm up. Promise.\n\nAnd so I waited.\n\nWe waited.\n\nThe clock ticked past 9. Then 10. Then 11.\n\nStill, no call. No text. No Yuriy.\n\nI told myself maybe he was tired. Maybe traffic. Maybe he overslept. Maybe... maybe.\n\nBut something didn't feel right. Not in my mind—but in my body.\n\nStill, I tried to let it go.\n\nAnd then Sacha sat up in bed, suddenly alert.\n\nPapa! Papa! Papa! he yelled.\n\nHe was pointing at the hospital room door, eyes wide, voice full of excitement.\n\nPapa, Papa! he shouted again, grinning like he'd just seen his dad walk through the door.\n\nI froze.\n\nThere had been no knock. No footsteps. No sound.\n\nBut Sacha was certain. He was smiling. Reaching. Laughing like he always did when Yuriy came home.\n\nI got up slowly, heart pounding, and opened the door.\n\nNo one. Just the quiet hallway.\n\nNo, baby, I whispered. Papa's not at the door.\n\nBut Sacha kept smiling, like he still felt him there.\n\nAnd then I felt it too. A presence. A chill. A weight shift in the air.\n\nI grabbed my phone, hands shaking now. I texted Yuriy. Called. Nothing.\n\nThen I reached out to the people he said he was with the night before. Silence.\n\nThat's when I called the police. Not to panic. Just to know.\n\nHi, I said calmly. Can you do a welfare check? My husband… he was supposed to visit us this morning. My son and I are here in the hospital. He hasn't shown up. I just… I have a feeling.\n\nI waited for an update that seemed like forever...\n\nThe officer on the other end was gentle but firm.\n\nMa'am, he said after a long pause, we need you to come to the house.\n\nAnd that's when my soul caught up with what my body already knew.\n\nI whispered, My husband is dead, isn't he?\n\nThey hadn't said it yet. But I knew.\n\nI felt it hours ago. When the prayer whispered itself through the speaker. When Sacha called for a man who never walked in. When the door opened to no one, and yet the air shifted like someone had just passed through.\n\nYuriy hadn't come to the hospital that morning.\n\nBut he had come to say goodbye."
  },
  'when-the-vibes-speak-first': {
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'When the Vibes Speak First',
    image_url: 'https://images.unsplash.com/photo-1542103749-8ef59b94f475?w=400&h=400&fit=crop&crop=face',
    category: 'Intuition & Trust',
    gradient: 'from-green-600 to-teal-600',
    readTime: '4 min read',
    content: "They say vibes don't lie. And after everything I've been through—after all the moments where logic whispered wait but my gut screamed run—I know that's true.\n\nIt starts subtly, always. A slight shift in the air. A flicker behind someone's smile. The way your chest tightens when they enter the room. You can't explain it, not in a way that would satisfy a courtroom or even a good friend. But it's real. And I've learned—sometimes the vibes show you the truth long before the facts ever do.\n\nThere was a time I ignored them.\n\nHow long had we known them? Years, maybe. Close enough to call family. We shared meals, secrets, laughter—things you only give to people you trust. There was even a time when I thought: These are the people I'd want in my corner if everything went wrong.\n\nBut something in me just… couldn't rest.\n\nAt first, I brushed it off. Told myself I was being paranoid. Overthinking. Sensitive. But then that feeling started showing up every time they did.\n\nYou know that feeling when you're around someone and it just feels off? Like they're smiling but you don't feel warmth. Like every word they say is perfectly timed but never quite rings true? That was it. That was them.\n\nI warned him. I told Yuriy again and again, I don't think we can trust them. You need to be careful who you share your information with—your finances, your dreams.\n\nBut Yuriy was always the logical one. He believed in facts, proof, evidence. He'd say, Ruby, you're reasonable. You're smart. You're intuitive, yes, but we can't go around distrusting people with no reason.\n\nI loved him for that. But I also knew—intuition is a reason.\n\nStill, he chose logic. And logic lost.\n\nThe betrayal wasn't loud. It didn't come with a bang. It unraveled slowly, like thread from a sweater, one small inconsistency at a time. One excuse. One misstep. Until the truth was too big to ignore.\n\nAnd I remember thinking, I knew it. I always knew it.\n\nThere were messages I could barely respond to. Conversations that drained me before they even began. Smiles I returned out of politeness, not because I felt safe. My body spoke before I ever could—tight shoulders, short replies, eyes that wandered because they didn't trust staying still.\n\nYou don't need a lie detector when your soul is the one ringing the alarm.\n\nShe—yes, her—she was the kind of person who could sit right next to you and wear a face of pure innocence. The kind of person who greets you with sweet words but whose presence feels like static. The kind who cloaks themselves in charm while pulling strings behind your back.\n\nThe saddest part? Yuriy didn't get to see it unfold the way I did. He passed before the whole truth came to light. But I saw it. I see it now.\n\nAnd maybe it's strange to say, but some people really do peak in deceit. They look polished, but if you wipe away the surface, what's underneath isn't clean. It's calculated.\n\nI've learned to listen—to the silence, the tension, the way my spirit shifts. That's why I watch. That's why I keep my distance. That's why even when everyone else sees a friendly face, I pay attention to the energy behind it.\n\nBecause vibes don't lie.\n\nAnd when they speak, I've learned to listen—even if no one else does."
  },
  'a-life-remembered': {
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'A Life Remembered',
    image_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=400&fit=crop&crop=face',
    category: 'Healthcare & Compassion',
    gradient: 'from-purple-600 to-pink-600',
    readTime: '3 min read',
    content: "As I entered the hospital, something always shifted inside me—like a magic switch. The noise in my mind quieted, the weight on my shoulders lightened. No matter what storm I was weathering outside—grief, exhaustion, chaos—it all disappeared the moment I stepped into the building. In here, it wasn't about me. It was about them—my patients.\n\nI wore my smile like armor, even when my heart was breaking inside.\n\nHello dear, I'm going to be with you tonight, I said softly as I entered his room.\n\nI loved my night shifts. Maybe because I've never really slept like a normal person. I was always up, always moving—full-time student, full-time mom, and working so many PRN shifts that it practically counted as a second full-time job. Looking back now, I don't even know how I managed it all. But I did.\n\nThat night, my patient was resting quietly. An older man, with tired eyes but a gentle spirit.\n\nI think my time's up, he whispered when I sat beside him.\n\nI nodded, placing a hand gently on his. Is there anything you need?\n\nHe looked at me, his voice steady but soft. Just one regret, he said.\n\nWhat is it? I asked.\n\nI wish I had taken that one test, he replied. I wish I had tried harder. If I had passed, I could've had a different career—one that paid more, gave me the confidence to start a family. But I didn't believe in myself. I didn't try hard enough.\n\nHe paused. Young lady, he said, don't ever be like me. Always try. Always believe in yourself. You don't want to end up like me… dying alone, wondering if anyone will even remember I existed. My only brother passed a few months ago, and our parents have been gone for years.\n\nI looked into his eyes, and my heart clenched. I will remember you, I told him. Even if one day I forget your name, I'll remember you.\n\nHe smiled. A soft, grateful smile.\n\nI'll be checking on you throughout the night, I said, squeezing his hand before stepping out of the room.\n\nThe next night, I was called in for a transfer. I walked past his old room and paused. It was empty.\n\nI went to the nurses' station. Where's my old man? I asked.\n\nHe was transferred, someone said.\n\nTo where?\n\nThey hesitated. To the mortuary.\n\nI froze. No family. No friends. No one to sit by his side in his final moments.\n\nHe was right. No one else was there to remember him.\n\nBut I was.\n\nAnd I always will be.\n\nBecause I still remember him."
  },
  'the-weight-of-goodbye': {
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'The Weight of Goodbye',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg',
    category: 'Grief & Work',
    gradient: 'from-red-600 to-orange-600',
    readTime: '3 min read',
    content: "Oh, I lost count. Was it five deaths this week? Maybe more. And several failed suicide attempts too. It's all blending together in a haze of grief and exhaustion.\n\nIt started with the funeral—my beautiful church friend and her son. I still remember the moment I heard the news. My ears refused to accept the words, as if reality had crumbled around me. How could this happen? How was this fair?\n\nAt the funeral, my mind played cruel tricks on me. As I stood over her casket, I swore I saw her chest rise and fall, as if she were still breathing. No, Ruby, not again. Just act normal. It was my eyes, deceiving me. A part of me refused to believe she was gone. I didn't dare say anything. I knew what it meant.\n\nI moved over to her baby—so small, so still. He looked peaceful, as if simply napping. But he wasn't. I was crying now, my heart shattering at the unfairness of it all. This wasn't a patient in my care—this was different. This was personal.\n\nThe ride home felt like a blur. My body was there, but my soul was tangled in the losses of the week. The moment I stepped into my house, I headed straight for the shower, letting the water wash over me, trying to cleanse the heaviness of the day. My safe haven? Work. Work kept me moving, kept me from sinking into grief.\n\nAnd just like that, another call.\n\nRuby, you have a dying patient. She's alone, but family is coming soon.\n\nI gathered myself and went. My patient was progressing, her body slowly shutting down, but she was holding on—waiting. Waiting for the final goodbye.\n\nThen, one by one, her family arrived. I watched as they whispered their last words, kissed her forehead, held her frail hands. I had to be strong, had to make sure the room had tissues, that everyone was taken care of. There was no room for my own tears.\n\nOh, death.\n\nI observed her chest rise and fall, slower now. It was coming. The moment. The final breath.\n\nA voice behind me broke my focus.\n\nRuby, let's check again. Looks like your patient passed away.\n\nNo. No, she was still breathing. I had been watching her chest move, rising and falling just like before. I turned back.\n\nNo, your patient is gone, Ruby. Look again.\n\nMy heart pounded. I saw her breathing. I did. But as I stared longer, the realization settled in.\n\nNothing moved.\n\nShe was gone.\n\nI had lost track. In my exhaustion, in my need to keep moving, I hadn't even noticed the exact moment she left this world.\n\nGo and get some rest, Ruby.\n\nI nodded, but I knew—there is no real rest in this work."
  },
  'dear-yuriy': {
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'Dear Yuriy,',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg',
    category: 'Betrayal & Justice',
    gradient: 'from-amber-600 to-orange-600',
    readTime: '4 min read',
    content: "It still feels strange to write to you, as if words could somehow bridge the distance between here and wherever you are. But maybe they can. Maybe they already do.\n\nEverything happened so fast. Before I could even catch my breath, while I was busy grieving, he was busy deleting and amending information. While we were still waiting to take your body to the mortuary—just hours after discovering you were gone—he was already persuading me to file taxes and sign documents. When I refused to comply, he vowed to make life miserable for me and the kids.\n\nHe found an excuse to deny the accidental life insurance, terminated Sasha's health insurance immediately after your death, and didn't care that our baby—your baby—would grow up with a scar on his face and still needed ongoing treatment. He helped me bring Sasha home from the hospital, even texted to check on him, all while knowing he had already cancelled the insurance. He lied and said you were just an employee.\n\nBut you weren't just anything, Yuriy. You expanded that company rapidly after you merged your practice—you brought growth, innovation, and a human touch he never could. You worked yourself to exhaustion building something meaningful, and this is how he chose to honor you—with betrayal and greed.\n\nAfter the funeral, when I sent a simple message of gratitude, he told me it was harassment and ordered me not to contact anyone from your company. From that moment, I was labeled, isolated, and targeted. He defined you by how you died, and defined us by his own shame. But you were so much more than how you died—you were brilliance, compassion, and vision.\n\nYour friend was an enemy in disguise, not the brother you thought you had. You told me once that if anything ever happened, I should call him first—and I did. But he didn't come to help; he came to hunt me and the kids.\n\nYour mother had begged to keep your cause of death private—to protect your dignity—but he couldn't resist telling the world a twisted story, one that tarnished your name for his benefit. He knew what that shame would do to your mother, how fragile her heart was, how much the whispers of others would hurt her. But he did it anyway. One of the greediest, most senseless humans you should have known better than to trust.\n\nI've spent months unearthing the truth—documents, signatures, lies dressed as formalities. He took your name off papers you never saw, shifted ownership, diluted your shares, and spoke of you like a ghost whose silence gave him permission. What he has already taken isn't enough—he's still demanding more from me. More control, more submission, more pieces of what you built and left behind for your family. He acts as though destroying us isn't satisfaction enough, as though bleeding us slowly will somehow justify his greed.\n\nEven through the chaos, I still see you everywhere. In our son's curiosity, in the way the little ones laugh, in the quiet moments when I find the strength to keep going. I built something in your honor—DobryLife. It's everything you stood for: compassion, healing, and humanity. I made it for you, and for everyone who's ever felt unseen or broken by the weight of caring too much.\n\nThere are days I still talk to you out loud, asking for strength, for direction, for one more sign that you see me fighting for what's right. Some nights, I imagine you sitting beside me—tired but proud—telling me I'm doing exactly what I was meant to do: turning pain into purpose.\n\nHe thought your story ended when you took your last breath, Yuriy. But he was wrong. It's only beginning—and this time, I'm the one writing it.\n\nWith love, always,\n\nRuby"
  },
  'the-mirror-he-broke': {
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'The Mirror He Broke',
    image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg',
    category: 'Legal & Truth',
    gradient: 'from-gray-700 to-gray-900',
    readTime: '2 min read',
    content: "Once upon a time, there was a man who built an empire with his best friend. One was the heart — a doctor whose compassion could mend the human soul. The other was the mouth — a businessman who could sell promises faster than he could keep them.\n\nTogether, they created something beautiful. But beauty turns dangerous when one man sees partnership and the other sees possession.\n\nWhen tragedy struck and the doctor died, the businessman didn't mourn — he moved.\n\nWhile the widow and her children grieved, he opened files, changed signatures, and rewrote stories. He called it business. She called it betrayal.\n\nAnd now, the same man stands before the world claiming fraud — against the very woman he once urged to trust him. But truth has a funny way of reflecting itself, no matter how many mirrors he breaks.\n\nThis story isn't about a lawsuit. It's about legacy — about a wife defending her husband's name from the hands that helped bury it.\n\nShe doesn't fight for greed. She fights for truth, for the children who will one day ask why their father's brilliance was twisted into a headline. She fights for the man who believed compassion could outlive corruption.\n\nAnd while he files papers and spreads accusations, she builds something stronger — a legacy born not from deceit, but from devotion.\n\nBecause lies can stain a reputation, but they can't erase a life lived in purpose.\n\nIn the end, the world will see who was building — and who was breaking.\n\n– Ruby"
  },
};

export default function StoryDetail() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const storyId = searchParams.get('id');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const isExecutive = user?.plan_type === 'executive_monthly' || user?.plan_type === 'executive_yearly';

  const story = useMemo(() => {
    return stories[storyId] || null;
  }, [storyId]);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  const scrollIntervalRef = useRef(null);
  const utteranceRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const fullStoryContent = useMemo(() => (story ? story.content : ''), [story]);

  useEffect(() => {
    if (story) {
      const utterance = new SpeechSynthesisUtterance(fullStoryContent);
      utterance.onend = () => setIsAudioPlaying(false);
      utteranceRef.current = utterance;
    }
    return () => {
      if (speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.paused) {
        speechSynthesis.cancel();
      }
    };
  }, [story, fullStoryContent]);

  const handlePlayPauseAudio = () => {
    // Audio controls are only available to Executive members
    if (!isExecutive) return;
    
    if (!utteranceRef.current) return;

    if (isAudioPlaying) {
      speechSynthesis.pause();
    } else {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
      } else {
        if (!speechSynthesis.speaking && !speechSynthesis.paused) {
          speechSynthesis.speak(utteranceRef.current);
        } else {
          speechSynthesis.cancel();
          speechSynthesis.speak(utteranceRef.current);
        }
      }
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  useEffect(() => {
    if (isAutoScrolling && isExecutive) { // Autoscroll only available to Executive members
      const speedMapping = [70, 55, 40, 25, 10]; // Slower to faster mapping for interval (ms)
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, 1);
        if (Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight) {
          setIsAutoScrolling(false);
        }
      }, speedMapping[scrollSpeed - 1]);
    } else {
      clearInterval(scrollIntervalRef.current);
    }
    return () => clearInterval(scrollIntervalRef.current);
  }, [isAutoScrolling, scrollSpeed, isExecutive]);

  const toggleAutoScroll = () => {
    if (!isExecutive) return; // Autoscroll only available to Executive members
    setIsAutoScrolling(prev => !prev);
  };

  const changeSpeed = (direction) => {
    if (!isExecutive) return; // Autoscroll only available to Executive members
    if (direction === 'slower') {
      setScrollSpeed(s => Math.min(5, s + 1));
    } else {
      setScrollSpeed(s => Math.max(1, s - 1));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Story Not Found</h2>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to={createPageUrl('StoryHub')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Story Hub
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Non-Executive users see preview with upgrade prompt
  if (!isExecutive) {
    const previewContent = story.content.split('\n\n').slice(0, 3).join('\n\n');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button variant="ghost" asChild>
              <Link to={createPageUrl('StoryHub')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Link>
            </Button>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl"
          >
            <img 
              src={story.image_url} 
              alt={story.topic}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${story.gradient}`}></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <Badge className="self-start mb-4 bg-white/20 backdrop-blur-md text-white border-white/30">
                {story.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{story.topic}</h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg"
                    alt={story.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm opacity-90">{story.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {story.readTime}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{previewContent}</ReactMarkdown>
                </div>
                
                {/* Fade overlay */}
                <div className="relative h-32 -mt-16 bg-gradient-to-t from-white to-transparent"></div>
              </CardContent>
            </Card>

            {/* Executive Upgrade Prompt */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-6">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Continue Reading with Executive
                </h2>
                <p className="text-xl text-gray-700 mb-2">
                  Unlock the full story and access our complete collection
                </p>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Executive members get unlimited access to all stories, can submit their own, and enjoy premium storytelling features with AI preservation.
                </p>
                
                <div className="bg-white rounded-xl p-6 mb-8 max-w-md mx-auto">
                  <h3 className="font-semibold mb-4 text-amber-900">Executive Benefits:</h3>
                  <ul className="space-y-2 text-left text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      Read all full stories
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      Submit your own stories
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      Private story vault with AI
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      Free books & journals ($83+ value)
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      Unlimited Wassup AI Chats
                    </li>
                  </ul>
                </div>

                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl px-8 py-6 text-lg"
                >
                  <Link to={createPageUrl('Upgrade')}>
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Executive - $55/month
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 border-t border-gray-200">
          <p className="text-center text-sm opacity-80 text-gray-600">
            © 2025 Ruby Dobry — Creative works on this site are artistic expressions and not legal statements. All rights reserved.
          </p>
        </footer>
      </div>
    );
  }

  // Executive members see full story
  return (
    <>
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-teal-500 origin-left z-50" style={{ scaleX }} />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Button asChild variant="ghost">
              <Link to={createPageUrl('StoryHub')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Story Hub
              </Link>
            </Button>
          </motion.div>

          {/* Hero Section - Full Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl"
          >
            <img 
              src={story.image_url} 
              alt={story.topic}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${story.gradient}`}></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
              <Badge className="self-start mb-4 bg-white/20 backdrop-blur-md text-white border-white/30">
                {story.category}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{story.topic}</h1>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg"
                    alt={story.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                  />
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm opacity-90">{story.bio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {story.readTime}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="prose prose-lg lg:prose-xl max-w-none text-gray-700 leading-relaxed pb-24"
            variants={containerVariants}
          >
            <ReactMarkdown>{story.content}</ReactMarkdown>
          </motion.div>
        </motion.div>

        <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 border-t border-gray-200">
          <p className="text-center text-sm opacity-80 text-gray-600">
            © 2025 Ruby Dobry — Creative works on this site are artistic expressions and not legal statements. All rights reserved.
          </p>
        </footer>
      </div>

      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
      >
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-gray-200/80">
          <Button onClick={handlePlayPauseAudio} variant="ghost" size="icon" className="rounded-full w-12 h-12">
            {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <Button onClick={toggleAutoScroll} variant="ghost" size="icon" className={`rounded-full w-12 h-12 transition-colors ${isAutoScrolling ? 'bg-teal-100 text-teal-700' : ''}`}>
            <ScrollText className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1">
            <Button onClick={() => changeSpeed('slower')} variant="ghost" size="icon" className="rounded-full w-10 h-10" disabled={scrollSpeed === 5}>
              <ChevronsDown className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium text-gray-600 w-6 text-center">{scrollSpeed}</span>
            <Button onClick={() => changeSpeed('faster')} variant="ghost" size="icon" className="rounded-full w-10 h-10" disabled={scrollSpeed === 1}>
              <ChevronsUp className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
