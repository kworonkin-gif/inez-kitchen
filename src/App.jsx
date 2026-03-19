import React, { useState, useEffect, useMemo, useCallback } from "react";

const INEZ_CONTEXT = `You are a specialist paediatric nutritionist and chef helping plan meals for a 20-month-old girl named Inez. Her dietary rules combine evidence-based GERD guidelines (CHOP, NIDDK, Johns Hopkins) with specific rules provided by her mum based on medical advice received.

MEDICAL CONDITIONS:
- Sotos syndrome: No special diet required (per Healthline/NIH). The ONLY dietary implication is higher calorie intake to support rapid growth. Otherwise a normal well-balanced diet applies.
- Acid reflux (GERD): This drives all the specific dietary restrictions below.

COOKING METHODS: Only steamed, boiled, or oven baked. No frying or sautéing. ALWAYS state exact method, oven temperature, cooking time, and texture to aim for in every recipe.

FOODS TO AVOID (GERD triggers — evidence-based + mum's confirmed list):
- All cow protein: no beef, no dairy (milk, cheese, butter, yogurt, cream)
- Cacao / chocolate
- Acidic foods: tomatoes, citrus fruits, raspberries, vinegar, green apples, bell peppers
- Garlic and onion (confirmed GERD triggers)
- Leeks: only green tops in very small amounts — avoid generally
- Full-fat coconut milk (high fat = GERD trigger). Avoid.
- All high fat foods generally. Oil: maximum 1 teaspoon per meal.
- Hard, chewy, or dry textures — all meals need moisture throughout
- No muffins or baked goods — too dry without dairy
- No nuts — choking hazard and high fat
- Processed foods: everything cooked from scratch. Rice cakes only occasionally as last resort.

APPROVED SAFE FOODS (evidence-based GERD-safe list, combined with mum's list):
Proteins: eggs + egg yolks, turkey, lean white fish (cod, haddock, sole), prawns, tofu (silken/soft), veal, rabbit, lentils, beans, chickpeas
Vegetables: beetroot (iron-rich, sweet, soft when cooked — excellent for Inez), carrots, broccoli, green beans, peas, asparagus, sweet potato, courgette, spinach, kale, cauliflower, butternut squash
Fruits: banana, ripe pear, melon, avocado, papaya, mango, watermelon, blueberries
Grains: brown rice, oatmeal/porridge, quinoa, millet, whole grain pasta (small shapes only), couscous
Safe flavourings: ginger (small amounts — beneficial for reflux), basil, oregano, parsley, dill, cilantro, thyme, rosemary, sage, cumin, coriander, turmeric, mild paprika, cardamom, lemongrass, cinnamon, caraway

IRON PRIORITY (toddlers need ~7mg iron/day — deficiency is very common):
Every single meal must include at least one iron-rich ingredient.
Best iron sources available: lentils, chickpeas, beans, tofu, quinoa, beetroot, spinach, broccoli, egg yolk, lean fish, turkey, prawns.
ALWAYS pair plant-based iron with a vitamin C food to boost absorption (e.g. broccoli with pear, spinach with melon, beetroot with blueberries).
Note the iron-vitamin C pairing explicitly in each recipe.

TEXTURE AND FEEDING: Inez cannot self-feed with a spoon — she is fed by an adult. All meals must be soft and spoonable. Small pasta shapes only. Nothing dry — always pair with a moist element.

BREADCRUMBED FISH: Pat fish dry. Dip in beaten egg (no flour, no milk). Press into plain unseasoned breadcrumbs. Bake at 180C on lightly oiled tray for 15-18 mins until soft inside — not dry. Serve with moist sides. Break into soft pieces before feeding.

CUISINE VARIETY: At least 3 different culinary traditions per batch cook. Draw from: Asian (Japanese broths, Korean steamed, Thai herb-forward), Middle Eastern (cumin, za'atar, lentils), Latin American (mild Mexican beans, cumin, coriander), Indian-inspired (turmeric, cumin, coriander — no chilli/garlic/onion), North African (tagine-inspired, couscous), Mediterranean (Greek herbs). Always adapt to remove garlic, onion, acidic ingredients.

PORTIONS: Very large — she eats more than most adults. 3 big meals + 2 substantial snacks daily.

NUTRITION: High calorie + high protein for rapid growth (Sotos), iron at every meal, omega-3 from oily fish max 2x/week, minimal fat from olive oil only.

METHOD CLARITY: Write complete unambiguous instructions. State method, temperature, time, texture goal, and how to serve. Never assume the reader knows the method.

INCLUSION: Inez notices when she eats differently to everyone else. Her meals should look as similar as possible to the rest of the family.`;

const FAMILY_CONTEXT = `You are a family meal planner helping a family of 4 with very different dietary needs plan shared weekend meals.

THE FAMILY:
- Mum: healthy, nutritious food, easy to please
- Phil (partner): eats anything, less focused on health, easy to please
- Finlay (8, stepson): FUSSY. Likes beige comfort food. Hates chunks of vegetables. Sauce is fine ONLY when fully integrated into the dish (e.g. bolognese mixed into pasta). Any sauce that could touch separate items on his plate = NO. Keep his plate with components clearly separated. Favourites: pasta, burgers, fish fingers, chips, spaghetti bolognese (veg blended in).
- Inez (20 months): Reflux diet - no cow protein, no dairy, no beef, no acidic foods, no garlic/onion, no cacao, very minimal oil, no leeks. Can eat: eggs, veal, rabbit, turkey, lean white fish. All food soft, moist, and spoonable (fed by adult - cannot self-feed). Oven-baked breadcrumbed fish IS allowed: pat dry, dip in beaten egg (no flour or milk needed), coat in plain unseasoned breadcrumbs, bake at 180C for 15-18 mins until soft inside - not dry. Always serve with moist sides. She wants to feel included - her plate should look as close to everyone else's as possible.

COOKING METHODS FOR INEZ: Only steamed, boiled, or oven baked. Always state exact method, temperature, time, and texture goal. Never leave Inez's cooking method ambiguous or incomplete.

THE GOAL: One meal, adapted 3 ways (Inez / Finlay / Adults). One shop, one cook.

ALWAYS include:
1. Exact moment to set Inez's portion aside BEFORE adding garlic, spice or adult flavourings
2. Complete step-by-step instructions for Inez's version - full method, nothing assumed
3. Finlay's plating notes - components separated, sauce integrated not poured over separate items
4. A Finlay Fallback - dead simple alternative using pantry staples in case he rejects the meal`;

const TABS = ["❄️ Fridge", "🍳 Batch Cook", "☀️ Day Planner", "👨‍👩‍👧‍👦 Weekend", "📖 Recipes", "🛒 Shopping"];

// Assume Inez eats 3 meals + 2 snacks = 5 eating occasions per day
// Each portion = 1 meal. Snacks count as 0.5 portions for simplicity.
const MEALS_PER_DAY = 3;

// StableInput and StableTextarea - use refs to prevent keyboard dismissal on Android
// These look controlled from outside but never re-render on keystroke internally
function StableInput({ value, onBlur, placeholder, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.value = value || "";
    }
  }, [value]);
  return (
    <input
      ref={ref}
      defaultValue={value || ""}
      placeholder={placeholder}
      onBlur={e => onBlur && onBlur(e.target.value)}
      style={{ ...style, fontSize: Math.max(16, style?.fontSize || 16) }}
    />
  );
}

function StableTextarea({ value, onBlur, placeholder, rows, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.value = value || "";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      defaultValue={value || ""}
      placeholder={placeholder}
      rows={rows}
      onBlur={e => onBlur && onBlur(e.target.value)}
      style={{ ...style, fontSize: Math.max(16, style?.fontSize || 16) }}
    />
  );
}

// Uncontrolled form - uses refs not state so typing never triggers re-renders
function AddFridgeForm({ onAdd }) {
  const inputRef = React.useRef(null);
  const [portions, setPortions] = useState(5);
  function handleAdd() {
    const val = inputRef.current?.value?.trim();
    if (val) { onAdd(val, portions); if (inputRef.current) inputRef.current.value = ""; }
  }
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#2c3e50" }}>Add meal to fridge</h3>
      <input
        ref={inputRef}
        defaultValue=""
        placeholder="Meal name e.g. Turkey & lentil stew..."
        style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 16, fontFamily: "Georgia,serif", marginBottom: 12, boxSizing: "border-box" }}
      />
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#555", fontWeight: "bold" }}>How many portions?</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPortions(p => Math.max(1, p - 1))} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #f4a261", background: "white", fontSize: 20, cursor: "pointer", color: "#e76f51", fontWeight: "bold" }}>−</button>
          <span style={{ fontSize: 22, fontWeight: "bold", color: "#2c3e50", minWidth: 30, textAlign: "center" }}>{portions}</span>
          <button onClick={() => setPortions(p => p + 1)} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #f4a261", background: "white", fontSize: 20, cursor: "pointer", color: "#e76f51", fontWeight: "bold" }}>+</button>
        </div>
      </div>
      <button
        onClick={handleAdd}
        style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#e76f51,#f4a261)", color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia,serif" }}>
        Add to Fridge
      </button>
    </div>
  );
}

export default function MealPlanner() {
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem("inez_api_key") || ""; } catch { return ""; }
  });
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [tab, setTab] = useState(0);

  // Show setup screen if no API key saved
  if (!apiKey) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fef9f0,#fde8d0 50%,#fef0e8)", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍳</div>
            <h1 style={{ fontSize: 22, color: "#2c3e50", marginBottom: 8 }}>Inez's Kitchen</h1>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>One-time setup. You'll need a free Anthropic API key to power the recipe generator.</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 8, fontWeight: "bold" }}>Your Anthropic API Key:</p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", marginBottom: 8 }}
            />
            <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>Get your free key at <strong>console.anthropic.com</strong> → API Keys. Your key is stored only on this device.</p>
          </div>
          <button
            onClick={() => {
              const key = apiKeyInput.trim();
              if (key.startsWith("sk-")) {
                localStorage.setItem("inez_api_key", key);
                setApiKey(key);
              } else {
                alert("Please enter a valid API key starting with sk-ant-");
              }
            }}
            style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#e76f51,#f4a261)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia,serif" }}>
            Let's Go 🎉
          </button>
          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>Cost: approx £3-8/month depending on usage</p>
        </div>
      </div>
    );
  }

  const [recipes, setRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("inez_v4") || "[]"); } catch { return []; }
  });

  // Fridge stock
  const [fridgeItems, setFridgeItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("inez_fridge") || "[]"); } catch { return []; }
  });
  const [newFridgeName, setNewFridgeName] = useState("");
  const [newFridgePortions, setNewFridgePortions] = useState(5);
  const [addingFridge, setAddingFridge] = useState(false);

  // Batch cook
  const [weekPlan, setWeekPlan] = useState(null);
  const [parsedRecipes, setParsedRecipes] = useState([]); // extracted individual recipes from batch
  const [selectedToSave, setSelectedToSave] = useState({}); // which recipes user wants to save
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [nutrientFlags, setNutrientFlags] = useState(null);
  const [shoppingList, setShoppingList] = useState(() => {
    try { return localStorage.getItem("inez_shopping") || null; } catch { return null; }
  });
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMsg, setBatchMsg] = useState("");
  const [leftovers, setLeftovers] = useState("");
  const [useLeftovers, setUseLeftovers] = useState(false);

  // Day planner
  const [dayPlan, setDayPlan] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [dayNote, setDayNote] = useState("");
  const [includeEggs, setIncludeEggs] = useState(true);

  // Weekend planner
  const [weekendPlan, setWeekendPlan] = useState(null);
  const [weekendLoading, setWeekendLoading] = useState(false);
  const [weekendMsg, setWeekendMsg] = useState("");
  const [weekendNote, setWeekendNote] = useState("");
  const [weekendShoppingList, setWeekendShoppingList] = useState(() => {
    try { return localStorage.getItem("inez_weekend_shopping") || null; } catch { return null; }
  });
  const [weekendShoppingLoading, setWeekendShoppingLoading] = useState(false);

  // Shopping checklist
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("inez_checked") || "{}"); } catch { return {}; }
  });

  // Recipe book
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [addingRecipe, setAddingRecipe] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newRating, setNewRating] = useState(3);
  const [recipeIdea, setRecipeIdea] = useState(null);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [filterFavs, setFilterFavs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const recipeNameRef = React.useRef(null);
  const recipeNotesRef = React.useRef(null);

  useEffect(() => {
    try { localStorage.setItem("inez_v4", JSON.stringify(recipes)); } catch {}
  }, [recipes]);

  useEffect(() => {
    try { localStorage.setItem("inez_fridge", JSON.stringify(fridgeItems)); } catch {}
  }, [fridgeItems]);

  useEffect(() => {
    try {
      if (shoppingList) localStorage.setItem("inez_shopping", shoppingList);
    } catch {}
  }, [shoppingList]);

  useEffect(() => {
    try {
      if (weekendShoppingList) localStorage.setItem("inez_weekend_shopping", weekendShoppingList);
    } catch {}
  }, [weekendShoppingList]);

  useEffect(() => {
    try { localStorage.setItem("inez_checked", JSON.stringify(checkedItems)); } catch {}
  }, [checkedItems]);

  // Fridge calculations
  const totalPortions = fridgeItems.reduce((sum, item) => sum + item.portions, 0);
  const daysLeft = Math.floor(totalPortions / MEALS_PER_DAY);
  const needsToCook = daysLeft < 2;
  const cookSoon = daysLeft >= 2 && daysLeft < 4;

  const fridgeStatus = useMemo(() => {
    if (fridgeItems.length === 0) return { msg: "Fridge is empty — time to batch cook!", color: "#c0392b", bg: "#fff0f0", icon: "🚨" };
    if (needsToCook) return { msg: `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} of food left — batch cook soon!`, color: "#c0392b", bg: "#fff0f0", icon: "🚨" };
    if (cookSoon) return { msg: `About ${daysLeft} days of food left — plan your next batch cook.`, color: "#b7850b", bg: "#fffbf0", icon: "⚠️" };
    return { msg: `You have roughly ${daysLeft} days of food in the fridge. No need to cook yet!`, color: "#2d6a4f", bg: "#f0faf4", icon: "✅" };
  }, [fridgeItems, daysLeft, needsToCook, cookSoon]);

  function addFridgeItem() {
    if (!newFridgeName.trim()) return;
    const now = new Date();
    const item = {
      id: Date.now(),
      name: newFridgeName.trim(),
      portions: newFridgePortions,
      originalPortions: newFridgePortions,
      addedDate: now.toLocaleDateString("en-GB"),
      addedTimestamp: now.getTime()
    };
    setFridgeItems(p => [item, ...p]);
    setNewFridgeName(""); setNewFridgePortions(5); setAddingFridge(false);
  }

  function getDaysAgo(timestamp) {
    if (!timestamp) return null;
    const diff = Date.now() - timestamp;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  const fridgeItemAge = useCallback((item) => {
    const days = getDaysAgo(item.addedTimestamp);
    if (days === null) return null;
    if (days === 0) return { label: "Added today", color: "#2d6a4f", warn: false, danger: false };
    if (days === 1) return { label: "Added yesterday", color: "#2d6a4f", warn: false, danger: false };
    if (days <= 3) return { label: `${days} days ago`, color: "#b7950b", warn: false, danger: false };
    if (days === 4) return { label: `${days} days ago — use or freeze today!`, color: "#e07b39", warn: true, danger: false };
    if (days >= 5) return { label: `${days} days ago — DO NOT USE if not frozen`, color: "#c0392b", warn: true, danger: true };
    return null;
  }, []);

  function usePortions(id, n) {
    setFridgeItems(p => p.map(item => {
      if (item.id !== id) return item;
      const newP = Math.max(0, item.portions - n);
      return { ...item, portions: newP };
    }).filter(item => item.portions > 0));
  }

  function removeFridgeItem(id) {
    setFridgeItems(p => p.filter(item => item.id !== id));
  }

  // Standard API call (used for shopping lists, day plans, weekend plans)
  async function callClaude(prompt, sys) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        system: sys || INEZ_CONTEXT,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const d = await res.json();
    if (d.error) { console.error(d.error); throw new Error(d.error.message); }
    return d.content?.map(b => b.text || "").join("") || "";
  }

  // Streaming API call - text appears word by word as it generates
  async function callClaudeStream(prompt, sys, onChunk) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        stream: true,
        system: sys || INEZ_CONTEXT,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "content_block_delta" && data.delta?.text) {
            fullText += data.delta.text;
            onChunk(fullText);
          }
        } catch {}
      }
    }
    return fullText;
  }

  async function generateBatchPlan() {
    setBatchLoading(true); setBatchMsg("Generating recipes..."); setWeekPlan(null); setNutrientFlags(null); setShoppingList(null);
    const prev = recipes.length > 0 ? `Previously cooked (avoid repeating): ${recipes.map(r => r.name).join(", ")}.` : "";
    const dislikes = recipes.filter(r => r.rating <= 2).map(r => r.name);
    const dislikeNote = dislikes.length ? `She did NOT enjoy these: ${dislikes.join(", ")}.` : "";
    const fridgeNote = fridgeItems.length > 0 ? `Already in fridge (avoid duplicating these meals): ${fridgeItems.map(f => f.name).join(", ")}.` : "";
    const leftoverNote = useLeftovers && leftovers.trim() ? `USE THESE INGREDIENTS from the fridge/pantry in at least 2 recipes: ${leftovers}` : "";
    try {
      // Stream the recipes so text appears immediately
      const recipePrompt = `${prev}\n${dislikeNote}\n${fridgeNote}\n${leftoverNote}

Generate exactly 4 batch cook recipes. Different protein in each, different carb in each. Interesting flavours. No muffins or baked goods. Minimal oil in all recipes.

CRITICAL - include snacks integrated into the plan:

Format:
RECIPE 1: [name]
NUTRITION: [key nutrients]
INGREDIENTS:
[quantities for 5 portions]
METHOD:
[complete unambiguous steps - state method, temp, time, texture]
FREEZING: [instructions]
🥚 EGG YOLK BOOST: [yes/no and how]

---

[repeat for recipes 2, 3, 4]

---

🍎 SNACKS THIS WEEK

👩‍🍳 PREP DURING BATCH COOK:
[snack] — uses [ingredient] from Recipe [X]. How to prep: [1-2 sentences]
[snack] — uses [ingredient] from Recipe [X]. How to prep: [1-2 sentences]
[snack] — uses [ingredient] from Recipe [X]. How to prep: [1-2 sentences]

🍌 ZERO-PREP SNACKS:
[snack] — [why good + how to serve]
[snack] — [why good + how to serve]
[snack] — [why good + how to serve]`;

      // Stream recipes - text appears immediately as it generates
      let finalResult = "";
      await callClaudeStream(recipePrompt, INEZ_CONTEXT, (partial) => {
        setWeekPlan(partial);
        finalResult = partial;
      });
      // Parse individual recipes from the generated plan
      const lines = finalResult.split('\n');
      const parsed = [];
      let current = null;
      for (const line of lines) {
        const match = line.match(/^RECIPE (\d+):\s*(.+)/i);
        if (match) {
          if (current) parsed.push(current);
          current = { number: match[1], name: match[2].trim(), content: line + '\n' };
        } else if (current) {
          if (line.match(/^🍎 SNACKS THIS WEEK/)) { parsed.push(current); current = null; break; }
          current.content += line + '\n';
        }
      }
      if (current) parsed.push(current);
      setParsedRecipes(parsed);
      const sel = {};
      parsed.forEach(r => { sel[r.number] = true; });
      setSelectedToSave(sel);
      setShowSavePanel(false);

      // Run nutrient check in parallel while user reads recipes
      setBatchMsg("Checking nutrients...");
      const flags = await callClaude(
        `Review these 4 recipes and snacks for a 20-month-old with Sotos syndrome on a reflux diet with no cow protein, minimal oil. Flag MISSING or LOW nutrients (iron, calcium alternatives, omega-3, zinc, vitamin D, fibre, vitamin C, iodine). Bullet points only. Suggest fixes using only allowed ingredients.\n\n${finalResult}`,
        "You are a paediatric nutritionist. Be concise."
      );
      setNutrientFlags(flags);
    } catch { setWeekPlan("Something went wrong. Please try again."); }
    setBatchLoading(false);
  }

  async function generateShoppingList() {
    if (!weekPlan) return;
    setBatchLoading(true); setBatchMsg("Building shopping list...");
    try {
      const result = await callClaude(`Consolidated shopping list from these recipes and snacks. Groups: PROTEINS:, VEGETABLES:, GRAINS & CARBS:, FRUIT:, PANTRY & HERBS:. Combine duplicates. Piggyback snacks don't need separate ingredients.\n\n${weekPlan}`);
      setShoppingList(result);
    } catch { setShoppingList("Something went wrong."); }
    setBatchLoading(false);
  }

  async function generateWeekendPlan() {
    setWeekendLoading(true); setWeekendMsg("Planning your weekend meals..."); setWeekendPlan(null); setWeekendShoppingList(null);
    try {
      const result = await callClaude(`Plan Saturday AND Sunday shared family meals. For each day: Lunch and Dinner.
${weekendNote ? `Note from mum: ${weekendNote}` : ""}

CRITICAL RULES:
- Each meal must work for all 4 family members with adaptations
- Inez's version must look as similar as possible to everyone else's
- Always specify EXACTLY when to set Inez's portion aside before adding garlic/spice/adult flavourings
- Finlay's plate must have components separated — sauce integrated into dish is fine, sauce that could touch other items is not
- Include a Finlay Fallback for each meal
- Meals should be varied across the weekend — different proteins Saturday vs Sunday
- Inez eats lunch at 11:30-12 and dinner at 3:30-4:30 on weekends

Format EXACTLY as:

═══════════════════════════════
🗓️ SATURDAY
═══════════════════════════════

🍽️ SATURDAY LUNCH: [meal name]
Why this works for everyone: [1 line]

👨‍👩‍👧‍👦 HOW TO COOK IT:
[Main cooking method]

⏰ INEZ FIRST — set aside her portion when:
[Exact moment]

🍽️ PLATING:
Inez: [her version]
Finlay: [his version]
Adults: [full version]

🆘 FINLAY FALLBACK:
[Simple alternative]

---

🍽️ SATURDAY DINNER: [meal name]
[same format]

═══════════════════════════════
🗓️ SUNDAY
═══════════════════════════════

🍽️ SUNDAY LUNCH: [meal name]
[same format]

---

🍽️ SUNDAY DINNER: [meal name]
[same format]`, FAMILY_CONTEXT);
      setWeekendPlan(result);
    } catch { setWeekendPlan("Something went wrong. Please try again."); }
    setWeekendLoading(false);
  }

  async function generateWeekendShopping() {
    if (!weekendPlan) return;
    setWeekendShoppingLoading(true);
    try {
      const result = await callClaude(`Create a consolidated weekend shopping list from these 4 family meals. Remember no cow protein/dairy for Inez. Group by: PROTEINS:, VEGETABLES:, GRAINS & CARBS:, PANTRY & HERBS:. Combine duplicates.\n\n${weekendPlan}`, FAMILY_CONTEXT);
      setWeekendShoppingList(result);
    } catch { setWeekendShoppingList("Something went wrong."); }
    setWeekendShoppingLoading(false);
  }

  async function generateDayPlan() {
    setDayLoading(true); setDayPlan(null);
    const bank = recipes.filter(r => r.rating >= 3).map(r => r.name);
    const fridgeStock = fridgeItems.length > 0 ? `Currently in fridge: ${fridgeItems.map(f => `${f.name} (${f.portions} portions)`).join(", ")}. Prioritise using these.` : "";
    try {
      const result = await callClaude(`Plan a full balanced day for Inez. Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner.
Rules: different protein each meal, different carb each meal, varied veg, substantial snacks. Minimal oil only.
${includeEggs ? "Include at least one egg meal or egg yolk addition." : ""}
${bank.length ? `Favourite recipes: ${bank.join(", ")}` : ""}
${fridgeStock}
${dayNote ? `Note: ${dayNote}` : ""}

Format each meal:
MEAL NAME
Protein: / Carb: / Veg: / How to prepare: / Nutrition note:

End with DAILY NUTRITION SUMMARY listing proteins, carbs, veg and any gaps.`);
      setDayPlan(result);
    } catch { setDayPlan("Something went wrong."); }
    setDayLoading(false);
  }

  async function getRecipeIdea() {
    setIdeaLoading(true); setRecipeIdea(null);
    const used = recipes.map(r => r.name).join(", ");
    try {
      const result = await callClaude(`One creative new recipe for Inez.${used ? ` Already made: ${used}.` : ""} Full recipe, 5 portions, interesting flavours, minimal oil, no muffins or dry baked goods. Flag egg yolk opportunity. Suggest one piggyback snack from same ingredients.`);
      setRecipeIdea(result);
    } catch { setRecipeIdea("Something went wrong."); }
    setIdeaLoading(false);
  }

  function saveRecipe() {
    const name = recipeNameRef.current?.value?.trim() || newName.trim();
    const notes = recipeNotesRef.current?.value?.trim() || newNotes.trim();
    if (!name) return;
    setRecipes(p => [{ id: Date.now(), name, notes, rating: newRating, favourite: false, date: new Date().toLocaleDateString("en-GB") }, ...p]);
    if (recipeNameRef.current) recipeNameRef.current.value = "";
    if (recipeNotesRef.current) recipeNotesRef.current.value = "";
    setNewName(""); setNewNotes(""); setNewRating(3); setAddingRecipe(false);
  }

  function saveSelectedRecipes() {
    const toSave = parsedRecipes.filter(r => selectedToSave[r.number]);
    const now = new Date().toLocaleDateString("en-GB");
    const newRecs = toSave.map(r => ({
      id: Date.now() + Math.random(),
      name: r.name,
      notes: r.content,
      rating: 3,
      favourite: false,
      date: now
    }));
    setRecipes(p => [...newRecs, ...p]);
    setShowSavePanel(false);
    alert(`✅ Saved ${toSave.length} recipe${toSave.length !== 1 ? 's' : ''} to your recipe book!`);
  }

  async function regenerateRecipe(recipeNumber) {
    const toKeep = parsedRecipes.filter(r => r.number !== recipeNumber).map(r => r.name);
    const keepNote = toKeep.length ? `Keep these exact recipes, only replace Recipe ${recipeNumber}: ${toKeep.join(", ")}` : "";
    setBatchLoading(true); setBatchMsg(`Regenerating Recipe ${recipeNumber}...`);
    try {
      const result = await callClaude(`${keepNote}
Generate ONE replacement recipe (call it RECIPE ${recipeNumber}: [name]) that is different to: ${toKeep.join(", ")}. Different protein, different cuisine style, interesting flavours. Full format with NUTRITION, INGREDIENTS (5 portions), METHOD, FREEZING, EGG YOLK BOOST.`);
      const match = result.match(/RECIPE \d+:\s*(.+)/i);
      if (match) {
        const newName = match[1].trim();
        setParsedRecipes(p => p.map(r => r.number === recipeNumber ? { ...r, name: newName, content: result } : r));
        // Update the weekPlan text too
        setWeekPlan(p => {
          const old = parsedRecipes.find(r => r.number === recipeNumber);
          if (old) return p.replace(old.content, result);
          return p;
        });
      }
    } catch { }
    setBatchLoading(false);
  }

  function addBatchToFridge() {
    if (!weekPlan) return;
    const lines = weekPlan.split('\n');
    const recipeNames = lines.filter(l => l.match(/^RECIPE \d+:/i)).map(l => l.replace(/^RECIPE \d+:\s*/i, '').trim());
    const now = new Date();
    recipeNames.forEach(name => {
      if (name) {
        setFridgeItems(p => [{
          id: Date.now() + Math.random(),
          name,
          portions: 5,
          originalPortions: 5,
          addedDate: now.toLocaleDateString("en-GB"),
          addedTimestamp: now.getTime()
        }, ...p]);
      }
    });
    setTab(0);
  }

  function toggleFav(id) { setRecipes(p => p.map(r => r.id === id ? { ...r, favourite: !r.favourite } : r)); }
  function updateRating(id, r) { setRecipes(p => p.map(x => x.id === id ? { ...x, rating: r } : x)); }
  function deleteRecipe(id) { setRecipes(p => p.filter(r => r.id !== id)); }

  function printWeekend() {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Weekend Meal Plan</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.8;color:#2c3e50;font-size:14px;}h1{color:#e76f51;}pre{white-space:pre-wrap;font-family:Georgia,serif;}@media print{button{display:none}}</style></head><body><h1>👨‍👩‍👧‍👦 Weekend Family Meals</h1><pre>${weekendPlan}</pre><script>window.print();</script></body></html>`);
    w.document.close();
  }

  function printBatch() {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Inez Batch Cook Plan</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.8;color:#2c3e50;font-size:14px;}h1{color:#e76f51;}pre{white-space:pre-wrap;font-family:Georgia,serif;}@media print{button{display:none}}</style></head><body><h1>🍳 Inez's Batch Cook Plan</h1><pre>${weekPlan}</pre>${nutrientFlags ? `<h2>⚠️ Nutrient Check</h2><pre>${nutrientFlags}</pre>` : ""}<script>window.print();</script></body></html>`);
    w.document.close();
  }

  const rl = (r) => {
    if (r >= 5) return { label: "She loved it! ⭐", color: "#2d6a4f" };
    if (r >= 4) return { label: "Really liked it 😊", color: "#52b788" };
    if (r >= 3) return { label: "Ate it fine 👍", color: "#b7950b" };
    if (r >= 2) return { label: "Not keen 😐", color: "#e07b39" };
    return { label: "Refused it ❌", color: "#c0392b" };
  };

  const Stars = ({ rating, onChange }) => (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s} onClick={() => onChange?.(s)} style={{ background: "none", border: "none", cursor: onChange ? "pointer" : "default", fontSize: 18, color: s <= rating ? "#f4a261" : "#ddd", padding: 0 }}>★</button>
      ))}
    </div>
  );

  function FormatBatch({ text }) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.match(/^RECIPE \d+:/i)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: 16, marginTop: i > 0 ? 24 : 0, paddingTop: i > 0 ? 20 : 0, borderTop: i > 0 ? "2px solid #f5e6d8" : "none" }}>{line}</div>;
      if (line.match(/^🍎 SNACKS THIS WEEK/)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: 16, marginTop: 28, paddingTop: 20, borderTop: "2px solid #f5e6d8" }}>{line}</div>;
      if (line.match(/^(👩‍🍳 PREP DURING|🍌 ZERO-PREP)/)) return <div key={i} style={{ fontWeight: "bold", color: "#c05621", fontSize: 13, marginTop: 12, marginBottom: 4 }}>{line}</div>;
      if (line.match(/^(NUTRITION:|INGREDIENTS:|METHOD:|FREEZING:|🥚)/i)) return <div key={i} style={{ fontWeight: "bold", color: "#555", fontSize: 13, marginTop: 8 }}>{line}</div>;
      if (line.trim() === '---') return <hr key={i} style={{ border: "none", borderTop: "1px solid #f0e0d0", margin: "6px 0" }} />;
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ paddingLeft: 12, fontSize: 13, color: "#444", lineHeight: 1.75 }}>• {line.slice(2)}</div>;
      return <div key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.75 }}>{line}</div>;
    });
  }

  function FormatWeekend({ text }) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.match(/^═/)) return <div key={i} style={{ borderTop: "3px solid #e76f51", marginTop: 24, marginBottom: 4 }} />;
      if (line.match(/^🗓️/)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: 18, marginBottom: 8 }}>{line}</div>;
      if (line.match(/^🍽️ (SATURDAY|SUNDAY)/)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: 15, marginTop: 20, marginBottom: 6 }}>{line}</div>;
      if (line.match(/^(👨‍👩‍👧‍👦|⏰ INEZ|🍽️ PLATING|🆘 FINLAY)/)) return <div key={i} style={{ fontWeight: "bold", color: "#555", fontSize: 13, marginTop: 12, marginBottom: 4 }}>{line}</div>;
      if (line.match(/^(Inez:|Finlay:|Adults:)/)) {
        const isInez = line.startsWith('Inez:');
        const isFinlay = line.startsWith('Finlay:');
        const bg = isInez ? "#fff8f0" : isFinlay ? "#f0f8ff" : "#f5f5f5";
        const border = isInez ? "#f4a261" : isFinlay ? "#90cdf4" : "#ddd";
        const emoji = isInez ? "👶" : isFinlay ? "👦" : "🍽️";
        return <div key={i} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "8px 12px", marginBottom: 6, fontSize: 13, color: "#2c3e50" }}>{emoji} {line}</div>;
      }
      if (line.match(/^Why this works/i)) return <div key={i} style={{ fontSize: 13, color: "#2d6a4f", fontStyle: "italic", marginBottom: 6 }}>{line}</div>;
      if (line.trim() === '---') return <hr key={i} style={{ border: "none", borderTop: "1px solid #f0e0d0", margin: "10px 0" }} />;
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ paddingLeft: 12, fontSize: 13, color: "#444", lineHeight: 1.75 }}>• {line.slice(2)}</div>;
      return <div key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.75 }}>{line}</div>;
    });
  }

  function FormatDay({ text }) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.match(/^(BREAKFAST|LUNCH|DINNER|MORNING SNACK|AFTERNOON SNACK|DAILY NUTRITION)/i))
        return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: 15, marginTop: i > 0 ? 22 : 0, paddingTop: i > 0 ? 16 : 0, borderTop: i > 0 ? "1px solid #f5e6d8" : "none" }}>{line}</div>;
      if (line.match(/^(Protein:|Carb:|Veg:|How to prepare:|Nutrition note:)/i))
        return <div key={i} style={{ fontWeight: "bold", color: "#555", fontSize: 13, marginTop: 6 }}>{line}</div>;
      if (line.startsWith('- ') || line.startsWith('• '))
        return <div key={i} style={{ paddingLeft: 12, fontSize: 13, color: "#444", lineHeight: 1.75 }}>• {line.slice(2)}</div>;
      return <div key={i} style={{ fontSize: 13, color: "#444", lineHeight: 1.75 }}>{line}</div>;
    });
  }

  function Card({ children, style }) {
    return <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16, ...style }}>{children}</div>;
  }

  function Btn({ label, onClick, disabled, color, style, small }) {
    return (
      <button onClick={onClick} disabled={disabled} style={{
        padding: small ? "9px 14px" : "13px 16px",
        background: disabled ? "#e0e0e0" : (color || "linear-gradient(135deg,#e76f51,#f4a261)"),
        color: disabled ? "#aaa" : "white", border: "none", borderRadius: 12,
        fontSize: small ? 12 : 14, fontWeight: "bold",
        cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Georgia,serif",
        boxShadow: disabled ? "none" : "0 3px 10px rgba(0,0,0,0.1)", ...style
      }}>{label}</button>
    );
  }

  function Toggle({ value, onChange, label, sub }) {
    return (
      <div onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: value ? "#fff8f0" : "#f8f8f8", border: `2px solid ${value ? "#f4a261" : "#eee"}`, borderRadius: 10, cursor: "pointer", marginBottom: 12 }}>
        <div style={{ width: 34, height: 19, borderRadius: 10, background: value ? "#f4a261" : "#ddd", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
          <div style={{ width: 15, height: 15, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: value ? 17 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: "bold", color: "#2c3e50" }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: "#888" }}>{sub}</div>}
        </div>
      </div>
    );
  }

  function ShoppingListDisplay({ text, prefix }) {
    return text.split('\n').map((line, i) => {
      const key = `${prefix}_${i}`;
      if (line.match(/^[A-Z][A-Z\s&\/]+:/)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", marginTop: 14, fontSize: 13 }}>{line}</div>;
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const checked = !!checkedItems[key];
        return (
          <div key={i} onClick={() => setCheckedItems(p => ({ ...p, [key]: !p[key] }))}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", cursor: "pointer" }}>
            <div style={{
              width: 20, height: 20, borderRadius: 5, flexShrink: 0,
              border: `2px solid ${checked ? "#e76f51" : "#ddd"}`,
              background: checked ? "#e76f51" : "white",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {checked && <span style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: checked ? "#aaa" : "#2c3e50", textDecoration: checked ? "line-through" : "none", transition: "all 0.2s" }}>
              {line.slice(2)}
            </span>
          </div>
        );
      }
      return <div key={i} style={{ fontSize: 13, color: "#888" }}>{line}</div>;
    });
  }

  const filteredRecipes = recipes.filter(r => {
    if (filterFavs && !r.favourite) return false;
    if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const status = fridgeStatus;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fef9f0,#fde8d0 50%,#fef0e8)", fontFamily: "Georgia,serif", paddingBottom: 50 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#e76f51,#f4a261)", padding: "26px 24px 18px", textAlign: "center", boxShadow: "0 4px 20px rgba(231,111,81,0.3)" }}>
        <div style={{ fontSize: 34, marginBottom: 4 }}>🍳</div>
        <h1 style={{ margin: 0, color: "white", fontSize: 23, fontWeight: "bold", letterSpacing: "-0.5px" }}>Inez's Kitchen</h1>
        <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 12 }}>Reflux-safe • Family meals • Made with love</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflowX: "auto" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 1px", border: "none", background: "none", fontSize: 10, fontWeight: tab === i ? "bold" : "normal", color: tab === i ? "#e76f51" : "#999", borderBottom: `3px solid ${tab === i ? "#e76f51" : "transparent"}`, cursor: "pointer", fontFamily: "Georgia,serif", whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "18px 15px", maxWidth: 600, margin: "0 auto" }}>

        {/* ── FRIDGE TRACKER ── */}
        {tab === 0 && <>

          {/* Status banner */}
          <div style={{ background: status.bg, border: `2px solid ${status.color}`, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{status.icon}</div>
            <div style={{ fontWeight: "bold", color: status.color, fontSize: 15, marginBottom: 4 }}>{status.msg}</div>
            {fridgeItems.length > 0 && (
              <div style={{ fontSize: 12, color: "#888" }}>
                {totalPortions} portions across {fridgeItems.length} meal{fridgeItems.length !== 1 ? "s" : ""} — roughly {daysLeft} day{daysLeft !== 1 ? "s" : ""} at {MEALS_PER_DAY} meals/day
              </div>
            )}
          </div>

          {/* Quick action */}
          {needsToCook && (
            <Btn label="🍳 Go to Batch Cook" onClick={() => setTab(1)} style={{ width: "100%", marginBottom: 16 }} />
          )}

          {/* Add item */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Btn label={addingFridge ? "✕ Cancel" : "＋ Add to Fridge"} onClick={() => setAddingFridge(!addingFridge)} style={{ flex: 1 }} />
            {fridgeItems.length > 0 && <Btn label="🗑️ Clear All" onClick={() => setFridgeItems([])} color="#e74c3c" small />}
          </div>

          {addingFridge && (
            <AddFridgeForm onAdd={(name, portions) => {
              const now = new Date();
              setFridgeItems(p => [{ id: Date.now(), name, portions, originalPortions: portions, addedDate: now.toLocaleDateString("en-GB"), addedTimestamp: now.getTime() }, ...p]);
              setAddingFridge(false);
            }} />
          )}

          {/* Fridge items */}
          {fridgeItems.length === 0 && !addingFridge ? (
            <Card>
              <div style={{ textAlign: "center", padding: "30px 0", color: "#bbb" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>❄️</div>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>Your fridge is empty.<br />Batch cook and add meals here to track what you have.</p>
                <Btn label="Go to Batch Cook →" onClick={() => setTab(1)} small />
              </div>
            </Card>
          ) : fridgeItems.map(item => {
            const pct = item.portions / item.originalPortions;
            const barColor = pct > 0.5 ? "#2d6a4f" : pct > 0.25 ? "#b7950b" : "#c0392b";
            return (
              <div key={item.id} style={{ background: "white", borderRadius: 14, padding: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <h4 style={{ margin: "0 0 3px", fontSize: 14, color: "#2c3e50" }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Added {item.addedDate}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: "bold", color: barColor }}>{item.portions}</span>
                    <span style={{ fontSize: 11, color: "#aaa" }}>left</span>
                    <button onClick={() => removeFridgeItem(item.id)} style={{ background: "#fff0f0", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 11, color: "#e74c3c", marginLeft: 4 }}>✕</button>
                  </div>
                </div>

                {/* Age warning */}
                {(() => {
                  const age = fridgeItemAge(item);
                  if (!age) return null;
                  return (
                    <div style={{ fontSize: 11, fontWeight: age.warn ? "bold" : "normal", color: age.color, marginBottom: 6, padding: age.warn ? "4px 8px" : 0, background: age.danger ? "#fff0f0" : age.warn ? "#fffbf0" : "transparent", borderRadius: 6 }}>
                      🕐 {age.label}
                    </div>
                  );
                })()}

                {/* Progress bar */}
                <div style={{ background: "#f0f0f0", borderRadius: 6, height: 6, marginBottom: 10 }}>
                  <div style={{ width: `${Math.min(100, pct * 100)}%`, height: "100%", borderRadius: 6, background: barColor, transition: "width 0.3s" }} />
                </div>

                {/* Use buttons */}
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => usePortions(item.id, n)} style={{ flex: 1, padding: "7px 4px", background: "#fef9f0", border: "1.5px solid #f4a261", borderRadius: 8, fontSize: 12, cursor: "pointer", color: "#c05621", fontWeight: "bold" }}>
                      Use {n}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </>}

        {/* ── BATCH COOK ── */}
        {tab === 1 && <>
          {/* Fridge status reminder */}
          {fridgeItems.length > 0 && (
            <div style={{ background: status.bg, border: `1.5px solid ${status.color}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: status.color, fontWeight: "bold" }}>
              {status.icon} {status.msg}
            </div>
          )}

          <Card>
            <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#2c3e50" }}>Inez's Batch Cook</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>4 varied recipes + snacks. Won't repeat what's already in the fridge.</p>
            <Toggle value={useLeftovers} onChange={setUseLeftovers} label="🧊 Use up what's in my fridge" sub="Tell me what ingredients you have" />
            {useLeftovers && <StableTextarea value={leftovers} onBlur={setLeftovers} placeholder="e.g. sweet potato, turkey mince, courgette..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #f4a261", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 12, boxSizing: "border-box", resize: "none" }} />}
            <Btn label={batchLoading ? `⏳ ${batchMsg}` : "✨ Generate This Week's Plan"} onClick={generateBatchPlan} disabled={batchLoading} style={{ width: "100%" }} />
          </Card>

          {nutrientFlags && (
            <Card style={{ background: "#fffbf0", border: "1.5px solid #f4d58d" }}>
              <h3 style={{ margin: "0 0 10px", color: "#b7850b", fontSize: 14 }}>⚠️ Nutrient Check</h3>
              <div style={{ fontSize: 13, color: "#5a4000", lineHeight: 1.8 }}>
                {nutrientFlags.split('\n').map((line, i) => line.startsWith('- ') || line.startsWith('• ') ? <div key={i} style={{ paddingLeft: 10 }}>• {line.slice(2)}</div> : <div key={i}>{line}</div>)}
              </div>
            </Card>
          )}

          {weekPlan && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "#e76f51", fontSize: 16 }}>🍽️ This Week's Plan</h3>
                <Btn label="🖨️ Print" onClick={printBatch} small color="#555" />
              </div>
              <FormatBatch text={weekPlan} />
              <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
                <Btn label={batchLoading ? "⏳" : "🛒 Shopping List"} onClick={generateShoppingList} disabled={batchLoading} color="#2d6a4f" style={{ flex: 1 }} />
                <Btn label="❄️ Add to Fridge" onClick={addBatchToFridge} color="#2b6cb0" style={{ flex: 1 }} />
                <Btn label="📖 Save Recipes" onClick={() => setShowSavePanel(!showSavePanel)} color="#f4a261" style={{ flex: 1 }} />
              </div>

              {showSavePanel && (parsedRecipes.length === 0 ? (
                <div style={{ marginTop: 16, padding: 16, background: "#fef9f0", borderRadius: 12, border: "1.5px solid #f4a261", fontSize: 13, color: "#888", textAlign: "center" }}>
                  Regenerate your plan to use the new save feature — tap ✨ Generate again and your recipes will be selectable.
                </div>
              ) :
                <div style={{ marginTop: 16, padding: 16, background: "#fef9f0", borderRadius: 12, border: "1.5px solid #f4a261" }}>
                  <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: "bold", color: "#2c3e50" }}>Select recipes to save — tick the ones you want, replace the ones you don't:</p>
                  {parsedRecipes.map(r => (
                    <div key={r.number} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0e0d0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }} onClick={() => setSelectedToSave(p => ({ ...p, [r.number]: !p[r.number] }))}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${selectedToSave[r.number] ? "#e76f51" : "#ddd"}`, background: selectedToSave[r.number] ? "#e76f51" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {selectedToSave[r.number] && <span style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, color: selectedToSave[r.number] ? "#2c3e50" : "#aaa", textDecoration: selectedToSave[r.number] ? "none" : "line-through" }}>Recipe {r.number}: {r.name}</span>
                      </div>
                      <button onClick={() => regenerateRecipe(r.number)} disabled={batchLoading} style={{ marginLeft: 8, padding: "4px 10px", background: "#f0f8ff", border: "1.5px solid #90cdf4", borderRadius: 8, fontSize: 11, color: "#2b6cb0", cursor: "pointer", fontWeight: "bold", flexShrink: 0 }}>
                        🔄 Replace
                      </button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <Btn label={`💾 Save ${Object.values(selectedToSave).filter(Boolean).length} Recipe${Object.values(selectedToSave).filter(Boolean).length !== 1 ? 's' : ''}`} onClick={saveSelectedRecipes} style={{ flex: 1 }} disabled={!Object.values(selectedToSave).some(Boolean)} />
                    <Btn label="Cancel" onClick={() => setShowSavePanel(false)} color="#aaa" small />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {shoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>🛒 Inez's Shopping List</h3><ShoppingListDisplay text={shoppingList} prefix="batch" /></Card>}
        </>}

        {/* ── DAY PLANNER ── */}
        {tab === 2 && <>
          <Card>
            <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#2c3e50" }}>Inez's Day Planner</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>Full balanced day — no repeated proteins or carbs. Prioritises what's in the fridge.</p>
            <Toggle value={includeEggs} onChange={setIncludeEggs} label="🥚 Include egg ideas" sub="Suggest egg meals and where to add egg yolk" />
            <StableTextarea value={dayNote} onBlur={setDayNote} placeholder="Any notes? e.g. 'she had fish yesterday'..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 14, boxSizing: "border-box", resize: "none" }} />
            <Btn label={dayLoading ? "⏳ Planning Inez's day..." : "☀️ Plan Today's Meals"} onClick={generateDayPlan} disabled={dayLoading} style={{ width: "100%" }} />
          </Card>
          {dayPlan && (
            <Card>
              <h3 style={{ margin: "0 0 4px", color: "#e76f51", fontSize: 16 }}>☀️ Today's Plan</h3>
              <p style={{ margin: "0 0 16px", fontSize: 11, color: "#bbb" }}>Balanced across the whole day</p>
              <FormatDay text={dayPlan} />
              <Btn label="🔄 Generate Another Day" onClick={generateDayPlan} disabled={dayLoading} style={{ width: "100%", marginTop: 18 }} />
            </Card>
          )}
          {!dayPlan && !dayLoading && <Card><div style={{ textAlign: "center", padding: "20px 0" }}><div style={{ fontSize: 40, marginBottom: 10 }}>☀️</div><p style={{ margin: 0, fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>Plan a nutritionally balanced day for Inez.</p></div></Card>}
        </>}

        {/* ── WEEKEND PLANNER ── */}
        {tab === 3 && <>
          <Card>
            <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#2c3e50" }}>👨‍👩‍👧‍👦 Weekend Family Meals</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>Saturday + Sunday lunch and dinner — one meal adapted for everyone.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["👶 Inez", "👦 Finlay", "🍽️ Adults"].map((label, i) => (
                <div key={i} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: i === 0 ? "#fff8f0" : i === 1 ? "#f0f8ff" : "#f5f5f5", border: `1.5px solid ${i === 0 ? "#f4a261" : i === 1 ? "#90cdf4" : "#ddd"}`, color: i === 0 ? "#c05621" : i === 1 ? "#2b6cb0" : "#555" }}>{label}</div>
              ))}
            </div>
            <StableTextarea value={weekendNote} onBlur={setWeekendNote} placeholder="Any notes? e.g. 'keep it simple', 'use up chicken'..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 14, boxSizing: "border-box", resize: "none" }} />
            <Btn label={weekendLoading ? `⏳ ${weekendMsg}` : "🗓️ Plan Our Weekend Meals"} onClick={generateWeekendPlan} disabled={weekendLoading} style={{ width: "100%" }} />
          </Card>

          {weekendPlan && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "#e76f51", fontSize: 16 }}>🗓️ This Weekend's Plan</h3>
                <Btn label="🖨️ Print" onClick={printWeekend} small color="#555" />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {[["👶 Inez", "#fff8f0", "#f4a261", "#c05621"], ["👦 Finlay", "#f0f8ff", "#90cdf4", "#2b6cb0"], ["🍽️ Adults", "#f5f5f5", "#ddd", "#555"]].map(([label, bg, border, color], i) => (
                  <div key={i} style={{ padding: "4px 10px", borderRadius: 16, fontSize: 11, background: bg, border: `1.5px solid ${border}`, color }}>{label}</div>
                ))}
                <div style={{ padding: "4px 10px", borderRadius: 16, fontSize: 11, background: "#fff0f5", border: "1.5px solid #feb2b2", color: "#c53030" }}>🆘 Finlay Fallback</div>
              </div>
              <FormatWeekend text={weekendPlan} />
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn label={weekendShoppingLoading ? "⏳" : "🛒 Weekend Shopping"} onClick={generateWeekendShopping} disabled={weekendShoppingLoading} color="#2d6a4f" style={{ flex: 1 }} />
                <Btn label="🔄 New Weekend" onClick={generateWeekendPlan} disabled={weekendLoading} color="#f4a261" style={{ flex: 1 }} />
              </div>
            </Card>
          )}

          {weekendShoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>🛒 Weekend Shopping List</h3><ShoppingListDisplay text={weekendShoppingList} prefix="weekend" /></Card>}

          {!weekendPlan && !weekendLoading && (
            <Card><div style={{ textAlign: "center", padding: "24px 0", color: "#bbb" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
              <p style={{ margin: 0, fontSize: 13, color: "#aaa", lineHeight: 1.8 }}>Plan Saturday and Sunday meals for the whole family.<br />One meal, adapted for Inez, Finlay and the adults.<br /><span style={{ fontSize: 12, color: "#c05621" }}>Finlay fallbacks included just in case.</span></p>
            </div></Card>
          )}
        </>}

        {/* ── RECIPE BOOK ── */}
        {tab === 4 && <>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Btn label={addingRecipe ? "✕ Cancel" : "＋ Log Recipe"} onClick={() => setAddingRecipe(!addingRecipe)} style={{ flex: 1 }} />
            <Btn label={ideaLoading ? "⏳" : "✨ Recipe Idea"} onClick={getRecipeIdea} disabled={ideaLoading} color="#2d6a4f" style={{ flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <StableInput value={searchTerm} onBlur={setSearchTerm} placeholder="🔍 Search recipes..." style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 13, fontFamily: "Georgia,serif" }} />
            <button onClick={() => setFilterFavs(!filterFavs)} style={{ padding: "9px 14px", borderRadius: 10, border: `2px solid ${filterFavs ? "#e76f51" : "#eee"}`, background: filterFavs ? "#fff3f0" : "white", fontSize: 13, cursor: "pointer", color: filterFavs ? "#e76f51" : "#aaa", fontWeight: "bold" }}>❤️</button>
          </div>

          {recipeIdea && (
            <Card style={{ background: "#f0faf4", border: "1px solid #b7e4c7" }}>
              <h3 style={{ margin: "0 0 12px", color: "#2d6a4f", fontSize: 14 }}>✨ Recipe Idea</h3>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.8, color: "#2c3e50" }}>{recipeIdea}</div>
              <Btn label="Log this recipe →" onClick={() => { setAddingRecipe(true); setRecipeIdea(null); }} small style={{ marginTop: 12 }} />
            </Card>
          )}

          {addingRecipe && (
            <Card>
              <h3 style={{ margin: "0 0 14px", color: "#2c3e50", fontSize: 15 }}>Log a Recipe</h3>
              <input ref={recipeNameRef} defaultValue={newName} placeholder="Recipe name..." style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 16, fontFamily: "Georgia,serif", marginBottom: 10, boxSizing: "border-box" }} />
              <textarea ref={recipeNotesRef} defaultValue={newNotes} placeholder="Notes — ingredients, tweaks, things to remember..." rows={3} style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 16, fontFamily: "Georgia,serif", marginBottom: 12, boxSizing: "border-box", resize: "vertical" }} />
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "#555", fontWeight: "bold" }}>How did she find it?</p>
              <Stars rating={newRating} onChange={setNewRating} />
              <p style={{ margin: "6px 0 14px", fontSize: 12, color: rl(newRating).color }}>{rl(newRating).label}</p>
              <Btn label="Save Recipe" onClick={saveRecipe} style={{ width: "100%" }} />
            </Card>
          )}

          {filteredRecipes.length === 0 ? (
            <Card><div style={{ textAlign: "center", padding: "30px 0", color: "#bbb" }}><div style={{ fontSize: 44, marginBottom: 10 }}>📖</div><p style={{ margin: 0, fontSize: 13 }}>{recipes.length === 0 ? "No recipes yet. Start building Inez's recipe book!" : "No recipes match your filter."}</p></div></Card>
          ) : filteredRecipes.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 14, padding: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 10, borderLeft: `4px solid ${rl(r.rating).color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <h4 style={{ margin: 0, color: "#2c3e50", fontSize: 14 }}>{r.name}</h4>
                    {r.favourite && <span style={{ fontSize: 13 }}>❤️</span>}
                  </div>
                  <Stars rating={r.rating} />
                  <p style={{ margin: "4px 0 2px", fontSize: 11, color: rl(r.rating).color, fontWeight: "bold" }}>{rl(r.rating).label}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#ccc" }}>{r.date}</p>
                </div>
                <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                  <button onClick={() => toggleFav(r.id)} style={{ background: r.favourite ? "#fff0f0" : "#f8f8f8", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 12 }}>❤️</button>
                  <button onClick={() => setExpandedRecipe(expandedRecipe === r.id ? null : r.id)} style={{ background: "#f8f8f8", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 11, color: "#666" }}>{expandedRecipe === r.id ? "▲" : "▼"}</button>
                  <button onClick={() => deleteRecipe(r.id)} style={{ background: "#fff0f0", border: "none", borderRadius: 8, padding: "5px 9px", cursor: "pointer", fontSize: 11, color: "#e74c3c" }}>✕</button>
                </div>
              </div>
              {expandedRecipe === r.id && (
                <div style={{ marginTop: 12 }}>
                  {r.notes
                    ? <div style={{ padding: 12, background: "#fef9f0", borderRadius: 8, fontSize: 12, color: "#555", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 10 }}>{r.notes}</div>
                    : <div style={{ padding: 10, background: "#f8f8f8", borderRadius: 8, fontSize: 12, color: "#aaa", marginBottom: 10 }}>No notes saved for this recipe.</div>
                  }
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#aaa" }}>Update rating:</p>
                  <Stars rating={r.rating} onChange={(v) => updateRating(r.id, v)} />
                </div>
              )}
            </div>
          ))}
        </>}

        {/* ── SHOPPING ── */}
        {tab === 5 && (
          (shoppingList || weekendShoppingList) ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Tap items as you shop. Lists saved until cleared.</p>
                <button onClick={() => {
                  setShoppingList(null); setWeekendShoppingList(null); setCheckedItems({});
                  try { localStorage.removeItem("inez_shopping"); localStorage.removeItem("inez_weekend_shopping"); localStorage.removeItem("inez_checked"); } catch {}
                }} style={{ padding: "6px 12px", background: "#fff0f0", border: "1.5px solid #feb2b2", borderRadius: 8, fontSize: 11, color: "#c0392b", cursor: "pointer", fontWeight: "bold" }}>
                  🗑️ Clear lists
                </button>
              </div>
              {shoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>🍳 Inez's Batch Cook List</h3><ShoppingListDisplay text={shoppingList} prefix="batch" /></Card>}
              {weekendShoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>👨‍👩‍👧‍👦 Weekend Family List</h3><ShoppingListDisplay text={weekendShoppingList} prefix="weekend" /></Card>}
            </div>
          ) : (
            <Card><div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
              <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.6, color: "#aaa" }}>Generate a batch cook or weekend plan and your shopping lists will appear here.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Btn label="Batch Cook →" onClick={() => setTab(1)} small />
                <Btn label="Weekend →" onClick={() => setTab(3)} small color="#2d6a4f" />
              </div>
            </div></Card>
          )
        )}

      </div>
    </div>
  );
}
