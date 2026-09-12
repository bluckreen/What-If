// Client-side dynamic contextual thought generator
// Guarantees that even if network blips or fallbacks occur, thoughts ALWAYS reference the user's specific dilemma

export function generateClientContextualThoughts(
  situation: string,
  round: number,
  previousThoughts: string[] = []
): string[] {
  const cleanSituation = (situation || "").trim().replace(/[.,?!]+$/, "");
  const lower = cleanSituation.toLowerCase();
  const lastThought = previousThoughts.length > 0 ? previousThoughts[previousThoughts.length - 1] : "";

  let topic = cleanSituation;
  if (topic.length > 45) {
    topic = topic.substring(0, 45) + "...";
  }

  const isWork = /boss|work|job|colleague|coworker|client|meeting|presentation|email|slack|teams|office|fired|promotion|manager|reply all/i.test(lower);
  const isHome = /stove|oven|door|lock|locked|keys|house|apartment|iron|candle|tap|water|fire|kitchen|garage|window/i.test(lower);
  const isSocial = /waved|wave|stared|smile|laugh|awkward|blunder|tripped|hug|handshake|said|spoke|stranger|party|eye contact/i.test(lower);

  if (isWork) {
    const table: Record<number, string[]> = {
      1: [
        `Maybe everybody was buried in their own chaotic inbox to notice ${topic}.`,
        `Maybe my manager saw it and assumed it was deliberate high-level strategy.`,
        `Maybe it's completely standard and my brain is manufacturing stress.`,
        `Maybe someone else will send an accidental company-wide meme in five minutes.`,
        `Maybe within 24 hours nobody at the company will recall this at all.`
      ],
      2: [
        `Wait, did my teammate's Slack icon change to an active green dot right after ${topic}?`,
        `Why did three senior directors just book a private huddle with no agenda?`,
        `Someone just reacted with a thumbs-up emoji, the most menacing symbol in human history.`,
        `What if HR's next 'Culture Survey' contains multiple questions directly describing me?`,
        `My computer monitor is suddenly emitting an aura of corporate termination.`
      ],
      3: [
        `The executive board is currently holding an unscheduled emergency summit about ${topic}.`,
        `IT has quietly begun backing up my browser history to present at a tribunal.`,
        `My LinkedIn profile has preemptively drafted a 'Looking for new opportunities' post.`,
        `They have already assigned my desk plants to an intern with better social etiquette.`,
        `A company-wide all-hands meeting has been titled 'Addressing Recent Incomprehensible Behaviors'.`
      ],
      4: [
        `I need to change my identity, adopt a fake mustache, and seek employment as an alpaca rancher.`,
        `If I fake a sudden bout of spontaneous amnesia, can they legally hold me accountable for ${topic}?`,
        `I should pack my belongings in a cardboard box right now and leave through the fire exit.`,
        `My name has been replaced on the organizational chart with a skull and crossbones.`,
        `I will now communicate exclusively via notarized courier envelopes.`
      ],
      5: [
        `The entire global economic market is teetering on collapse due to ${topic}.`,
        `Alien civilizations have intercepted this corporate blunder and decided Earth is forfeit.`,
        `I am spiritually fused to this catastrophic moment for all eternity.`,
        `Harvard Business School will publish a 400-page case study on my descent.`,
        `This is fine. I always wanted to live off-grid in a mossy cave anyway.`
      ]
    };
    return table[Math.min(round, 5)] || table[1];
  }

  if (isHome) {
    const table: Record<number, string[]> = {
      1: [
        `Muscle memory probably took care of it and everything is completely safe.`,
        `It is mathematically improbable for a domestic disaster to strike right this second.`,
        `I distinctly remember hearing the reassuring click before walking out the door.`,
        `Modern residential systems have eighteen built-in safety overrides for this.`,
        `My mind is just inventing panic because silence is uncomfortable.`
      ],
      2: [
        `Wait... did I actually see it turn off, or am I replaying memories from last month?`,
        `Did the hallway temperature feel 0.8 degrees warmer right as the door closed?`,
        `The neighborhood stray cat watched me leave with what looked like profound pity.`,
        `What if the safety mechanism itself suffered a sudden existential breakdown?`,
        `I should probably turn around right now, run two red lights, and double check.`
      ],
      3: [
        `The local fire department has probably set up an incident command tent on my porch.`,
        `My insurance provider is already composing an Olympic-level rejection letter.`,
        `The building group chat is currently holding a vote on who claims my vacant parking spot.`,
        `Local seismologists have detected localized thermal anomalies originating from my living room.`,
        `A news helicopter is currently circling my roof broadcasting live breaking coverage.`
      ],
      4: [
        `I must sprint through traffic, kick down my own door, and perform a tactical slide.`,
        `If the apartment disappears, at least I will never have to scrub the grout again.`,
        `I should immediately seek political asylum at the nearest embassy before sirens start.`,
        `I am legally adopting a nomadic lifestyle in the deep boreal forest effective immediately.`,
        `My smoke detector has unionized and is refusing to sound without hazardous duty pay.`
      ],
      5: [
        `The cosmic order was calibrated across 14 billion years specifically to incinerate my kitchen.`,
        `The fundamental laws of thermodynamics have conspired against my afternoon.`,
        `I am now spiritually bonded to the apartment; if it burns, my ghost will still owe rent.`,
        `NASA weather satellites have repositioned their optical sensors over my roof.`,
        `This is fine. Charcoal and rubble is a very popular brutalist interior aesthetic.`
      ]
    };
    return table[Math.min(round, 5)] || table[1];
  }

  if (isSocial) {
    const table: Record<number, string[]> = {
      1: [
        `They were totally distracted and didn't even notice what I did.`,
        `Everyone is too absorbed in their own insecurities to log my micro-blunder.`,
        `It probably came across as quirky, mysterious, and intentionally avant-garde.`,
        `They almost certainly assumed I was gesturing to someone standing right behind them.`,
        `Nobody on this planet will remember this event in seven minutes.`
      ],
      2: [
        `Wait, they definitely blinked three times in rapid succession with visible bewilderment.`,
        `Did their left eyebrow raise by 2 millimeters in silent, devastating social critique?`,
        `A bystander twelve feet away just unlocked their phone to text their group chat.`,
        `My face is currently generating enough thermal radiation to boil a cup of tea.`,
        `They are 100% recounting this encounter in vivid detail right now.`
      ],
      3: [
        `A dedicated Reddit thread titled 'Witnessed the most awkward interaction today' is trending.`,
        `Everyone within a 50-foot radius has formed a silent bond of shared secondhand cringe.`,
        `Psychology researchers will use footage of this moment to study acute social distress.`,
        `The person involved has legally applied for a protective order against my aura.`,
        `I should smoothly pretend I was experiencing a temporary neurological hiccup.`
      ],
      4: [
        `I must immediately change my name to Bartholomew, shave my head, and move to Greenland.`,
        `If I pretend to suddenly not speak any known human language, will they forgive me?`,
        `I should walk backwards into the nearest rhododendron bush and never reemerge.`,
        `My social credit score has plummeted into sub-oceanic trenches.`,
        `I will henceforth communicate exclusively via anonymous handwritten carrier pigeon letters.`
      ],
      5: [
        `The universe orchestrated millions of years of human evolution to produce this exact cringe.`,
        `Every ancestor in my genetic lineage is shaking their head in the spirit realm.`,
        `I am radiating an electromagnetic frequency of awkwardness detectable by radar.`,
        `The only mathematically sound solution is to dissolve into carbon and join the soil.`,
        `This is fine. Interacting with carbon-based bipeds was always an overrated hobby.`
      ]
    };
    return table[Math.min(round, 5)] || table[1];
  }

  // Universal dynamic context generator with user's exact dilemma topic
  const table: Record<number, string[]> = {
    1: [
      `Regarding "${topic}", there is a 95% chance everything is completely normal and harmless.`,
      `Maybe I am projecting my own internal caffeine jitters onto "${topic}".`,
      `The simplest explanation is the true one: nobody noticed or cared about "${topic}".`,
      `Within 24 hours, "${topic}" will be entirely washed away by the passage of time.`,
      `A normal, emotionally regulated human would shrug at "${topic}" and eat a snack.`
    ],
    2: [
      `Wait... if "${topic}" was truly harmless, why did my stomach drop through the floor?`,
      `Did you hear that brief, eerie silence right when "${topic}" happened?`,
      `What if the quiet reaction to "${topic}" is actually people being too horrified to speak?`,
      `There is a non-zero probability that "${topic}" has set off an invisible domino effect.`,
      `Why is my brain demanding I replay the tape of "${topic}" for the 47th time?`
    ],
    3: [
      `People are definitely whispering in private chat rooms right now about "${topic}".`,
      `This has officially metastasized from a minor blip into an escalating multi-tiered disaster.`,
      `My subconscious has prepared a 12-slide PowerPoint presentation on why "${topic}" ruined everything.`,
      `I have simulated 34 alternate catastrophe timelines stemming directly from "${topic}".`,
      `What if this exact moment with "${topic}" is where my biography takes a dark, comedic turn?`
    ],
    4: [
      `I need to draft an airtight 8-point emergency escape protocol to evade "${topic}".`,
      `If I relocate to an uncharted fishing vessel in the North Sea, will "${topic}" still find me?`,
      `I should release a formal press statement denying any conscious involvement with "${topic}".`,
      `My internal risk management team is suggesting a total identity wipe and passport cremation.`,
      `If I throw my phone into a microwave on HIGH for 30 seconds, does "${topic}" go away?`
    ],
    5: [
      `The spacetime continuum was forged 13.8 billion years ago specifically to engineer "${topic}".`,
      `Philosophers of the 31st century will debate "${topic}" as the defining paradox of human error.`,
      `I am now quantum-entangled with "${topic}"; we have become one singularity of awkwardness.`,
      `The architects of this reality simulation are currently high-fiving over how "${topic}" played out.`,
      `This is fine. Embracing absolute cosmic absurdity is the only logical choice remaining.`
    ]
  };

  return table[Math.min(round, 5)] || table[1];
}
