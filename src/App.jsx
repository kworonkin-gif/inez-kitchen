import React, { useState, useEffect, useMemo, useCallback } from "react";

const INEZ_CONTEXT = `You are a specialist paediatric nutritionist and chef helping plan meals for a 20-month-old girl named Inez who has Sotos syndrome and acid reflux (GERD).

SOTOS SYNDROME NUTRITION PRIORITY:
Sotos syndrome causes rapid overgrowth. Inez needs SIGNIFICANTLY more calories and protein than a typical toddler her age. Every meal must be calorie-dense and protein-rich. Think of her as needing adult-sized portions with toddler-safe textures. Never suggest small or light meals.

MEDICAL CONDITIONS:
- Sotos syndrome: Higher calorie intake essential to support rapid growth. Normal balanced diet otherwise.
- Acid reflux (GERD): Drives all specific dietary restrictions below.

CONFIRMED ALLERGIES / AVOID COMPLETELY:
- Chicken (allergic)
- Apples (allergic)
- Cacao / chocolate
- All cow protein: no beef, no dairy (milk, cheese, butter, yogurt, cream)
- Acidic foods: tomatoes, citrus fruits, raspberries, vinegar, green apples, bell peppers
- Garlic and onion (confirmed GERD triggers)
- Leeks (avoid generally)
- Full-fat coconut milk (high fat = GERD trigger)
- All high fat foods. Oil: maximum 1 teaspoon per meal
- Hard, chewy, or dry textures
- Nuts (choking hazard and high fat)
- Processed foods (everything from scratch)

COOKING METHODS: Only steamed, boiled, or oven baked. No frying or sauteing. ALWAYS state exact method, oven temperature, cooking time, and texture to aim for.

APPROVED PROTEINS (verified GERD-safe, low fat):
Turkey (lean, no skin), veal, rabbit, lean white fish (cod, haddock, sole, plaice), salmon (max 2x/week), prawns, eggs + egg yolks, silken/soft tofu, lentils (well rinsed), chickpeas (well rinsed), cannellini beans, black beans, edamame

APPROVED VEGETABLES (verified GERD-safe - CHOP, Johns Hopkins, NIDDK):
Carrots, broccoli, green beans, peas, asparagus, sweet potato, courgette/zucchini, spinach, kale, cauliflower, butternut squash, beetroot, cucumber, baked potato, beets, parsnip, swede, corn (soft, well cooked)

APPROVED FRUITS (non-acidic, GERD-safe):
Banana, ripe pear, melon (all types), avocado, papaya, mango, watermelon, blueberries (small amounts)

APPROVED GRAINS (verified GERD-safe whole grains):
Oatmeal/porridge (absorbs stomach acid - excellent), brown rice, quinoa, millet, farro, couscous, whole grain pasta (small shapes only: orzo, small shells, ditalini), whole grain bread (soft, moist only)

SAFE FLAVOURINGS: Ginger (small amounts - beneficial for reflux), basil, oregano, parsley, dill, coriander/cilantro, thyme, rosemary, sage, cumin, turmeric, mild paprika, cardamom, lemongrass, cinnamon, caraway, za'atar (without sumac), fresh herbs generously

CALCIUM ALTERNATIVES (no dairy):
Fortified oat milk (use in cooking), fortified rice milk, tinned salmon with bones (mashed), broccoli, kale, tofu (calcium-set), edamame

IRON PRIORITY (toddlers need ~7mg iron/day - critical for rapid growth with Sotos):
EVERY meal must include at least one iron-rich ingredient.
Best iron sources: lentils, chickpeas, beans, tofu, quinoa, beetroot, spinach, broccoli, egg yolk, lean fish, turkey, prawns, edamame, farro
ALWAYS pair plant-based iron with vitamin C for absorption. State the pairing explicitly.

TEXTURE AND FEEDING:
Inez cannot self-feed with a spoon - fed by an adult. All meals must be soft and spoonable. Small pasta shapes only. Nothing dry - always add moist sauce, broth, or puree. She can finger-pick soft pieces.

BREADCRUMBED FISH (GERD-safe method):
Pat fish dry. Dip in beaten egg (no flour, no milk). Press into plain unseasoned breadcrumbs. Bake at 180C on lightly oiled tray for 15-18 mins until soft inside. Always serve with moist sides.

GLOBAL CUISINE VARIETY - MANDATORY:
Each batch cook MUST use at least 3 different culinary traditions. Be creative and interesting.
Draw from: Japanese (dashi broth), Thai (lemongrass, coconut-free), Indian-inspired (turmeric, cumin, coriander - no chilli/garlic/onion), Moroccan/North African (tagine-inspired, cumin, cinnamon, couscous), Middle Eastern (za'atar, cumin, lentils), Mediterranean (herbs, olive oil), Latin American (cumin, coriander, mild beans), West African (herb-forward).
ALWAYS adapt to remove garlic, onion, acidic ingredients. Never default to bland or boring.

PORTIONS: Very large - she eats more than most adults. 3 big meals + 2 substantial snacks daily. Each recipe makes 5 large portions.

NUTRITION - BUILD INTO EVERY RECIPE (do not list as separate check):
Every recipe must already include: high protein, iron-rich ingredient + vitamin C pairing, calcium alternative, healthy fat (avocado/egg yolk/1 tsp olive oil), high fibre from wholegrains or legumes, zinc from turkey/fish/legumes/oats.

METHOD CLARITY: Write complete unambiguous instructions. State method, temperature, time, texture goal, how to serve. Never assume the reader knows the method.`;

const FAMILY_CONTEXT = `You are a family meal planner helping a family of 4 with very different dietary needs plan shared weekend meals.

THE FAMILY:
- Mum (Karolina): healthy, nutritious food, easy to please, no restrictions
- Phil (partner): eats anything, less focused on health, easy to please
- Finlay (8, stepson): FUSSY. Likes beige comfort food. Hates chunks of vegetables. Sauce is fine ONLY when fully integrated into the dish. Any sauce that could touch separate items = NO. Components must be clearly separated on his plate. Favourites: pasta, fish fingers, chips, spaghetti bolognese (veg blended in).
- Inez (20 months): Has acid reflux (GERD) and Sotos syndrome. ALLERGIC TO CHICKEN. No cow protein/dairy, no beef, no acidic foods (tomatoes, citrus), no garlic/onion, no cacao, no apple, very minimal oil (1 tsp max), no leeks. APPROVED proteins: turkey, veal, rabbit, lean white fish, salmon (max 2x/week), eggs, tofu, prawns, lentils, chickpeas. All food must be SOFT, MOIST, and SPOONABLE. She needs HIGH CALORIES for rapid growth (Sotos syndrome). Her meals must look as similar as possible to everyone else's.

THE APPROACH: Cook ONE base meal, then adapt it 3 ways. One shop, one cook session.

ALWAYS include:
1. EXACT moment to set Inez's portion aside BEFORE adding garlic, spice, onion, dairy or adult flavourings
2. Complete step-by-step instructions for Inez's version - full method, moisture throughout
3. Finlay's plating - components separated, sauce integrated not poured over
4. Finlay Fallback - dead simple pantry alternative if he refuses
5. How to make Inez's plate look similar to everyone else's`;

const TABS = ["Fridge", "Batch Cook", "Day Plan", "Weekend", "Recipes", "Shopping"];
const TAB_ICONS = ["❄️", "🍳", "☀️", "👨‍👩‍👧‍👦", "📖", "🛒"];
const MEALS_PER_DAY = 3;

function StableInput({ value, onBlur, placeholder, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current && document.activeElement !== ref.current) ref.current.value = value || ""; }, [value]);
  return <input ref={ref} defaultValue={value || ""} placeholder={placeholder} onBlur={e => onBlur && onBlur(e.target.value)} style={{ ...style, fontSize: Math.max(16, style?.fontSize || 16) }} />;
}

function StableTextarea({ value, onBlur, placeholder, rows, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current && document.activeElement !== ref.current) ref.current.value = value || ""; }, [value]);
  return <textarea ref={ref} defaultValue={value || ""} placeholder={placeholder} rows={rows} onBlur={e => onBlur && onBlur(e.target.value)} style={{ ...style, fontSize: Math.max(16, style?.fontSize || 16) }} />;
}

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
      <input ref={inputRef} defaultValue="" placeholder="Meal name e.g. Turkey & lentil stew..." style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 16, fontFamily: "Georgia,serif", marginBottom: 12, boxSizing: "border-box" }} />
      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, color: "#555", fontWeight: "bold" }}>How many portions?</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setPortions(p => Math.max(1, p - 1))} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #f4a261", background: "white", fontSize: 20, cursor: "pointer", color: "#e76f51", fontWeight: "bold" }}>-</button>
          <span style={{ fontSize: 22, fontWeight: "bold", color: "#2c3e50", minWidth: 30, textAlign: "center" }}>{portions}</span>
          <button onClick={() => setPortions(p => p + 1)} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #f4a261", background: "white", fontSize: 20, cursor: "pointer", color: "#e76f51", fontWeight: "bold" }}>+</button>
        </div>
      </div>
      <button onClick={handleAdd} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#e76f51,#f4a261)", color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia,serif" }}>Add to Fridge</button>
    </div>
  );
}

export default function MealPlanner() {
  const [apiKey, setApiKey] = useState(() => { try { return localStorage.getItem("inez_groq_key") || ""; } catch { return ""; } });
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [tab, setTab] = useState(0);

  if (!apiKey) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fef9f0,#fde8d0 50%,#fef0e8)", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍳</div>
            <h1 style={{ fontSize: 22, color: "#2c3e50", marginBottom: 8 }}>Inez's Kitchen</h1>
            <p style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>One-time setup. Enter your free Groq API key to power the recipe generator.</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#555", marginBottom: 8, fontWeight: "bold" }}>Your Groq API Key:</p>
            <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} placeholder="gsk_..." style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: 14, fontFamily: "Georgia,serif", boxSizing: "border-box", marginBottom: 8 }} />
            <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>Get your free key at <strong>console.groq.com</strong> - API Keys - Create API key. Stored only on this device.</p>
          </div>
          <button onClick={() => { const key = apiKeyInput.trim(); if (key.length > 20) { localStorage.setItem("inez_groq_key", key); setApiKey(key); } else { alert("Please enter a valid Groq API key (starts with gsk_)"); } }} style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#e76f51,#f4a261)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia,serif" }}>Let's Go!</button>
          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>Free tier - no credit card needed</p>
        </div>
      </div>
    );
  }

  const [recipes, setRecipes] = useState(() => { try { return JSON.parse(localStorage.getItem("inez_v4") || "[]"); } catch { return []; } });
  const [fridgeItems, setFridgeItems] = useState(() => { try { return JSON.parse(localStorage.getItem("inez_fridge") || "[]"); } catch { return []; } });
  const [addingFridge, setAddingFridge] = useState(false);

  const [batchRecipes, setBatchRecipes] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMsg, setBatchMsg] = useState("");
  const [batchSnacks, setBatchSnacks] = useState("");
  const [leftovers, setLeftovers] = useState("");
  const [useLeftovers, setUseLeftovers] = useState(false);
  const [shoppingList, setShoppingList] = useState(() => { try { return localStorage.getItem("inez_shopping") || null; } catch { return null; } });
  const [shoppingLoading, setShoppingLoading] = useState(false);

  const [dayPlan, setDayPlan] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [dayNote, setDayNote] = useState("");
  const [includeEggs, setIncludeEggs] = useState(true);

  const [weekendPlan, setWeekendPlan] = useState(null);
  const [weekendLoading, setWeekendLoading] = useState(false);
  const [weekendNote, setWeekendNote] = useState("");
  const [weekendShoppingList, setWeekendShoppingList] = useState(() => { try { return localStorage.getItem("inez_weekend_shopping") || null; } catch { return null; } });
  const [weekendShoppingLoading, setWeekendShoppingLoading] = useState(false);

  const [checkedItems, setCheckedItems] = useState(() => { try { return JSON.parse(localStorage.getItem("inez_checked") || "{}"); } catch { return {}; } });
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

  useEffect(() => { try { localStorage.setItem("inez_v4", JSON.stringify(recipes)); } catch {} }, [recipes]);
  useEffect(() => { try { localStorage.setItem("inez_fridge", JSON.stringify(fridgeItems)); } catch {} }, [fridgeItems]);
  useEffect(() => { try { if (shoppingList) localStorage.setItem("inez_shopping", shoppingList); } catch {} }, [shoppingList]);
  useEffect(() => { try { if (weekendShoppingList) localStorage.setItem("inez_weekend_shopping", weekendShoppingList); } catch {} }, [weekendShoppingList]);
  useEffect(() => { try { localStorage.setItem("inez_checked", JSON.stringify(checkedItems)); } catch {} }, [checkedItems]);

  const totalPortions = fridgeItems.reduce((sum, item) => sum + item.portions, 0);
  const daysLeft = Math.floor(totalPortions / MEALS_PER_DAY);
  const needsToCook = daysLeft < 2;
  const cookSoon = daysLeft >= 2 && daysLeft < 4;

  const fridgeStatus = useMemo(() => {
    if (fridgeItems.length === 0) return { msg: "Fridge is empty - time to batch cook!", color: "#c0392b", bg: "#fff0f0", icon: "🚨" };
    if (needsToCook) return { msg: `Only ${daysLeft} day${daysLeft === 1 ? "" : "s"} of food left - batch cook soon!`, color: "#c0392b", bg: "#fff0f0", icon: "🚨" };
    if (cookSoon) return { msg: `About ${daysLeft} days of food left - plan your next batch cook.`, color: "#b7850b", bg: "#fffbf0", icon: "⚠️" };
    return { msg: `You have roughly ${daysLeft} days of food in the fridge.`, color: "#2d6a4f", bg: "#f0faf4", icon: "✅" };
  }, [fridgeItems, daysLeft, needsToCook, cookSoon]);

  function getDaysAgo(timestamp) { if (!timestamp) return null; return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)); }

  const fridgeItemAge = useCallback((item) => {
    const days = getDaysAgo(item.addedTimestamp);
    if (days === null) return null;
    if (days === 0) return { label: "Added today", color: "#2d6a4f", warn: false, danger: false };
    if (days === 1) return { label: "Added yesterday", color: "#2d6a4f", warn: false, danger: false };
    if (days <= 3) return { label: `${days} days ago`, color: "#b7950b", warn: false, danger: false };
    if (days === 4) return { label: `${days} days ago - use or freeze today!`, color: "#e07b39", warn: true, danger: false };
    return { label: `${days} days ago - DO NOT USE if not frozen`, color: "#c0392b", warn: true, danger: true };
  }, []);

  function usePortions(id, n) { setFridgeItems(p => p.map(item => item.id !== id ? item : { ...item, portions: Math.max(0, item.portions - n) }).filter(item => item.portions > 0)); }
  function removeFridgeItem(id) { setFridgeItems(p => p.filter(item => item.id !== id)); }

  async function callGroq(prompt, systemPrompt) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 6000, temperature: 0.9, messages: [...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: prompt }] })
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.choices?.[0]?.message?.content || "";
  }

  async function callGroqStream(prompt, systemPrompt, onChunk) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 6000, temperature: 0.9, stream: true, messages: [...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []), { role: "user", content: prompt }] })
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
          if (line === "data: [DONE]") continue;
          const data = JSON.parse(line.slice(6));
          const text = data.choices?.[0]?.delta?.content;
          if (text) { fullText += text; onChunk(fullText); }
        } catch {}
      }
    }
    return fullText;
  }

  function parseRecipesFromText(text) {
    const lines = text.split('\n');
    const parsed = [];
    let current = null;
    for (const line of lines) {
      const match = line.match(/^RECIPE (\d+):\s*(.+)/i);
      if (match) {
        if (current) parsed.push(current);
        current = { number: match[1], name: match[2].replace(/\s*-\s*.+$/, '').trim(), content: line + '\n', kept: true, expanded: false };
      } else if (current) {
        if (line.match(/^SNACKS THIS WEEK/i) || line.match(/^🍎/)) { parsed.push(current); current = null; break; }
        current.content += line + '\n';
      }
    }
    if (current) parsed.push(current);
    return parsed;
  }

  function extractSnacks(text) {
    const markers = ['🍎 SNACKS THIS WEEK', 'SNACKS THIS WEEK'];
    for (const marker of markers) {
      const idx = text.indexOf(marker);
      if (idx !== -1) return text.slice(idx);
    }
    return '';
  }

  async function generateBatchPlan() {
    setBatchLoading(true); setBatchMsg("Generating your personalised recipes..."); setBatchRecipes([]); setBatchSnacks(""); setShoppingList(null);
    const prev = recipes.length > 0 ? `Previously made (avoid repeating): ${recipes.map(r => r.name).join(", ")}.` : "";
    const dislikes = recipes.filter(r => r.rating <= 2).map(r => r.name);
    const dislikeNote = dislikes.length ? `She did NOT enjoy these - do not use: ${dislikes.join(", ")}.` : "";
    const fridgeNote = fridgeItems.length > 0 ? `Already in fridge (do not duplicate): ${fridgeItems.map(f => f.name).join(", ")}.` : "";
    const leftoverNote = useLeftovers && leftovers.trim() ? `USE THESE INGREDIENTS in at least 2 recipes: ${leftovers}` : "";

    const prompt = `${prev}
${dislikeNote}
${fridgeNote}
${leftoverNote}

Generate exactly 4 batch cook recipes for Inez. Each recipe must:
- Use a DIFFERENT protein
- Use a DIFFERENT carb/grain
- Come from a DIFFERENT culinary tradition (at least 3 different traditions across the 4 recipes)
- Be calorie-dense and protein-rich (Sotos syndrome - she needs much more than a typical toddler)
- Include iron-rich ingredient paired with vitamin C (build it in, do not list as a separate check)
- Include a calcium alternative (oat milk, tofu, broccoli, kale, tinned salmon)
- Be moist and spoonable throughout
- Be interesting and flavourful - not bland or boring
- NEVER include chicken, apple, cacao, dairy, beef, garlic, onion, acidic foods, nuts

Format each recipe EXACTLY as:

RECIPE 1: [Name] - [Cuisine tradition]
NUTRITION: Protein: [source] | Iron + Vit C: [pairing] | Calcium: [source]
INGREDIENTS (5 large portions):
[ingredient list with quantities]
METHOD:
[Complete steps. State: cooking method, temperature, time, texture goal, how to serve]
FREEZING: [Instructions]
EGG YOLK BOOST: [Yes/No - if yes, how and when]

---

RECIPE 2: [Name] - [Cuisine tradition]
[same format]

---

RECIPE 3: [Name] - [Cuisine tradition]
[same format]

---

RECIPE 4: [Name] - [Cuisine tradition]
[same format]

---

🍎 SNACKS THIS WEEK

👩 PREP DURING BATCH COOK (uses ingredients already out):
[snack name] - from Recipe [X], uses [ingredient]. Prep: [method]
[snack name] - from Recipe [X], uses [ingredient]. Prep: [method]
[snack name] - from Recipe [X], uses [ingredient]. Prep: [method]

🍌 ZERO-PREP SNACKS:
[snack] - [why good for Inez + how to serve]
[snack] - [why good for Inez + how to serve]
[snack] - [why good for Inez + how to serve]`;

    try {
      let fullText = "";
      await callGroqStream(prompt, INEZ_CONTEXT, (partial) => { fullText = partial; setBatchMsg("Generating... ✨"); });
      const parsed = parseRecipesFromText(fullText);
      const snacks = extractSnacks(fullText);
      setBatchRecipes(parsed);
      setBatchSnacks(snacks);
      setBatchMsg("");
    } catch (e) {
      setBatchMsg("Error: " + e.message + ". Tap Change Key (top right) if your key looks wrong.");
    }
    setBatchLoading(false);
  }

  async function regenerateUnticked() {
    const toRegenerate = batchRecipes.filter(r => !r.kept);
    if (toRegenerate.length === 0) return;
    const toKeep = batchRecipes.filter(r => r.kept).map(r => r.name);
    setBatchLoading(true); setBatchMsg(`Regenerating ${toRegenerate.length} recipe${toRegenerate.length > 1 ? 's' : ''}...`);
    try {
      const newRecipesList = await Promise.all(toRegenerate.map(async (r) => {
        const result = await callGroq(
          `Generate ONE replacement recipe to replace "${r.name}". Must be DIFFERENT from: ${toKeep.join(", ")}. Different protein, different cuisine tradition, calorie-dense, moist, Inez-safe (no chicken, no dairy, no garlic/onion, no apple, no cacao, no acidic foods). Format EXACTLY:\n\nRECIPE ${r.number}: [Name] - [Cuisine]\nNUTRITION: Protein: [source] | Iron + Vit C: [pairing] | Calcium: [source]\nINGREDIENTS (5 large portions):\n[list]\nMETHOD:\n[steps with temp, time, texture]\nFREEZING: [instructions]\nEGG YOLK BOOST: [yes/no]`,
          INEZ_CONTEXT
        );
        const match = result.match(/^RECIPE \d+:\s*(.+)/im);
        const name = match ? match[1].replace(/\s*-\s*.+$/, '').trim() : r.name;
        return { ...r, name, content: result, kept: true };
      }));
      setBatchRecipes(prev => prev.map(r => { const updated = newRecipesList.find(n => n.number === r.number); return updated || r; }));
    } catch (e) { setBatchMsg("Error regenerating. Please try again."); }
    setBatchLoading(false);
  }

  function saveRecipeFromBatch(recipe) {
    const now = new Date().toLocaleDateString("en-GB");
    setRecipes(p => [{ id: Date.now() + Math.random(), name: recipe.name, notes: recipe.content, rating: 3, favourite: false, date: now }, ...p]);
    alert(`"${recipe.name}" saved to your Recipe Book!`);
  }

  async function generateSmartShoppingList() {
    if (batchRecipes.length === 0) return;
    setShoppingLoading(true);
    const fridgeStock = fridgeItems.length > 0 ? `\n\nALREADY IN FRIDGE - do NOT include on shopping list unless significantly more is needed:\n${fridgeItems.map(f => f.name).join(", ")}` : "";
    const allText = batchRecipes.map(r => r.content).join("\n\n") + "\n\n" + batchSnacks;
    try {
      const result = await callGroq(`Create a consolidated shopping list from these recipes. Group by: PROTEINS:, VEGETABLES:, GRAINS & CARBS:, FRUIT:, PANTRY & HERBS:. Combine duplicates. Each item on its own line starting with "- ".${fridgeStock}\n\nRECIPES:\n${allText}`);
      setShoppingList(result);
    } catch (e) { setShoppingList("Something went wrong generating the shopping list."); }
    setShoppingLoading(false);
  }

  function addBatchToFridge() {
    if (batchRecipes.length === 0) return;
    const now = new Date();
    batchRecipes.forEach(r => { setFridgeItems(p => [{ id: Date.now() + Math.random(), name: r.name, portions: 5, originalPortions: 5, addedDate: now.toLocaleDateString("en-GB"), addedTimestamp: now.getTime() }, ...p]); });
    setTab(0);
  }

  async function generateWeekendPlan() {
    setWeekendLoading(true); setWeekendPlan(null); setWeekendShoppingList(null);
    try {
      const result = await callGroq(`Plan Saturday AND Sunday shared family meals. For each day: Lunch and Dinner.
${weekendNote ? `Note from mum: ${weekendNote}` : ""}

CRITICAL: Each meal works for all 4 family members with adaptations. Inez's version looks similar to everyone else's. Vary proteins Saturday vs Sunday. Inez eats lunch at 11:30 and dinner at 3:30-4:30.

Format EXACTLY as:

SATURDAY
---
SATURDAY LUNCH: [meal name]
Why this works for everyone: [1 line]
HOW TO COOK IT: [Main method]
INEZ FIRST - set aside her portion when: [Exact moment]
PLATING:
Inez: [her version - soft, moist, spoonable, high calorie]
Finlay: [his version - components separated]
Adults: [full version]
FINLAY FALLBACK: [Simple pantry alternative]

SATURDAY DINNER: [meal name]
[same format]

SUNDAY
---
SUNDAY LUNCH: [meal name]
[same format]

SUNDAY DINNER: [meal name]
[same format]`, FAMILY_CONTEXT);
      setWeekendPlan(result);
    } catch (e) { setWeekendPlan("Something went wrong. Please try again."); }
    setWeekendLoading(false);
  }

  async function generateWeekendShopping() {
    if (!weekendPlan) return;
    setWeekendShoppingLoading(true);
    const fridgeStock = fridgeItems.length > 0 ? `\nAlready in fridge - exclude unless more needed: ${fridgeItems.map(f => f.name).join(", ")}` : "";
    try {
      const result = await callGroq(`Consolidated weekend shopping list. Group by: PROTEINS:, VEGETABLES:, GRAINS & CARBS:, PANTRY & HERBS:. Each item starts with "- ". ${fridgeStock}\n\nMEALS:\n${weekendPlan}`, FAMILY_CONTEXT);
      setWeekendShoppingList(result);
    } catch { setWeekendShoppingList("Something went wrong."); }
    setWeekendShoppingLoading(false);
  }

  async function generateDayPlan() {
    setDayLoading(true); setDayPlan(null);
    const bank = recipes.filter(r => r.rating >= 3).map(r => r.name);
    const fridgeStock = fridgeItems.length > 0 ? `Currently in fridge: ${fridgeItems.map(f => `${f.name} (${f.portions} portions)`).join(", ")}. Prioritise using these.` : "";
    try {
      const result = await callGroq(`Plan a full balanced day for Inez. Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner.
Different protein each meal. Different carb each meal. Varied veg. Substantial portions (Sotos - she needs significantly more than a typical toddler).
${includeEggs ? "Include at least one egg meal or egg yolk addition." : ""}
${bank.length ? `Her favourites: ${bank.join(", ")}` : ""}
${fridgeStock}
${dayNote ? `Note: ${dayNote}` : ""}

Format each meal:
MEAL NAME
Protein: / Carb: / Veg: / How to prepare (method, temp, time, texture): / Nutrition note:

End with DAILY NUTRITION SUMMARY.`, INEZ_CONTEXT);
      setDayPlan(result);
    } catch { setDayPlan("Something went wrong. Please try again."); }
    setDayLoading(false);
  }

  async function getRecipeIdea() {
    setIdeaLoading(true); setRecipeIdea(null);
    const used = recipes.map(r => r.name).join(", ");
    try {
      const result = await callGroq(`One creative new recipe for Inez.${used ? ` Already made: ${used}.` : ""} 5 large portions, calorie-dense, interesting global flavours, iron-rich + vitamin C paired, moist and spoonable. Include egg yolk boost if possible. Suggest one piggyback snack from same ingredients.`, INEZ_CONTEXT);
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

  function toggleFav(id) { setRecipes(p => p.map(r => r.id === id ? { ...r, favourite: !r.favourite } : r)); }
  function updateRating(id, r) { setRecipes(p => p.map(x => x.id === id ? { ...x, rating: r } : x)); }
  function deleteRecipe(id) { setRecipes(p => p.filter(r => r.id !== id)); }

  function printWeekend() {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Weekend Meal Plan</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.8;color:#2c3e50;font-size:14px;}h1{color:#e76f51;}pre{white-space:pre-wrap;font-family:Georgia,serif;}</style></head><body><h1>Weekend Family Meals</h1><pre>${weekendPlan}</pre></body></html>`);
    w.document.close();
  }

  function printBatch() {
    const allText = batchRecipes.map(r => r.content).join("\n\n---\n\n") + (batchSnacks ? "\n\n" + batchSnacks : "");
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Inez Batch Cook Plan</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.8;color:#2c3e50;font-size:14px;}h1{color:#e76f51;}pre{white-space:pre-wrap;font-family:Georgia,serif;}</style></head><body><h1>Inez's Batch Cook Plan</h1><pre>${allText}</pre></body></html>`);
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
      {[1,2,3,4,5].map(s => <button key={s} onClick={() => onChange?.(s)} style={{ background: "none", border: "none", cursor: onChange ? "pointer" : "default", fontSize: 18, color: s <= rating ? "#f4a261" : "#ddd", padding: 0 }}>★</button>)}
    </div>
  );

  function FormatRecipeText({ text }) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.match(/^RECIPE \d+:/i)) return null;
      if (line.match(/^(NUTRITION:|INGREDIENTS|METHOD:|FREEZING:|EGG YOLK)/i)) return <div key={i} style={{ fontWeight: "bold", color: "#555", fontSize: 12, marginTop: 6 }}>{line}</div>;
      if (line.trim() === '---') return <hr key={i} style={{ border: "none", borderTop: "1px solid #f0e0d0", margin: "4px 0" }} />;
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ paddingLeft: 10, fontSize: 12, color: "#444", lineHeight: 1.6 }}>• {line.slice(2)}</div>;
      return <div key={i} style={{ fontSize: 12, color: "#444", lineHeight: 1.6 }}>{line}</div>;
    });
  }

  function FormatText({ text, baseSize }) {
    if (!text) return null;
    const sz = baseSize || 13;
    return text.split('\n').map((line, i) => {
      if (line.match(/^(SATURDAY|SUNDAY)$/i)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: sz + 3, marginTop: 20, marginBottom: 6, borderTop: "2px solid #f5e6d8", paddingTop: 16 }}>{line}</div>;
      if (line.match(/^(SATURDAY|SUNDAY) (LUNCH|DINNER):/i)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: sz + 1, marginTop: 16, marginBottom: 6 }}>{line}</div>;
      if (line.match(/^(HOW TO COOK IT|INEZ FIRST|PLATING:|FINLAY FALLBACK|Why this works)/i)) return <div key={i} style={{ fontWeight: "bold", color: "#555", fontSize: sz - 1, marginTop: 10, marginBottom: 3 }}>{line}</div>;
      if (line.match(/^(Inez:|Finlay:|Adults:)/)) {
        const isInez = line.startsWith('Inez:');
        const isFinlay = line.startsWith('Finlay:');
        const bg = isInez ? "#fff8f0" : isFinlay ? "#f0f8ff" : "#f5f5f5";
        const border = isInez ? "#f4a261" : isFinlay ? "#90cdf4" : "#ddd";
        const emoji = isInez ? "👶" : isFinlay ? "👦" : "🍽️";
        return <div key={i} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "7px 10px", marginBottom: 5, fontSize: sz - 1, color: "#2c3e50" }}>{emoji} {line}</div>;
      }
      if (line.match(/^(BREAKFAST|LUNCH|DINNER|MORNING SNACK|AFTERNOON SNACK|DAILY NUTRITION)/i)) return <div key={i} style={{ fontWeight: "bold", color: "#e76f51", fontSize: sz + 1, marginTop: i > 0 ? 18 : 0, paddingTop: i > 0 ? 14 : 0, borderTop: i > 0 ? "1px solid #f5e6d8" : "none" }}>{line}</div>;
      if (line.match(/^(Protein:|Carb:|Veg:|How to prepare:|Nutrition note:)/i)) return <div key={i} style={{ fontWeight: "bold", color: "#555", fontSize: sz - 1, marginTop: 5 }}>{line}</div>;
      if (line.match(/^(SNACKS THIS WEEK|👩|🍌)/)) return <div key={i} style={{ fontWeight: "bold", color: "#c05621", fontSize: sz, marginTop: 10, marginBottom: 3 }}>{line}</div>;
      if (line.trim() === '---') return <hr key={i} style={{ border: "none", borderTop: "1px solid #f0e0d0", margin: "8px 0" }} />;
      if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} style={{ paddingLeft: 12, fontSize: sz - 1, color: "#444", lineHeight: 1.7 }}>• {line.slice(2)}</div>;
      return <div key={i} style={{ fontSize: sz - 1, color: "#444", lineHeight: 1.7 }}>{line}</div>;
    });
  }

  function Card({ children, style }) {
    return <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16, ...style }}>{children}</div>;
  }

  function Btn({ label, onClick, disabled, color, style, small }) {
    return <button onClick={onClick} disabled={disabled} style={{ padding: small ? "9px 14px" : "13px 16px", background: disabled ? "#e0e0e0" : (color || "linear-gradient(135deg,#e76f51,#f4a261)"), color: disabled ? "#aaa" : "white", border: "none", borderRadius: 12, fontSize: small ? 12 : 14, fontWeight: "bold", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "Georgia,serif", boxShadow: disabled ? "none" : "0 3px 10px rgba(0,0,0,0.1)", ...style }}>{label}</button>;
  }

  function Toggle({ value, onChange, label, sub }) {
    return (
      <div onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: value ? "#fff8f0" : "#f8f8f8", border: `2px solid ${value ? "#f4a261" : "#eee"}`, borderRadius: 10, cursor: "pointer", marginBottom: 12 }}>
        <div style={{ width: 34, height: 19, borderRadius: 10, background: value ? "#f4a261" : "#ddd", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
          <div style={{ width: 15, height: 15, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: value ? 17 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
        </div>
        <div><div style={{ fontSize: 13, fontWeight: "bold", color: "#2c3e50" }}>{label}</div>{sub && <div style={{ fontSize: 11, color: "#888" }}>{sub}</div>}</div>
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
          <div key={i} onClick={() => setCheckedItems(p => ({ ...p, [key]: !p[key] }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", cursor: "pointer" }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, border: `2px solid ${checked ? "#e76f51" : "#ddd"}`, background: checked ? "#e76f51" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {checked && <span style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: checked ? "#aaa" : "#2c3e50", textDecoration: checked ? "line-through" : "none", transition: "all 0.2s" }}>{line.slice(2)}</span>
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

  const untickCount = batchRecipes.filter(r => !r.kept).length;
  const status = fridgeStatus;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fef9f0,#fde8d0 50%,#fef0e8)", fontFamily: "Georgia,serif", paddingBottom: 50 }}>

      <div style={{ background: "linear-gradient(135deg,#e76f51,#f4a261)", padding: "26px 24px 18px", textAlign: "center", boxShadow: "0 4px 20px rgba(231,111,81,0.3)", position: "relative" }}>
        <div style={{ fontSize: 34, marginBottom: 4 }}>🍳</div>
        <h1 style={{ margin: 0, color: "white", fontSize: 23, fontWeight: "bold", letterSpacing: "-0.5px" }}>Inez's Kitchen</h1>
        <p style={{ margin: "5px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 12 }}>Reflux-safe • Family meals • Made with love</p>
        <button onClick={() => { localStorage.removeItem("inez_groq_key"); setApiKey(""); }} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, color: "white", fontSize: 10, padding: "4px 8px", cursor: "pointer" }}>🔑 Change Key</button>
      </div>

      <div style={{ display: "flex", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflowX: "auto" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "12px 1px", border: "none", background: "none", fontSize: 10, fontWeight: tab === i ? "bold" : "normal", color: tab === i ? "#e76f51" : "#999", borderBottom: `3px solid ${tab === i ? "#e76f51" : "transparent"}`, cursor: "pointer", fontFamily: "Georgia,serif", whiteSpace: "nowrap" }}>{TAB_ICONS[i]} {t}</button>
        ))}
      </div>

      <div style={{ padding: "18px 15px", maxWidth: 600, margin: "0 auto" }}>

        {/* FRIDGE */}
        {tab === 0 && <>
          <div style={{ background: status.bg, border: `2px solid ${status.color}`, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{status.icon}</div>
            <div style={{ fontWeight: "bold", color: status.color, fontSize: 15, marginBottom: 4 }}>{status.msg}</div>
            {fridgeItems.length > 0 && <div style={{ fontSize: 12, color: "#888" }}>{totalPortions} portions across {fridgeItems.length} meal{fridgeItems.length !== 1 ? "s" : ""} — roughly {daysLeft} day{daysLeft !== 1 ? "s" : ""} at {MEALS_PER_DAY} meals/day</div>}
          </div>
          {needsToCook && <Btn label="🍳 Go to Batch Cook" onClick={() => setTab(1)} style={{ width: "100%", marginBottom: 16 }} />}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Btn label={addingFridge ? "Cancel" : "+ Add to Fridge"} onClick={() => setAddingFridge(!addingFridge)} style={{ flex: 1 }} />
            {fridgeItems.length > 0 && <Btn label="Clear All" onClick={() => setFridgeItems([])} color="#e74c3c" small />}
          </div>
          {addingFridge && <AddFridgeForm onAdd={(name, portions) => { const now = new Date(); setFridgeItems(p => [{ id: Date.now(), name, portions, originalPortions: portions, addedDate: now.toLocaleDateString("en-GB"), addedTimestamp: now.getTime() }, ...p]); setAddingFridge(false); }} />}
          {fridgeItems.length === 0 && !addingFridge ? (
            <Card><div style={{ textAlign: "center", padding: "30px 0" }}><div style={{ fontSize: 44, marginBottom: 12 }}>❄️</div><p style={{ margin: "0 0 16px", fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>Your fridge is empty. Batch cook and add meals here.</p><Btn label="Go to Batch Cook" onClick={() => setTab(1)} small /></div></Card>
          ) : fridgeItems.map(item => {
            const pct = item.portions / item.originalPortions;
            const barColor = pct > 0.5 ? "#2d6a4f" : pct > 0.25 ? "#b7950b" : "#c0392b";
            return (
              <div key={item.id} style={{ background: "white", borderRadius: 14, padding: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div><h4 style={{ margin: "0 0 3px", fontSize: 14, color: "#2c3e50" }}>{item.name}</h4><p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>Added {item.addedDate}</p></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: "bold", color: barColor }}>{item.portions}</span>
                    <span style={{ fontSize: 11, color: "#aaa" }}>left</span>
                    <button onClick={() => removeFridgeItem(item.id)} style={{ background: "#fff0f0", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", fontSize: 11, color: "#e74c3c", marginLeft: 4 }}>✕</button>
                  </div>
                </div>
                {(() => { const age = fridgeItemAge(item); if (!age) return null; return <div style={{ fontSize: 11, fontWeight: age.warn ? "bold" : "normal", color: age.color, marginBottom: 6, padding: age.warn ? "4px 8px" : 0, background: age.danger ? "#fff0f0" : age.warn ? "#fffbf0" : "transparent", borderRadius: 6 }}>🕐 {age.label}</div>; })()}
                <div style={{ background: "#f0f0f0", borderRadius: 6, height: 6, marginBottom: 10 }}><div style={{ width: `${Math.min(100, pct * 100)}%`, height: "100%", borderRadius: 6, background: barColor, transition: "width 0.3s" }} /></div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3].map(n => <button key={n} onClick={() => usePortions(item.id, n)} style={{ flex: 1, padding: "7px 4px", background: "#fef9f0", border: "1.5px solid #f4a261", borderRadius: 8, fontSize: 12, cursor: "pointer", color: "#c05621", fontWeight: "bold" }}>Use {n}</button>)}
                </div>
              </div>
            );
          })}
        </>}

        {/* BATCH COOK */}
        {tab === 1 && <>
          {fridgeItems.length > 0 && <div style={{ background: status.bg, border: `1.5px solid ${status.color}`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: status.color, fontWeight: "bold" }}>{status.icon} {status.msg}</div>}
          <Card>
            <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#2c3e50" }}>Inez's Batch Cook</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>4 nutritionally complete recipes from global cuisines. Tick the ones you love, regenerate the rest.</p>
            <Toggle value={useLeftovers} onChange={setUseLeftovers} label="Use up what's in my fridge" sub="Tell me what ingredients you have" />
            {useLeftovers && <StableTextarea value={leftovers} onBlur={setLeftovers} placeholder="e.g. sweet potato, turkey mince, courgette..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #f4a261", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 12, boxSizing: "border-box", resize: "none" }} />}
            <Btn label={batchLoading ? `⏳ ${batchMsg}` : "✨ Generate This Week's Plan"} onClick={generateBatchPlan} disabled={batchLoading} style={{ width: "100%" }} />
          </Card>

          {batchRecipes.length > 0 && <>
            <div style={{ background: "#f0f8ff", border: "1.5px solid #90cdf4", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#2b6cb0", fontWeight: "bold" }}>Tick recipes you want to keep. Untick to replace them.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {untickCount > 0 && <Btn label={batchLoading ? "⏳ Regenerating..." : `🔄 Regenerate ${untickCount} Unticked`} onClick={regenerateUnticked} disabled={batchLoading} color="#2b6cb0" small />}
                <Btn label="❄️ Add All to Fridge" onClick={addBatchToFridge} color="#2d6a4f" small />
                <Btn label="🖨️ Print" onClick={printBatch} color="#555" small />
              </div>
            </div>

            {batchRecipes.map((recipe) => (
              <div key={recipe.number} style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 14, border: `2px solid ${recipe.kept ? "#f4a261" : "#e0e0e0"}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div onClick={() => setBatchRecipes(p => p.map(r => r.number === recipe.number ? { ...r, kept: !r.kept } : r))} style={{ width: 28, height: 28, borderRadius: 8, border: `2.5px solid ${recipe.kept ? "#e76f51" : "#ccc"}`, background: recipe.kept ? "#e76f51" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: 2 }}>
                    {recipe.kept && <span style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Recipe {recipe.number}</div>
                    <div style={{ fontSize: 15, color: "#2c3e50", fontWeight: "bold" }}>{recipe.name}</div>
                  </div>
                </div>
                <div style={{ maxHeight: recipe.expanded ? "none" : 160, overflow: "hidden", position: "relative", marginBottom: 10 }}>
                  <FormatRecipeText text={recipe.content} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent, white)" }} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setBatchRecipes(p => p.map(r => r.number === recipe.number ? { ...r, expanded: !r.expanded } : r))} style={{ padding: "7px 12px", background: "#fef9f0", border: "1.5px solid #f4a261", borderRadius: 8, fontSize: 12, color: "#c05621", cursor: "pointer", fontWeight: "bold" }}>{recipe.expanded ? "Less" : "Full Recipe"}</button>
                  <button onClick={() => saveRecipeFromBatch(recipe)} style={{ padding: "7px 12px", background: "#f0faf4", border: "1.5px solid #52b788", borderRadius: 8, fontSize: 12, color: "#2d6a4f", cursor: "pointer", fontWeight: "bold" }}>📖 Save to Recipes</button>
                  <button onClick={() => setBatchRecipes(p => p.map(r => r.number === recipe.number ? { ...r, kept: !r.kept } : r))} style={{ padding: "7px 12px", background: recipe.kept ? "#fff0f0" : "#f0f8ff", border: `1.5px solid ${recipe.kept ? "#feb2b2" : "#90cdf4"}`, borderRadius: 8, fontSize: 12, color: recipe.kept ? "#c0392b" : "#2b6cb0", cursor: "pointer", fontWeight: "bold" }}>
                    {recipe.kept ? "✕ Replace this" : "✓ Keep this"}
                  </button>
                </div>
              </div>
            ))}

            {batchSnacks && <Card style={{ background: "#f0faf4", border: "1px solid #b7e4c7" }}><FormatText text={batchSnacks} /></Card>}

            <Card>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#2c3e50" }}>🛒 Smart Shopping List</h3>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888" }}>{fridgeItems.length > 0 ? `Automatically excludes ${fridgeItems.length} item${fridgeItems.length !== 1 ? "s" : ""} already in your fridge.` : "Tap to generate your shopping list."}</p>
              <Btn label={shoppingLoading ? "⏳ Building list..." : "🛒 Generate Shopping List"} onClick={generateSmartShoppingList} disabled={shoppingLoading} color="#2d6a4f" style={{ width: "100%" }} />
            </Card>
          </>}

          {shoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>🛒 Inez's Shopping List</h3><ShoppingListDisplay text={shoppingList} prefix="batch" /></Card>}
        </>}

        {/* DAY PLANNER */}
        {tab === 2 && <>
          <Card>
            <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#2c3e50" }}>Inez's Day Planner</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>Full balanced day — varied proteins, carbs and veg. Prioritises what's in the fridge.</p>
            <Toggle value={includeEggs} onChange={setIncludeEggs} label="🥚 Include egg ideas" sub="Suggest egg meals and where to add egg yolk" />
            <StableTextarea value={dayNote} onBlur={setDayNote} placeholder="Any notes? e.g. she had fish yesterday..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 14, boxSizing: "border-box", resize: "none" }} />
            <Btn label={dayLoading ? "⏳ Planning Inez's day..." : "☀️ Plan Today's Meals"} onClick={generateDayPlan} disabled={dayLoading} style={{ width: "100%" }} />
          </Card>
          {dayPlan && <Card><h3 style={{ margin: "0 0 4px", color: "#e76f51", fontSize: 16 }}>☀️ Today's Plan</h3><FormatText text={dayPlan} /><Btn label="🔄 Generate Another Day" onClick={generateDayPlan} disabled={dayLoading} style={{ width: "100%", marginTop: 18 }} /></Card>}
          {!dayPlan && !dayLoading && <Card><div style={{ textAlign: "center", padding: "20px 0" }}><div style={{ fontSize: 40, marginBottom: 10 }}>☀️</div><p style={{ margin: 0, fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>Plan a nutritionally balanced day for Inez.</p></div></Card>}
        </>}

        {/* WEEKEND */}
        {tab === 3 && <>
          <Card>
            <h2 style={{ margin: "0 0 6px", fontSize: 17, color: "#2c3e50" }}>👨‍👩‍👧‍👦 Weekend Family Meals</h2>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#888", lineHeight: 1.6 }}>Saturday + Sunday lunch and dinner — one meal adapted for everyone.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {["👶 Inez", "👦 Finlay", "🍽️ Adults"].map((label, i) => (
                <div key={i} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: "bold", background: i === 0 ? "#fff8f0" : i === 1 ? "#f0f8ff" : "#f5f5f5", border: `1.5px solid ${i === 0 ? "#f4a261" : i === 1 ? "#90cdf4" : "#ddd"}`, color: i === 0 ? "#c05621" : i === 1 ? "#2b6cb0" : "#555" }}>{label}</div>
              ))}
            </div>
            <StableTextarea value={weekendNote} onBlur={setWeekendNote} placeholder="Any notes? e.g. keep it simple, use up turkey..." rows={2} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 14, boxSizing: "border-box", resize: "none" }} />
            <Btn label={weekendLoading ? "⏳ Planning weekend..." : "🗓️ Plan Our Weekend Meals"} onClick={generateWeekendPlan} disabled={weekendLoading} style={{ width: "100%" }} />
          </Card>
          {weekendPlan && <>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: "#e76f51", fontSize: 16 }}>🗓️ This Weekend</h3>
                <Btn label="🖨️ Print" onClick={printWeekend} small color="#555" />
              </div>
              <FormatText text={weekendPlan} />
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn label={weekendShoppingLoading ? "⏳" : "🛒 Shopping List"} onClick={generateWeekendShopping} disabled={weekendShoppingLoading} color="#2d6a4f" style={{ flex: 1 }} />
                <Btn label="🔄 New Weekend" onClick={generateWeekendPlan} disabled={weekendLoading} color="#f4a261" style={{ flex: 1 }} />
              </div>
            </Card>
            {weekendShoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>🛒 Weekend Shopping List</h3><ShoppingListDisplay text={weekendShoppingList} prefix="weekend" /></Card>}
          </>}
          {!weekendPlan && !weekendLoading && <Card><div style={{ textAlign: "center", padding: "24px 0" }}><div style={{ fontSize: 44, marginBottom: 12 }}>👨‍👩‍👧‍👦</div><p style={{ margin: 0, fontSize: 13, color: "#aaa", lineHeight: 1.8 }}>Plan Saturday and Sunday meals for the whole family.<br />One meal, adapted for Inez, Finlay and the adults.</p></div></Card>}
        </>}

        {/* RECIPES */}
        {tab === 4 && <>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <Btn label={addingRecipe ? "Cancel" : "+ Log Recipe"} onClick={() => setAddingRecipe(!addingRecipe)} style={{ flex: 1 }} />
            <Btn label={ideaLoading ? "⏳" : "✨ Recipe Idea"} onClick={getRecipeIdea} disabled={ideaLoading} color="#2d6a4f" style={{ flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <StableInput value={searchTerm} onBlur={setSearchTerm} placeholder="🔍 Search recipes..." style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1.5px solid #eee", fontSize: 13, fontFamily: "Georgia,serif" }} />
            <button onClick={() => setFilterFavs(!filterFavs)} style={{ padding: "9px 14px", borderRadius: 10, border: `2px solid ${filterFavs ? "#e76f51" : "#eee"}`, background: filterFavs ? "#fff3f0" : "white", fontSize: 13, cursor: "pointer", color: filterFavs ? "#e76f51" : "#aaa", fontWeight: "bold" }}>❤️</button>
          </div>

          {recipeIdea && <Card style={{ background: "#f0faf4", border: "1px solid #b7e4c7" }}><h3 style={{ margin: "0 0 12px", color: "#2d6a4f", fontSize: 14 }}>✨ Recipe Idea</h3><div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.8, color: "#2c3e50" }}>{recipeIdea}</div><Btn label="Log this recipe" onClick={() => { setAddingRecipe(true); setRecipeIdea(null); }} small style={{ marginTop: 12 }} /></Card>}

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
            <Card><div style={{ textAlign: "center", padding: "30px 0" }}><div style={{ fontSize: 44, marginBottom: 10 }}>📖</div><p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>{recipes.length === 0 ? "No recipes yet. Generate a batch cook plan and save individual recipes!" : "No recipes match your filter."}</p></div></Card>
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
                  {r.notes ? <div style={{ padding: 12, background: "#fef9f0", borderRadius: 8, fontSize: 12, color: "#555", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 10 }}>{r.notes}</div>
                    : <div style={{ padding: 10, background: "#f8f8f8", borderRadius: 8, fontSize: 12, color: "#aaa", marginBottom: 10 }}>No notes saved.</div>}
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#aaa" }}>Update rating:</p>
                  <Stars rating={r.rating} onChange={(v) => updateRating(r.id, v)} />
                </div>
              )}
            </div>
          ))}
        </>}

        {/* SHOPPING */}
        {tab === 5 && (
          (shoppingList || weekendShoppingList) ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Tap items as you shop. Lists saved until cleared.</p>
                <button onClick={() => { setShoppingList(null); setWeekendShoppingList(null); setCheckedItems({}); try { localStorage.removeItem("inez_shopping"); localStorage.removeItem("inez_weekend_shopping"); localStorage.removeItem("inez_checked"); } catch {} }} style={{ padding: "6px 12px", background: "#fff0f0", border: "1.5px solid #feb2b2", borderRadius: 8, fontSize: 11, color: "#c0392b", cursor: "pointer", fontWeight: "bold" }}>Clear lists</button>
              </div>
              {shoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>🍳 Inez's Batch Cook List</h3><ShoppingListDisplay text={shoppingList} prefix="batch" /></Card>}
              {weekendShoppingList && <Card><h3 style={{ margin: "0 0 14px", color: "#2d6a4f", fontSize: 15 }}>👨‍👩‍👧‍👦 Weekend Family List</h3><ShoppingListDisplay text={weekendShoppingList} prefix="weekend" /></Card>}
            </div>
          ) : (
            <Card><div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
              <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.6, color: "#aaa" }}>Generate a batch cook or weekend plan and your shopping lists will appear here.</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <Btn label="Batch Cook" onClick={() => setTab(1)} small />
                <Btn label="Weekend" onClick={() => setTab(3)} small color="#2d6a4f" />
              </div>
            </div></Card>
          )
        )}

      </div>
    </div>
  );
}
