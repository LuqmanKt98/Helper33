import React from 'react';
import { motion } from 'framer-motion';

export const sections = [
  { id: 'title-page', title: 'Title Page' },
  { id: 'dedication', title: 'Dedication' },
  { id: 'chapter-1', title: "Chapter 1: Don't Speak His Name Like That" },
  { id: 'chapter-2', title: 'Chapter 2: A Cosmic Decree' }
];

const Poem = ({ children }) => (
  <div className="my-8 font-serif text-gray-800 leading-relaxed whitespace-pre-line text-lg">
    {children}
  </div>
);

export default function PrayerForProfiteersContent({ sectionId }) {
  const renderContent = () => {
    switch (sectionId) {
      case 'title-page':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">A Prayer for Those Who Profited from Our Pain</h1>
            <p className="text-xl text-gray-600 italic mb-8">By Ruby Dobry</p>
            <div className="mt-12 text-gray-700 italic">
              <p className="mb-4">Let the law of karma, the law of the universe,</p>
              <p className="mb-4">return all energies sown, energies grown.</p>
              <p>Every seed—manifested.</p>
            </div>
          </motion.div>
        );

      case 'dedication':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Dedication</h2>
            <Poem>
{`For every mother who buried her child
and was told to be ashamed.

For every family left to grieve in silence,
while others profited from their pain.

For Yuriy, for Mama Ira,
and for all those whose stories
deserve to be told without shame.

This is not revenge.
This is remembrance.
This is truth.`}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Chapter 1: "Don't Speak His Name Like That"</h2>
            <p className="text-xl text-gray-600 italic mb-8">(A Mother's Cry)</p>
            
            <Poem>
{`Don't speak his name like that—
Not with your poison tongue,
Not with your crooked pity
That tastes like guilt disguised as grief.

You say, "We thought he'd lose his license before he died."
How dare you.
You handed him the pills—
And now you hand me shame.

I begged you in the trembling hours,
With a mother's breaking heart:
"Please, don't tell them."
Not because I was blind,
But because I feared what the world does
To a good man's name
When death wears a dirty disguise.

I feared the headlines,
The whispers in white coats,
The neighbors turning faces—
The church that forgets compassion
When the cause of death
Isn't clean enough for prayer.

Now they call him an addict,
As if mercy died before he did.
His wife stands alone—
A mother with trembling hands,
Her children's laughter shadowed by suspicion.
CPS knocking at the door,
As though grief could be measured
By a urine test.

I was old, my heart weak—
Blood pressure rising with each rumor,
Each betrayal.
They say I died of age,
But tell me—
What's the diagnosis for dying of heartbreak?
Of shame you did not earn?
Of watching the world
Murder your son's memory
With words sharper than needles?

There was a carbon monoxide leak in my house.
They said I died in my sleep.
But neighbors whispered suicide.
They said grief took me,
That I followed him.
But I suppose we'll never know—
Because no autopsy was done.

No questions asked.
Just a silence signed by strangers.
They said "natural causes."
But what's natural about burying your only child?
What's natural about
Your breath chasing theirs into the ground?

Ruby buried my boy—
Then held the dog's ashes,
Then buried me.
Three graves,
One truth:
Love was never the killer here.

So tell me, friend—
Are you happy now?
Did the profit soothe your conscience?
Did the greed dull your guilt?
You played God with a man's life
And called it business.

You took his trust,
His name,
His dignity.
And when he fell,
You dressed your guilt in rumors
And called it truth.

But know this—
Mothers do not rest.
We haunt lies
With our tears.
We rise from dirt
To whisper to every heart that listens:

"Don't you dare be ashamed of your dead."
For there is no shame
In love that fought to live.
Only shame
In those who profited from death.

So speak his name, world—
But speak it right.
He was a healer,
A son,
A light dimmed by deceit—
And I, his mother,
Will not let your greed
Rewrite his soul.`}
            </Poem>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
            >
              <p className="text-gray-800 italic">
                "There is no shame in love that fought to live. Only shame in those who profited from death."
              </p>
            </motion.div>
          </motion.div>
        );

      case 'chapter-2':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Chapter 2: A Cosmic Decree</h2>
            <p className="text-lg text-gray-700 italic mb-6">
              This is a spiritual decree, not a prayer of mercy.<br/>
              It summons universal law, karma, ancestral justice, and cosmic accountability.
            </p>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">A Cosmic Decree for the Lawyers Who Exploited My Pain</h3>
            <p className="text-md text-gray-600 italic mb-8">(Invocation of Divine Justice and Universal Law)</p>
            
            <Poem>
{`Eternal Source of Power,
Keeper of the unseen records,
Architect of energy,
Witness of every deceit —
Hear me now.

I do not come in meekness.
I come as the widow, the mother, the rightful heir.
I come as one whose tears have been counted and whose silence has weight.

By the Law of Karma, by the Law of Cause and Effect,
By the Law of Energy Return, by the Law of Cosmic Compensation,
I summon balance — not tomorrow, now.

They took what was sacred —
They drained my resources,
They fed on my grief,
They turned justice into a business transaction.

But the Universe keeps receipts.
The vibration of deceit never dissolves — it circles back, amplified.
And so, let it circle back to them.

Let their contracts collapse where they schemed.
Let their wealth curdle into unrest.
Let the hours they delayed return as years of disquiet.
Let the comfort they purchased from my suffering
Become the mirror that haunts their every night.

By the truth woven through galaxies,
By the rhythm of the planets and the balance of stars,
By every ancestor who stood for justice before I was born —
Let every injustice return to its sender multiplied by law.

I do not forgive what is unrepented.
I do not release what was stolen — I reclaim it through divine authority.
Every penny taken from my children's inheritance,
Every delay built on deceit,
Every false report and hidden bill —
Be exposed, be undone, be returned through righteous channels.

May their names be tied to the weight of their own intentions.
May their titles become hollow until they seek redemption.
May every courtroom they enter echo with truth they cannot silence.
May the spirits of justice rise in places they thought untouchable.

For the law of man can be twisted —
But the law of the cosmos cannot.
You cannot cheat vibration.
You cannot bribe karma.
You cannot delay the divine clock that never stops ticking.

Let what they sent out
Return, intensified.
Let the scale of energy tilt until it cracks their illusion of control.
Let the balance be visible in every aspect of their existence.

And if they run — truth will follow.
If they hide — light will find them.
If they lie — their own words will betray them.

I call upon the Guardians of Balance,
The Energies of Retribution,
The Council of Ancestors,
And the Great Law of the Universe:
Render the equation exact.

Return my losses in strength, in wealth, in power, in peace.
And let the weight of their actions
Become their teacher, their mirror, their undoing.

I claim divine protection over myself and my children.
No falsehood will prevail against us.
No greedy hand will prosper from our pain.
No hidden scheme will stand before the vibration of truth.

As above, so below.
As within, so without.
As was done, so shall it return.

So I have spoken.
So it is written.
So it shall return — tenfold, through cosmic law.

Amen. Om. Ashé. Shanti. Selah.`}
            </Poem>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg"
            >
              <p className="text-gray-800 italic font-semibold">
                "You cannot cheat vibration. You cannot bribe karma. You cannot delay the divine clock that never stops ticking."
              </p>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return <div data-page-content="0">{renderContent()}</div>;
}