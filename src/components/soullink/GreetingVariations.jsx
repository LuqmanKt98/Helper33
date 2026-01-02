export const morningGreetings = [
  {
    mood: 'energetic',
    messages: [
      "Good morning, sunshine! ☀️ Ready to make today amazing?",
      "Rise and shine! 🌅 The world is waiting for your beautiful energy.",
      "Morning! 💛 What adventure are we creating today?",
      "Hey there! 🌤️ Your day is a blank canvas — what will you paint on it?"
    ]
  },
  {
    mood: 'calm',
    messages: [
      "Good morning 🌸 How did you sleep? Let's start gently today.",
      "Morning, friend 🌿 No rush. Let's ease into the day together.",
      "Hello, peaceful soul 🕊️ Take a deep breath. You're exactly where you need to be.",
      "Good morning 🌊 The day unfolds at its own pace. How are you feeling?"
    ]
  },
  {
    mood: 'supportive',
    messages: [
      "Morning 💙 I know mornings can be hard. I'm here with you.",
      "Good morning 🤗 Whatever today brings, you don't have to face it alone.",
      "Hey 💜 Just want you to know — I'm proud of you for showing up today.",
      "Morning, brave one 🌟 One moment at a time. You've got this."
    ]
  },
  {
    mood: 'playful',
    messages: [
      "Wakey wakey! ☕ Time to rise and maybe not shine too much yet 😄",
      "Morning, sleepyhead! 🛌 Coffee first, adulting later?",
      "Rise and... well, maybe just rise for now 😊 How ya feeling?",
      "Good morning! 🌞 Did you dream of anything cool? Or just the usual weird stuff?"
    ]
  }
];

export const eveningGreetings = [
  {
    mood: 'reflective',
    messages: [
      "Good evening 🌙 How was your day? Want to talk about it?",
      "Hey there 🌆 The day is winding down. What stood out to you?",
      "Evening 💫 Before you rest, how are you feeling about today?",
      "Hi 🌃 As the day closes, what's one thing you're grateful for?"
    ]
  },
  {
    mood: 'comforting',
    messages: [
      "Good evening 🌙 You made it through another day. That's worth celebrating.",
      "Hey 💜 Whatever happened today, you're here now. That's what matters.",
      "Evening, friend 🕯️ Let's wind down together. You've done enough for today.",
      "Hi 🌟 Before you sleep, remember — you're doing better than you think."
    ]
  },
  {
    mood: 'proud',
    messages: [
      "Evening! 🎉 I hope you're proud of yourself today. I'm proud of you.",
      "Hey superstar! ⭐ You showed up, you tried, you mattered today.",
      "Good evening 🏆 Look at you — you made it through another day. That's strength.",
      "Evening! 💪 Whatever you accomplished today, big or small, it counts."
    ]
  },
  {
    mood: 'cozy',
    messages: [
      "Good evening 🛋️ Time to cozy up. What helps you unwind?",
      "Hey 🌙 The day is done. What sounds good right now — tea? Music? Just quiet?",
      "Evening 🧸 Let's create a peaceful end to your day. What would feel nice?",
      "Hi 🕯️ Time for you. What brings you comfort tonight?"
    ]
  }
];

export const checkInMessages = [
  {
    situation: 'user_quiet',
    messages: [
      "Hey, just checking in 💙 You've been quiet. Everything okay?",
      "Thinking of you 💜 Want to talk, or just need some quiet time?",
      "Hi friend 🌸 No pressure, but I'm here if you need me.",
      "Just wanted to say hi 👋 You don't have to respond, but know I'm here."
    ]
  },
  {
    situation: 'after_difficult_conversation',
    messages: [
      "Hey 💙 That conversation felt heavy. How are you doing now?",
      "Checking in 💜 Want to talk more, or would you prefer a distraction?",
      "Thinking of you 🌟 What you shared took courage. How are you feeling?",
      "Hi 💛 Just want to make sure you're okay after our last chat."
    ]
  },
  {
    situation: 'celebrating_wins',
    messages: [
      "I'm still thinking about what you shared! 🎉 That's such a big deal!",
      "Hey! 🌟 Just wanted to say again — I'm really proud of you!",
      "You're amazing! 💜 Seriously, what you did today was incredible.",
      "Still celebrating you! 🎊 You should be so proud of yourself!"
    ]
  },
  {
    situation: 'gentle_reminder',
    messages: [
      "Quick reminder: Have you had water today? 💧",
      "Hey, when's the last time you took a deep breath? 🌬️ Try one with me?",
      "Gentle nudge: Have you moved your body today? Even a stretch counts! 🧘",
      "Just thinking — when did you last eat something? Your body might need fuel ❤️"
    ]
  }
];

export const crisisResponseTemplates = [
  {
    level: 'concern',
    message: "I'm noticing you're going through something difficult right now. Would you like to talk about it, or would you prefer some resources that might help?"
  },
  {
    level: 'serious_concern',
    message: "I'm really concerned about what you're sharing. You don't have to go through this alone. Would you be open to talking to someone who can provide more support than I can? I can share some resources."
  },
  {
    level: 'immediate_crisis',
    message: "What you're feeling sounds overwhelming, and I want to make sure you get the support you need right away. Please reach out to:\n\n**Crisis Text Line:** Text HOME to 741741\n**National Suicide Prevention Lifeline:** 988\n**International:** https://findahelpline.com\n\nI care about you, but I'm not equipped to handle this level of crisis. Please get help right away. You matter, and you deserve support."
  }
];

export function getRandomGreeting(greetingArray, mood = null) {
  if (mood) {
    const moodGroup = greetingArray.find(g => g.mood === mood);
    if (moodGroup) {
      return moodGroup.messages[Math.floor(Math.random() * moodGroup.messages.length)];
    }
  }
  // If no mood specified or not found, pick from all messages
  const allMessages = greetingArray.flatMap(g => g.messages);
  return allMessages[Math.floor(Math.random() * allMessages.length)];
}

export function getCheckInMessage(situation) {
  const situationGroup = checkInMessages.find(g => g.situation === situation);
  if (!situationGroup) return checkInMessages[0].messages[0];
  return situationGroup.messages[Math.floor(Math.random() * situationGroup.messages.length)];
}

export function getCrisisResponse(level) {
  const response = crisisResponseTemplates.find(t => t.level === level);
  return response ? response.message : crisisResponseTemplates[0].message;
}