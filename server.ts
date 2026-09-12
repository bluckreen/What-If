import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Contextual procedural generator that extracts keywords and generates themed thoughts
function generateContextualThoughts(situation: string, round: number, previousThoughts: string[] = []): string[] {
  const cleanSituation = situation.trim().replace(/[.,?!]+$/, "");
  const lower = cleanSituation.toLowerCase();
  const lastThought = previousThoughts.length > 0 ? previousThoughts[previousThoughts.length - 1] : "";

  // Helper to extract a subject keyword or phrase
  let topic = cleanSituation;
  if (topic.length > 40) {
    topic = topic.substring(0, 40) + "...";
  }

  // Detect domain
  const isWork = /boss|work|job|colleague|coworker|client|meeting|presentation|email|slack|teams|office|fired|promotion|manager|reply all/i.test(lower);
  const isTexting = /text|message|replied|reply|read|delivered|dm|chat|ghost|instagram|snap|seen|phone|whatsapp/i.test(lower);
  const isHome = /stove|oven|door|lock|locked|keys|house|apartment|iron|candle|tap|water|fire|kitchen|garage|window/i.test(lower);
  const isSocial = /waved|wave|stared|smile|laugh|awkward|blunder|tripped|hug|handshake|said|spoke|stranger|party|eye contact/i.test(lower);
  const isPet = /dog|cat|pet|puppy|kitten|bark|meow|vet/i.test(lower);
  const isBody = /hair|haircut|teeth|food|stomach|clothes|outfit|smell|breath|weight|gym|face|acne/i.test(lower);

  if (isWork) {
    const rounds: Record<number, string[]> = {
      1: [
        `Maybe everyone was too busy with their own deadlines to notice ${topic}.`,
        `Maybe my manager thought it was completely normal and didn't think twice.`,
        `Maybe the email got caught in spam and nobody even saw it.`,
        `Maybe someone else did something way more awkward five minutes later.`,
        `Maybe this will be completely forgotten by tomorrow morning's standup.`
      ],
      2: [
        `Wait, why did my manager's Slack status change to 'In a meeting' right after?`,
        `Did that coworker's polite 'Thanks!' actually have an aggressive undertone?`,
        `Someone just typed and stopped typing in the general channel three times.`,
        `HR just scheduled a company-wide 'Refresher on Professional Conduct'.`,
        `My desk feels slightly further away from the coffee machine than it was yesterday.`
      ],
      3: [
        `Leadership is currently having an emergency summit solely to discuss ${topic}.`,
        `They are drafting a severance package wrapped in passive-aggressive bubble wrap.`,
        `My name has been replaced on the org chart with a question mark.`,
        `IT has quietly revoked my administrative access to the water cooler.`,
        `The entire executive suite is reviewing the security footage in slow motion.`
      ],
      4: [
        `I need to fake an urgent witness protection transfer and move to Patagonia.`,
        `If I wipe my hard drive with a rare earth magnet, will my career reset to Level 1?`,
        `I will now communicate exclusively through interpretive dance and calendar invites.`,
        `My LinkedIn profile has preemptively updated my title to 'Former Employee / Cautionary Tale'.`,
        `The company mascot has been instructed to avoid shaking my hand.`
      ],
      5: [
        `The global economy is teetering on collapse because of ${topic}.`,
        `Alien civilizations are analyzing this workplace blunder as proof of human decline.`,
        `I must build a fortress out of discarded cardboard boxes under my desk and never leave.`,
        `History books will dedicate Chapter 14 to my unprecedented corporate catastrophe.`,
        `This is fine. Unemployment will give me more time to stare at ceilings.`
      ]
    };
    return rounds[Math.min(round, 5)] || rounds[1];
  }

  if (isHome) {
    const rounds: Record<number, string[]> = {
      1: [
        `Muscle memory probably took care of it and I did check before leaving.`,
        `It's physically impossible for anything bad to happen in just a few hours.`,
        `I distinctly remember hearing the reassuring click of it shutting off.`,
        `Even if I didn't, modern appliances have built-in safety shutoffs for this.`,
        `My brain is just inventing panic because it has nothing else to do today.`
      ],
      2: [
        `Wait... did I actually feel the dial turn, or am I remembering last Tuesday?`,
        `Why did the hallway air feel 0.4 degrees warmer as I stepped out?`,
        `The cat was looking at me with what can only be described as profound pity.`,
        `What if the fail-safe mechanism itself suffered a minor existential crisis?`,
        `I should probably turn around right now and drive 40 miles back to check.`
      ],
      3: [
        `The fire department has likely set up their command center on my welcome mat.`,
        `My insurance company is already composing a poetic denial letter.`,
        `The neighborhood group chat is currently voting on who inherits my parking spot.`,
        `Local seismologists have detected localized tectonic rumbles originating from my hallway.`,
        `A news helicopter is currently circling my roof broadcasting live updates.`
      ],
      4: [
        `I need to sprint back, breach the front door like a SWAT operative, and dive onto the floor.`,
        `If the building disappears, at least I won't have to clean the bathroom this weekend.`,
        `I should immediately apply for asylum at the nearest embassy before the smoke clears.`,
        `I am legally adopting a nomadic lifestyle in the deep woods effective immediately.`,
        `My smoke detector has unionized and is refusing to beep without hazard pay.`
      ],
      5: [
        `The cosmic order was calibrated over 14 billion years specifically to incinerate my kitchen.`,
        `The laws of thermodynamics have conspired against my household peace of mind.`,
        `I am spiritually linked to the apartment; if it burns, my ghost will still owe rent.`,
        `NASA satellites have redirected their cameras to witness my domestic failure in 4K.`,
        `This is fine. Ash and rubble is a very popular brutalist architectural trend.`
      ]
    };
    return rounds[Math.min(round, 5)] || rounds[1];
  }

  if (isSocial) {
    const rounds: Record<number, string[]> = {
      1: [
        `They were probably distracted and didn't even notice what I did.`,
        `People are way too focused on their own lives to register my micro-blunder.`,
        `It looked completely natural and confident from an outside perspective.`,
        `They probably assumed I was greeting someone right behind them.`,
        `Nobody will remember this for more than seven seconds.`
      ],
      2: [
        `Wait, they definitely paused and squinted at me with unmistakable confusion.`,
        `Did their left eyebrow twitch upwards in silent social judgment?`,
        `A bystander three yards away just took out their phone to record.`,
        `My face is radiating enough heat to melt butter across the room.`,
        `They are 100% recounting this encounter to their group chat right now.`
      ],
      3: [
        `A dedicated Reddit thread titled 'Witnessed the most awkward human alive' is trending.`,
        `Everyone who witnessed ${topic} is forming a lifelong pact of shared second-hand embarrassment.`,
        `Psychology professors will use footage of this encounter in introductory lectures.`,
        `The person I blundered in front of has legally taken out a restraining order against my vibes.`,
        `I should smoothly pretend I was experiencing a rare neurological reflex.`
      ],
      4: [
        `I must immediately change my name, shave my eyebrows, and start over in Greenland.`,
        `If I fake a sudden bout of amnesia, maybe they'll feel too guilty to laugh.`,
        `I should walk backwards into the nearest hedge like Homer Simpson and never return.`,
        `My social credit score has plummeted into sub-aquatic territory.`,
        `I will henceforth communicate exclusively via carrier pigeon from an undisclosed cellar.`
      ],
      5: [
        `The universe orchestrated millions of years of human evolution to produce this exact cringe.`,
        `Every ancestor in my genetic lineage is collectively shaking their head in the spirit realm.`,
        `I am radiating an aura of awkwardness detectable by migratory birds.`,
        `The only rational solution is to dissolve into carbon and join the soil.`,
        `This is fine. I never liked interacting with carbon-based organisms anyway.`
      ]
    };
    return rounds[Math.min(round, 5)] || rounds[1];
  }

  // Universal dynamic context generator incorporating user's exact dilemma & latest chosen thought
  const rounds: Record<number, string[]> = {
    1: [
      `Maybe regarding "${topic}", everything is actually completely fine and normal.`,
      `Maybe I'm projecting my own stress onto "${topic}" when nobody else noticed.`,
      `Maybe the simplest explanation is the true one and there is no hidden meaning.`,
      `Maybe within twenty-four hours, "${topic}" won't even matter at all.`,
      `Maybe I should just take a deep breath and let "${topic}" resolve itself.`
    ],
    2: [
      `Wait... if "${topic}" was truly fine, why did my gut make that weird sinking noise?`,
      `Did anyone notice that subtle pause right when "${topic}" happened?`,
      `What if the quietness around "${topic}" is actually the calm before the storm?`,
      `There is a 43% chance that "${topic}" is an indicator of a much deeper complication.`,
      `Why can I not stop replaying the exact five seconds of "${topic}" in high definition?`
    ],
    3: [
      `People are definitely whispering in private about "${topic}" behind closed doors.`,
      `This is escalating from a harmless incident with "${topic}" into a multi-tiered disaster.`,
      `My subconscious is constructing an airtight legal prosecution regarding "${topic}".`,
      `I have analyzed seventeen different catastrophe timelines stemming from "${topic}".`,
      `What if "${topic}" is the exact turning point where my peaceful life went off the rails?`
    ],
    4: [
      `I must formulate an elaborate 8-step evacuation protocol to escape "${topic}".`,
      `If I relocate to an uncharted volcanic island, will "${topic}" still follow me?`,
      `I should draft a public statement denying all personal association with "${topic}".`,
      `My internal crisis team is recommending a complete identity makeover and plastic surgery.`,
      `If I throw all my electronics into a blender, will the consequences of "${topic}" disappear?`
    ],
    5: [
      `The cosmic fabric of spacetime was woven 13.8 billion years ago specifically to engineer "${topic}".`,
      `Philosophers will study "${topic}" for centuries as the peak paradox of human existence.`,
      `I am now spiritually entangled with "${topic}"; we are an inseparable singularity of chaos.`,
      `The simulation administrators are currently pointing at my screen laughing hysterically about "${topic}".`,
      `This is fine. Total surrender to absurdity is the only path left forward.`
    ]
  };

  return rounds[Math.min(round, 5)] || rounds[1];
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// In-memory cache for ultra-fast repeated/similar requests
const thoughtsCache = new Map<string, string[]>();

app.post("/api/overthink", async (req, res) => {
  try {
    const { situation, round, previousThoughts = [] } = req.body;
    const client = getGeminiClient();

    // Cache key based on situation, round, and last thought
    const lastThought = previousThoughts.length > 0 ? previousThoughts[previousThoughts.length - 1] : "";
    const cacheKey = `${situation.trim().toLowerCase()}_r${round}_${lastThought.slice(0, 30)}`;
    if (thoughtsCache.has(cacheKey)) {
      return res.json({
        thoughts: thoughtsCache.get(cacheKey),
        source: "cache"
      });
    }

    const roundNames = [
      "Round 1: Reasonable possibilities",
      "Round 2: Slightly suspicious possibilities",
      "Round 3: Clearly overthinking",
      "Round 4: Ridiculous possibilities",
      "Round 5: Completely unnecessary / absurd possibilities"
    ];

    const currentStageName = roundNames[Math.min(round - 1, 4)];

    const stageGuidelines = [
      "Round 1 (Reasonable): Plausible everyday explanations with subtle subconscious doubts (e.g. harmless oversights, normal human distractions, muscle memory).",
      "Round 2 (Slightly suspicious): Over-analyzing tiny micro-details (micro-expressions, punctuation, background noises, slight delays, weird gut feelings).",
      "Round 3 (Clearly overthinking): Escalating conspiracy theories, group chat gossip, extreme assumptions, multi-tier societal judgment.",
      "Round 4 (Ridiculous): Unhinged dramatic overreactions (fake IDs, moving to remote tundra, drastic identity resets, catastrophic social exile).",
      "Round 5 (Absurdity Maximum): Cosmic existential delirium, timeline collapses, simulation bugs, surreal philosophical chaos."
    ];

    const currentStageGuideline = stageGuidelines[Math.min(round - 1, 4)];

    if (client) {
      // Primary: gemini-3.1-flash-lite (fastest inference, low latency)
      // Fallback: gemini-3.8-flash, gemini-3.6-flash
      const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash"];

      const latestFixation = previousThoughts.length > 0 ? previousThoughts[previousThoughts.length - 1] : null;

      const prompt = `You are the chaotic, hilarious inner monologue in the indie comedy simulator 'WHAT IF...? The Overthinking Machine'.

USER'S CURRENT DILEMMA:
"${situation}"

${previousThoughts.length > 0 ? `PREVIOUS FIXATION CHOSEN: "${latestFixation}"` : "Starting Round 1 - Fresh dilemma."}

CURRENT SPIRAL DEPTH: Round ${round} of 5 (${currentStageName})

CRITICAL MANDATORY INSTRUCTIONS:
1. Every single one of the 5 thoughts MUST directly relate to the user's specific dilemma ("${situation}").
2. ${latestFixation ? `The 5 possibilities MUST specifically branch from and escalate their chosen fixation: "${latestFixation}". Take this thought deeper into paranoia, consequence, and comedy!` : `Offer 5 distinct, funny interpretations of their initial dilemma.`}
3. STRICT PROHIBITION: DO NOT output generic texting/message thoughts UNLESS the dilemma is specifically about texting. If the user wrote about a stove, a haircut, an awkward wave, an interview, a pet, a meeting, or an elevator, EVERY thought must be 100% about THAT subject!
4. Tone for this round: ${currentStageGuideline}
5. Keep each thought punchy, vivid, and funny (10-20 words max). Avoid emojis.
6. Return EXACTLY 5 distinct possibilities matching the JSON schema.`;

      for (const modelName of candidateModels) {
        try {
          // Wrap in a 3.8s timeout per model attempt so slow responses don't stall the UI
          const generatePromise = client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              maxOutputTokens: 250,
              temperature: 0.9,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  thoughts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Array of exactly 5 distinct, context-specific thought options"
                  }
                },
                required: ["thoughts"]
              }
            }
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout waiting for model response")), 3800)
          );

          const response: any = await Promise.race([generatePromise, timeoutPromise]);

          if (response?.text) {
            const parsed = JSON.parse(response.text);
            if (Array.isArray(parsed.thoughts) && parsed.thoughts.length >= 4) {
              const selectedThoughts = parsed.thoughts.slice(0, 5);
              // Save in cache
              if (thoughtsCache.size > 200) {
                const firstKey = thoughtsCache.keys().next().value;
                if (firstKey) thoughtsCache.delete(firstKey);
              }
              thoughtsCache.set(cacheKey, selectedThoughts);

              return res.json({
                thoughts: selectedThoughts,
                source: modelName
              });
            }
          }
        } catch (modelError) {
          console.warn(`Model ${modelName} delayed or failed, trying fallback:`, modelError);
        }
      }
    }

    // Dynamic Context-Aware Procedural Fallback if AI is slow or offline
    const thoughts = generateContextualThoughts(situation, round, previousThoughts);

    return res.json({
      thoughts,
      source: "contextual-procedural"
    });
  } catch (err) {
    console.error("Overthink route error:", err);
    res.status(500).json({ error: "Failed to generate thoughts" });
  }
});

async function startServer() {
  // Serve static files from /public directory (audio, assets, etc.)
  app.use(express.static(path.join(process.cwd(), "public")));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
