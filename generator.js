/* =============================================
   Mini AI Marketing Agency - Generation Engine
   Rule-based, no API keys, no backend.
   ============================================= */

// --- Helpers ---
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- Template Banks ---
// Structure: TEMPLATES[language][tone][section] = [template strings, ...]
// Placeholders: {name} {type} {product} {audience} {offer} {platform}

const TEMPLATES = {
  en: {
    friendly: {
      positioning: [
        "{name} is your friendly neighbourhood {type} that makes {product} approachable for {audience}. We believe everyone deserves {product} that feels personal, so we're putting {offer} front and centre — because great things happen when a brand feels like a friend.",
        "At {name}, we're on a mission to make {product} warm, welcoming, and wonderfully simple for {audience}. Our promise: {offer}. Stop by and feel the difference a friendly {type} can make.",
        "Hi! We're {name} — a {type} built around one simple idea: {product} should bring people together. That's why we crafted {offer}, and we can't wait to share it with {audience}."
      ],
      pillars: [
        ["Behind the Scenes", "Customer Spotlights", "Tips & How-Tos"],
        ["Meet the Team", "Real Stories", "Quick Wins"],
        ["Day-in-the-Life", "Community Love", "Little Joys"]
      ],
      posts: [
        "Meet the hands behind {name} — a quick peek behind our {type} doors &#128075;",
        "{audience}, what's your favourite way to enjoy {product}? Tell us below!",
        "One small change that makes {product} even better (hint: it involves {offer}) &#128521;",
        "Customer story: how {product} became part of someone's daily routine.",
        "Poll time! Which {product} vibe are you today? A) Chill B) Energised C) Treat-yourself"
      ],
      captions: [
        "Some days call for a little extra. Today that's {product} and a smile. &#127775; #SmallBusinessLove",
        "Made for {audience}, crafted with heart. Swipe to see why {name} is different. &#128150;",
        "Life's too short for boring {product}. Lucky for you, {offer} is here. Link in bio!"
      ],
      ads: [
        "Looking for {product} that feels like it was made just for you? {name} has {offer} waiting for {audience}. Tap to discover your new favourite {type}.",
        "Your perfect {product} moment is one click away. {name} brings {offer} to {audience} — no fuss, just the good stuff."
      ],
      creative: [
        "{offer} — your new favourite {type} is here.",
        "Say hello to {name}. {product} made with love.",
        "The {type} {audience} have been waiting for."
      ]
    },

    professional: {
      positioning: [
        "{name} delivers {product} with precision and reliability for {audience}. As a trusted {type}, we combine expertise with a clear value proposition: {offer}. Our approach is measured, consistent, and built to earn your confidence.",
        "{name} is a {type} that takes {product} seriously. Serving {audience} with integrity, we've structured our offering around one clear commitment: {offer}. That's the benchmark we hold ourselves to every day.",
        "At {name}, we understand what {audience} expect from a {type}: quality, consistency, and results. Our cornerstone — {offer} — reflects our dedication to delivering {product} that professionals can rely on."
      ],
      pillars: [
        ["Industry Insights", "Case Studies", "Product Deep Dives"],
        ["Thought Leadership", "Data & Results", "Process Breakdowns"],
        ["Market Trends", "Client Success Stories", "Best Practices"]
      ],
      posts: [
        "3 data-backed reasons why {product} matters for {audience} right now.",
        "How {name} approaches quality: a look inside our {type} process.",
        "Industry insight: the trends shaping {product} this quarter.",
        "Client spotlight — measurable results we delivered with {product}.",
        "Q&A: your top questions about {product}, answered by our team."
      ],
      captions: [
        "Precision. Consistency. Results. That's the {name} standard. #QualityMatters",
        "Trusted by {audience}. Discover how {product} can work for you.",
        "Excellence isn't an accident — it's a process. {name} | {type}"
      ],
      ads: [
        "If you're {audience} seeking reliable {product}, {name} delivers. Start with {offer} and experience the difference professionalism makes.",
        "Stop compromising on {product}. {name} offers {audience} a proven solution with {offer}. Learn more today."
      ],
      creative: [
        "{name} — {product}, delivered with precision.",
        "{offer}: the professional choice for {product}.",
        "Where expertise meets {product}. {name}."
      ]
    },

    premium: {
      positioning: [
        "{name} redefines {product} for {audience} who expect nothing less than exceptional. As an elevated {type}, every detail is curated — from our signature {product} to our exclusive invitation: {offer}. This is {product}, refined.",
        "For the discerning {audience}, {name} is the {type} that sets the standard. We believe {product} should be an experience, not a transaction — which is why we created {offer}. Welcome to a higher tier.",
        "{name} is the {type} for {audience} who appreciate the extraordinary. Our philosophy is simple: {product} deserves to be exquisite. Begin with {offer} and see what premium truly means."
      ],
      pillars: [
        ["Craftsmanship Stories", "Exclusive Previews", "Curated Collections"],
        ["The Art of Quality", "Limited Editions", "Member Experiences"],
        ["Heritage & Vision", "Behind the Craft", "Connoisseur's Corner"]
      ],
      posts: [
        "The art of {product}: what goes into creating something truly exceptional at {name}.",
        "Introducing an exclusive experience for {audience} — details inside.",
        "Why quality over quantity defines every decision at our {type}.",
        "A closer look at the craftsmanship behind {name}'s signature {product}.",
        "The story of {name}: from vision to the gold standard in {type}."
      ],
      captions: [
        "Curated for {audience}. Crafted without compromise. {name} &#8212; {product} elevated.",
        "Excellence speaks for itself. Discover {name} and experience {product} at its finest.",
        "Not all {product} is created equal. {name} invites you to something better. {offer}."
      ],
      ads: [
        "For {audience} who settle for nothing less, {name} presents {product} at its most refined. Begin your journey with {offer}.",
        "Exceptional {product} for exceptional people. {name} — the premier {type} for {audience}. Claim your {offer} today."
      ],
      creative: [
        "{name}. {product}, elevated.",
        "Experience {product} at its finest. {offer}.",
        "The {type} for those who know the difference. {name}."
      ]
    },

    fun: {
      positioning: [
        "{name} is the {type} that brings {product} to life for {audience} with energy and a splash of personality. Why be boring? We're shaking things up with {offer} — because marketing should be as fun as the brands it builds.",
        "Boring {product}? Not on our watch! {name} is the {type} that puts the spark back into {product} for {audience}. Grab {offer} and let's make some noise together &#127881;",
        "Meet {name}: the {type} that's rewriting the {product} playbook for {audience}. No corporate fluff, no jargon — just bold moves and {offer}. Ready to have some fun?"
      ],
      pillars: [
        ["Fun Facts", "Challenges & Games", "Reactions & Memes"],
        ["Quizzes", "UGC Spotlights", "Surprise Drops"],
        ["This or That", "Bold Takes", "Community Creations"]
      ],
      posts: [
        "This or that: {product} edition! Which one are you picking? &#128064;",
        "Unpopular opinion: {product} should always be this good. Fight us. &#128521;",
        "Caption this! Best caption wins {offer} &#127942;",
        "Ranking every {product} from {name} — the results may shock you.",
        "Behind the chaos: 30 seconds inside {name} HQ. No filter."
      ],
      captions: [
        "Warning: may cause excessive joy and sudden love for {product}. {offer} — link in bio! &#128293;",
        "Plot twist: {product} doesn't have to be dull. {name} is proof. &#128378;",
        "Tag someone who needs {offer} in their life right now. Go on, we'll wait. &#128075;"
      ],
      ads: [
        "Tired of the same old {product}? {name} is the {type} that actually gets you. Grab {offer} and let's have some fun with it!",
        "Your {product} called — it wants a glow up. {name} has {offer} for {audience}. Don't miss out!"
      ],
      creative: [
        "Bored? Try {name}. {offer} awaits.",
        "{name}: the {type} that actually gets you.",
        "Your {product} deserves a glow up. Start with {offer}."
      ]
    }
  },

  my: {
    friendly: {
      positioning: [
        "{name} ဟာ {audience} အတွက် {product} ကို ရင်းနှီးပျူငှာစွာ ဆောင်ကျဉ်းပေးတဲ့ သင့်ရဲ့ {type} တစ်ခုပါ။ လူတိုင်း {offer} ကို ခံစားရသင့်တယ်လို့ ကျွန်ုပ်တို့ ယုံကြည်ပါတယ် — မိတ်ဆွေတစ်ယောက်လို ခံစားရတဲ့ brand တစ်ခုက အရာရာကို ပိုကောင်းစေပါတယ်။",
        "{name} ကနေ {product} ကို {audience} အတွက် နွေးထွေးရင်းနှီးစွာ တင်ဆက်ပေးနေပါတယ်။ ကျွန်ုပ်တို့ရဲ့ ကတိ: {offer}။ လာလည်ပြီး ကွာခြားမှုကို ခံစားကြည့်ပါ။",
        "မင်္ဂလာပါ! {name} ပါ — {audience} အတွက် {product} ကို ပိုမိုရင်းနှီးစေမယ့် {type} တစ်ခုပါ။ {offer} ကို အတူတူ မျှဝေခံစားဖို့ ဖိတ်ခေါ်ပါတယ်။"
      ],
      pillars: [
        ["နောက်ကွယ်က ဖန်တီးမှုများ", "Customer များရဲ့ အတွေ့အကြုံများ", "အကြံပြုချက်များနှင့် နည်းလမ်းများ"],
        ["Team အကြောင်း", "တကယ့်ဖြစ်ရပ်များ", "မြန်ဆန်သော အောင်မြင်မှုများ"],
        ["နေ့စဉ်ဘဝထဲက {type}", "Community ရဲ့ ချစ်ခြင်းမေတ္တာ", "ပျော်ရွှင်စရာ အခိုက်အတန့်များ"]
      ],
      posts: [
        "{name} ရဲ့ နောက်ကွယ်က လူတွေနဲ့ မိတ်ဆက်ပေးပါရစေ — {type} တစ်ခုရဲ့ အတွင်းဘက်ကို ခဏလောက် ကြည့်ကြရအောင် &#128075;",
        "{audience} တို့ရေ၊ {product} ကို ဘယ်လိုပုံစံနဲ့ အကြိုက်ဆုံးလဲ။ Comment မှာ ပြောခဲ့ပါဦး!",
        "{product} ကို ပိုကောင်းစေမယ့် နည်းလမ်းလေးတစ်ခု (အရိပ်အမြွက်: {offer} နဲ့ ဆိုင်ပါတယ်) &#128521;",
        "Customer story: {product} က လူတစ်ယောက်ရဲ့ နေ့စဉ်ဘဝကို ဘယ်လိုပြောင်းလဲစေခဲ့သလဲ။",
        "Poll time! ဒီနေ့ {product} အတွက် ဘယ် vibe လဲ။ A) အေးဆေး B) တက်ကြွ C) ကိုယ့်ကိုယ်ကို ဆုချမယ်"
      ],
      captions: [
        "တစ်ခါတစ်လေ နည်းနည်းလေး အပိုလိုအပ်တယ်။ ဒီနေ့တော့ {product} နဲ့ အပြုံးလေး။ &#127775; #SmallBusinessLove",
        "{audience} အတွက် ဖန်တီးထားတာပါ၊ ချစ်ခြင်းမေတ္တာနဲ့ လုပ်ထားတာပါ။ {name} က ဘာကြောင့် ထူးခြားသလဲ ဆိုတာ swipe လုပ်ကြည့်ပါ။ &#128150;",
        "ဘဝက {product} အတွက် တိုတောင်းလွန်းပါတယ်။ ကံကောင်းတာက {offer} ရှိနေလို့ပါ။ Link in bio!"
      ],
      ads: [
        "ကိုယ့်အတွက်ပဲ ဖန်တီးထားသလို ခံစားရတဲ့ {product} ကို ရှာနေလား။ {name} မှာ {audience} အတွက် {offer} စောင့်ကြိုနေပါတယ်။ အခုပဲ စတင်လိုက်ပါ။",
        "သင့်ရဲ့ အကောင်းဆုံး {product} အခိုက်အတန့်က တစ်ချက်နှိပ်ရုံပါပဲ။ {name} က {audience} အတွက် {offer} ကို ဆောင်ကျဉ်းပေးပါတယ်။"
      ],
      creative: [
        "{offer} — သင့်ရဲ့ အကြိုက်ဆုံး {type} အသစ်ရောက်ရှိပါပြီ။",
        "{name} ကို မိတ်ဆက်ပါတယ်။ ချစ်ခြင်းမေတ္တာနဲ့ ဖန်တီးထားတဲ့ {product}။",
        "{audience} စောင့်မျှော်နေခဲ့တဲ့ {type}။"
      ]
    },

    professional: {
      positioning: [
        "{name} သည် {audience} အတွက် {product} ကို တိကျမှု၊ ယုံကြည်စိတ်ချရမှုတို့ဖြင့် ပေးအပ်သော {type} တစ်ခုဖြစ်ပါသည်။ ကျွမ်းကျင်မှုနှင့် ရှင်းလင်းသော တန်ဖိုးကို ပေါင်းစပ်ထားပါသည်: {offer}။",
        "{name} သည် {product} ကို အလေးအနက်ထားသော {type} တစ်ခုဖြစ်ပါသည်။ {audience} အတွက် သမာဓိရှိစွာ ဝန်ဆောင်မှုပေးနေပြီး {offer} ဟူသော ကတိတစ်ခုတည်းဖြင့် တည်ဆောက်ထားပါသည်။",
        "{name} တွင် {audience} က {type} တစ်ခုမှ မျှော်လင့်သည့် အရည်အသွေး၊ တည်ငြိမ်မှုနှင့် ရလဒ်တို့ကို ကျွန်ုပ်တို့ နားလည်ပါသည်။ ကျွန်ုပ်တို့၏ အခြေခံအုတ်မြစ် — {offer} သည် {product} ကို အားကိုးထိုက်စွာ ပေးအပ်ရန် ကျွန်ုပ်တို့၏ ဆုံးဖြတ်ချက်ကို ထင်ဟပ်စေပါသည်။"
      ],
      pillars: [
        ["စက်မှုလုပ်ငန်းဆိုင်ရာ အမြင်များ", "Case Studies", "ထုတ်ကုန်အသေးစိတ်"],
        ["အတွေးအမြင်ခေါင်းဆောင်မှု", "ဒေတာနှင့် ရလဒ်များ", "လုပ်ငန်းစဉ် ခွဲခြမ်းစိတ်ဖြာခြင်း"],
        ["စျေးကွက်လမ်းကြောင်းများ", "Client အောင်မြင်မှုများ", "အကောင်းဆုံး အလေ့အကျင့်များ"]
      ],
      posts: [
        "{audience} အတွက် {product} က အခုချိန်မှာ ဘာကြောင့် အရေးပါသလဲ — ဒေတာနဲ့တကွ အကြောင်းပြချက် ၃ ချက်။",
        "{name} က အရည်အသွေးကို ဘယ်လိုချဉ်းကပ်သလဲ — ကျွန်ုပ်တို့ရဲ့ {type} လုပ်ငန်းစဉ်ကို ကြည့်ကြရအောင်။",
        "စက်မှုလုပ်ငန်းဆိုင်ရာ အမြင်: ဒီသုံးလပတ်ရဲ့ {product} လမ်းကြောင်းများ။",
        "Client spotlight — {product} နဲ့ ကျွန်ုပ်တို့ ပေးအပ်ခဲ့တဲ့ တိုင်းတာနိုင်သော ရလဒ်များ။",
        "အမေးအဖြေ: {product} အကြောင်း ထိပ်တန်းမေးခွန်းများကို ကျွန်ုပ်တို့အဖွဲ့မှ ဖြေကြားပေးပါမယ်။"
      ],
      captions: [
        "တိကျမှု။ တည်ငြိမ်မှု။ ရလဒ်။ ဒါ {name} ရဲ့ စံနှုန်းပါ။ #QualityMatters",
        "{audience} မှ ယုံကြည်အားကိုးခြင်း။ {product} က သင့်အတွက် ဘယ်လိုအလုပ်လုပ်ပေးနိုင်သလဲ ရှာဖွေကြည့်ပါ။",
        "ထူးချွန်မှုက မတော်တဆမဟုတ်ပါ — လုပ်ငန်းစဉ်တစ်ခုပါ။ {name} | {type}"
      ],
      ads: [
        "သင်ဟာ {audience} အနေနဲ့ ယုံကြည်စိတ်ချရတဲ့ {product} ကို ရှာနေတယ်ဆိုရင် {name} က ပေးအပ်ပါတယ်။ {offer} နဲ့ စတင်ပြီး ကျွမ်းကျင်မှုရဲ့ ကွာခြားချက်ကို ခံစားကြည့်ပါ။",
        "{product} အပေါ် အလျှော့ပေးတာကို ရပ်လိုက်ပါ။ {name} က {audience} အတွက် {offer} နဲ့အတူ သက်သေပြထားတဲ့ ဖြေရှင်းချက်ကို ပေးပါတယ်။"
      ],
      creative: [
        "{name} — {product}၊ တိကျမှုနှင့်အတူ။",
        "{offer}: {product} အတွက် ကျွမ်းကျင်သော ရွေးချယ်မှု။",
        "ကျွမ်းကျင်မှုနှင့် {product} တွေ့ဆုံသောနေရာ။ {name}။"
      ]
    },

    premium: {
      positioning: [
        "{name} သည် ထူးခြားမှုကိုသာ မျှော်လင့်သော {audience} အတွက် {product} ကို ပြန်လည်သတ်မှတ်ပေးပါသည်။ အဆင့်မြင့် {type} တစ်ခုအနေဖြင့် အသေးစိတ်တိုင်းကို ဂရုတစိုက် စီစဉ်ထားပါသည် — {offer} ဖြင့် ဖိတ်ခေါ်ပါသည်။ ဤသည်မှာ {product}၊ သန့်စင်ထားသော။",
        "ရွေးချယ်တတ်သော {audience} အတွက် {name} သည် စံနှုန်းကို သတ်မှတ်သည့် {type} ဖြစ်ပါသည်။ {product} သည် အရောင်းအဝယ်မဟုတ်ဘဲ အတွေ့အကြုံတစ်ခုဖြစ်သင့်သည်ဟု ကျွန်ုပ်တို့ ယုံကြည်ပါသည် — ထို့ကြောင့် {offer} ကို ဖန်တီးခဲ့ပါသည်။",
        "{name} သည် ထူးကဲမှုကို တန်ဖိုးထားသော {audience} အတွက် {type} ဖြစ်ပါသည်။ ကျွန်ုပ်တို့၏ ဒဿနမှာ ရိုးရှင်းပါသည်: {product} သည် လှပထူးခြားသင့်ပါသည်။ {offer} ဖြင့် စတင်ပြီး premium ၏ အဓိပ္ပါယ်ကို သိရှိလိုက်ပါ။"
      ],
      pillars: [
        ["လက်မှုပညာ ဇာတ်လမ်းများ", "သီးသန့် အစမ်းမြင်ကွင်းများ", "ရွေးချယ်စုစည်းထားသော Collection"],
        ["အရည်အသွေး၏ အနုပညာ", "ကန့်သတ်ထုတ်ဝေမှုများ", "အဖွဲ့ဝင် အတွေ့အကြုံများ"],
        ["အမွေအနှစ်နှင့် အမြင်", "လက်မှုပညာနောက်ကွယ်", "Connoisseur ကဏ္ဍ"]
      ],
      posts: [
        "{product} ရဲ့ အနုပညာ: {name} မှာ တကယ်ထူးခြားတဲ့ အရာတစ်ခု ဖန်တီးဖို့ ဘာတွေပါဝင်သလဲ။",
        "{audience} အတွက် သီးသန့် အတွေ့အကြုံတစ်ခု မိတ်ဆက်ခြင်း — အသေးစိတ်ကို အတွင်းဘက်မှာ ကြည့်ပါ။",
        "အရည်အသွေးက ပမာဏထက် ဘာကြောင့် ကျွန်ုပ်တို့ရဲ့ {type} မှာ ဆုံးဖြတ်ချက်တိုင်းကို သတ်မှတ်သလဲ။",
        "{name} ရဲ့ signature {product} ရဲ့ နောက်ကွယ်က လက်မှုပညာကို အနီးကပ် ကြည့်ကြရအောင်။",
        "{name} ရဲ့ ဇာတ်လမ်း: vision ကနေ {type} ရဲ့ ရွှေစံနှုန်းအထိ။"
      ],
      captions: [
        "{audience} အတွက် စီစဉ်ထားသည်။ အလျှော့မပေးဘဲ ဖန်တီးထားသည်။ {name} &#8212; {product} မြှင့်တင်ထားသည်။",
        "ထူးချွန်မှုက သူ့ဘာသာသူ ပြောပါတယ်။ {name} ကို ရှာဖွေပြီး {product} ရဲ့ အကောင်းဆုံးကို ခံစားကြည့်ပါ။",
        "{product} အားလုံး တူညီတာမဟုတ်ပါဘူး။ {name} က ပိုကောင်းတဲ့အရာဆီ ဖိတ်ခေါ်ပါတယ်။ {offer}။"
      ],
      ads: [
        "အနည်းဆုံးကိုသာ လက်မခံတဲ့ {audience} အတွက် {name} က {product} ကို အကောင်းဆုံးပုံစံနဲ့ တင်ဆက်ပါတယ်။ {offer} နဲ့ သင့်ခရီးကို စတင်လိုက်ပါ။",
        "ထူးခြားတဲ့ {product} က ထူးခြားတဲ့လူတွေအတွက်ပါ။ {name} — {audience} အတွက် အထင်ကရ {type}။ {offer} ကို ဒီနေ့ပဲ ရယူလိုက်ပါ။"
      ],
      creative: [
        "{name}။ {product}၊ မြှင့်တင်ထားသည်။",
        "{product} ကို အကောင်းဆုံးပုံစံနဲ့ ခံစားပါ။ {offer}။",
        "ကွာခြားချက်ကို သိသောသူများအတွက် {type}။ {name}။"
      ]
    },

    fun: {
      positioning: [
        "{name} သည် {audience} အတွက် {product} ကို စွမ်းအင်နှင့် ကိုယ်ပိုင်စတိုင်လ်ဖြင့် သက်ဝင်စေသော {type} ဖြစ်ပါသည်။ ပျင်းစရာကောင်းတာက ဘာလို့လဲ? {offer} နဲ့ ကျွန်ုပ်တို့ လှုပ်ခတ်နေပါတယ် — marketing က သူတည်ဆောက်တဲ့ brand တွေလိုပဲ ပျော်စရာကောင်းသင့်လို့ပါ။",
        "ပျင်းစရာ {product}? ကျွန်ုပ်တို့ရဲ့ ကြီးကြပ်မှုအောက်မှာ မဖြစ်နိုင်ပါဘူး! {name} က {audience} အတွက် {product} မှာ ပြန်လည်တောက်ပလာစေတဲ့ {type} ပါ။ {offer} ကို ယူပြီး အတူတူ ဆူညံလိုက်ကြရအောင် &#127881;",
        "{name} နဲ့ မိတ်ဆက်ပါ: {audience} အတွက် {product} playbook ကို ပြန်ရေးနေတဲ့ {type}။ Corporate fluff မပါ၊ jargon မပါ — ရဲရင့်တဲ့ လှုပ်ရှားမှုတွေနဲ့ {offer} ပဲ။"
      ],
      pillars: [
        ["ပျော်စရာ အချက်အလက်များ", "စိန်ခေါ်မှုများနှင့် ဂိမ်းများ", "တုံ့ပြန်မှုများနှင့် Meme များ"],
        ["ဉာဏ်စမ်းမေးခွန်းများ", "UGC Spotlight များ", "အံ့အားသင့်ဖွယ် ထုတ်ဝေမှုများ"],
        ["ဒါလား ဒါလား", "ရဲရင့်သော အမြင်များ", "Community ဖန်တီးမှုများ"]
      ],
      posts: [
        "ဒါလား ဒါလား: {product} edition! ဘယ်တစ်ခုကို ရွေးမလဲ။ &#128064;",
        "လူကြိုက်များမှာမဟုတ်တဲ့ အမြင်: {product} က အမြဲတမ်း ဒီလောက်ကောင်းသင့်တယ်။ ငြင်းမလား။ &#128521;",
        "Caption ရေးပါ! အကောင်းဆုံး caption က {offer} ရမယ် &#127942;",
        "{name} က {product} တိုင်းကို အဆင့်သတ်မှတ်ခြင်း — ရလဒ်တွေက သင့်ကို shock ဖြစ်စေနိုင်တယ်။",
        "ပရမ်းပတာနောက်ကွယ်: {name} HQ ထဲမှာ စက္ကန့် ၃၀။ Filter မပါ။"
      ],
      captions: [
        "သတိပေးချက်: အလွန်အကျွံ ပျော်ရွှင်မှုနှင့် {product} အတွက် ရုတ်တရက် ချစ်ခြင်းမေတ္တာ ဖြစ်စေနိုင်သည်။ {offer} — link in bio! &#128293;",
        "Plot twist: {product} က ပျင်းစရာဖြစ်စရာမလိုပါဘူး။ {name} က သက်သေပါ။ &#128378;",
        "သူတို့ဘဝထဲမှာ {offer} လိုအပ်တဲ့သူကို tag လုပ်ပါ။ စောင့်နေပါမယ်။ &#128075;"
      ],
      ads: [
        "အမြဲတမ်း အတူတူ {product} ကို ငြီးငွေ့နေပြီလား။ {name} က သင့်ကို တကယ်နားလည်တဲ့ {type} ပါ။ {offer} ကို ယူပြီး ပျော်လိုက်ကြရအောင်!",
        "သင့် {product} က ဖုန်းဆက်တယ် — glow up လုပ်ချင်တယ်တဲ့။ {name} မှာ {audience} အတွက် {offer} ရှိပါတယ်။ လက်မလွှတ်လိုက်ပါနဲ့!"
      ],
      creative: [
        "ပျင်းနေလား? {name} ကို စမ်းကြည့်ပါ။ {offer} စောင့်ကြိုနေပါတယ်။",
        "{name}: သင့်ကို တကယ်နားလည်တဲ့ {type}။",
        "သင့် {product} က glow up တစ်ခု ထိုက်တန်ပါတယ်။ {offer} နဲ့ စတင်ပါ။"
      ]
    }
  }
};

// --- Content Pillars (by business type keywords) ---
const PILLAR_MAP = {
  café: [
    ["Brewing Guides & Tips", "Behind the Counter", "Community Events"],
    ["Coffee Origins", "Customer Favourites", "Seasonal Specials"],
    ["Barista Picks", "Café Vibes", "Local Partnerships"]
  ],
  restaurant: [
    ["Dish of the Week", "Chef's Table", "Ingredient Stories"],
    ["Kitchen Sneak Peeks", "Customer Reviews", "Seasonal Menus"],
    ["Recipe Glimpses", "Staff Picks", "Food Pairings"]
  ],
  boutique: [
    ["Style Guides", "New Arrivals", "Customer Looks"],
    ["Behind the Brand", "Styling Tips", "Limited Drops"],
    ["Fabric Stories", "Mood Boards", "Community Style"]
  ],
  clinic: [
    ["Health Tips", "Patient Stories", "Service Spotlights"],
    ["Wellness Education", "Myth vs Fact", "Behind the Practice"],
    ["Prevention Guides", "Success Stories", "Team Expertise"]
  ],
  salon: [
    ["Transformation Tuesday", "Product Picks", "Stylist Tips"],
    ["Before & After", "Hair Care Guides", "Trend Alerts"],
    ["Client Glow Ups", "Tool Talk", "Seasonal Looks"]
  ],
  gym: [
    ["Workout of the Week", "Member Transformations", "Nutrition Bites"],
    ["Trainer Tips", "Class Spotlights", "Motivation Monday"],
    ["Form Checks", "Success Journeys", "Community Challenges"]
  ],
  default: [
    ["Educational Content", "Behind the Scenes", "Customer Spotlights"],
    ["Product Highlights", "Industry Know-How", "Community Stories"],
    ["How It's Made", "Expert Advice", "Client Wins"]
  ]
};

function getPillars(type) {
  const t = type.toLowerCase();
  for (const [key, val] of Object.entries(PILLAR_MAP)) {
    if (t.includes(key)) return val;
  }
  return PILLAR_MAP.default;
}

// --- Generate ---
function interpolate(template, ctx) {
  return template
    .replace(/\{name\}/g, ctx.name)
    .replace(/\{type\}/g, ctx.type)
    .replace(/\{product\}/g, ctx.product)
    .replace(/\{audience\}/g, ctx.audience)
    .replace(/\{offer\}/g, ctx.offer)
    .replace(/\{platform\}/g, ctx.platformLabel);
}

function generate(ctx) {
  const lang = ctx.language;   // 'en' | 'my'
  const tone = ctx.tone;       // 'friendly' | 'professional' | 'premium' | 'fun'
  const t = TEMPLATES[lang][tone];

  const pillars = pick(getPillars(ctx.type));

  const pkg = {
    positioning: interpolate(pick(t.positioning), ctx),
    pillars: pillars,
    posts: t.posts.map((p) => interpolate(p, ctx)),
    captions: t.captions.map((c) => interpolate(c, ctx)),
    ads: t.ads.map((a) => interpolate(a, ctx)),
    creative: interpolate(pick(t.creative), ctx)
  };

  return pkg;
}

export { generate, interpolate };
