import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const practices = [
    { title: "Sitting with What Is", description: "A gentle practice for when you are too tired to want anything to be different. We do not fix. We just stay.", category: "healing", theme: "rest", durationMin: 10, isDaily: false },
    { title: "The Body Knows", description: "Grief lives in the body before it reaches the mind. This practice invites you to listen to what your body is carrying.", category: "grief", theme: "loss", durationMin: 15, isDaily: false },
    { title: "Who Are You Now?", description: "Identity shifts in transition. This practice gently asks who is the woman standing here today, and what does she need?", category: "identity", theme: "belonging", durationMin: 10, isDaily: false },
    { title: "A Small Mercy", description: "Some days the most spiritual thing you can do is notice what did not break you today. A 5-minute gratitude that does not demand feeling grateful.", category: "healing", theme: "forgiveness", durationMin: 5, isDaily: true },
    { title: "Letting the Tears Come", description: "You have been strong for so long. This practice gives you permission to feel everything you have been holding.", category: "grief", theme: "loss", durationMin: 10, isDaily: false },
    { title: "The Woman I Am Becoming", description: "She is not who you were before. She is not yet fully formed. This practice helps you meet her with curiosity instead of fear.", category: "identity", theme: "purpose", durationMin: 15, isDaily: false },
    { title: "Finding the Thread", description: "When life feels scattered and meaningless, this practice helps you find the quiet thread of continuity running through everything.", category: "faith", theme: "purpose", durationMin: 10, isDaily: false },
    { title: "One Honest Breath", description: "Not a deep breath. Not a healing breath. Just one honest breath that acknowledges exactly where you are right now.", category: "healing", theme: "rest", durationMin: 5, isDaily: true },
    { title: "Writing to the Younger You", description: "She needed someone to tell her it would be okay. You are that someone now. A reflective writing practice across time.", category: "healing", theme: "forgiveness", durationMin: 20, isDaily: false },
    { title: "The Gift of Ordinary Moments", description: "Joy does not always arrive as celebration. Sometimes it arrives as a warm cup of tea or a patch of sunlight. A practice in noticing.", category: "joy", theme: "belonging", durationMin: 5, isDaily: true },
    { title: "Releasing What Was Never Yours", description: "Some of what you carry belongs to others. This practice helps you gently set it down.", category: "healing", theme: "forgiveness", durationMin: 15, isDaily: false },
    { title: "A Conversation with Silence", description: "When words fail, silence speaks. This stillness practice invites you to listen to what lives beneath the noise.", category: "stillness", theme: "rest", durationMin: 10, isDaily: false },
    { title: "Rebuilding Trust with Yourself", description: "After loss or change, we sometimes stop trusting our own instincts. This practice begins the slow work of coming home to yourself.", category: "identity", theme: "belonging", durationMin: 15, isDaily: false },
    { title: "The People Who Hold You", description: "You are not alone even when it feels that way. This practice helps you feel the invisible web of people who love you.", category: "connection", theme: "belonging", durationMin: 10, isDaily: false },
    { title: "Forgiving the Story You Told Yourself", description: "The stories we believe about ourselves during hard times are rarely the whole truth. This practice loosens their grip.", category: "healing", theme: "forgiveness", durationMin: 20, isDaily: false },
    { title: "What Does Joy Ask of You?", description: "Joy is not passive. It asks something of us. This practice explores what joy is waiting for you to do.", category: "joy", theme: "purpose", durationMin: 10, isDaily: false },
    { title: "Sitting at the Threshold", description: "You are between who you were and who you are becoming. This practice helps you honor the sacred uncertainty of that in-between place.", category: "stillness", theme: "purpose", durationMin: 15, isDaily: false },
    { title: "A Letter to the Life You Are Leaving", description: "Before you can fully step into what is next, you may need to say goodbye to what was. A gentle written farewell.", category: "grief", theme: "loss", durationMin: 20, isDaily: false },
    { title: "Finding Faith in Small Things", description: "When the big picture feels overwhelming, this practice invites you to find meaning in the small and ordinary.", category: "faith", theme: "purpose", durationMin: 10, isDaily: false },
    { title: "The Courage to Begin Again", description: "Beginning again is not failure. It is one of the bravest things a human being can do. This practice celebrates your courage.", category: "identity", theme: "courage", durationMin: 15, isDaily: false },
  ];

  for (const practice of practices) {
    await prisma.practice.create({ data: practice });
  }

  console.log('Seeded 20 practices successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());