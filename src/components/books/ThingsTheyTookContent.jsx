import React from 'react';
import { motion } from 'framer-motion';

export const sections = [
  { id: 'dedication', title: 'Dedication' },
  { id: 'toc', title: 'Table of Contents' },
  { id: 'authors-note', title: "Author's Note" },
  { id: 'chapter-1', title: 'Chapter One: Dear Husband' },
  { id: 'chapter-2', title: 'Chapter Two: What They Took' },
  { id: 'chapter-3', title: 'Chapter Three: Trust Issues' },
  { id: 'chapter-4', title: 'Chapter Four: The Silence After the Calls' },
  { id: 'chapter-5', title: 'Chapter Five: The Ones Who Stayed' },
  { id: 'chapter-6', title: 'Chapter Six: Burnout Took You First' },
  { id: 'chapter-7', title: 'Chapter Seven: Conversations with the Dead' },
  { id: 'chapter-8', title: 'Chapter Eight: The Betrayal That Followed' },
  { id: 'chapter-9', title: 'Chapter Nine: The Mirror of Me' },
  { id: 'chapter-10', title: 'Chapter Ten: Learning to Breathe Again' },
  { id: 'chapter-11', title: 'Chapter Eleven: The Garden of Light' },
  { id: 'chapter-12', title: 'Chapter Twelve: For the Ones Who Will Come After' },
  { id: 'closing', title: 'Closing Note' }
];

const WiseQuote = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
    className="my-6 pl-6 border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r-lg"
  >
    <p className="text-amber-900 italic font-serif text-lg">{children}</p>
  </motion.div>
);

const ReflectionQuestion = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="my-6 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-xl"
  >
    <p className="text-sm font-semibold text-indigo-600 mb-2">Reflection Question</p>
    <p className="text-indigo-900 font-medium">{children}</p>
  </motion.div>
);

const Poem = ({ children }) => (
  <div className="my-8 font-serif text-gray-700 leading-relaxed whitespace-pre-line">
    {children}
  </div>
);

export default function ThingsTheyTookContent({ sectionId }) {
  const renderContent = () => {
    switch (sectionId) {
      case 'dedication':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dedication</h2>
            <Poem>
{`For Yuriy —
My love, my mirror, my light.
Even in death, you remain the reason I rise.

And for our children —
May you always know that love endures, even through the unthinkable.`}
            </Poem>
          </motion.div>
        );

      case 'toc':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Table of Contents</h2>
            <div className="space-y-2 text-gray-700">
              <p>Dear Husband</p>
              <p>What They Took</p>
              <p>Trust Issues</p>
              <p>The Silence After the Calls</p>
              <p>The Ones Who Stayed</p>
              <p>Burnout Took You First</p>
              <p>Conversations with the Dead</p>
              <p>The Betrayal That Followed</p>
              <p>The Mirror of Me</p>
              <p>Learning to Breathe Again</p>
              <p>The Garden of Light</p>
              <p>For the Ones Who Will Come After</p>
            </div>
          </motion.div>
        );

      case 'authors-note':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Author's Note</h2>
            <Poem>
{`This book was written through grief — not from it.
Each word carries the weight of love, betrayal, and faith;
each page, the breath of a soul still learning to stand after loss.

When the world broke open, I turned to writing.
What began as letters to Yuriy became confessions, poems, and prayers.
I wrote to remember. I wrote to heal.
I wrote because silence was too loud.

If these words find you, may they remind you that healing is not forgetting.
It's remembering differently.
It's learning to love again in a world that once shattered you.`}
            </Poem>
          </motion.div>
        );

      case 'chapter-1':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter One: Dear Husband</h2>
            <Poem>
{`You know,
they always say,
"We felt their presence at the funeral."
But my heart was heavy,
my eyes a river of salt—
and though the room overflowed with bodies,
I could not feel you.

Did you know, my love,
that many who stood there in black
had already betrayed you?
Smiles on their lips,
knives tucked behind their backs.

The one who stood up to speak—
not for you,
but for the sound of their own voice,
for the attention it could buy them.

How quickly they shifted,
like shadows bending in the light.
To the police they said, "I am family."
At the funeral: "We were partners."
At the meetings, erasing your name:
"I worked with him, but I hardly knew him."

Yes—
isn't it a cruel shift?
One man, many masks,
all worn in your absence.

And I sat there,
holding grief like fire in my hands,
wondering if the world
would ever show you
the loyalty you deserved.`}
            </Poem>
            <WiseQuote>
              "The mask worn for the crowd will always crack in the silence of truth."
            </WiseQuote>
            <ReflectionQuestion>
              Have you ever witnessed someone shift their mask—showing one face to honor a person, and another when it came time to protect themselves?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-2':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Two: What They Took</h2>
            <Poem>
{`I don't even know
how to make this make sense.
In my culture,
to touch the belongings of the dead
so soon after breath has left—
it is forbidden.

But hours after your passing,
a necklace was snatched from its rightful place.
They said it was for memory,
to remember you, Mama Ira.
But I remember your words:
how you dreamed of passing those jewels down—
your grandmother's to your mother's,
your mother's to you—
and finally to your granddaughter.

You smiled when she was born,
our first girl after so many sons.
You said, "At last,
someone to inherit the treasures of women."

How then,
could someone steal them
before the tears had even dried?

I knew something was wrong
when I couldn't find the dog's ashes.
Yes, even that they took,
searching for treasure in the urn,
only to return it later,
once they realized it held no gold,
only love burned to dust.

They sold what you cherished.
Pocketed the money.
Just as your son was betrayed,
you too were stripped by those closest.
How strange that betrayal
always wears the face of your closest ally.

Be careful who you trust, my love.
They admired the grandchild in your presence,
but in your absence,
she became invisible.
It was all for show.`}
            </Poem>
            <WiseQuote>
              "Greed does not grieve. It only waits for silence to take its share."
            </WiseQuote>
            <ReflectionQuestion>
              What would you want done with your most cherished belongings after your passing?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-3':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Three: Trust Issues</h2>
            <Poem>
{`They told me to go to therapy.
Yes—pay for endless hours,
pour my wounds into someone's notebook,
wait for healing to arrive.

And I do believe in therapy—
but no amount of talk can mend this right now.
The pain is not just grief,
it is betrayal.

How do I trust a therapist,
when I cannot even trust the one
who recommended them?

I know there is light in this world.
But darkness has pressed itself so close,
it blinds me to the brightness of others.
Still, I whisper—
there is light.

So yes,
I laugh bitterly and say,
"I have trust issues."
But no,
I am not a victim.
I am a survivor
waiting for peace to return.`}
            </Poem>
            <WiseQuote>
              "Trust is built in drops and lost in buckets."
            </WiseQuote>
            <ReflectionQuestion>
              When your trust has been broken, what small steps help you rebuild it—with yourself, or with others?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-4':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Four: The Silence After the Calls</h2>
            <Poem>
{`The phone doesn't ring anymore.
No soft buzz at midnight saying,
"I'll be home soon."
No morning reminders
that somewhere out there,
you were saving lives
while losing pieces of your own.

Now there is only silence—
a silence that hums louder than sound.

I still reach for my phone,
still wait for your name to light up the screen.
Sometimes I whisper,
"Did you eat today?"
"Are you resting?"
But the air stays still.

Grief doesn't always scream.
Sometimes,
it just turns off the sound
and watches you try to fill it with meaning.`}
            </Poem>
            <WiseQuote>
              "Death ends a life, not a relationship." — Mitch Albom
            </WiseQuote>
            <ReflectionQuestion>
              Whose voice do you still listen for in the silence?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-5':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Five: The Ones Who Stayed</h2>
            <Poem>
{`After the noise faded,
there were a few who stayed.

They didn't come for the story—
they came because love
doesn't need an audience.

They sat in the silence with me,
didn't tell me to "be strong,"
just stayed.

Grief reveals what joy can hide.
When life shattered,
the ones who stayed
became my temple.`}
            </Poem>
            <WiseQuote>
              "In the end, we remember not the words of our enemies, but the silence of our friends." — Martin Luther King Jr.
            </WiseQuote>
            <ReflectionQuestion>
              Who stood beside you when everything fell apart?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-6':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Six: Burnout Took You First</h2>
            <Poem>
{`They called you the healer.
You carried others' storms
until your own skies broke.

You gave comfort while drowning.
You taught that doctors are human,
but the world treated you like a machine.

Burnout took you before the darkness did.
If only healers were allowed to heal too.`}
            </Poem>
            <WiseQuote>
              "You can't pour from an empty cup—but many healers die trying."
            </WiseQuote>
            <ReflectionQuestion>
              Where in your life do you need to rest before you break?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-7':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Seven: Conversations with the Dead</h2>
            <Poem>
{`They say the dead are silent.
But I still hear you—
in dreams, in wind, in the hum of night.

Grief is faith in disguise,
a belief that love doesn't vanish—
it just changes address.`}
            </Poem>
            <WiseQuote>
              "Those we love don't go away; they walk beside us every day."
            </WiseQuote>
            <ReflectionQuestion>
              If you could speak once more to someone you've lost, what would you say?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-8':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Eight: The Betrayal That Followed</h2>
            <Poem>
{`I thought death would be the hardest part.
But the silence after you were gone
became a battlefield.

They came with sympathy in their mouths
and greed in their hands.

They buried you,
then tried to bury the truth beside you.
But I will keep digging
until the earth confesses what they did.

This isn't revenge.
It's remembrance.`}
            </Poem>
            <WiseQuote>
              "The truth is like a lion; let it loose—it will defend itself."
            </WiseQuote>
            <ReflectionQuestion>
              When you've been betrayed, what helps you rise—anger, forgiveness, or truth?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-9':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Nine: The Mirror of Me</h2>
            <Poem>
{`For a long time,
I didn't recognize myself.
Grief had rearranged me.

But slowly,
I began to see strength—
not the kind that fights,
but the kind that endures.

Now the mirror shows a woman reborn.`}
            </Poem>
            <WiseQuote>
              "And then one day she discovered she was fierce and full of fire."
            </WiseQuote>
            <ReflectionQuestion>
              When you look at yourself now, what part of you is returning?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-10':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Ten: Learning to Breathe Again</h2>
            <Poem>
{`It happened quietly—
a laugh, a sunrise, a taste of peace.
Healing came like dawn,
soft and steady.

Grief doesn't leave—
it just learns to sit beside you as you live.`}
            </Poem>
            <WiseQuote>
              "Healing is not about becoming who you were before. It's about letting who you are now be loved too."
            </WiseQuote>
            <ReflectionQuestion>
              What small sign tells you that you're beginning to heal?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-11':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Eleven: The Garden of Light</h2>
            <Poem>
{`I pressed one seed into the earth
and whispered, "Grow where he once stood."

And it did.
The garden became my heart—
a place where loss became soil
and love became light.`}
            </Poem>
            <WiseQuote>
              "Where flowers bloom, so does hope."
            </WiseQuote>
            <ReflectionQuestion>
              What part of your pain can you turn into something living?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'chapter-12':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Chapter Twelve: For the Ones Who Will Come After</h2>
            <Poem>
{`To our children,
and to every soul learning to live again—
this is for you.

Guard your peace.
Love with integrity.
Rise when it's hard.

Our story began with heartbreak,
but it doesn't end there.
It continues every time you choose light over fear.`}
            </Poem>
            <WiseQuote>
              "A legacy is not what we leave behind for people; it's what we leave within them."
            </WiseQuote>
            <ReflectionQuestion>
              What legacy do you want your love to leave behind?
            </ReflectionQuestion>
          </motion.div>
        );

      case 'closing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Closing Note</h2>
            <Poem>
{`If you have walked through betrayal,
if you have buried your heart and still dared to love again—
you are already a survivor.

May these pages remind you
that loss does not define you.
What you create after it does.

Keep planting light,
even in dark soil.

— Ruby Dobry`}
            </Poem>
          </motion.div>
        );

      default:
        return <p className="text-gray-600">Section not found.</p>;
    }
  };

  return (
    <div className="prose prose-lg max-w-none">
      {renderContent()}
    </div>
  );
}