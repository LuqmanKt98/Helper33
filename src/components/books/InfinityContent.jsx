
import React from 'react';
import { motion } from 'framer-motion';
import { PenSquare, MessageCircle, Star } from 'lucide-react';

const PageWrapper = ({ pageIndex, children }) => (
    <div data-page-content={pageIndex}>{children}</div>
);

const SectionTitle = ({ children, id }) => (
  <h2 id={id} className="text-2xl md::text-3xl font-bold text-gray-800 mt-12 mb-6 border-b-2 border-rose-200 pb-2 scroll-mt-24">
    {children}
  </h2>
);

const SubHeading = ({ children }) => (
    <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">
        {children}
    </h3>
);

const Paragraph = ({ children }) => (
    <p className="text-lg text-gray-700 leading-relaxed mb-4" data-speakable="true">{children}</p>
);

const PromptBox = ({ title, children }) => (
    <motion.div 
        className="bg-rose-50 border-l-4 border-rose-400 p-6 my-8 rounded-r-lg"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-start gap-4">
            <PenSquare className="w-6 h-6 text-rose-500 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-rose-800 text-lg mb-2">{title || "Your Turn: Reflective Prompt"}</h4>
                <div className="prose prose-lg text-gray-700">{children}</div>
            </div>
        </div>
    </motion.div>
);

const TipsBox = ({ title, children }) => (
    <motion.div 
        className="bg-sky-50 border-l-4 border-sky-400 p-6 my-8 rounded-r-lg"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-start gap-4">
            <MessageCircle className="w-6 h-6 text-sky-500 mt-1 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-sky-800 text-lg mb-2">{title}</h4>
                <div className="prose prose-lg text-gray-700">{children}</div>
            </div>
        </div>
    </motion.div>
);

const Affirmation = ({ children }) => (
     <motion.div 
        className="bg-emerald-50/80 border-t-4 border-b-4 border-emerald-200 p-6 my-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
    >
        <Star className="w-5 h-5 mx-auto text-emerald-500 mb-3" />
        <h4 className="font-semibold text-emerald-800 text-md mb-2 tracking-widest uppercase">Affirmation for Today</h4>
        <p className="text-xl italic text-emerald-900 leading-relaxed" data-speakable="true">"{children}"</p>
    </motion.div>
);

const Introduction = [
    <PageWrapper pageIndex={0}>
        <div className="text-center my-12">
            <h2 className="text-xl font-semibold text-gray-700">In Loving Memory of</h2>
            <p className="text-lg text-gray-600">Dr. Yuriy Dobry, Mama Ira, Rolik the Dog</p>
        </div>
        <div className="text-center my-12">
            <h2 className="text-xl font-semibold text-gray-700">Dedication</h2>
            <p className="text-lg text-gray-600 italic">For Yuriy—</p>
            <Paragraph>
                My beloved husband, partner, and light in the darkest moments. Your love transformed my world, and your absence reshaped it. This journal is a journey through the shadows of grief, but the memory of you lights every page. I write to remember, to feel, to heal.
            </Paragraph>
            <Paragraph>
                May these words honor your spirit and offer comfort to those walking this tender path of loss.
            </Paragraph>
            <Paragraph>
                Forever loved. Forever missed.
            </Paragraph>
        </div>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SectionTitle id="not-alone">You Are Not Alone</SectionTitle>
        <Paragraph>
            Hold on for a moment. I know it feels impossible right now, but trust me, I've been on this road before. The numbness, the pain, the shock... it all swirls inside, and no words can capture what you're feeling. It's okay if you can't cry the way you want to, or if the tears don't come at all. Sometimes the hurt is so deep that it leaves you wondering how to express it.
        </Paragraph>
        <Paragraph>
            I know you have questions, ones that may never have clear answers. The things left unsaid, the moments you wish you could rewind and do differently, they weigh heavily on your heart. But remember, it's okay to feel everything at once. You're allowed to grieve, to be confused, to be angry, and to feel lost.
        </Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <Paragraph>
            Take it moment by moment. You don't need to have all the answers right now. And even though it feels unbearable, you will make it through this. The pain won't be in control forever, even if it feels endless right now. You are stronger than you know, and this storm will pass. You will learn to live with your pain and manage the storm within so that you are in control. I can't promise your life will ever be like it used to be, or that everything will be perfect, but I can promise that you will learn to embrace this new reality.
        </Paragraph>
        <Paragraph>
            In the meantime, breathe. Cry if you need to. Scream if it helps. But know that you are not alone, and you will rise again, even if it's one shaky step at a time.
        </Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <SubHeading>Visiting my husband at the mortuary: Dead Date</SubHeading>
        <Paragraph>
            It felt like the first time we met. I remember how nervous I was back then, making sure I looked perfect and arrived on time. But today... today it didn't matter how I looked. You had seen every part of me over the years, accepted all of me.
        </Paragraph>
        <Paragraph>Still, I made sure to arrive exactly when I was supposed to. I had to see you.</Paragraph>
        <Paragraph>
            As I walked through the door, I didn't know how I felt. My heart was numb, my thoughts scattered. I saw you, but something was wrong. Your eyes, once so full of life, were closed. Your skin, once warm beneath my touch, was cold. I talked to you, oh, how I talked but you didn't respond.
        </Paragraph>
        <Paragraph>You couldn't.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <Paragraph>
            My heart shattered in that moment, splintered into pieces as I stood there, speaking to the man who could no longer speak back. The sight of you gave me something to hold on to, something to ground me. But I knew... soon I wouldn't be able to do this anymore.
        </Paragraph>
        <Paragraph>
            I loved this body as much as I loved your heart and soul. And even though you're gone, I kept staring at you, because it was you, just as you were, yet not at all the same. The artist tried; they really did. They gave you the clean shave you always loved. I reminded them to make sure. And now, wrapped in white, you look like you... but something essential is missing.
        </Paragraph>
        <Paragraph>
            What does this mean, my love? What is happening? I'm standing before you, but you're no longer here with me.
        </Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <Paragraph>
            I'm here because I loved all of you; your laughter, your warmth, your heart. And yes, even this body. But it breaks me to see you like this, so still, so cold. This image of you is burned into my mind. I'll never forget how you look now, no matter how hard I try.
        </Paragraph>
        <Paragraph>
            I want to stay and stare forever, but the coldness of you, of this room, tells me it's time to leave. I know soon we'll take you out one last time, for the final view, the final goodbye.
        </Paragraph>
        <Paragraph>This was far too soon.</Paragraph>
        <Paragraph>More reflections can be found at the back of this book...</Paragraph>
    </PageWrapper>
];

const Day1 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-1">Day 1: The Day of Loss</SectionTitle>
        <Paragraph>This was the day everything changed, the beginning of my grief journey. I still cannot describe the day I experienced my deepest loss.</Paragraph>
        <Paragraph>Yes, I've lost people and pets dear to me, but this loss, this loss hit differently. I don't even know how I managed to get myself into the Uber to reach the location where my husband passed. Everything was vague. To this day, I still don't remember the drive. It was all a blur.</Paragraph>
        <Paragraph>So many emotions, and yet, I couldn't cry. I was trying to be strong, but I wasn't. I just wanted to see my husband. I kept thinking: I need to see him for this to make sense. But nothing made sense. When I did cry, it came from a place deeper than I had ever known, a primal cry. My heart shattered, and my body felt numb.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>The Realization</SubHeading>
        <Paragraph>You ask yourself: How? Why? What happened? Was there something I missed? Was there anything I could've done to prevent this?</Paragraph>
        <Paragraph>You reread the last texts. You replay the last conversations. You listen for clues. You beg the universe for an answer.</Paragraph>
        <Paragraph>For me, it was the police who told me. I had called for a welfare check. He didn't show up like he promised. That wasn't like him. I knew something was wrong.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
         <Paragraph>Waiting to see him felt like an eternity. And when I finally did, I could barely look. I wasn't allowed to touch him, but I was told I could speak to him. I glanced briefly, but I couldn't bear to see him like that, not my love, not like that.</Paragraph>
        <Paragraph>But something strange happened. I felt him on my right side, near the window. It was as if he were standing beside me, waiting for me to arrive so he could say goodbye. I talked to him there, not to his body, but to him.</Paragraph>
        <Paragraph>Maybe others thought I was losing my mind, but I know what I felt. Maybe that's grief. Maybe that's love. Maybe it's how the heart copes with unthinkable loss.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <PromptBox>
            <p>Describe how you're feeling right now.</p>
            <p>What was the moment you found out like?</p>
            <p>Who told you or did you find out yourself?</p>
            <p>What emotions, images, or questions stand out to you?</p>
            <p>Let it all out. This page is just for you. No judgment. No filters.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <TipsBox title="Helpful Tips for the Day of Loss">
            <p>This may be the hardest day of your life. You may feel paralyzed, in shock, or totally disconnected. That's okay. There is no 'normal' way to grieve. But here are some gentle tips to help you take care of yourself today:</p>
            <ul>
                <li>Call someone you can trust. Not just someone who says they care, but someone who truly does. Be cautious. Grief can bring out surprising sides in people, especially when assets or inheritance are involved.</li>
                <li>Focus on basic survival. One breath at a time. Breathe. If that's all you can do today, that's enough. Sip water or tea. Eat a bite or two of something soft, like yogurt or soup. Rest your body, even if you can't sleep. Lie down. Close your eyes. Let your nervous system reset.</li>
                <li>Start documenting everything. Save texts, voicemails, and emails. Write down what happened today, including the names of officers or medical staff you spoke with. These details might matter later, and your memory may be fuzzy from the shock.</li>
                <li>Begin notifying close family/friends. Only if you're ready. You don't have to call everyone right now. If someone offers to make calls on your behalf, let them but choose wisely. Share only what you feel comfortable with.</li>
                <li>Protect valuables and important documents. Sadly, not everyone respects the grieving process. Secure your loved one's belongings, keys, phones, ID, and financial or legal papers if possible.</li>
            </ul>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <SubHeading>Self-Care on the Day of Loss</SubHeading>
        <Paragraph>Grief can make you forget that your body needs care to survive the pain. Today, focus on:</Paragraph>
        <ul>
            <li><strong>Hydration:</strong> Keep water or tea nearby.</li>
            <li><strong>Gentle nourishment:</strong> Even if it's just a spoonful or two.</li>
            <li><strong>Rest:</strong> Shock exhausts the body. Let yourself lie down.</li>
            <li><strong>Stillness and silence:</strong> Don't feel pressure to talk. Breathe in the quiet.</li>
            <li><strong>Permission:</strong> Allow yourself to feel whatever you're feeling: sadness, shock, anger, even numbness.</li>
        </ul>
        <Affirmation>I don't have to make sense of this right now. I am breathing. I am surviving. That is enough.</Affirmation>
    </PageWrapper>
];

const Day2 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-2">Day 2: Numbness and Shock</SectionTitle>
        <Paragraph>The first layer of grief felt like total numbness. My body was frozen in place.</Paragraph>
        <Paragraph>I think it's the body's way of protecting itself, this numbness. My system just couldn't take it all in. My heart felt heavy, as though I was carrying grief in my chest, my shoulders, and my gut. I was just holding on, one breath at a time, one moment at a time.</Paragraph>
        <Paragraph>I wasn't hungry or thirsty. I knew I needed to eat something, but the food just sat there. My stomach ached from emptiness, but I couldn't swallow. I managed a few spoonfuls of yogurt and sips of tea, just to have something in my system. Even that was hard.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>Holding On</SubHeading>
        <Paragraph>All I remember thinking was: I have my children with me. That's what matters right now.</Paragraph>
        <Paragraph>They didn't fully understand where Papa was. The younger ones couldn't sleep. My baby stayed up all night.</Paragraph>
        <Paragraph>We slept together on the couch, the same couch stained with the trauma of that day. We were surrounded by the mess of it all, his absence, the body fluids, the evidence of his departure. I don't remember what happened for the rest of the day, but I know the cleaners came, or something like that. I was so numb I didn't feel disgusted. I didn't feel much of anything. Just... frozen. A witness to my own life unraveling.</Paragraph>
        <Paragraph>It didn't feel real. But it was.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>You may feel numb right now. Like you're watching your life from a distance. That's okay.</p>
            <p>Take a moment and write:</p>
            <ul className="list-disc pl-5">
                <li>What are you feeling today?</li>
                <li>Are there any memories that keep surfacing?</li>
                <li>What does "shock” feel like in your body and in your mind?</li>
            </ul>
            <p>Let your thoughts flow. There is no right or wrong here.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="Helpful Tips for Navigating Numbness and Shock">
            <ul>
                <li><strong>Accept the Numbness:</strong> This is your body's natural response to trauma. Numbness isn't weakness, it's your nervous system buffering you from the full weight of the pain.</li>
                <li><strong>Let others help:</strong> If someone offers to clean, cook, or manage calls, say yes.</li>
                <li><strong>Focus on what's most important:</strong> protecting your peace, staying upright, and holding your children close.</li>
                <li><strong>Write down what needs doing:</strong> Grief brain is real. You will forget things; names, conversations, even simple tasks.</li>
                <li><strong>Keep essentials near you:</strong> Keep tissues, water, snacks, a change of clothes, and a phone charger nearby. Set up a small "survival corner."</li>
                <li><strong>Keep children close and routines soft:</strong> Kids grieve differently. Let routines slide. Just be close to each other.</li>
            </ul>
        </TipsBox>
    </PageWrapper>,
     <PageWrapper pageIndex={4}>
        <SubHeading>Self-Care for the Shock Stage</SubHeading>
        <ul>
            <li><strong>Sip warm liquids:</strong> Herbal teas, bone broth, warm lemon water, anything soothing.</li>
            <li><strong>Stay warm:</strong> Your body might feel cold from shock. Wrap in a blanket or wear fuzzy socks.</li>
            <li><strong>Create a soft atmosphere:</strong> Dim the lights. Light a candle.</li>
            <li><strong>Breathe and rest:</strong> Your only job today is to breathe and survive the hour you're in.</li>
        </ul>
        <Affirmation>I don't have to make sense of this right now. I am breathing. I am surviving. That is enough.</Affirmation>
    </PageWrapper>
];

const Day3 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-3">Day 3: First Memories</SectionTitle>
        <Paragraph>I remember the first time I saw him: his shirt, his smile, the way he looked at me. It was during the height of the COVID pandemic. While much of the world stayed behind closed doors, masked and uncertain, we were taking chances for love. I flew out of state, from airport to airport, risking exposure and judgment. But for us, it was worth it.</Paragraph>
        <Paragraph>He met me in his favorite purple-pink long-sleeved shirt and jeans. I still have that shirt. I wear it when I miss him it's like a hug I can still feel.</Paragraph>
        <Paragraph>And then there was the car, his "baby,” the orange Furry. He told me not to buy an orange car because it draws attention and oh, was he right. That car caused us more trouble than it was worth, but it was part of our story.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>The First Date</SubHeading>
        <Paragraph>When we met, we were both nervous. I teased him, said I'd give him a hug when I was ready, with a wink. I got into the car, and we just looked at each other. I remember admiring his long eyelashes and his eyes. That was the first and last day he ever wore contact lenses just to impress me. He hated them, but he wore them for me.</Paragraph>
        <Paragraph>Our first stop wasn't a fancy date or dinner. He had to drop off medication for a patient. That's the kind of man he was: compassionate, committed. Even on our first date, he was caring for others.</Paragraph>
        <Paragraph>That moment is forever etched in my heart. Our beginning was fearless, tender, and real.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>What is your very first memory of your loved one? Was it magical, awkward, sweet, or unforgettable?</p>
            <p>Try to write about that moment in as much detail as you can:</p>
            <ul className="list-disc pl-5">
                <li>What were they wearing?</li>
                <li>How did they smell?</li>
                <li>What words were said?</li>
                <li>What stood out to you about them?</li>
            </ul>
            <p>These memories are treasures. They are yours to keep and revisit whenever you need to feel close.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="Helpful Tips for the Day">
            <p>Grief can cause your memory to get cloudy. You may forget things that were once clear. Revisiting positive memories can be grounding. They help remind you who your loved one was and why your bond mattered so deeply. Here are some helpful ways to reconnect with memory today:</p>
            <ol>
                <li><strong>Look through old photos or messages</strong><br/>Find your favorite picture or text thread. Let yourself remember, laugh, or cry. If it hurts too much, pause. Come back later. It's okay to take breaks.</li>
                <li><strong>Start a "Memory Page" in your journal</strong><br/>Use a page (or a few) to jot down every random memory that surfaces. Don't worry about order or grammar. These are your memories: raw and authentic.</li>
                <li><strong>Tell someone the story</strong><br/>Call or message a trusted friend and say, “I want to tell you about the first time I met them." Speaking memories aloud can make them feel real and alive again.</li>
                <li><strong>Save voice notes or videos if you have them</strong><br/>If it feels okay, listen to their voice or watch them move. It may bring comfort, or it may be painful. Listen to your body. There's no pressure.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Self-Care While Revisiting Memories</SubHeading>
        <Paragraph>Memories are like waves. Some come gently. Others crash. Be tender with yourself as you open the door to the past. Here are gentle ways to care for yourself today:</Paragraph>
        <ul>
            <li><strong>Create a safe memory space:</strong> Light a candle. Make tea. Hold a keepsake that reminds you of them. Wrap yourself in a blanket.</li>
            <li><strong>Hug something soft:</strong> A pillow, a sweater, a stuffed toy, anything that gives comfort when emotions rise.</li>
            <li><strong>Set a time limit if needed:</strong> You don't have to get through all the memories today. Just one or two is enough.</li>
            <li><strong>Breathe and release:</strong> If a memory feels too heavy, pause. Put your hand over your heart. Breathe deep and remind yourself: I am safe in this moment.</li>
        </ul>
        <Affirmation>"These memories are sacred. They remind me of love, joy, and the moments that made us."</Affirmation>
    </PageWrapper>
];

const Day4 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-4">Day 4: Physical and Emotional Pain</SectionTitle>
        <Paragraph>Grief isn't just emotional. My body ached. I lost my appetite and so much weight.</Paragraph>
        <Paragraph>My body is numb and I wish my heart were numb too. But it's not. I feel everything. My heart is shattered into pieces. It hurts in ways I never thought possible. The pain lives in my chest. It's tight, sore, heavy, like something is sitting on me.</Paragraph>
        <Paragraph>Sometimes it's hard to breathe. And when I cry, there's a little release, like loosening a valve just enough to stop the dam from bursting. But the tears don't take the pain away, they make it slightly bearable for a moment.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>The Weight of Grief</SubHeading>
        <Paragraph>I've lost track of days and nights. I've been lying in bed thinking, Oh my love... And then, I want to be with him.</Paragraph>
        <Paragraph>That thought scared me. I never wanted to die... but in those moments, I didn't want to live in a world without him either.</Paragraph>
        <Paragraph>I stopped eating and lost a lot of weight. My stomach hurt constantly—from the hunger, the grief, the emptiness.</Paragraph>
        <Paragraph>I felt weak, dizzy, and couldn't concentrate on anything. Everything took effort. Even existing.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>Grief doesn't just break your heart. It can affect your whole body. How does your body feel today?</p>
            <p>Where do you feel pain, tension, or heaviness?</p>
            <p>Are you tired? Are you restless? Are you numb?</p>
            <p>What emotions do you feel most strongly, and where do they live in your body?</p>
            <p>There are no wrong answers. Just notice. Just feel. Just write.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="Understanding the Physical Side of Grief">
            <p>You may be surprised at how grief physically shows up in your body. This is very real and very normal. Some common physical responses to grief include:</p>
            <ul>
                <li>Chest tightness or pressure</li>
                <li>Headaches or dizziness</li>
                <li>Nausea or stomach pain</li>
                <li>Exhaustion or fatigue</li>
                <li>Weakness or shakiness</li>
                <li>Muscle aches or back pain</li>
                <li>Brain fog or difficulty concentrating</li>
                <li>Sleep disturbances or vivid dreams</li>
            </ul>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Tips for the Body</SubHeading>
        <p>You're not imagining this. Grief affects your nervous system, immune system, gut, sleep, and more. Here are a few simple ways to support your body today:</p>
        <ol>
            <li><strong>Hydrate—even if you can't eat much</strong><br/>Try sipping warm water, broth, or herbal tea. Grief dehydrates you, especially when you're crying often.</li>
            <li><strong>Eat something soft and easy</strong><br/>A spoonful of yogurt, fruit puree, soup, or crackers. Set a timer to remind yourself to take a small bite every few hours. Think of food as fuel, not a task.</li>
            <li><strong>Rest when your body says rest</strong><br/>Don't force yourself to "get up and get moving" just yet. If all you can do today is lie down, let that be enough. Rest is not weakness. It's grief recovery.</li>
            <li><strong>Try spa, sauna, or quiet time (if you can)</strong><br/>If you can afford a spa day or even a simple sauna session, give it a try. Sometimes warmth and care can help your body release what words can't. But the truth is, not everyone has the time or luxury to pause and heal.</li>
        </ol>
        <Paragraph>Some need to take care of children or show up for others. If you can take time off, do it. Give yourself that space. And if you can't, or don't want to sit in sadness and would rather stay busy—that's okay too. Just remember: keeping busy is not the same as healing. Avoiding your emotions by diving into projects or overworking will eventually wear you down. You can only outrun your grief for so long before it catches up with you.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <SubHeading>Self-Care for the Body and Mind</SubHeading>
        <Paragraph>This is a time to treat yourself like someone who is healing from trauma, because you are. Here are some self-care practices you can try today, even if you only do one:</Paragraph>
        <ul>
            <li><strong>Gentle movement:</strong> Stretch your arms, roll your shoulders, or stroll to the window and back.</li>
            <li><strong>Deep breathing:</strong> Inhale for 4 seconds, hold for 4, exhale for 6. Repeat 3-4 times.</li>
            <li><strong>Apply warmth:</strong> A heating pad on your chest or tummy, or a warm towel around your neck.</li>
            <li><strong>Take a warm shower or bath:</strong> Let the water help soothe the weight you're carrying.</li>
            <li><strong>Unplug for a while:</strong> Turn off your phone or step away from the world's noise. Listen to what your soul is whispering underneath the pain.</li>
        </ul>
        <Affirmation>"My body is grieving, too. I give myself permission to feel, to rest, and to heal—one breath at a time."</Affirmation>
    </PageWrapper>
];

const Day5 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-5">Day 5: Unspoken Words</SectionTitle>
        <Paragraph>There were things I never got to say, and I carry them in my heart. I wish we had more time. Time to take the trip to Lake Tahoe he always wanted. Time to have that one more child he dreamed of. Time to slow down, to retire and be with each other without the weight of the world on our shoulders.</Paragraph>
        <Paragraph>I wish we had said a proper goodbye. I wish we had talked more about what was really going on. Maybe if he hadn't protected me so much, I could've helped. But he carried so much on his own. He was hurting, and I didn't even know how deeply.</Paragraph>
        <Paragraph>I'm confused. Angry. Heartbroken. I keep asking: Why didn't we talk more? Why did we argue about things that now seem so pointless? I'm left with a million unanswered questions.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>Things Left Unsaid</SubHeading>
        <Paragraph>But amidst all of that, I hold on to his voice. He made sure to call me every day and say, "I love you,” as if he never wanted me to doubt it. That kind of intentional love doesn't just happen, it was deliberate, devoted, and deep.</Paragraph>
        <Paragraph>He used to say: "Babe, we achieved so much. You're my dream girl, and I want eternity with you. I'm proud of how much we've built over the years within such a short period of time."</Paragraph>
        <Paragraph>And he was right. We didn't have forever, but we made the most of what we had. Our love was full—full of fire, growth, sacrifice, and dreams. He gave his all to me, to our family, and to his patients.</Paragraph>
        <Paragraph>He chose to put patients first, every single time. That was the oath he took, and one we both honored. Monday to Saturday, he was in the office every day. Sundays were barely breaks, just little pauses before starting again. He knew he needed a real break. We talked about it. But he kept pushing forward, carrying more than he let on.</Paragraph>
        <Paragraph>There's no looking back now. The unspoken words, the undone actions, the moments we thought we had time for—they'll forever remain unknown.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>There are always things left unsaid.</p>
            <p>What are your unspoken words?</p>
            <p>What do you wish you could've said to your loved one before they passed?</p>
            <p>Is there something you regret?</p>
            <p>Is there something beautiful or simple, like "thank you” or “I love you”—that you never got to say?</p>
            <p>Write it now as if they're right here. Let this be your space for closure, expression, or even forgiveness.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
         <TipsBox title="Helpful Tips for Navigating Unspoken Words">
            <p>The weight of unfinished conversations can feel unbearable. The “I should have said" thoughts can loop endlessly in your mind. This is a natural part of grief, but you don't have to carry it in silence. Here are gentle ways to begin releasing some of those unspoken thoughts:</p>
            <ol>
                <li><strong>Write them a letter</strong><br/>Address your loved one directly. Pour out everything you wanted to say—no matter how raw or messy. Keep it in your journal, burn it in a ritual, or read it aloud. There's no wrong way.</li>
                <li><strong>Create a "talking space"</strong><br/>Light a candle and set aside a quiet space. Speak to them as if they were next to you. This could be part of a daily ritual or something you do just once.</li>
                <li><strong>Speak their name</strong><br/>Saying their name out loud keeps their memory alive. You might feel silly talking to someone who's not physically there, but grief honors love, and love never really leaves.</li>
                <li><strong>Use voice notes or recordings</strong><br/>Sometimes speaking is easier than writing. Record yourself talking through what you're feeling. You don't have to listen back. It's just a release.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Self-Care for Emotional Release</SubHeading>
        <Paragraph>Saying what was never said can unlock a wave of emotion. That's okay. It means something in you is beginning to move. Here are ways to take care of yourself after opening up emotionally:</Paragraph>
        <ul>
            <li><strong>Warm bath or shower:</strong> Let the water cleanse your body and mind.</li>
            <li><strong>Wrap yourself in something soft:</strong> A blanket, their shirt, or something comforting.</li>
            <li><strong>Reach out to someone you trust:</strong> You don't have to process these emotions alone. A friend, therapist, or grief group can help.</li>
            <li><strong>Give yourself time:</strong> If you're feeling emotionally drained afterward, rest. Don't rush to "feel better.”</li>
        </ul>
        <Affirmation>"Even though the words were never spoken, the love was always there. I honor what was left unsaid, and I give myself permission to feel it all."</Affirmation>
    </PageWrapper>
];

const Day6 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-6">Day 6: Support System</SectionTitle>
        <Paragraph>My parents were oceans away, continents apart, in Africa. I couldn't bring myself to tell them right away. I needed to process things before I could speak the words out loud. I was protecting them, maybe even protecting myself.</Paragraph>
        <Paragraph>I remember calling his so-called best friend, the one I thought I could trust. But instead of support, he showed me what real greed looks like. It's heartbreaking to discover that some people don't show up to comfort; they show up to take. And they don't wait long to do it.</Paragraph>
        <Paragraph>Yes, people showed up at the funeral. It looked like support. But after the funeral, the silence began. The phone stopped ringing. The check-ins grew less frequent. Some people disappeared altogether.</Paragraph>
        <Paragraph>But then there were the few, the ones who stayed. The ones who continued to check in, even if they didn't know what to say. The ones who helped with the kids. The ones who just sat with me in silence. I will forever be grateful to those people.</Paragraph>
        <Paragraph>Because grief can be so lonely. But even one person who shows up can make the weight feel a little less crushing.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <PromptBox>
            <p>Grief reveals who your real people are. Take a moment to reflect:</p>
            <p>Who has truly been there for you since your loss?</p>
            <p>How did their presence help or hurt?</p>
            <p>If you feel alone, who do you wish were showing up for you right now?</p>
            <p>What kind of support do you need the most; emotional, practical, physical, or spiritual?</p>
            <p>Let yourself be honest. You deserve to name your needs.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <TipsBox title="Helpful Tips: Understanding Support in Grief">
            <p>Grief can shake your entire support system. Sometimes people surprise you in good and bad ways. You might find that the ones you expected to be there disappear, while unexpected people step in with kindness. Here are some helpful reminders for navigating this part of the journey:</p>
            <ol>
                <li><strong>Accept support in the form it comes</strong><br/>Not everyone will say the right thing. Some might fumble or avoid. But if someone offers help; meals, rides, childcare, company, say yes if it feels right. You don't have to do this alone.</li>
                <li><strong>Reach out to someone you trust</strong><br/>If the silence hurts more than the grief, pick up the phone or text someone. Start small: "I could use some company today." Vulnerability is hard, but it opens the door to connection.</li>
                <li><strong>Write down your support circle</strong><br/>List 3–5 people you can count on, even if it's just one. Include professionals like therapists, support groups, or religious leaders. Keep this list where you can see it. In moments of isolation, remember: you are not alone.</li>
                <li><strong>Let go of those who hurt you</strong><br/>If someone shows their true colors during your most vulnerable time, believe them. You don't owe anyone access to your grief. Protect your peace.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <SubHeading>Self-Care When Support Feels Thin</SubHeading>
        <Paragraph>Feeling abandoned or disappointed by others can deepen the pain of grief. Here's how you can take care of your heart:</Paragraph>
        <ul>
            <li><strong>Name your true allies:</strong> Even if it's just one person. Let them know they matter.</li>
            <li><strong>Let silence be healing, not haunting:</strong> Play calming music, sit in nature, or journal when the quiet feels overwhelming.</li>
            <li><strong>Join a grief support group:</strong> Hearing "me too" online or in person can be profoundly healing.</li>
            <li><strong>Ask for what you need:</strong> You're allowed to say, "I need help today."</li>
        </ul>
        <Paragraph>If you're the only one standing in your corner today, remember: you are enough. And your grief still matters.</Paragraph>
        <Affirmation>"Even if the world feels quiet, I am still worthy of support. I honor those who stayed, and I release those who could not."</Affirmation>
    </PageWrapper>
];

const Day7 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-7">Day 7: Looking for Signs</SectionTitle>
        <Paragraph>Sometimes I see him in dreams, feel him near. I know he's still with me in some way.</Paragraph>
        <Paragraph>Some say our loved ones never really leave us. I believe that. To me, my husband was present the day he passed. I saw him not with my eyes, but with my heart. We had a heart-to-heart conversation, soul to soul. I can't fully explain it, but I know what I felt.</Paragraph>
        <Paragraph>I heard a knock that day, and sometimes, I still catch a glimpse of him, through a glass window or a shadow in the corner of the room. He doesn't frighten me. It's gentle. It's peaceful. I know it's him.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>A Gentle Presence</SubHeading>
        <Paragraph>I didn't feel his presence at the funeral. It felt like he had already gone into the light, like he had waited to make sure I was okay, and once I told him it was okay to go, he did. I told him: As heartbroken as I am, I understand. I will take care of the kids. You don't have to worry.</Paragraph>
        <Paragraph>We still talk, from time to time. No, I hadn't seen a medium or psychic at first not then. I didn't need to. You know when your person is nearby. You feel it. You sense it. There's a knowing that can't be explained.</Paragraph>
        <Paragraph>Eventually, I chose to see a real, ethical psychic, which helped drastically. But that choice didn't come lightly. I want to be clear here: This is a broader conversation, especially if, like me, you were raised in or still identify with a religion.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <SubHeading>On Spiritual Tools</SubHeading>
        <Paragraph>You may be wondering: Why would I see a psychic? What does that say about my beliefs? Can I still call myself a Christian? A Muslim? A spiritual person? That's personal. Only you can answer that for yourself. But please, if you're curious or open to exploring spiritual tools, do not fall into traps. There are scammers, predators, and people who will take advantage of your desperation. You may be grieving and searching for signs, but you don't know what spirit or energy someone could be working with. Be wise. Be discerning.</Paragraph>
        <Paragraph>The truth is, we all have intuitive abilities. Yes, you do too. Some are more in tune with themselves than others, but sometimes the answers you're seeking are already within you.</Paragraph>
        <Paragraph>You don't have to perform rituals or invite unfamiliar energies to feel connected. If you're feeling spiritually overwhelmed or confused, lean on someone you trust; a pastor, rabbi, imam, spiritual guide, success coach, or counselor who honors your beliefs and won't take advantage of your vulnerability.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <Paragraph>I know you might feel desperate for answers. I've been there. But please, don't let that desperation guide your actions. Trust the process. Trust your loved one. Trust your intuition.</Paragraph>
        <Paragraph>And know this: it's also normal if you haven't had a dream or a sign yet. Sometimes our grief creates a fog, and the signs come later, when we're ready.</Paragraph>
        <PromptBox>
            <p>Have you felt your loved one's presence in any way?</p>
            <p>Was it in a dream that felt more than a dream?</p>
            <p>A scent? A song playing at the exact right time?</p>
            <p>A flicker of light, a whisper, or a strong feeling of knowing they were near?</p>
            <p>Or... have you been waiting for a sign and felt nothing? That's okay too. Write about anything you've experienced or haven't. This is your truth. Your journey. You don't have to explain it to anyone else.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <TipsBox title="Helpful Tips: Recognizing and Receiving Signs">
            <p>Grief doesn't just break us. It opens us. Sometimes, we begin to notice subtle things. We become sensitive to the quiet. We pay attention in new ways. And that's where signs can appear. Here are a few thoughts to help you navigate this:</p>
            <ol>
                <li><strong>You're not imagining it:</strong> That flicker, that whisper, that song, that sensation, it's real to you, and that's what matters.</li>
                <li><strong>Be patient with dreams:</strong> Please don't feel discouraged if you haven't dreamed of them yet. Sometimes our souls need rest before our minds can receive.</li>
                <li><strong>Look for patterns or symbols:</strong> Butterflies, coins, feathers, familiar songs; some signs are personal and quiet. It's not about superstition. It's about meaning.</li>
                <li><strong>Don't overanalyze:</strong> You don't need to "figure it out." Just let it be. Let it comfort you.</li>
                <li><strong>Be cautious with spiritual practices:</strong> Avoid opening doors to spirits or energies you don't understand. You don't need rituals to connect with your loved one. Your heart is enough. If you seek spiritual guidance, do it from a place of discernment, peace, and protection.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <SubHeading>Self-Care for the Spiritually Sensitive Heart</SubHeading>
        <Paragraph>Grief can make your senses tender and your soul wide open. Here's how to care for your spirit when you feel emotionally and spiritually connected:</Paragraph>
        <ul>
            <li><strong>Create quiet moments:</strong> Turn off noise. Sit in stillness. Just listen.</li>
            <li><strong>Light a candle for your loved one:</strong> Set an intention or speak their name.</li>
            <li><strong>Try gentle meditation or prayer:</strong> Even 5–10 minutes of breath and presence can ground you.</li>
            <li><strong>Talk to them:</strong> Say what's in your heart. Out loud or in writing. You don't need an answer to be heard.</li>
        </ul>
        <Affirmation>"I trust that love continues in unseen ways. I am open, but discerning. I trust my heart, my loved one, and the sacred process of grief.”</Affirmation>
    </PageWrapper>
];

const Day8 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-8">Day 8: Processing Emotions</SectionTitle>
        <Paragraph>Each day brings new feelings, sometimes sadness, sometimes rage, sometimes stillness. I feel different today. Not necessarily better. Not whole. Just... different.</Paragraph>
        <Paragraph>I know I will never again feel the way I felt the day before my husband passed. That version of me no longer exists. That day and the day he passed, marked a before and after in my life.</Paragraph>
        <Paragraph>Some days are excruciating. Some days I can breathe a little easier. But most days... I take it moment by moment. I've felt waves of emotions I can't always name. Sadness. Rage. Numbness. Guilt. Anxiety. Sometimes all in one hour. Sometimes nothing at all.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>A New Way of Living</SubHeading>
        <Paragraph>And something I've come to accept is this: Grief is not something to avoid. It's something to embrace. I've realized that I now have to live life without my husband. And that is a different kind of living.</Paragraph>
        <Paragraph>It's like losing a functional part of yourself; an arm, a leg, a vital organ, and now you have to learn how to exist without it. You don't stop living, but you learn to live differently. There's no going back to the "before." Only forward. One breath, one step, one day at a time.</Paragraph>
        <Paragraph>And I know, no matter how hard it is, and no matter how harsh it may sound, life must go on. The bills don't pause. The world keeps spinning. If you have a job, you have to find a way to function. If you have children, they now have only one parent. It's not fair. It's not easy. But it's real.</Paragraph>
        <Paragraph>And part of this process, part of grief is dealing with what's called adjustment syndrome. Your entire world has shifted. Your mind, your body, your routines, your identity. Everything changes. You will need to make real adjustments. Emotional, practical, spiritual, and financial.</Paragraph>
        <Paragraph>Your loved one would not want you to live in pain forever. They would want you to function. They would want you to heal and carry them forward, not stay stuck where they left.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>How are you feeling today? Sad? Angry? Confused? Numb? Restless? Lonely?</p>
            <p>Maybe you don't even know. That's okay too. Write about what emotions you're experiencing right now.</p>
            <p>Have you noticed a change from Day 1 to today?</p>
            <p>Are you feeling more or less? Has anything surprised you about how you're reacting? Let this page hold the truth that maybe no one else has asked you about.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="Understanding the Stages of Grief">
            <p>Grief is not linear. It's not a checklist. But there are common stages people move through in different ways and at different times:</p>
            <ul>
                <li><strong>Denial:</strong> This can't be happening. It's a protective shock response.</li>
                <li><strong>Anger:</strong> Why me? Why them? Anger is a natural response to injustice and loss.</li>
                <li><strong>Bargaining:</strong> What if I had done something differently? If only I could go back...</li>
                <li><strong>Depression:</strong> The deep sadness, emptiness, and fatigue when reality hits.</li>
                <li><strong>Acceptance:</strong> Not about being "okay" with it, but about learning to live with it.</li>
                <li><strong>Meaning-making (bonus stage):</strong> Finding purpose and love again, and integrating your loss into your life's story.</li>
            </ul>
            <p>You may bounce between these stages or experience them all at once. There's no wrong way.</p>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Helpful Tips: Processing Emotions in Grief</SubHeading>
        <Paragraph>You may go from crying to laughing to feeling nothing within minutes. That's completely normal. Here's how to gently support yourself:</Paragraph>
        <ol>
            <li><strong>Name your emotions:</strong><br/>Saying, "I feel angry" or "I feel empty" gives your feelings a place to exist. Journaling or even saying it aloud can lessen the overwhelm.</li>
            <li><strong>Let emotions move through you:</strong><br/>Don't try to suppress or ignore what you're feeling. Cry if you need to. Scream into a pillow. Punch a cushion. Sit in silence. Emotions are meant to move. Let them.</li>
            <li><strong>Expect contradictions</strong><br/>You may feel peace and pain at the same time. You may feel relief, followed by guilt. Or joy, followed by shame. This is the messy middle of grief. Don't judge yourself.</li>
            <li><strong>Remember: feeling nothing is also a feeling:</strong><br/>Numbness is often your mind's way of protecting you from overload. Don't push yourself to feel more than you can handle right now.</li>
        </ol>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <SubHeading>Self-Care for Emotional Waves</SubHeading>
        <Paragraph>Grief will test your body, mind, and spirit. You'll need support systems—not just people, but practices to hold you up. Try the following:</Paragraph>
        <ul>
            <li><strong>Create a "comfort list":</strong> Write down five things that calm or soothe you (e.g., warm tea, a favorite blanket, music, a safe friend, prayer).</li>
            <li><strong>Use a "Feelings Log":</strong> Write three words to describe your emotional state daily. This will help you track how your grief is evolving.</li>
            <li><strong>Practice grounding techniques:</strong> Place your feet flat on the ground, press your hands into your lap, take slow breaths, and describe five things around you.</li>
            <li><strong>Clean one small space:</strong> When the chaos inside is too loud, organizing or freshening up, even one corner can offer a sense of control.</li>
        </ul>
        <Paragraph>Reminder: This emotional storm won't always be this loud. You'll learn how to stand inside it. And eventually, you'll move through it.</Paragraph>
        <Affirmation>"Grief is not weakness, it is love in motion. I will not rush myself. I will feel, I will adjust, and I will live."</Affirmation>
    </PageWrapper>
];

const Day9 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-9">Day 9: Honoring Their Memory</SectionTitle>
        <Paragraph>I planted trees. I talk to the ocean. I raise my children in his love. I see him in the kids every day. In their eyes, in their laughter, in the things they say. In those moments, I realize his love didn't end, it continues through them.</Paragraph>
        <Paragraph>That's all I can share for now. Some memories are too sacred. Some parts of grief are too personal for words. But this much I know: his memory lives. Not in grand gestures, not always in public tributes, but in quiet glances. In breath. In presence. In the way I show up for our children. In the way I keep going when I want to collapse. In the way I whisper his name when no one's listening.</Paragraph>
        <Paragraph>I also love to reflect by the ocean. He always told us: “Drive by the ocean. Clear your head.” Whenever he was feeling overwhelmed, anxious, or needed to decompress, that's where he'd go.</Paragraph>
        <Paragraph>Now, I do the same. Sometimes I just park my car and sit there. No distractions. No noise. Just the sound of waves crashing and my heart speaking. I talk to him. I let the ocean hold my grief and carry some of it out with the tide.</Paragraph>
        <Paragraph>That's how I honor him, too— not just by remembering, but by continuing the practices that brought him peace.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <PromptBox>
            <p>How would you like to honor your loved one's memory?</p>
            <p>Is there a ritual, tradition, or place that brings you closer to them?</p>
            <p>Do you want to create something in their name?</p>
            <p>Is there something small you do every day or week that feels like remembrance?</p>
            <p>You don't have to have it all figured out. This is a space to explore how you want to keep their spirit alive in your world.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <TipsBox title="Helpful Tips: Honoring Your Loved One in Grief">
            <p>Memorializing a loved one doesn't have to be big or loud. In fact, some of the most powerful acts of remembrance are quiet, personal, and sacred. Here are a few ways you might choose to honor them:</p>
            <ol>
                <li><strong>Create a small altar or remembrance space</strong><br/>A photo, a candle, a piece of jewelry, or something that belonged to them. Visit it when you need to feel close.</li>
                <li><strong>Write them letters</strong><br/>Keep a notebook just for them. Share updates, memories, or things you never got to say.</li>
                <li><strong>Plant something in their memory</strong><br/>A tree, a flower, or a garden. Watching it grow can bring healing and connection.</li>
                <li><strong>Mark special dates</strong><br/>Their birthday, your anniversary, the day they passed. You can light a candle, make their favorite meal, or take time off work to reflect.</li>
                <li><strong>Carry on their passions</strong><br/>Were they into cooking, art, music, service, mentoring, or nature? Consider continuing what they loved or teaching it to someone else.</li>
                <li><strong>Visit a meaningful place</strong><br/>A favorite beach, mountain, hiking trail, or café. Let that space become sacred. Let it hold your memories, your reflections, your love.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <SubHeading>Self-Care for the Act of Remembering</SubHeading>
        <Paragraph>Remembering can be beautiful and also painful. Here's how to hold both:</Paragraph>
        <ul>
            <li><strong>Drink water and take breaks:</strong> Sometimes, honoring them will bring tears. Hydrate and rest when you need to.</li>
            <li><strong>Hug something that brings comfort:</strong> A favorite blanket, hoodie, pillow, or item that connects you to them.</li>
            <li><strong>Play their music:</strong> Create a playlist that reminds you of them. Let yourself feel what comes.</li>
            <li><strong>Schedule grief-friendly time:</strong> If you know a memory-heavy day is coming, reduce your obligations that day.</li>
        </ul>
        <Paragraph>Reminder: There is no right way to honor someone you've loved. Just your way.</Paragraph>
        <Affirmation>"I carry their memory with me—not as a burden, but as a light. Love does not end. I will honor them in the way that feels right for me."</Affirmation>
    </PageWrapper>
];

const Day10 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-10">Day 10: Feeling Lost</SectionTitle>
        <Paragraph>I didn't know who I was without him. I felt directionless and overwhelmed. I'm not suicidal... but I want to see what's on the other side. Not out of despair, but out of longing. Out of love.</Paragraph>
        <Paragraph>I desperately want to see my husband. I miss him so much it physically hurts. I want to see him. I want to feel him. I want to hold his hand, hear his laugh, touch his face, and feel the calm I only felt around him.</Paragraph>
        <Paragraph>There's so much uncertainty now. So much confusion. How do I figure out life without him? How do I keep going when the person I built my world with is no longer here?</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>A Shift in Identity</SubHeading>
        <Paragraph>Some days I feel like I'm floating through life with no map, no destination—just existing. And existing feels exhausting.</Paragraph>
        <Paragraph>And then there's this other layer I don't always talk about: I put my career on hold. I built my life around my husband and our family. I don't regret being a stay-at-home mom not for a second. That time was sacred. It was right for us. But now... now that he's gone, I feel this shift. And I ask myself: Did I make the right choice? Was it better to focus on my family or my career? Where do I even begin now?</Paragraph>
        <Paragraph>It's not just grief, it's a total role change. And I wasn't ready for it. But even in this feeling of being lost... I remind myself: I'm still here. And if I'm still here, I still have something to live for.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>Grief can make you feel like you're wandering through life without a compass.</p>
            <p>Are you feeling directionless or stuck right now?</p>
            <p>What tasks or routines are hardest for you to complete?</p>
            <p>What responsibilities are pressing down on you?</p>
            <p>Are you grieving lost dreams or roles in addition to your loved one?</p>
            <p>What, if anything, still feels important even if it's hard?</p>
            <p>Write honestly. You don't have to have answers today, just name where you are.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="When You Feel Lost in Grief">
            <p>Feeling lost doesn't mean you're failing. It means your world has changed, and your mind, heart, and body are trying to catch up. Here are some ways to gently anchor yourself when everything feels adrift:</p>
            <ol>
                <li><strong>Focus on the next step, not the whole road</strong><br/>You don't have to figure everything out right now. What's one small thing you can do today? Get dressed? Eat? Make a list? That's enough.</li>
                <li><strong>Create a tiny structure for your day</strong><br/>When you feel lost, routine becomes a life raft. Write down just three things to do today. Keep it simple. Shower. Take a walk. Pay one bill.</li>
                <li><strong>Speak kindly to yourself</strong><br/>Say things like: "I'm doing my best. I don't have to know the answers today." You're not weak for feeling lost. You're grieving.</li>
                <li><strong>Talk to someone you trust</strong><br/>When you're emotionally drowning, even one voice saying "I'm here” can help. Reach out, even if it's to say, "I'm having a hard day."</li>
                <li><strong>Acknowledge the functional side of grief</strong><br/>Life doesn't stop. There are bills to pay, kids to care for, and deadlines to meet. And that can feel overwhelming and unfair. You may be dealing with adjustment stress, which is real and valid. If you can't do everything, do something. And forgive yourself for the rest.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Self-Care When You Feel Lost</SubHeading>
        <Paragraph>Feeling lost can bring on fatigue, fog, and panic. Here are some things that might help:</Paragraph>
        <ul>
            <li><strong>Ground yourself physically:</strong> Sit with your feet flat on the ground, hands on your thighs, and take slow, deep breaths. Remind yourself: I am here. I am safe.</li>
            <li><strong>Start a "life-after" list:</strong> Things you have done since the loss, no matter how small. This reminds you that you are finding your way.</li>
            <li><strong>Prioritize rest:</strong> Your brain and body are in overload. It's okay to nap, unplug, or cancel plans.</li>
            <li><strong>Step outside, even for a minute:</strong> Fresh air and sunlight can gently reorient your nervous system.</li>
        </ul>
        <Paragraph>Note: If your "lost” starts to feel like despair, or your thoughts feel too heavy to carry alone, please reach out to a therapist, counselor, or crisis line. There is no shame in needing help.</Paragraph>
        <Affirmation>"Even in this fog, I am still here. I may feel lost, but I am not alone. I will find my way forward, one breath at a time."</Affirmation>
    </PageWrapper>
];

const Day11 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-11">Day 11: Small Joys Amidst Pain</SectionTitle>
        <Paragraph>The birds. My children's laughter. My chickens. These small things remind me to breathe. I find comfort in nature. It's where I remember that life is still happening, even when mine feels like it's standing still.</Paragraph>
        <Paragraph>I love to look at the clouds. The shifting sky reminds me that things change, and yet there's beauty in the in-between. I see miracles all around me, the way the sunlight breaks through after rain, the way the birds fly in formation, the way the plants grow even after a harsh season.</Paragraph>
        <Paragraph>I feel my husband with me when I notice these things. Not in body, but in spirit, just beyond the veil. Watching over me and the kids. The night lights. The sunrise and sunset. The wind rustling through the trees. My children's laughter. My chickens pecking around the yard.</Paragraph>
        <Paragraph>They may seem small, but these are my reminders. That love still exists. That joy hasn't left the world completely. My husband is still nearby even if I can't see him.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <PromptBox>
            <p>Even in grief, small moments of joy or peace might appear.</p>
            <p>Did anything today, no matter how small, bring you a sense of calm or comfort?</p>
            <p>Was it something you heard, saw, touched, smelled, or felt?</p>
            <p>What made you feel a little less alone? A little more grounded?</p>
            <p>What helped you take one more breath?</p>
            <p>Write it down. Hold onto it. These are the threads that help you weave your way through pain.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <TipsBox title="Helpful Tips: Noticing Joy Without Guilt">
            <p>When grief is fresh, joy can feel... wrong. Out of place. Even disrespectful. You may ask yourself, How can I smile when they're gone? But joy does not mean you're forgetting. Joy means your heart is still alive.</p>
            <p>Here's how to make space for small joy without guilt:</p>
            <ol>
                <li><strong>Give yourself permission to feel good even briefly</strong><br/>A moment of laughter or calm doesn't betray your grief. It honors your resilience and your loved one's desire for you to live.</li>
                <li><strong>Let joy and pain coexist</strong><br/>You can cry and smile in the same breath. It's okay to miss them and still enjoy something beautiful.</li>
                <li><strong>Start a "light list"</strong><br/>Write down one thing each day that brought light into your life. It could be the smell of rain, the sound of birds, or a kind message from someone.</li>
                <li><strong>Capture moments of comfort</strong><br/>Take photos of things that make you feel grounded. Keep a joy journal, or create a folder on your phone titled "Today's Light."</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <SubHeading>Self-Care to Embrace Gentle Joy</SubHeading>
        <Paragraph>If today brings even a flicker of light, let it in. Here are ways to care for that space:</Paragraph>
        <ul>
            <li><strong>Spend time outside:</strong> Sit on the porch, walk barefoot in the grass, tend to a plant.</li>
            <li><strong>Read or listen to something uplifting:</strong> A book, a podcast, even a few comforting quotes.</li>
            <li><strong>Make something warm:</strong> A cup of tea, a cozy meal, or something from a shared recipe with your loved one.</li>
        </ul>
        <Paragraph>Let the joy be quiet: You don't have to share it. Sometimes joy is just for you. Note: On days when no joy appears, that's okay too. Just keep your heart open for tomorrow.</Paragraph>
        <Affirmation>"Even in sorrow, there is beauty. I am allowed to feel both pain and peace. I welcome small joys as signs that I am still alive."</Affirmation>
    </PageWrapper>
];

const Day12 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-12">Day 12: Conversations with Them</SectionTitle>
        <Paragraph>I talk to him out loud. In anger. In love. At the cemetery. In the quiet. I would say exactly what I've been telling him. Over and over again. I wish we had a proper goodbye. I would want to know how he felt in those final moments. Was he scared? Was he at peace? Was he in pain? I would ask: Did you know how much I loved you? How much I still do?</Paragraph>
        <Paragraph>And I would tell him again: I love you. I miss you. So much.</Paragraph>
        <Paragraph>But not every conversation is soft. Sometimes I talk to him in anger. Sometimes I'm full of frustration, rage, and disbelief. And I let it out. I remember visiting the cemetery and just yelling. I stood there bawling my eyes out, screaming, asking questions that may never have answers.</Paragraph>
        <Paragraph>And even then... I still talked to him. Just like I always do. Whenever I visit, I talk. Whether I'm crying, venting, remembering, or just sitting in silence, I speak. Because that's what we did in life, and I'm still here. So, I still do it. The bond didn't break. It just changed form.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <PromptBox>
            <p>Imagine you could talk to your loved one today.</p>
            <p>What would you want to say?</p>
            <p>What would you want to ask?</p>
            <p>What do you think they would say back to you?</p>
            <p>Are there things you need to say in anger or frustration, too?</p>
            <p>You don't have to hold anything back here. This space is safe. Love carries all emotions not just the tender ones. Let the conversation unfold exactly as it needs to.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <TipsBox title="Helpful Tips: Talking to Your Loved One">
            <p>You're not imagining it. So many grieving people talk to their loved ones after they've passed. This isn't strange. It's healing. It's a form of continuing bonds: a healthy, meaningful part of grief. Here are some ways to hold those conversations with care:</p>
            <ol>
                <li><strong>Write them a letter</strong><br/>Tell them what your day has been like. What you miss. What hurts. What made you smile. What made you angry. Keep the letter, burn it, or read it aloud. Let it be part of your connection.</li>
                <li><strong>Speak to them in your heart or out loud</strong><br/>In the car. At the cemetery. In the shower. In the quiet of the night. Let your truth out, no matter the tone. They can handle your real.</li>
                <li><strong>Listen with your heart</strong><br/>Sometimes you may feel their response, not as words, but as a sudden peace, warmth, or thought that enters your mind. Trust what brings comfort. Trust the love that still lives.</li>
                <li><strong>Record a voice memo or video</strong><br/>If journaling is too much, try recording yourself speaking to them. It doesn't have to be shared. Sometimes, just hearing your voice helps release emotion.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <SubHeading>Self-Care When You're Missing Them Deeply</SubHeading>
        <Paragraph>These conversations can open up fresh waves of grief. That's okay. Here's how to hold yourself through them:</Paragraph>
        <ul>
            <li>Hydrate and breathe deeply: Afterward, emotional expression is physically exhausting.</li>
            <li>Rest or stretch your body: Shake out the tension, walk, or lie down with soft music.</li>
            <li>Light a candle: Let it symbolize their light, your love, and the space between.</li>
            <li>Speak their name with intention: You are keeping them alive in your story.</li>
        </ul>
        <Paragraph>Reminder: Grief is not just sadness. It's every emotion. You're allowed to be angry. You're allowed to scream. You're allowed to love them while questioning why they had to go.</Paragraph>
        <Affirmation>"I still speak to them in love, in pain, in anger, and in memory. Our bond is not broken. It is evolving."</Affirmation>
    </PageWrapper>
];

const Day13 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-13">Day 13: Planning the Funeral</SectionTitle>
        <SubHeading>Conversations with Them</SubHeading>
        <Paragraph>I talk to him out loud. In anger. In love. At the cemetery. In the quiet.</Paragraph>
        <Paragraph>My only wish was that there would be no cremation. We had talked about it, just once, randomly. I asked him, "What do you want when you die? Should I cremate you and spread your ashes over the ocean?" He looked at me seriously and said, “No. Let my mother decide the funeral arrangements.”</Paragraph>
        <Paragraph>So, I honored that. I stepped back. Whatever she wanted, I supported, because that's what he asked of me. I remember sitting on the couch, crying while sending out invitations. My body was doing the work, but my heart was numb. I was handling logistics I never wanted to handle. No one prepares you for this part.</Paragraph>
        <Paragraph>How do you plan a farewell for the love of your life? There's no guide for this. There's no energy. No clarity. No "right" way. Only grief and decisions that feel too big to make while you're breaking inside.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <PromptBox>
            <p>As the funeral approaches or as you reflect on it how do you feel?</p>
            <p>Are you finding any comfort in planning?</p>
            <p>Or does every detail feel like a heavy reminder of the finality?</p>
            <p>Are there any decisions that felt impossible?</p>
            <p>Are there people helping or adding pressure?</p>
            <p>What would you want this process to feel like, if you could shape it differently?</p>
            <p>Write about how you're carrying this responsibility. Let your grief speak. Let your exhaustion be heard.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <TipsBox title="Helpful Tips: Planning the Funeral While Grieving">
            <p>Planning a funeral while grieving is one of the most emotionally and physically draining things you can do. Here are some tips that might help:</p>
            <ol>
                <li><strong>Focus on one decision at a time</strong><br/>You don't have to do everything in one day. Prioritize the essentials first: location, date, basic logistics.</li>
                <li><strong>Ask for help and accept it</strong><br/>Delegate tasks: programs, flowers, food, photos. Let someone else make calls or handle errands.</li>
                <li><strong>Honor their wishes where possible</strong><br/>If you know what they wanted, use that as your anchor. If you don't, make choices rooted in love and respect.</li>
                <li><strong>It's okay to step back</strong><br/>If someone else needs to take the lead (like a parent, sibling, or close friend), let them. You are not obligated to carry it all.</li>
                <li><strong>You don't have to please everyone</strong><br/>This isn't about impressing guests or following rules. Do what feels most honest to your loved one—and to you.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <SubHeading>Self-Care While Planning the Funeral</SubHeading>
        <Paragraph>You are doing one of the hardest things a person can do while being heartbroken. Here's how to take care of yourself in the midst of it:</Paragraph>
        <ul>
            <li>Drink warm water or tea often, especially if you cry or forget to eat.</li>
            <li>Wear something soft and comforting—you can seek comfort wherever you can.</li>
            <li>Journal or voice-record your thoughts each night to release built-up emotion.</li>
            <li>Touch something grounding—a stone, a photo, a scarf, when decisions feel overwhelming.</li>
            <li>Rest. Even if it's a 15-minute nap or closing your eyes with calming music.</li>
        </ul>
        <Paragraph>Reminder: This is not just an event. It's a goodbye. And goodbyes hurt. Be gentle with yourself.</Paragraph>
        <Affirmation>"I am honoring their life with love, even through my pain. I do not have to carry this alone.”</Affirmation>
    </PageWrapper>
];

const Day15 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-15">Day 15: The Funeral Day</SectionTitle>
        <Paragraph>How do I say goodbye? Sometimes, there are no words. So instead, there is a feeling. A weight. A silence too loud to bear. And maybe, just maybe, a poem that holds what we cannot say out loud:</Paragraph>
        <SubHeading>The Funeral Day</SubHeading>
        <Paragraph>A poem for what I couldn't say</Paragraph>
        <Paragraph>I stood in black but felt colorless. Like the world had drained itself of meaning. Faces blurred. Voices faded.</Paragraph>
        <Paragraph>Flowers bloomed where my heart was breaking. They told me he was gone, But part of me still waited for him to walk in late, smiling. Like this was all a mistake.</Paragraph>
        <Paragraph>They said lovely things. Everything was clear and blurred all at once. I could not control my cry. Bite on the mint and take a sip of water, they said.</Paragraph>
        <Paragraph>But all I really wanted was to crawl into the casket with him and whisper, "Take me too."</Paragraph>
        <Paragraph>I was not okay. But I was present. And sometimes, that's enough.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <Paragraph>The funeral didn't feel real. I moved through it like a shadow. I don't remember everything, but I remember the moments that hurt the most— Seeing the casket. Watching them close it. Knowing I would never see his face again.</Paragraph>
        <Paragraph>I remember watching people cry and wondering how they still had tears. I remember others laughing quietly in corners, and feeling betrayed by their joy. I remember feeling like the world was rushing past me, while I was stuck in place. I remember... surviving.</Paragraph>
        <Paragraph>I wondered how people had the appetite to have such a feast for the after funeral gathering</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>Write about your experience at the funeral:</p>
            <p>What emotions came up?</p>
            <p>Did anything surprise you, about yourself, others, or the ceremony?</p>
            <p>Were there words or moments that helped, or made things worse?</p>
            <p>What did you hold in? What do you wish you could have done differently?</p>
            <p>You don't have to remember everything. Just write what stands out. Let this be your sacred record.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="Helpful Tips: Navigating the Funeral Day">
            <p>Funeral day can feel like an out-of-body experience. You're physically there, but emotionally unraveling. That's normal. Here's how to cope:</p>
            <ol>
                <li><strong>Let your body lead</strong><br/>If you need to sit—sit. If you feel faint, step outside. Don't force composure. Let yourself cry, shake, leave early, or do what feels right.</li>
                <li><strong>Designate a "safe person"</strong><br/>Ask one trusted person to be by your side, handle logistics, or pull you out if you get overwhelmed.</li>
                <li><strong>Bring a grief kit</strong><br/>Include tissues, mints, water, a small comfort item (scarf, stone, essential oil), sunglasses, a snack.</li>
                <li><strong>You don't owe anyone a conversation</strong><br/>It's okay to say, "Thank you for coming"—and walk away. Protect your peace.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Self-Care for the Funeral Day</SubHeading>
        <Paragraph>You made it through. That in itself is a triumph. Now, you must care for the version of you that did. Eat something nourishing today, even if it's just a warm soup or tea. Rinse off the energy of the day, take a long shower or bath if you can. Rest, deeply and without guilt. Let your body collapse if it needs to. Hold a comfort object, something that reminds you of them or anchors you to yourself. Light a candle or say a prayer just for you, for what you carried and endured.</Paragraph>
        <Paragraph>Reminder: It's okay if you felt nothing. Or too much. Or everything all at once. Grief is unpredictable. Let the day pass. Let yourself begin to exhale.</Paragraph>
        <Affirmation>"I showed up today with a broken heart and steady breath. That is strength. I honor my grief without apology."</Affirmation>
    </PageWrapper>
];

const Day16 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-16">Day 16: Anger and Sadness</SectionTitle>
        <Paragraph>I've been angry. I've been deeply sad. But love was always the reason. Of course, I've been angry. Angry at the situation. Angry at how everything changed so fast. Angry at how unfair this feels.</Paragraph>
        <Paragraph>And of course, I've been sad. Unbearably, deeply, endlessly sad. I've felt the full range of emotions, sometimes all within the same hour.</Paragraph>
        <Paragraph>And yet... in the midst of all that, I've realized something unexpected: all the silly things we used to argue about don't matter anymore. The little frustrations. The disagreements. The times we both could've just let it go. None of it matters now.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <Paragraph>Instead, what plays in my mind are all the beautiful memories, the laughter, the inside jokes, the tenderness. Especially the beginning of our relationship, before we had children. Not because I don't love the memories with the kids, of course I do. I treasure every moment we shared as a family. But there's something unique and unforgettable about how it all began. The first time I saw him. The spark. The nervousness. The excitement of finding someone who just got me. That time feels sacred. It was just us.</Paragraph>
        <Paragraph>I cling to that version of us when the anger rises. It reminds me that even though grief brings rage and sorrow, it only does so because there was love—and so much of it.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>Grief often brings anger, and that anger is valid.</p>
            <p>Are you angry today?</p>
            <p>Angry at life? At the circumstances? At the people around you?</p>
            <p>Maybe even at your loved one, for leaving? For not being able to stay?</p>
            <p>Or maybe you're not angry, but deeply, soul-tired sad. Whatever you feel, this is your space to be honest about it. Yell on the page. Cry on the page. Be still on the page. There's no wrong emotion in grief.</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <TipsBox title="Helpful Tips: Navigating Anger and Sadness">
            <p>These emotions aren't shameful—they are the most human part of loss. Here's how to work with them gently:</p>
            <ol>
                <li><strong>Give anger a safe outlet</strong><br/>Scream into a pillow. Punch a cushion. Write a letter and don't send it. Don't bottle it up, it only turns inward.</li>
                <li><strong>Let the sadness move through you</strong><br/>Crying is cleansing. It's your body's way of honoring pain. Tears are evidence that love existed and still does.</li>
                <li><strong>Talk to someone who can hold space</strong><br/>A friend. A therapist. A support group. Sometimes just saying, “I'm really angry today,” helps release the charge.</li>
                <li><strong>Write the unspoken</strong><br/>If you're mad at your loved one for leaving, say it. If you're mad at the world, write it down. If you miss them so much it physically hurts, give those feelings language.</li>
            </ol>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <SubHeading>Self-Care for Emotional Overload</SubHeading>
        <Paragraph>When anger and sadness take over, you need a soft place to land.</Paragraph>
        <ul>
            <li><strong>Cool your body down:</strong> Splash cold water on your face, hold ice cubes, step outside. Anger and sadness heat the body, cooling down can bring calm.</li>
            <li><strong>Light a candle and name your emotion aloud:</strong> Just saying it can defuse the pressure: "I'm sad today. I miss them. I'm overwhelmed."</li>
            <li><strong>Play music that matches your mood:</strong> Let your emotions have a soundtrack. It helps them move through.</li>
            <li><strong>Try a movement release:</strong> Shake your hands, walk briskly, stretch your arms wide. Movement helps the body process pain.</li>
        </ul>
        <Paragraph>Reminder: You are not "doing it wrong" because you're angry. You are grieving. And grief is every emotion trying to make sense of what's missing.</Paragraph>
        <Affirmation>"I am allowed to feel anger. I am allowed to feel sorrow. I will not shame my emotions. I will honor them and let them pass through me."</Affirmation>
    </PageWrapper>
];

const Day17 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-17">Day 17: Releasing the Pain</SectionTitle>
        <Paragraph>I used to pick at my feet. I stopped. I started healing. I turned to gardening. I cry when my chest feels heavy. When the ache crawls up into my throat and my body can no longer contain what I carry. When I am overwhelmed by the what-ifs... and then, finally, the truth.</Paragraph>
        <Paragraph>And all I can say is this: I release myself from guilt. Was there something I could have done? Something I could've said? Some decisions I could've made differently? The answer is: Absolutely nothing.</Paragraph>
        <Paragraph>There was nothing I could have done to change the outcome. There was nothing I could have said to undo what happened. Replaying every moment and rethinking every word will not bring my husband back. And holding onto that guilt doesn't serve him. It doesn't serve me. It doesn't serve our children. It only traps me in a moment that cannot be rewritten. So today, maybe just for today— I let it go. Not because I've forgotten. Not because I'm "healed." But because I'm choosing to live forward.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <SubHeading>A Shift in Coping</SubHeading>
        <Paragraph>And I want to say this too— Sometimes, releasing pain looks unhealthy. There was a time I started picking at my feet. So much so that I could barely walk from the soreness. I tried wearing socks. Tights. Covering them up. But the more tense I felt, the more I picked.</Paragraph>
        <Paragraph>Then... months passed, and one day I realized, I had stopped picking... without even noticing it. Just like that. Quiet healing. Unforced. Slow. It didn't happen overnight, but it did happen.</Paragraph>
        <Paragraph>And yes, I still struggle with nail biting, that's been a long-time habit. Not always about grief. Sometimes, it's just boredom. How I picked that up is a story for another day. But here's what I know now: I found other ways to release pain. Healthier ways. Grounding ways. Like being in the garden. Like weed whacking yes, it's physical, intense, and it helps me move my emotions.</Paragraph>
        <Paragraph>So, if you're reading this and you've turned to something hurting you more than helping, know that you're not alone. And there are other ways. You deserve to feel better without breaking yourself further.</Paragraph>
    </PageWrapper>
];

const Day18 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-18">Day 18: On the Worst Days</SectionTitle>
        <Affirmation>"Even on my hardest days, I am surviving. I will take one small step, and that is enough."</Affirmation>
        <Paragraph>On the worst days, I was lucky to have help from my family. But even with their support, getting out of bed felt impossible. I would lie there, staring at the ceiling, sleeping so much that it gave me a headache. I was just trying to sleep my heartbreak away. I couldn't recognize myself in the mirror and hated what I saw. But I made a deal with myself: "If I can get up to use the restroom, then I will walk out of this room. I might wait until my bladder has exceeded its holding capacity, but I will get up."</Paragraph>
        <Paragraph>So, I got up. I made my favorite tea. I sipped it while lying down and watched my kids play. They missed me, and I knew I had to try for them. Nature helped me, too. If I could step outside, even for a moment, I'd check on my garden. There's something about seeing my plants, hearing the birds, and feeling the air that reminded me, I was still alive.</Paragraph>
        <Paragraph>I tried to stay hydrated, even when I had no appetite. I took small bites of food, even when I didn't feel like eating. I found little things to watch for comfort. I cried. I sipped tea. I breathed. And that was enough.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <TipsBox title="Helpful Tips for Getting Through the Hardest Days">
            <ul>
                <li><strong>Start Small</strong> - If getting out of bed feels impossible, begin with a small movement, wiggling your fingers, shifting positions, or sitting up for a moment.</li>
                <li><strong>Set a Simple Goal</strong> – Even if it's just getting up to use the restroom or making tea, give yourself a small victory.</li>
                <li><strong>Rest Without Guilt</strong> – Just making it through some days is enough. Don't shame yourself for needing extra sleep or time to be still.</li>
                <li><strong>Hydrate and Nourish</strong> – A warm cup of tea, a sip of water, or a small bite of food can help ground you. Even if you don't feel hungry, your body still needs care.</li>
                <li><strong>Let Nature Help</strong> – Step outside if possible, feel the air, watch the sky, or tend to a plant. Nature has a way of reminding us that life continues.</li>
                <li><strong>Acknowledge Your Feelings</strong> - Cry if you need to. Feel the sadness, the exhaustion, the frustration. It's okay to have days when you do nothing but grieve.</li>
                <li><strong>Lean on Something Comforting</strong> – Whether watching a favorite show, wrapping up in a blanket, or listening to calming music, find something that soothes you.</li>
                <li><strong>Find a Reason to Move</strong> – If you can, check on something that matters to you, your children, your pets, a plant. Let them remind you that you are still here.</li>
            </ul>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <SubHeading>Self-Care & Prompt</SubHeading>
        <Paragraph>Self-Care Tips for the Hardest Days</Paragraph>
        <ul>
            <li><strong>Take Slow, Deep Breaths</strong> - Take five slow, deep breaths when emotions feel overwhelming. It helps calm the nervous system.</li>
            <li><strong>Do One Gentle Act for Yourself</strong> - Take a warm shower, put on cozy clothes, or wrap yourself in a blanket. Physical comfort can ease emotional pain.</li>
            <li><strong>Make a Warm Drink</strong> – Tea, cocoa, or even just warm water with lemon can provide a sense of comfort and grounding.</li>
            <li><strong>Listen to Calming Sounds</strong> – Gentle music, nature sounds, or even white noise can help create a soothing environment.</li>
            <li><strong>Write, even if it's just a Few Words</strong> – Let out whatever is on your heart. It doesn't have to be structured, just let it flow.</li>
            <li><strong>Step Outside, even for a Moment</strong> – A small connection to nature can bring calm, even if it's just opening a window to feel fresh air.</li>
            <li><strong>Light a Candle or Use Soft Lighting</strong> – Soft, warm light can make a space feel more peaceful and safe.</li>
            <li><strong>Ask for Help or Accept Support</strong> - If someone offers to help, let them. If you need support, don't be afraid to ask. You don't have to do this alone.</li>
        </ul>
        <PromptBox>
            <p>What do your hardest days look like? When everything feels heavy, what small things help you get through? Even if it's just drinking tea, taking a deep breath, or stepping outside, write about how you help yourself survive the hardest days.</p>
        </PromptBox>
    </PageWrapper>
];

const Day19 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-19">Day 19: Finances and the Weight of Loss</SectionTitle>
        <Paragraph>This is a very sensitive topic. Losing my husband meant not only losing my life partner but also our primary source of income. I had been a homemaker, he managed the finances, and I supported him and our home. The financial instability hit hard. Even worse, the people he once trusted tried to take everything away from us. I was told I wasn't entitled to his personal belongings, which was both heartbreaking and shocking.</Paragraph>
        <Paragraph>I worried about how I would afford the scar reversal treatment he needed, how I would manage the bills piling up, medical expenses, utilities, legal fees. And people assumed we were taken care of because of life insurance. The truth? It took months. Over four months. And even then, I received only a small fraction, about one-tenth of what was expected. That was devastating.</Paragraph>
        <Paragraph>I remember sitting beside my son, who had just been discharged from the ICU after suffering second-degree burns, and thinking: What kind of person would take away a child's chance at healing?</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <Paragraph>But somehow, through all of it, I kept going. With help, prayer, and persistence, things gradually improved. It hasn't been easy, but I'm still here, showing up for my children, even when it's incredibly hard.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <TipsBox title="Helpful Tips for Navigating Finances After Loss">
            <ul>
                <li><strong>Reach Out for Financial Guidance:</strong> Don't be afraid to seek help. A trusted financial advisor, a probate attorney, or a support group can help you sort through the confusion.</li>
                <li><strong>Document Everything:</strong> Keep copies of all documents; death certificates, bills, insurance forms, and any communication from banks or employers.</li>
                <li><strong>Contact HR Yourself:</strong> If no one reaches out from your loved one's workplace, you can contact Human Resources directly to ask about benefits, last paychecks, retirement accounts, and insurance.</li>
                <li><strong>Apply for Assistance:</strong> Look into local, state, or national assistance programs. Sometimes grants, emergency funds, or nonprofit aid can help you get through the first few months.</li>
                <li><strong>Accept What You Can't Control:</strong> There will be delays, misinformation, or disappointment, but it's okay to feel angry and hurt. Let yourself grieve even this aspect of loss.</li>
                <li><strong>Find an Advocate:</strong> If legal matters are involved (especially if others are trying to claim your spouse's assets), a lawyer or advocate is essential.</li>
            </ul>
        </TipsBox>
        <SubHeading>Self-Care & Prompt</SubHeading>
        <Paragraph>Finances can trigger panic. When you sit down to handle paperwork or make calls, try creating a calming environment. Light a candle, make a cup of tea, play soft music, or sit near a window. Give yourself breaks, and don't try to do everything in one sitting. You're allowed to take it slow.</Paragraph>
        <PromptBox>
            <p>Have financial worries added to your grief? Write about what has been hardest for you financially since your loss. What unexpected roadblocks have you faced? What small financial victories have you had (no matter how small)? Remind yourself that every step forward matters. You're doing your best.</p>
        </PromptBox>
    </PageWrapper>
];

const Day20 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-20">Day 20: The Flashbacks</SectionTitle>
        <Paragraph>Sometimes, it feels like I see him through the window. I stare at the couch where he passed away and imagine curling up there with him, feeling his hug. Sometimes I just sit and stare. I see him when I close my eyes; his smile, his calm presence. I remember him most when I'm driving, because he always drove and I was his passenger. I still catch myself watching the door, expecting him to walk in at any moment. Fridays are especially hard. They used to be our special nights, when the next day was less busy and I had more time with him.</Paragraph>
        <Paragraph>People have told me to move things around or redecorate, but I'm not ready. His clothes, his shoes, his toothbrush, I need them where he left them. It makes me feel like he's still here, close to me. Maybe one day I'll be ready to let go or move things. For now, I only part with the things he didn't use much and hold on to what feels most like him. And if I never move them, that's okay too.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <TipsBox title="Helpful Tips for Navigating Flashbacks & Sentimental Triggers">
            <ul>
                <li>Let the memories flow. Flashbacks are normal and part of how your brain processes grief. Don't feel like you need to push them away.</li>
                <li>Keep items if they bring you comfort. You don't have to “move on” or pack things away unless and until you feel ready.</li>
                <li>Designate a special space. Create a small corner or area in your home where you honor your loved one, if that feels healing.</li>
                <li>Talk it out. Share memories with someone you trust, keeping your loved one's memory alive can ease the pain.</li>
                <li>Practice grounding. When flashbacks become overwhelming, try grounding techniques like naming five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste.</li>
            </ul>
        </TipsBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <SubHeading>Self-Care & Prompt</SubHeading>
        <Paragraph>Spend a few quiet minutes with something that reminds you of your loved one, a piece of clothing, a photo, a scent. Light a candle or make their favorite tea. Sit with the memory. Cry if you need to. Breathe deeply, and let yourself feel.</Paragraph>
        <PromptBox>
            <p>Have you experienced flashbacks or moments when it felt like your loved one was still near? Are there items or places that bring them closer to you? Write about what you're holding on to and why. There's no timeline for when, or if, you should let go.</p>
        </PromptBox>
        <Affirmation>I honor my grief by allowing memories to come and go. I do not need to rush through healing. I give myself permission to hold on to what brings me peace.</Affirmation>
    </PageWrapper>
];

const Day21 = [
    <PageWrapper pageIndex={0}>
        <SectionTitle id="day-21">Day 21: How Should I Grieve?</SectionTitle>
        <Paragraph>There is no exact way to grieve. Some say, 'Sorry you lost your husband.' Others say, 'It's been more than six months. It must hurt less now.' But no, it does not hurt less. Yes, I've learned to live with my grief and even embraced it, but that doesn't mean the pain has faded.</Paragraph>
        <Paragraph>I would say grief is like losing a leg. You can remain helpless and choose never to recover, or you can embrace this new version of yourself and learn to walk again. Healing takes time, and it requires patience. You have to give yourself grace. You have to heal on your own terms.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <Paragraph>I've been told I went to a meeting overdressed for a widow and that I needed to present myself as someone who was grieving. On the flip side, someone else told me I looked too miserable and should try to look more put together. So who is right, and who is wrong?</Paragraph>
        <Paragraph>I say—I will dress however makes me feel confident and a bit like myself again. Being a widow comes with countless expectations. Grief carries endless challenges, including struggles with identity. But I will learn to embrace both my life and my grief. I will not let grief become my enemy.</Paragraph>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox>
            <p>Have you ever felt like others were trying to tell you how to grieve? Have you been criticized for looking too sad, or not sad enough? Write about how you've chosen to show up in your grief. How do you want to express yourself, and what helps you feel most like 'you' again?</p>
        </PromptBox>
        <TipsBox title="Helpful Tips: Grieving in Your Way">
            <ul>
                <li>There is no single way to grieve, ignore the expectations. You are allowed to grieve in the way you need.</li>
                <li>Speak up when you're judged, if someone makes a hurtful comment, gently let them know.</li>
                <li>Dress for your soul, whether that's all black or bright colors, wear what makes you feel empowered.</li>
                <li>Identity shifts are normal, losing someone can shake who you are. You are still whole, even in your grief.</li>
                <li>Say no to boxes don't let society or tradition define what your grief should look like.</li>
            </ul>
        </TipsBox>
        <SubHeading>Self-Care Tip</SubHeading>
        <Paragraph>Find one small thing that reminds you of your confidence, whether it's wearing lipstick, putting on your favorite jewelry, or sitting in the sun. Reclaim a piece of your identity today.</Paragraph>
        <Affirmation>"I am not my grief. I am a whole person learning to live, love, and express myself again on my terms."</Affirmation>
    </PageWrapper>
];

const Reflections = [
    <PageWrapper pageIndex={0}>
        <SectionTitle>Reflections</SectionTitle>
        <Paragraph>This section compiles all the reflective prompts from the book. Use this space to revisit your thoughts and feelings as you move through your journey.</Paragraph>
        
        <PromptBox title="From 'Day 1: The Day of Loss'">
            <p>Describe how you're feeling right now. What was the moment you found out like? Who told you or did you find out yourself? What emotions, images, or questions stand out to you?</p>
        </PromptBox>
        <PromptBox title="From 'Day 2: Numbness and Shock'">
            <p>What are you feeling today? Are there any memories that keep surfacing? What does "shock" feel like in your body and in your mind?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <PromptBox title="From 'Day 3: First Memories'">
            <p>What is your very first memory of your loved one? Was it magical, awkward, sweet, or unforgettable? Try to write about that moment in as much detail as you can: What were they wearing? How did they smell? What words were said? What stood out to you about them?</p>
        </PromptBox>
        <PromptBox title="From 'Day 4: Physical and Emotional Pain'">
            <p>How does your body feel today? Where do you feel pain, tension, or heaviness? Are you tired? Are you restless? Are you numb? What emotions do you feel most strongly, and where do they live in your body?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <PromptBox title="From 'Day 5: Unspoken Words'">
            <p>What are your unspoken words? What do you wish you could've said to your loved one before they passed? Is there something you regret? Is there something beautiful or simple, like "thank you” or “I love you”—that you never got to say?</p>
        </PromptBox>
        <PromptBox title="From 'Day 6: Support System'">
            <p>Who has truly been there for you since your loss? How did their presence help or hurt? If you feel alone, who do you wish were showing up for you right now? What kind of support do you need the most; emotional, practical, physical, or spiritual?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <PromptBox title="From 'Day 7: Looking for Signs'">
            <p>Have you felt your loved one's presence in any way? Was it in a dream that felt more than a dream? A scent? A song playing at the exact right time? A flicker of light, a whisper, or a strong feeling of knowing they were near? Or... have you been waiting for a sign and felt nothing? That's okay too.</p>
        </PromptBox>
        <PromptBox title="From 'Day 8: Processing Emotions'">
            <p>How are you feeling today? Sad? Angry? Confused? Numb? Restless? Lonely? Write about what emotions you're experiencing right now. Have you noticed a change from Day 1 to today?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <PromptBox title="From 'Day 9: Honoring Their Memory'">
            <p>How would you like to honor your loved one's memory?</p>
            <p>Is there a ritual, tradition, or place that brings you closer to them?</p>
            <p>Do you want to create something in their name?</p>
            <p>Is there something small you do every day or week that feels like remembrance?</p>
        </PromptBox>
        <PromptBox title="From 'Day 10: Feeling Lost'">
            <p>Are you feeling directionless or stuck right now? What tasks or routines are hardest for you to complete? What responsibilities are pressing down on you? Are you grieving lost dreams or roles in addition to your loved one? What, if anything, still feels important even if it's hard?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <PromptBox title="From 'Day 11: Small Joys Amidst Pain'">
            <p>Did anything today, no matter how small, bring you a sense of calm or comfort?</p>
            <p>Was it something you heard, saw, touched, smelled, or felt?</p>
            <p>What made you feel a little less alone? A little more grounded?</p>
            <p>What helped you take one more breath?</p>
            <p>Write it down. Hold onto it. These are the threads that help you weave your way through pain.</p>
        </PromptBox>
        <PromptBox title="From 'Day 12: Conversations with Them'">
            <p>Imagine you could talk to your loved one today.</p>
            <p>What would you want to say?</p>
            <p>What would you want to ask?</p>
            <p>What do you think they would say back to you?</p>
            <p>Are there things you need to say in anger or frustration, too?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={6}>
        <PromptBox title="From 'Day 13: Planning the Funeral'">
            <p>As the funeral approaches or as you reflect on it how do you feel? Are you finding any comfort in planning? Or does every detail feel like a heavy reminder of the finality? Are there any decisions that felt impossible? Are there people helping or adding pressure?</p>
        </PromptBox>
        <PromptBox title="From 'Day 15: The Funeral Day'">
            <p>Write about your experience at the funeral: What emotions came up? Did anything surprise you, about yourself, others, or the ceremony? Were there words or moments that helped, or made things worse? What did you hold in? What do you wish you could have done differently?</p>
        </PromptBox>
    </PageWrapper>,
    <PageWrapper pageIndex={7}>
        <PromptBox title="From 'Day 16: Anger and Sadness'">
            <p>Are you angry today? Angry at life? At the circumstances? At the people around you? Maybe even at your loved one, for leaving? For not being able to stay? Or maybe you're not angry, but deeply, soul-tired sad.</p>
        </PromptBox>
        <PromptBox title="From 'Day 21: How Should I Grieve?'">
            <p>Have you ever felt like others were trying to tell you how to grieve? Have you been criticized for looking too sad, or not sad enough? Write about how you've chosen to show up in your grief. How do you want to express yourself, and what helps you feel most like 'you' again?</p>
        </PromptBox>
    </PageWrapper>
];

const Affirmations = [
    <PageWrapper pageIndex={0}>
        <SectionTitle>Affirmations</SectionTitle>
        <Paragraph>This section is a collection of all the affirmations from the book. Return to these words whenever you need a reminder of your strength, your resilience, and the love that endures.</Paragraph>
        
        <Affirmation>I don't have to make sense of this right now. I am breathing. I am surviving. That is enough.</Affirmation>
        <Affirmation>"These memories are sacred. They remind me of love, joy, and the moments that made us."</Affirmation>
        <Affirmation>"My body is grieving, too. I give myself permission to feel, to rest, and to heal—one breath at a time."</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={1}>
        <Affirmation>"Even though the words were never spoken, the love was always there. I honor what was left unsaid, and I give myself permission to feel it all."</Affirmation>
        <Affirmation>"Even if the world feels quiet, I am still worthy of support. I honor those who stayed, and I release those who could not."</Affirmation>
        <Affirmation>"I trust that love continues in unseen ways. I am open, but discerning. I trust my heart, my loved one, and the sacred process of grief.”</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={2}>
        <Affirmation>"Grief is not weakness, it is love in motion. I will not rush myself. I will feel, I will adjust, and I will live."</Affirmation>
        <Affirmation>"I carry their memory with me—not as a burden, but as a light. Love does not end. I will honor them in the way that feels right for me."</Affirmation>
        <Affirmation>"Even in this fog, I am still here. I may feel lost, but I am not alone. I will find my way forward, one breath at a time."</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={3}>
        <Affirmation>"Even in sorrow, there is beauty. I am allowed to feel both pain and peace. I welcome small joys as signs that I am still alive."</Affirmation>
        <Affirmation>"I still speak to them in love, in pain, in anger, and in memory. Our bond is not broken. It is evolving."</Affirmation>
        <Affirmation>"I am honoring their life with love, even through my pain. I do not have to carry this alone.”</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={4}>
        <Affirmation>"I showed up today with a broken heart and steady breath. That is strength. I honor my grief without apology."</Affirmation>
        <Affirmation>"I am allowed to feel anger. I am allowed to feel sorrow. I will not shame my emotions. I will honor them and let them pass through me."</Affirmation>
        <Affirmation>"Even on my hardest days, I am surviving. I will take one small step, and that is enough."</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={5}>
        <Affirmation>I honor my grief by allowing memories to come and go. I do not need to rush through healing. I give myself permission to hold on to what brings me peace.</Affirmation>
        <Affirmation>"I am not my grief. I am a whole person learning to live, love, and express myself again on my terms."</Affirmation>
        <Affirmation>I am grieving because I loved deeply.</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={6}>
        <Affirmation>My grief is valid, even when others don't understand.</Affirmation>
        <Affirmation>I am still worthy of joy, even in sadness.</Affirmation>
        <Affirmation>My emotions are sacred and deserve to be felt.</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={7}>
        <Affirmation>I am doing the best I can.</Affirmation>
        <Affirmation>Resting is not giving up—it's part of healing.</Affirmation>
        <Affirmation>My children are a living reflection of their love.</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={8}>
        <Affirmation>Letting go of guilt sets my soul free.</Affirmation>
        <Affirmation>Our connection isn't broken; it's transformed.</Affirmation>
        <Affirmation>My grief will evolve. I will not always feel this way.</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={9}>
        <Affirmation>Healing is not forgetting. It's living with love and loss.</Affirmation>
        <Affirmation>My healing is not linear, and that's okay.</Affirmation>
        <Affirmation>I will treat my body with kindness, even on hard days.</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={10}>
        <Affirmation>My tears are not a weakness. They are truth.</Affirmation>
        <Affirmation>I am still here and that is a miracle.</Affirmation>
        <Affirmation>One small step is still progress.</Affirmation>
    </PageWrapper>,
    <PageWrapper pageIndex={11}>
        <Affirmation>I am finding my way through this darkness.</Affirmation>
        <Affirmation>Love is my anchor, even in the storm.</Affirmation>
    </PageWrapper>
];

export const infinityJournalContent = [
  {
    page: 1,
    title: "The Infinity Journal",
    subtitle: "A compassionate companion for your healing journey",
    content: `Written by Ruby Dobry`
  },
  ...Introduction,
  ...Day1,
  ...Day2,
  ...Day3,
  ...Day4,
  ...Day5,
  ...Day6,
  ...Day7,
  ...Day8,
  ...Day9,
  ...Day10,
  ...Day11,
  ...Day12,
  ...Day13,
  ...Day15, // Using Day15 as per existing sectionPages mapping
  ...Day16,
  ...Day17,
  ...Day18,
  ...Day19,
  ...Day20,
  ...Day21,
  ...Reflections,
  ...Affirmations,
];

export const sectionPages = {
    introduction: Introduction,
    day1: Day1,
    day2: Day2,
    day3: Day3,
    day4: Day4,
    day5: Day5,
    day6: Day6,
    day7: Day7,
    day8: Day8,
    day9: Day9,
    day10: Day10,
    day11: Day11,
    day12: Day12,
    day13: Day13,
    day14: Day15, // OCR skipped 14, mapping to 15
    day15: Day15,
    day16: Day16,
    day17: Day17,
    day18: Day18,
    day19: Day19,
    day20: Day20,
    day21: Day21,
    reflections: Reflections,
    affirmations: Affirmations,
};

export const sectionPageTitles = {
    introduction: ['Dedication', 'You Are Not Alone (Part 1)', 'You Are Not Alone (Part 2)', 'Visiting the Mortuary (Part 1)', 'Visiting the Mortuary (Part 2)', 'Visiting the Mortuary (Part 3)'],
    day1: ['The Day of Loss', 'The Realization', 'The Experience', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day2: ['Numbness and Shock', 'Holding On', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day3: ['First Memories', 'The First Date', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day4: ['Physical & Emotional Pain', 'The Weight of Grief', 'Reflective Prompt', 'Understanding Physical Grief', 'Tips for the Body', 'Self-Care'],
    day5: ['Unspoken Words', 'Things Left Unsaid', 'Reflective Prompt', 'Tips for Unspoken Words', 'Self-Care'],
    day6: ['Support System', 'Reflective Prompt', 'Understanding Support', 'Self-Care'],
    day7: ['Looking for Signs', 'A Gentle Presence', 'On Spiritual Tools', 'Reflective Prompt', 'Tips for Signs', 'Self-Care'],
    day8: ['Processing Emotions', 'A New Way of Living', 'Reflective Prompt', 'Stages of Grief', 'Tips for Emotions', 'Self-Care'],
    day9: ['Honoring Their Memory', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day10: ['Feeling Lost', 'A Shift in Identity', 'Reflective Prompt', 'Tips for Feeling Lost', 'Self-Care'],
    day11: ['Small Joys Amidst Pain', 'Reflective Prompt', 'Noticing Joy Without Guilt', 'Self-Care'],
    day12: ['Conversations with Them', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day13: ['Planning the Funeral', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day14: ['The Funeral Day', 'A Poem', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day15: ['The Funeral Day', 'A Poem', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day16: ['Anger and Sadness', 'Clinging to Memories', 'Reflective Prompt', 'Helpful Tips', 'Self-Care'],
    day17: ['Releasing the Pain', 'A Shift in Coping'],
    day18: ['On the Worst Days', 'Helpful Tips', 'Self-Care & Prompt'],
    day19: ['Finances and Loss', 'The Aftermath', 'Self-Care & Prompt'],
    day20: ['The Flashbacks', 'Helpful Tips', 'Self-Care & Prompt'],
    day21: ['How Should I Grieve?', 'External Pressures', 'Helpful Tips & Self-Care'],
    reflections: ['Prompts 1-2', 'Prompts 3-4', 'Prompts 5-6', 'Prompts 7-8', 'Prompts 9-10', 'Prompts 11-12', 'Prompts 13-15', 'Prompts 16-21'],
    affirmations: ['Affirmations 1-3', 'Affirmations 4-6', 'Affirmations 7-9', 'Affirmations 10-12', 'Affirmations 13-15', 'Affirmations 16-18', 'Affirmations 19-21', 'Affirmations 22-24', 'Affirmations 25-27', 'Affirmations 28-30', 'Affirmations 31-33', 'Affirmations 34-35'],
};


export default function InfinityContent({ section, page = 0 }) {
  const contentToRender = sectionPages[section]?.[page] || sectionPages.introduction[0];
  
  return (
    <article className="prose prose-lg max-w-none prose-p:text-gray-700 prose-headings:text-gray-800">
      {contentToRender}
    </article>
  );
}
