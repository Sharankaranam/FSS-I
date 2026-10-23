import os
import sqlite3
import json
import zipfile
import xml.etree.ElementTree as ET

DB_PATH = os.path.join(os.path.dirname(__file__), "livewell.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")
JSON_EXPORT_PATH = os.path.join(os.path.dirname(__file__), "livewell_data.json")
DOCX_PATH = "/Users/saisharankaranam/Desktop/FUZZY-1/LIVE WELL FINAL.docx"


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    conn = get_db_connection()
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    conn.executescript(schema_sql)
    conn.commit()
    conn.close()
    print("Database schema initialized successfully.")


def seed_database():
    conn = get_db_connection()
    cur = conn.cursor()

    # 1. Book Metadata
    cur.execute(
        """
        INSERT INTO book_metadata (title, subtitle, author, co_authors, copyright_year, summary)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        (
            "LIVE WELL: 8 habits to highly effective Health and Happiness",
            "A Modern Guide to Health, Longevity, and Disease Reversal",
            "Dr. Murthy Gokula, MD, CMD, Dip ABLM, Dip FAAARM",
            "Laya Gokula, Vihana Shresta, Taarini Pappula, Neha Chanda",
            2025,
            "A clinical and lifestyle medicine guide integrating the Six Pillars of Lifestyle Medicine, the Nine Hallmarks of Longevity, the 8 steps of Ashtanga Yoga, and the 'MY GOAL DO IT' microhabits framework to prevent and reverse chronic disease.",
        ),
    )

    # 2. Six Pillars of Lifestyle Medicine (ABLM)
    pillars_data = [
        (
            1,
            "Nutrition",
            "Whole-food, plant-based diets rich in fiber, antioxidants, and colorful plants.",
            "Reverses insulin resistance, reduces systemic cytokines (NF-κB, IL-6), feeds beneficial microbiome, and optimizes nutrient sensing.",
            "American College of Lifestyle Medicine (ACLM), Harvard Medical School lifestyle medicine curricula.",
        ),
        (
            2,
            "Physical Activity",
            "Consistent daily movement combining aerobic activity (150 min/wk), strength training, and mobility.",
            "Rejuvenates mitochondria, stimulates stem cell mobilization, flushes damaged proteins (autophagy), and enhances insulin sensitivity.",
            "Aerobic + resistance training increases mitochondrial biogenesis (PGC-1α).",
        ),
        (
            3,
            "Restorative Sleep",
            "7–9 hours of continuous, restorative sleep supporting slow-wave and REM cycles.",
            "Maintains DNA repair mechanisms, protects telomere length, improves glymphatic brain waste clearance, and balances cortisol.",
            "Pittsburgh Sleep Quality Index (PSQI), Dawson & Reid sleep debt models.",
        ),
        (
            4,
            "Stress Management",
            "Mindfulness, diaphragmatic breathwork (Pranayama), yoga, and vagal nerve activation.",
            "Lowers sympathetic overdrive, reduces HPA-axis cortisol spikes, protects prefrontal cortex executive control, and reduces DNA damage.",
            "Yerkes-Dodson arousal law, McEwen's allostatic load model.",
        ),
        (
            5,
            "Avoidance of Harmful Substances",
            "Limiting alcohol, eliminating tobacco/vaping, and reducing environmental toxin exposure.",
            "Decreases toxic load on liver and kidneys, prevents DNA adducts and cellular senescence, and protects mitochondrial membranes.",
            "WHO and IARC environmental health guidelines.",
        ),
        (
            6,
            "Social Connection",
            "Fostering meaningful, loving relationships and community belonging.",
            "Reduces loneliness, calms systemic inflammatory signaling, increases oxytocin, and enhances emotional resilience.",
            "Harvard Study of Adult Development (longest longitudinal health study).",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO lifestyle_pillars (pillar_number, name, summary, cellular_benefits, clinical_evidence)
        VALUES (?, ?, ?, ?, ?)
    """,
        pillars_data,
    )

    # 3. Nine Hallmarks of Longevity & Cellular Aging Engines
    hallmarks_data = [
        (
            1,
            "Genomic Instability",
            "Accumulation of DNA lesions and damage over time that impairs cellular transcription.",
            "DNA repair support via sleep, stress reduction, and antioxidant plant compounds.",
        ),
        (
            2,
            "Telomere Shortening",
            "Erosion of protective chromosome ends with successive cell divisions.",
            "Preserving telomerase activity through stress reduction, restorative sleep, and plant-based nutrition.",
        ),
        (
            3,
            "Epigenetic Alterations",
            "Inappropriate DNA methylation and histone modifications silencing health genes.",
            "Folate, polyphenols, and lifestyle practices act as biochemical switches turning on longevity genes.",
        ),
        (
            4,
            "Loss of Proteostasis",
            "Failure of protein folding and accumulation of damaged, toxic protein aggregates.",
            "Exercise and intermittent fasting activate cellular autophagy to recycle damaged proteins.",
        ),
        (
            5,
            "Deregulated Nutrient Sensing",
            "Insulin resistance, mTOR hyperactivation, and blunted AMPK/sirtuin signaling.",
            "Low-glycemic whole food plant-based nutrition restores metabolic flexibility and insulin sensitivity.",
        ),
        (
            6,
            "Mitochondrial Dysfunction",
            "Decreased ATP output and increased leak of damaging reactive oxygen species (ROS).",
            "HIIT exercise, fasting, and cofactors (CoQ10, PQQ) trigger mitochondrial biogenesis.",
        ),
        (
            7,
            "Cellular Senescence",
            "Permanently arrested 'zombie' cells secreting pro-inflammatory cytokines (SASP).",
            "Exercise, polyphenols (quercetin, fisetin), and fasting induce clearance of senescent cells.",
        ),
        (
            8,
            "Stem Cell Exhaustion",
            "Depletion of regenerative stem cell pools in bone marrow, gut, and brain.",
            "Regular physical activity, restful sleep, and intermittent fasting stimulate stem cell renewal.",
        ),
        (
            9,
            "Altered Intercellular Communication",
            "Systemic chronic 'inflammaging' and neuroendocrine signaling breakdown.",
            "Anti-inflammatory nutrition, stress regulation, and social connection restore neuro-immune balance.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO hallmarks_of_aging (hallmark_number, name, biological_mechanism, disease_reversal_strategy)
        VALUES (?, ?, ?, ?)
    """,
        hallmarks_data,
    )

    # 4. Pillar to Hallmark Mapping (Table 4)
    pillar_hallmark_map_data = [
        (
            1,
            5,
            "Mediterranean & WFPB diets restore insulin sensitivity and optimal nutrient sensing.",
        ),
        (
            1,
            3,
            "Polyphenols and folate provide methyl donors for favorable epigenetic expression.",
        ),
        (
            1,
            6,
            "Antioxidant-rich nutrition quenches ROS and fuels mitochondrial energy production.",
        ),
        (
            2,
            4,
            "Muscle contraction activates proteasomal degradation and cellular autophagy.",
        ),
        (
            2,
            6,
            "Aerobic and resistance exercise upregulates PGC-1α for mitochondrial regeneration.",
        ),
        (
            2,
            7,
            "Regular exercise clears senescent immune cells and reduces chronic SASP inflammation.",
        ),
        (
            2,
            8,
            "Physical exertion mobilizes endothelial and mesenchymal stem cells for tissue repair.",
        ),
        (
            3,
            1,
            "Deep delta-wave sleep allows enzymatic DNA repair and reduces oxidative double-strand breaks.",
        ),
        (
            3,
            2,
            "Adequate sleep prevents accelerated telomere attrition from chronic fatigue.",
        ),
        (
            3,
            4,
            "Glymphatic brain clearance during slow-wave sleep flushes out amyloid and misfolded proteins.",
        ),
        (
            4,
            1,
            "Cortisol suppression prevents catecholamine-induced oxidative DNA breaks.",
        ),
        (
            4,
            3,
            "Mindfulness and relaxation prevent adverse stress-induced histone modifications.",
        ),
        (
            4,
            9,
            "Vagal nerve stimulation reduces systemic inflammation and normalizes cytokine communication.",
        ),
        (
            5,
            1,
            "Eliminating carcinogens and toxins stops exogenous DNA adduct formation.",
        ),
        (
            5,
            6,
            "Avoiding heavy metals and alcohol prevents mitochondrial membrane permeability transition.",
        ),
        (
            5,
            7,
            "Reducing toxic burden slows the rate at which damaged somatic cells enter senescence.",
        ),
        (
            6,
            9,
            "Social support suppresses pro-inflammatory transcription factors and promotes oxytocin.",
        ),
        (
            6,
            7,
            "Positive relationships buffer social isolation-induced cellular senescence.",
        ),
        (
            6,
            8,
            "Community emotional security supports immune competence and regenerative capacity.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO pillar_hallmark_map (pillar_id, hallmark_id, reversal_mechanism)
        VALUES (?, ?, ?)
    """,
        pillar_hallmark_map_data,
    )

    # 5. The 8 Superheroes / Habits of Vitality (Chapter 11)
    habits_data = [
        (
            1,
            "The Movement Master",
            "Physical Activity Super Power",
            "Move your body every day for energy, strong muscles, and mental focus.",
            "Loves when you move your body daily! Whether walking, dancing, playing sports, or doing yoga, this superhero makes your heart stronger, muscles powerful, and brain sharper.",
            "Can you move your body for at least 30 minutes every day? Do you feel strong and energetic?",
            "Do 10 jumping jacks or 5 minutes of mobility stretching to activate muscles.",
            "Fuel post-exercise with plant proteins, legumes, and hydration.",
            "Spend 10 minutes gently moving or walking after dinner to thank your Movement Master.",
            "Helps Gut Guardian (improves peristalsis), Energy Maker (creates mitochondria), Sleep Guardian (deepens delta sleep), and Stress Fighter (releases endorphins).",
        ),
        (
            2,
            "The Fuel Captain",
            "Nutrition Super Power",
            "Feed your body vibrant, colorful whole plants to heal inflammation and stabilize blood sugar.",
            "In charge of all healthy food you eat. Loves colorful fruits, vegetables, healthy plant proteins, and healthy fats that make body and brain work in harmony.",
            "Are you eating lots of colorful vegetables and fruits every day? Do you choose foods that make you feel nourished rather than sluggish?",
            "Drink a glass of warm lemon water and enjoy berries or oatmeal.",
            "Feed your cells with a colorful rainbow plate: leafy greens, legumes, whole grains, and healthy fats like walnuts/flaxseed.",
            "Avoid heavy late-night snacking at least 3 hours before sleep.",
            "Supports Gut Guardian (provides fiber for microbiome), Energy Maker (clean cellular fuel), Body Protector (detox antioxidants), and Stress Fighter (stable glucose prevents anxiety).",
        ),
        (
            3,
            "The Gut Guardian",
            "Digestive Health Super Power",
            "Nurture your microbiome with prebiotics and fermented foods for immunity and mood.",
            "Protects your tummy and helps you absorb all essential nutrients. Directly connected to the brain via the gut-brain axis; produces over 80% of the body's serotonin for joy and calm.",
            "Does your tummy feel comfortable after eating? Do you have regular, smooth bathroom visits? Is your mood calm and stable?",
            "Hydrate with clean water before morning meals to awaken digestive enzymes.",
            "Include prebiotic foods (garlic, onion, leeks, asparagus) and fermented foods (kimchi, sauerkraut, kefir).",
            "Sip soothing chamomile or peppermint tea; allow the gut to rest overnight (12-hour fast).",
            "Works with Fuel Captain (processes nutrients), Energy Maker (nutrient absorption), and Stress Fighter (regulates neurotransmitters and gut comfort).",
        ),
        (
            4,
            "The Energy Maker",
            "Mitochondria Super Power",
            "Supercharge your cellular engines to produce clean ATP and all-day vitality.",
            "Lives inside every single cell turning fuel into ATP energy. When your mitochondria are healthy, you have boundless, steady energy without crashes.",
            "Do you have steady energy throughout the day? Do you wake up feeling refreshed and ready to go?",
            "Get 5 minutes of morning sunlight in your eyes to sync mitochondrial circadian clocks.",
            "Incorporate antioxidant cofactors: dark berries, green tea, cruciferous greens, and healthy fats.",
            "Avoid blue light exposure 1 hour before bed to prevent mitochondrial stress.",
            "Strengthens Movement Master (fuels muscle output), Sleep Guardian (regulates energy cycles), and Body Protector (resists oxidative damage).",
        ),
        (
            5,
            "The Sleep Guardian",
            "Rest & Recovery Super Power",
            "Protect 7–9 hours of deep sleep to repair DNA, balance hormones, and restore mental focus.",
            "Works tirelessly while you sleep to repair damaged tissues, clean metabolic waste from your brain (glymphatic wash), and reset your neuroendocrine clock.",
            "Do you sleep 7–9 hours every night? Do you wake up rested and ready for the day?",
            "Wake up at the same consistent time every day; expose eyes to daylight.",
            "Eat lighter evening meals; avoid caffeine after 12 PM and alcohol before bed.",
            "Wind down 30 minutes before bed: dim lights, read a physical book, practice 4-7-8 breathing.",
            "Empowers Energy Maker (recharges cellular engines), Body Protector (boosts natural killer immune cells), and Stress Fighter (keeps amygdala reactive stress low).",
        ),
        (
            6,
            "The Stress Fighter",
            "Mental Wellness Super Power",
            "Harness breathwork, yoga, and mindfulness to maintain calm and executive control.",
            "Teaches you to breathe deeply, think positive thoughts, and stay centered during life's pressures. Protects your prefrontal cortex from toxic cortisol spikes.",
            "Do you have reliable ways to calm down when stressed? Can you focus clearly and maintain patience?",
            "Take 10 deep diaphragmatic breaths upon waking; write down 3 things you are grateful for.",
            "Practice mindful eating without screens or rushing.",
            "Do 5 minutes of alternate nostril breathing or restorative yoga before bed.",
            "Aids Sleep Guardian (calms sympathetic arousal), Gut Guardian (prevents stress-induced leaky gut), and Movement Master (prevents muscle tension).",
        ),
        (
            7,
            "The Connection Champion",
            "Social Wellness Super Power",
            "Cultivate deep friendships, family bonds, and community service to live longer.",
            "Reminds you that genuine human connection is biological medicine. Loving relationships release oxytocin, lower blood pressure, and build lifelong resilience.",
            "Do you have people in your life who care about you? Do you spend meaningful time with friends and family regularly?",
            "Send an encouraging message or express gratitude to a friend or loved one.",
            "Share meals with family or colleagues without digital distraction.",
            "Connect with a partner or friend about your day; practice active empathetic listening.",
            "Bolsters Stress Fighter (shared burdens reduce cortisol), Sleep Guardian (emotional peace aids rest), and Body Protector (social support boosts immune antibodies).",
        ),
        (
            8,
            "The Body Protector",
            "Detox & Defense Super Power",
            "Shield your cells from chemicals, pesticides, and pollutants while supporting liver and kidney detox.",
            "Helps your liver, kidneys, skin, and immune system work together to filter out toxins, fight off infections, and keep your internal biological environment pristine.",
            "Is your skin clear and healthy? Do you avoid smoking and excess alcohol? Does your body feel clean and resilient?",
            "Drink 16 oz of filtered water immediately upon waking to flush overnight metabolic waste.",
            "Eat cruciferous vegetables (broccoli, cabbage, kale) and drink green tea to stimulate Phase I & II liver detox.",
            "Take an evening shower or dry brush skin; filter bedroom air.",
            "Shields Gut Guardian (protects mucosal barrier), Energy Maker (prevents heavy metal mitochondrial poisoning), and Fuel Captain (absorbs clean nutrition).",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO habits_superpowers (
            habit_number, superhero_name, domain, tagline, description,
            superpower_check_questions, morning_routine, meal_guidance, evening_wind_down, synergistic_helpers
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,
        habits_data,
    )

    # 6. Ashtanga Yoga 8 Limbs (Table 1)
    limbs_data = [
        (
            1,
            "Yama",
            "Ethical Discipline / Restraints",
            "Harmonious social conduct, non-violence (Ahimsa), truthfulness, avoiding excess.",
            "Reduces stress, supports social health, lowers chronic systemic inflammation.",
            "Health Transformation",
        ),
        (
            2,
            "Niyama",
            "Personal Observances",
            "Self-discipline, purity/cleanliness (Saucha), gratitude, study, and positive routines.",
            "Builds self-care habits, psychological resilience, and anti-inflammatory lifestyle adherence.",
            "Health Transformation",
        ),
        (
            3,
            "Asana",
            "Physical Postures",
            "Conscious movement, flexibility, spinal mobility, and strength training.",
            "Improves muscular strength, glucose uptake, mitochondrial biogenesis, and metabolic health.",
            "Health Transformation",
        ),
        (
            4,
            "Pranayama",
            "Breath Control",
            "Rhythmic breath modulation (diaphragmatic, alternate nostril, box breathing).",
            "Lowers sympathetic tone, stimulates vagus nerve, reduces cortisol, and optimizes heart rate variability.",
            "Health Transformation",
        ),
        (
            5,
            "Pratyahara",
            "Sense Withdrawal",
            "Conscious digital detox, calming sensory overstimulation, mindful hunger awareness.",
            "Reduces reactivity to unhealthy food and stress cues; enhances mindful eating.",
            "Health Transformation",
        ),
        (
            6,
            "Dharana",
            "Concentration",
            "Single-pointed focus, eliminating multitasking, cultivating deep mental presence.",
            "Enhances cognitive working memory efficiency, supports sustainable habit building, and relieves anxiety.",
            "Happiness & Inner Peace",
        ),
        (
            7,
            "Dhyana",
            "Meditation",
            "Sustained mindful contemplation and awareness without judgment.",
            "Lowers neuro-inflammation, downregulates amygdala hyperactivity, and promotes neuroplastic healing.",
            "Happiness & Inner Peace",
        ),
        (
            8,
            "Samadhi",
            "Integration / Self-Realization",
            "Unity of mind, body, and purpose; feeling connected to self and community.",
            "Fosters existential meaning, allostatic peace, emotional resilience, and holistic longevity.",
            "Happiness & Inner Peace",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO ashtanga_limbs (limb_number, sanskrit_name, english_name, core_focus, health_impact, pathway_type)
        VALUES (?, ?, ?, ?, ?, ?)
    """,
        limbs_data,
    )

    # 7. Eight Interconnected Drivers of Chronic Disease (Table 2)
    drivers_data = [
        (
            "Gut Health",
            "Yama: Mindful eating; Asana: Twists for digestion",
            "Chew food 20 times before swallowing; practice gentle seated spinal twists after meals.",
            "Improves microbiome diversity, heals mucosal integrity, and reduces systemic endotoxemia.",
        ),
        (
            "Inflammation",
            "Niyama: Daily anti-inflammatory food log; Pranayama: Alternate nostril breathing",
            "Log 3 colors of fruits/veggies daily; practice 5 minutes of Nadi Shodhana breathing.",
            "Lowers pro-inflammatory cytokines (TNF-α, IL-6, hs-CRP) and improves immune balance.",
        ),
        (
            "Insulin Resistance",
            "Asana: Post-meal walking/yoga; Dharana: Focus on hunger cues",
            "Take a 10-minute brisk walk immediately after dinner; pause before snacking to rate real hunger.",
            "Stimulates GLUT4 glucose transporter translocation independent of insulin, stabilizing glycemia.",
        ),
        (
            "Toxins",
            "Yama: Choose toxin-free products; Asana: Sweating practices",
            "Swap plastic storage containers for glass; take an infrared sauna or brisk sweat-inducing walk.",
            "Enhances Phase I/II liver biotransformation and reduces environmental xenobiotic burden.",
        ),
        (
            "Hormones",
            "Pranayama: Evening breathwork; Asana: Endocrine-supportive poses",
            "Practice 4-7-8 breathing before bed; do legs-up-the-wall (Viparita Karani) to calm adrenals.",
            "Normalizes circadian cortisol rhythm, balances thyroid hormones, and supports reproductive vitality.",
        ),
        (
            "Epigenetics",
            "Niyama: Gratitude practice; Dhyana: Meditation on healing",
            "Write down 3 specific things you are grateful for each morning; meditate for 10 minutes.",
            "Provides favorable biochemical signals that upregulate longevity genes and downregulate oncogenes.",
        ),
        (
            "Stem Cells",
            "Asana: HIIT / dynamic yoga; Niyama: Antioxidant-rich foods",
            "Incorporate short bursts of bodyweight squats/HIIT 3x weekly; eat blueberries and green tea.",
            "Stimulates endogenous circulating stem cell mobilization and cellular tissue regeneration.",
        ),
        (
            "Mitochondria",
            "Asana: Brisk walking / HIIT; Pranayama: Breathwork for oxygenation",
            "Walk briskly outdoors for 20 minutes; practice deep diaphragmatic breath cycles.",
            "Stimulates PGC-1α-driven mitochondrial biogenesis and enhances cellular ATP generation.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO chronic_disease_drivers (driver_name, ashtanga_alignment, microhabit_example, evidence_impact)
        VALUES (?, ?, ?, ?)
    """,
        drivers_data,
    )

    # 8. MY GOAL DO IT Framework Steps
    steps_data = [
        (
            1,
            "M",
            "Mindset & Meaning",
            "Set a clear, heartfelt daily intention that connects your habit to your life purpose.",
            "Autonomous motivation theory (Ryan & Deci) — habits linked to identity endure.",
        ),
        (
            2,
            "Y",
            "You (Personalized Choice)",
            "Pick a microhabit tailored specifically to your preferences and daily rhythm.",
            "Self-determination theory — personal autonomy maximizes behavioral adherence.",
        ),
        (
            3,
            "G",
            "Get Specific (SMART Goal)",
            "Define the exact, measurable, bite-sized action (e.g., 'walk 10 minutes after lunch').",
            "Implementation intentions (Gollwitzer) — clear 'if-then' plans double success rate.",
        ),
        (
            4,
            "O",
            "One at a Time",
            "Focus on mastering one tiny microhabit before adding another.",
            "Cognitive load reduction — avoids willpower exhaustion and decision fatigue.",
        ),
        (
            5,
            "A",
            "Anchor to an Existing Routine",
            "Attach the new microhabit to an established daily anchor (e.g., 'after brushing teeth, do 10 squats').",
            "Habit stacking (BJ Fogg Tiny Habits) — piggybacks on existing neural pathways.",
        ),
        (
            6,
            "L",
            "Learn & Leverage Environment",
            "Design your physical and social environment so healthy choices are frictionless.",
            "Choice architecture (Thaler & Sunstein) — environment is the invisible hand shaping behavior.",
        ),
        (
            7,
            "D",
            "Do It Daily",
            "Practice the microhabit every day without exception, keeping the barrier to entry minimal.",
            "Neuroplasticity — daily repetition builds automatic basal ganglia habit loops.",
        ),
        (
            8,
            "O",
            "Overcome Obstacles with Calm",
            "When friction arises, pause, breathe deeply, and adjust rather than quit.",
            "Emotional regulation & resilience — prevents the 'what-the-hell' relapse effect.",
        ),
        (
            9,
            "I",
            "Integrate into Daily Identity",
            "Celebrate every win and identify as a healthy, vibrant individual.",
            "Identity-based habits (James Clear) — 'I am someone who nourishes my cells daily'.",
        ),
        (
            10,
            "T",
            "Track & Teach",
            "Log your progress in a journal and teach someone else the principle.",
            "Social accountability & Feynman learning technique — teaching solidifies mastery.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO my_goal_do_it_steps (step_order, letter, step_name, description, behavioral_science_principle)
        VALUES (?, ?, ?, ?, ?)
    """,
        steps_data,
    )

    # 9. Microhabits Catalog (All drivers across MY GOAL DO IT)
    # Fetch driver and step IDs for foreign keys
    cur.execute("SELECT id, driver_name FROM chronic_disease_drivers")
    driver_map = {row["driver_name"]: row["id"] for row in cur.fetchall()}

    cur.execute("SELECT id, letter FROM my_goal_do_it_steps")
    step_map = {row["letter"]: row["id"] for row in cur.fetchall()}

    microhabits_data = [
        # Gut Health
        (
            driver_map["Gut Health"],
            step_map["M"],
            "Set a daily morning intention: 'I nourish and respect my microbiome.'",
            "Affirmation before breakfast.",
        ),
        (
            driver_map["Gut Health"],
            step_map["Y"],
            "Add one new colorful plant-based food to your meals each week.",
            "Aim for 30 unique plants/week.",
        ),
        (
            driver_map["Gut Health"],
            step_map["G"],
            "Eat 1-2 tablespoons of fermented sauerkraut or kimchi with lunch.",
            "Provides live probiotic strains.",
        ),
        (
            driver_map["Gut Health"],
            step_map["O"],
            "Chew each bite of food 20 times before swallowing.",
            "Salivary enzymes prime digestion.",
        ),
        (
            driver_map["Gut Health"],
            step_map["A"],
            "Drink 16 oz of water 30 minutes before every meal.",
            "Hydrates stomach mucosal lining.",
        ),
        (
            driver_map["Gut Health"],
            step_map["L"],
            "Keep prebiotic snacks (nuts, apples, carrots) visible on the counter.",
            "Reduces junk food temptation.",
        ),
        (
            driver_map["Gut Health"],
            step_map["D"],
            "Replace afternoon ultra-processed snack with an apple and walnuts.",
            "Adds pectin and prebiotic fiber.",
        ),
        (
            driver_map["Gut Health"],
            step_map["O"],
            "Take 3 slow deep breaths before putting the first forkful in your mouth.",
            "Activates parasympathetic rest-and-digest.",
        ),
        (
            driver_map["Gut Health"],
            step_map["I"],
            "Reflect each evening on your bowel comfort and digestion clarity.",
            "Track in a notebook.",
        ),
        (
            driver_map["Gut Health"],
            step_map["T"],
            "Share an easy gut-healthy recipe with a friend or family member.",
            "Promotes social accountability.",
        ),
        # Inflammation
        (
            driver_map["Inflammation"],
            step_map["M"],
            "Set intention: 'My body is calm, cool, and healing every day.'",
            "Morning affirmation.",
        ),
        (
            driver_map["Inflammation"],
            step_map["Y"],
            "Add a handful of blueberries or blackberries to breakfast.",
            "Anthocyanins inhibit NF-κB.",
        ),
        (
            driver_map["Inflammation"],
            step_map["G"],
            "Walk briskly for 10 minutes right after lunch.",
            "Lowers postprandial inflammatory spikes.",
        ),
        (
            driver_map["Inflammation"],
            step_map["O"],
            "Take 1/2 teaspoon of turmeric with a pinch of black pepper in food.",
            "Curcuminoids reduce joint pain.",
        ),
        (
            driver_map["Inflammation"],
            step_map["A"],
            "Perform 5 minutes of gentle morning spinal stretching or yoga.",
            "Stimulates lymphatic circulation.",
        ),
        (
            driver_map["Inflammation"],
            step_map["L"],
            "Eliminate soda and sugary beverages from home and pantry.",
            "Removes advanced glycation end-products.",
        ),
        (
            driver_map["Inflammation"],
            step_map["D"],
            "Swap inflammatory trans-fats and fried foods for steamed veggies.",
            "Stops systemic cytokine release.",
        ),
        (
            driver_map["Inflammation"],
            step_map["O"],
            "Practice alternate nostril breathing for 5 minutes when feeling stressed.",
            "Dampens sympathetic overdrive.",
        ),
        (
            driver_map["Inflammation"],
            step_map["I"],
            "Celebrate waking up with less joint stiffness or more energy.",
            "Reinforces positive neuro-circuits.",
        ),
        (
            driver_map["Inflammation"],
            step_map["T"],
            "Teach a family member how turmeric and ginger soothe inflammation.",
            "Spreads healthy practices.",
        ),
        # Insulin Resistance
        (
            driver_map["Insulin Resistance"],
            step_map["M"],
            "Set intention: 'My cells are vibrant, receptive, and energized.'",
            "Morning mindset.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["Y"],
            "Start lunch and dinner with a bowl of dark leafy salad or steamed broccoli.",
            "Fiber coats intestine and blunts glucose curve.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["G"],
            "Walk 10 minutes immediately after your largest meal of the day.",
            "Activates GLUT4 glucose uptake in skeletal muscle.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["O"],
            "Notice how you feel 1 hour after eating — alert vs. sleepy.",
            "Identifies high-glycemic trigger meals.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["A"],
            "Perform 15 bodyweight air squats after sitting for 60 minutes.",
            "Breaks sedentary insulin resistance.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["L"],
            "Batch-cook lentils, beans, and steel-cut oats for the week.",
            "Makes complex carbohydrates effortless.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["D"],
            "Replace sugary coffee drinks or juices with plain green tea or water.",
            "Stops hepatic fructose overload.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["O"],
            "Pause and rate real hunger on a 1-10 scale before snacking.",
            "Stops emotional eating.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["I"],
            "Celebrate when 3 PM afternoon energy crashes disappear.",
            "Proof of stabilized blood glucose.",
        ),
        (
            driver_map["Insulin Resistance"],
            step_map["T"],
            "Show a friend how a 10-minute post-meal walk beats afternoon fatigue.",
            "Shared lifestyle intervention.",
        ),
        # Toxins
        (
            driver_map["Toxins"],
            step_map["M"],
            "Set intention: 'I choose purity and cleanliness in my body and home.'",
            "Saucha (purity) practice.",
        ),
        (
            driver_map["Toxins"],
            step_map["Y"],
            "Add a serving of cruciferous vegetables (broccoli, arugula, cabbage) daily.",
            "Sulforaphane boosts Nrf2 liver detox.",
        ),
        (
            driver_map["Toxins"],
            step_map["G"],
            "Replace 3 plastic food containers with glass or stainless steel.",
            "Eliminates BPA and phthalate leaching.",
        ),
        (
            driver_map["Toxins"],
            step_map["O"],
            "Filter your drinking and cooking tap water with a carbon or reverse-osmosis filter.",
            "Removes chlorine and heavy metals.",
        ),
        (
            driver_map["Toxins"],
            step_map["A"],
            "Take a brisk 20-minute walk or exercise to produce a light sweat.",
            "Dermal elimination of xenobiotics.",
        ),
        (
            driver_map["Toxins"],
            step_map["L"],
            "Switch to fragrance-free, eco-friendly household laundry and surface cleaners.",
            "Reduces indoor volatile organic compounds.",
        ),
        (
            driver_map["Toxins"],
            step_map["D"],
            "Avoid microwaving food in plastic containers or plastic wraps.",
            "Prevents plasticizers entering warm food.",
        ),
        (
            driver_map["Toxins"],
            step_map["O"],
            "Spend 10 minutes outdoors breathing fresh morning air.",
            "Clears stagnant indoor air from lungs.",
        ),
        (
            driver_map["Toxins"],
            step_map["I"],
            "Enjoy clearer skin and reduced morning sinus congestion.",
            "Evidence of lowered toxic burden.",
        ),
        (
            driver_map["Toxins"],
            step_map["T"],
            "Tell a friend why glass water bottles are superior to single-use plastics.",
            "Empowers community detox.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO microhabits_catalog (driver_id, step_id, microhabit_text, implementation_tip)
        VALUES (?, ?, ?, ?)
    """,
        microhabits_data,
    )

    # 10. Clinical Quizzes & Questionnaires
    quizzes_data = [
        (
            "INSULIN_RESISTANCE",
            "Insulin Resistance Screening Quiz (10 Questions)",
            "Chapter 3: Combating Insulin Resistance",
            "Metabolic Dysfunction & Insulin Resistance",
            "Answer 10 clinical screening questions. Give 1 point for every YES. Evaluate your metabolic risk tier.",
            "yes_no_count",
            10,
        ),
        (
            "HORMONE_HEALTH",
            "Hormone Health Screening Questionnaire (10 Questions)",
            "Chapter 4: Hormonal Balance for Optimal Health",
            "Endocrine & Hormonal Imbalance",
            "Answer 10 questions regarding symptoms of hormonal disruption. Score each YES as 1 point.",
            "yes_no_count",
            10,
        ),
        (
            "TOXIN_RISK",
            "Environmental Toxin Exposure & Detox Risk Quiz (10 Questions)",
            "Chapter 5: Toxins Health - Reducing Toxins for Better Aging",
            "Toxic Burden & Xenobiotic Overload",
            "Answer 10 lifestyle exposure questions. Each YES adds 1 point to determine your toxic risk category.",
            "yes_no_count",
            10,
        ),
        (
            "GUT_HEALTH",
            "Gut Health Self-Check Questionnaire (10 Questions)",
            "Chapter 6: Gut Health - The Foundation of Wellness",
            "Microbiome Dysbiosis & Gastrointestinal Integrity",
            "Rate each of the 10 gut symptoms from 0 (Never/Regular) to 3 (Almost Always/Severe). Total score out of 30.",
            "likert_4_point",
            30,
        ),
        (
            "GENETICS_EPIGENETICS",
            "Epigenetic Health Self-Assessment (10 Questions)",
            "Chapter 7: Genetics, Epigenetics, and Lifestyle Interventions",
            "Epigenetic Aging & Lifestyle Gene Signaling",
            "Check 10 daily habits and family markers. Give 1 point for every YES. Total score out of 10.",
            "yes_no_count",
            10,
        ),
        (
            "MITOCHONDRIAL_HEALTH",
            "Mitochondrial Health Risk Score (10 Questions)",
            "Chapter 8: Mitochondrial Regeneration for Longevity",
            "Mitochondrial Energy & ATP Dysfunction",
            "Assess 10 cellular energy markers. Each positive symptom adds 3 points (total score 0 to 30).",
            "weighted_points",
            30,
        ),
        (
            "STEM_CELL_VITALITY",
            "Stem Cell Regeneration Risk Score (11 Questions)",
            "Chapter 9: Stem Cell Regeneration for Youthful Vitality",
            "Regenerative Stem Cell Capacity & Tissue Renewal",
            "Answer 11 regenerative vitality questions. Points assess your body's regenerative reserve (0 to 30).",
            "weighted_points",
            30,
        ),
    ]
    cur.executemany(
        """
        INSERT INTO clinical_quizzes (quiz_code, title, chapter_source, target_condition, instructions, scoring_scale_type, max_possible_score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        quizzes_data,
    )

    # Fetch quiz IDs for questions and scoring rules
    cur.execute("SELECT id, quiz_code FROM clinical_quizzes")
    quiz_map = {row["quiz_code"]: row["id"] for row in cur.fetchall()}

    # 11. Quiz Questions
    # 11.1 Insulin Resistance Questions
    ir_questions = [
        (
            1,
            "Do your parents, brothers, or sisters have type 2 diabetes?",
            "Family History",
        ),
        (
            2,
            "Is your waist circumference greater than 40 inches (men) or 35 inches (women)?",
            "Visceral Adiposity",
        ),
        (
            3,
            "Do you frequently feel tired, drowsy, or sleepy 30–60 minutes after eating meals?",
            "Postprandial Glycemia",
        ),
        (
            4,
            "Do you frequently crave refined carbohydrates, bread, chips, or sugary sweets?",
            "Insulin Spikes",
        ),
        (
            5,
            "Do you notice dark velvety skin patches on your neck/armpits (acanthosis nigricans) or skin tags?",
            "Clinical Signs",
        ),
        (
            6,
            "Has a physician told you that your blood pressure is high (≥ 130/85 mmHg)?",
            "Cardiometabolic",
        ),
        (
            7,
            "Do blood tests show elevated triglycerides (≥ 150 mg/dL) or low HDL cholesterol (< 40 men, < 50 women)?",
            "Dyslipidemia",
        ),
        (
            8,
            "Is it difficult to lose weight, particularly stubborn fat accumulating around your belly?",
            "Metabolic Flexibility",
        ),
        (
            9,
            "Have you ever been diagnosed with non-alcoholic fatty liver disease (NAFLD) or PCOS?",
            "Organ Manifestation",
        ),
        (
            10,
            "Do you experience frequent urination, excessive thirst, or episodes of blurry vision?",
            "Hyperglycemia",
        ),
    ]
    yes_no_options = json.dumps([
        {"label": "No", "points": 0},
        {"label": "Yes", "points": 1},
    ])
    for q_num, q_text, cat in ir_questions:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 1, ?, ?)
        """,
            (quiz_map["INSULIN_RESISTANCE"], q_num, q_text, yes_no_options, cat),
        )

    # 11.2 Hormone Health Questions
    hormone_questions = [
        (
            1,
            "Have you experienced changes in your menstrual cycle (women) or diminished libido/drive (men/women)?",
            "Reproductive",
        ),
        (
            2,
            "Do you struggle with frequent unexplained mood swings, anxiety, or irritability?",
            "Neuroendocrine",
        ),
        (
            3,
            "Do you have a personal or family history of thyroid dysfunction (hypo/hyperthyroidism)?",
            "Thyroid",
        ),
        (
            4,
            "Do you frequently feel cold when others are comfortable, or have chronically cold hands/feet?",
            "Basal Metabolism",
        ),
        (
            5,
            "Have you noticed unexplained weight gain or an inability to lose weight despite dieting?",
            "Metabolic Hormones",
        ),
        (
            6,
            "Do you have difficulty falling asleep, staying asleep, or wake up unrefreshed?",
            "Circadian & Cortisol",
        ),
        (
            7,
            "Are you experiencing diffuse hair thinning, loss, or unexpected facial/body hair growth?",
            "Androgens & Thyroid",
        ),
        (
            8,
            "Do you suffer from frequent hot flashes, night sweats, or temperature dysregulation?",
            "Vasomotor",
        ),
        (
            9,
            "Have you developed sudden changes in skin texture, adult acne, or excessive dryness?",
            "Dermatological",
        ),
        (
            10,
            "Are you currently taking any prescription hormone therapies, birth control, or hormone supplements?",
            "Exogenous Hormones",
        ),
    ]
    for q_num, q_text, cat in hormone_questions:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 1, ?, ?)
        """,
            (quiz_map["HORMONE_HEALTH"], q_num, q_text, yes_no_options, cat),
        )

    # 11.3 Toxin Risk Questions
    toxin_questions = [
        (
            1,
            "Do you regularly consume ultra-processed foods, fast food, or food packaged in plastics?",
            "Dietary Xenobiotics",
        ),
        (
            2,
            "Do you routinely use conventional aerosol sprays, synthetic perfumes, or scented lotions?",
            "Household Chemicals",
        ),
        (
            3,
            "Are you frequently exposed to air pollution, agricultural pesticides, mold, or older paint?",
            "Environmental",
        ),
        (
            4,
            "Do you smoke, vape, or regularly breathe second-hand tobacco or cannabis smoke?",
            "Inhalation Toxins",
        ),
        (
            5,
            "Do you consume alcoholic drinks more than 1–2 times per week?",
            "Hepatic Burden",
        ),
        (
            6,
            "Do you use recreational drugs or take frequent over-the-counter NSAIDs/pain medications?",
            "Pharmacological",
        ),
        (
            7,
            "Do you drink unfiltered municipal tap water or water from thin plastic bottles?",
            "Water Quality",
        ),
        (
            8,
            "Are you taking multiple daily pharmaceutical drugs that stress liver or renal pathways?",
            "Medication Load",
        ),
        (
            9,
            "Have you experienced chronic fatigue, skin rashes, or brain fog that doesn't resolve?",
            "Toxin Symptoms",
        ),
        (
            10,
            "Does your family have a significant history of early cancer, neurodegenerative, or autoimmune disease?",
            "Genetic Vulnerability",
        ),
    ]
    for q_num, q_text, cat in toxin_questions:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 1, ?, ?)
        """,
            (quiz_map["TOXIN_RISK"], q_num, q_text, yes_no_options, cat),
        )

    # 11.4 Gut Health Questions (4-point scale: 0 to 3)
    gut_options = json.dumps([
        {"label": "Never / None (0 pts)", "points": 0},
        {"label": "Occasionally / Mild (1 pt)", "points": 1},
        {"label": "Frequently / Moderate (2 pts)", "points": 2},
        {"label": "Almost Always / Severe (3 pts)", "points": 3},
    ])
    gut_questions = [
        (
            1,
            "How often do you experience bloating, abdominal distension, or gas after meals?",
            "Digestion",
        ),
        (
            2,
            "How regular are your bowel movements (0 = regular/smooth, 3 = chronic constipation or diarrhea)?",
            "Elimination",
        ),
        (
            3,
            "How many courses of oral antibiotics have you taken over the past 12 months?",
            "Microbiome Disruption",
        ),
        (
            4,
            "Do you suffer from known food intolerances, sensitivities (dairy, gluten), or allergies?",
            "Immune Tolerance",
        ),
        (
            5,
            "How frequently do you experience acid reflux, heartburn, or indigestion?",
            "Upper GI",
        ),
        (
            6,
            "How would you rate your diet in terms of processed foods vs. diverse whole plants?",
            "Diet Quality",
        ),
        (
            7,
            "Have you been diagnosed with or suspected of having IBS, SIBO, IBD, or leaky gut?",
            "Clinical GI",
        ),
        (
            8,
            "Do you suffer from daytime tiredness or post-meal energy slumps?",
            "Systemic Fatigue",
        ),
        (
            9,
            "Do you experience persistent skin breakouts, acne, eczema, or rosacea?",
            "Gut-Skin Axis",
        ),
        (
            10,
            "How often do you experience unexplained mood shifts, anxiety, brain fog, or low mood?",
            "Gut-Brain Axis",
        ),
    ]
    for q_num, q_text, cat in gut_questions:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 1, ?, ?)
        """,
            (quiz_map["GUT_HEALTH"], q_num, q_text, gut_options, cat),
        )

    # 11.5 Genetics / Epigenetics Questions
    for q_num, q_text, cat in [
        (
            1,
            "Does anyone in your family (parents/siblings) have early type 2 diabetes, heart disease, or cancer?",
            "Family History",
        ),
        (
            2,
            "Are you frequently around environmental pollution, cigarette smoke, or chemical fumes?",
            "Environmental Stress",
        ),
        (
            3,
            "Do you feel emotionally stressed, anxious, or pressured on most days of the week?",
            "Allostatic Load",
        ),
        (
            4,
            "Do you consume fewer than 2 full servings of vegetables and fruits on most days?",
            "Methyl Donors Deficit",
        ),
        (
            5,
            "Do you routinely sleep less than 7 hours per night or have fragmented sleep?",
            "Circadian Debt",
        ),
        (
            6,
            "Do you get less than 30 minutes of physical activity or walking on most days?",
            "Physical Inactivity",
        ),
        (
            7,
            "Did you experience significant adverse childhood experiences (ACEs) or severe early life trauma?",
            "Developmental Epigenetics",
        ),
        (
            8,
            "Do you drink sugar-sweetened beverages, sports drinks, or alcohol more than twice a week?",
            "Metabolic Stress",
        ),
        (
            9,
            "Do you frequently drink from soft plastic bottles or handle thermal paper receipts?",
            "Endocrine Disruptors",
        ),
        (
            10,
            "Is it challenging to maintain a healthy body composition or stable weight?",
            "Metabolic Health",
        ),
    ]:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 1, ?, ?)
        """,
            (
                quiz_map["GENETICS_EPIGENETICS"],
                q_num,
                q_text,
                yes_no_options,
                cat,
            ),
        )

    # 11.6 Mitochondrial Health Questions (3 points each, max 30)
    mito_options = json.dumps([
        {"label": "No (0 pts)", "points": 0},
        {"label": "Yes (3 pts)", "points": 3},
    ])
    for q_num, q_text, cat in [
        (
            1,
            "Low Energy: Do you often feel drained or lack sustained stamina throughout the day?",
            "Cellular ATP",
        ),
        (
            2,
            "Brain Fog: Is it hard to concentrate, think quickly, or maintain sharp mental clarity?",
            "Cerebral Bioenergetics",
        ),
        (
            3,
            "Muscle Performance: Do you experience muscle weakness, exercise intolerance, or slow recovery?",
            "Myocyte Metabolism",
        ),
        (
            4,
            "Metabolic Concerns: Have you been diagnosed with insulin resistance, obesity, or fatty liver?",
            "Metabolic Syndrome",
        ),
        (
            5,
            "Toxin Exposure: Have you had known exposure to heavy metals, mold, or organic pollutants?",
            "Mitochondrial Toxins",
        ),
        (
            6,
            "Diet Quality: Is your diet low in colorful berries, polyphenols, and antioxidant-rich vegetables?",
            "Antioxidant Reserve",
        ),
        (
            7,
            "Headaches: Do you suffer from frequent unexplained headaches or migraines?",
            "Neuronal Energetics",
        ),
        (
            8,
            "Sensory Changes: Have you noticed accelerated changes in visual acuity or hearing?",
            "High-Energy Tissues",
        ),
        (
            9,
            "Temperature Regulation: Do you struggle to maintain a comfortable body temperature?",
            "Thermogenesis",
        ),
        (
            10,
            "Medication Effects: Are you on medications known to stress mitochondria (statins, certain antibiotics)?",
            "Iatrogenic Burden",
        ),
    ]:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 3, ?, ?)
        """,
            (quiz_map["MITOCHONDRIAL_HEALTH"], q_num, q_text, mito_options, cat),
        )

    # 11.7 Stem Cell Vitality Questions (max 30)
    stem_options = json.dumps([
        {"label": "No (0 pts)", "points": 0},
        {"label": "Yes (3 pts)", "points": 3},
    ])
    for q_num, q_text, cat in [
        (
            1,
            "Do you take an unusually long time to bounce back or recover after strenuous physical exertion?",
            "Recovery",
        ),
        (
            2,
            "Are small skin cuts, bruises, or surgical wounds noticeably slow to heal?",
            "Tissue Regeneration",
        ),
        (
            3,
            "Is your hair thinning rapidly or greying significantly earlier than expected?",
            "Follicular Stem Cells",
        ),
        (
            4,
            "Do you catch frequent seasonal colds, infections, or take weeks to clear common bugs?",
            "Hematopoietic Immunity",
        ),
        (
            5,
            "Do you experience persistent brain fog or notice your memory is not as sharp as it was?",
            "Neurogenesis",
        ),
        (
            6,
            "Are you losing muscle tone or strength despite doing normal daily activities?",
            "Sarcopenia",
        ),
        (
            7,
            "Have you been diagnosed with chronic autoimmune conditions or persistent joint inflammation?",
            "Immune Dysregulation",
        ),
        (
            8,
            "Do you have chronic tummy trouble, irregular bowel habits, or food intolerances?",
            "Intestinal Epithelium",
        ),
        (
            9,
            "Has your weight fluctuated dramatically up or down without intentional dieting?",
            "Metabolic Plasticity",
        ),
        (
            10,
            "Do you spend more than 8 hours of your waking day sitting and physically inactive?",
            "Sedentary Aging",
        ),
        (
            11,
            "Are you subjected to chronic unmanaged stress, ultra-processed diet, or poor sleep?",
            "Stem Cell Exhaustion",
        ),
    ]:
        cur.execute(
            """
            INSERT INTO quiz_questions (quiz_id, question_number, question_text, points_weight, options_json, category)
            VALUES (?, ?, ?, 3, ?, ?)
        """,
            (quiz_map["STEM_CELL_VITALITY"], q_num, q_text, stem_options, cat),
        )

    # 12. Quiz Scoring Rules & Clinical Triage Recommendations
    scoring_rules_data = [
        # Insulin Resistance
        (
            quiz_map["INSULIN_RESISTANCE"],
            "Low",
            0,
            2,
            "Low Risk",
            "Optimal insulin sensitivity. Minimal evidence of metabolic resistance.",
            "Maintain colorful plant-forward diet, 150 min/wk physical activity, and routine annual metabolic lab screening.",
        ),
        (
            quiz_map["INSULIN_RESISTANCE"],
            "Moderate",
            3,
            5,
            "Moderate Risk",
            "Early metabolic strain. Elevated risk of progressing to pre-diabetes and metabolic syndrome.",
            "Implement 10-minute post-meal walks, prioritize fiber-first meals, eliminate liquid sugars, and request fasting insulin + lipid panel.",
        ),
        (
            quiz_map["INSULIN_RESISTANCE"],
            "High",
            6,
            10,
            "High Risk",
            "Significant insulin resistance. High probability of pre-diabetes, visceral adiposity, and metabolic inflammation.",
            "Consult physician for complete metabolic workup (HbA1c, fasting insulin, HOMA-IR, lipid profile, liver panel). Adopt strict whole-food plant-based diet and supervised lifestyle protocol.",
        ),
        # Hormone Health
        (
            quiz_map["HORMONE_HEALTH"],
            "Mild",
            0,
            3,
            "Minimal Risk",
            "Healthy neuroendocrine balance. Endocrine feedback loops operating well.",
            "Protect consistent sleep schedules (bed by 10 PM), manage daily stress with breathwork, and maintain micronutrient-dense diet.",
        ),
        (
            quiz_map["HORMONE_HEALTH"],
            "Moderate",
            4,
            6,
            "Medium Risk",
            "Mild to moderate neuroendocrine imbalance affecting thyroid, adrenal cortisol, or sex hormone balance.",
            "Adopt evening wind-down routine to lower cortisol, reduce caffeine and alcohol, increase cruciferous vegetables for estrogen metabolism, and discuss hormone labs with doctor.",
        ),
        (
            quiz_map["HORMONE_HEALTH"],
            "Severe",
            7,
            10,
            "High Risk",
            "Pronounced hormone disruption significantly impairing sleep, metabolism, and mood.",
            "Comprehensive laboratory evaluation (TSH, Free T3/T4, Cortisol, DHEA-S, sex hormones). Work with an integrative/functional medicine doctor on targeted nutrition and adaptogens.",
        ),
        # Toxin Risk
        (
            quiz_map["TOXIN_RISK"],
            "Mild",
            0,
            3,
            "Mild Risk",
            "Low environmental xenobiotic exposure and adequate biological detoxification reserve.",
            "Continue filtered drinking water, eat organic produce where possible, and use clean household personal care products.",
        ),
        (
            quiz_map["TOXIN_RISK"],
            "Moderate",
            4,
            6,
            "Moderate Risk",
            "Substantial ongoing exposure to environmental chemicals, processed packaging, or lifestyle toxins.",
            "Transition food storage from plastic to glass, drink filtered water, add cruciferous vegetables (sulforaphane) to support Phase II liver detox, and sweat weekly.",
        ),
        (
            quiz_map["TOXIN_RISK"],
            "Severe",
            7,
            10,
            "Severe Risk",
            "Heavy toxic burden overwhelming hepatic and renal detoxification pathways.",
            "Work with clinical team to perform detox lab testing (heavy metals, environmental toxins, liver enzymes). Eliminate smoking/alcohol and implement structured lifestyle detox protocol.",
        ),
        # Gut Health
        (
            quiz_map["GUT_HEALTH"],
            "Low",
            0,
            7,
            "Awesome Gut Health",
            "Robust microbiome diversity, healthy mucosal barrier, and optimal digestion.",
            "Keep enjoying at least 30 diverse plant foods weekly, fermented foods, and staying well hydrated.",
        ),
        (
            quiz_map["GUT_HEALTH"],
            "Mild",
            8,
            15,
            "Gut Needs TLC",
            "Early microbial dysbiosis, mild permeability, or dietary fiber deficiency.",
            "Chew thoroughly (20x/bite), increase prebiotic foods (garlic, onions, asparagus), include daily probiotic foods, and avoid eating under stress.",
        ),
        (
            quiz_map["GUT_HEALTH"],
            "Moderate",
            16,
            23,
            "Moderate Risk",
            "Significant gut dysbiosis causing chronic digestive complaints, fatigue, and systemic inflammation.",
            "Eliminate the 'six poisons' (refined sugar, processed food, dairy, gluten, trans fats). Consider gentle herbal support (ginger, peppermint, licorice) and consult gut specialist.",
        ),
        (
            quiz_map["GUT_HEALTH"],
            "High",
            24,
            30,
            "High Risk",
            "Severe gastrointestinal impairment, marked dysbiosis, and compromised gut-brain communication.",
            "Consult healthcare provider for comprehensive stool testing (GI-MAP/microbiome), food sensitivity testing, and clinical gut restoration protocol (Remove, Replace, Reinoculate, Repair).",
        ),
        # Genetics / Epigenetics
        (
            quiz_map["GENETICS_EPIGENETICS"],
            "Mild",
            0,
            3,
            "Mild Risk",
            "Favorable epigenetic signaling. Daily lifestyle choices support longevity gene expression.",
            "Continue daily movement, restorative sleep, colorful nutrition, and positive stress-reduction routines.",
        ),
        (
            quiz_map["GENETICS_EPIGENETICS"],
            "Moderate",
            4,
            6,
            "Moderate Risk",
            "Sub-optimal lifestyle habits are triggering pro-inflammatory epigenetic pathways.",
            "Incorporate folate-rich foods (spinach, lentils, asparagus) to support DNA methylation, reduce chemical exposures, and commit to daily mindfulness.",
        ),
        (
            quiz_map["GENETICS_EPIGENETICS"],
            "Severe",
            7,
            10,
            "Severe Risk",
            "High allostatic burden driving accelerated biological aging and adverse gene transcription.",
            "Structured lifestyle intervention across all 6 lifestyle medicine pillars. Consider biological age testing (epigenetic DNA methylation clock) and personalized physician coaching.",
        ),
        # Mitochondrial Health
        (
            quiz_map["MITOCHONDRIAL_HEALTH"],
            "Low",
            0,
            10,
            "Low Risk",
            "Mitochondrial density and ATP generation are robust and well-maintained.",
            "Maintain regular aerobic activity, antioxidant-rich whole foods, and consistent circadian rhythms.",
        ),
        (
            quiz_map["MITOCHONDRIAL_HEALTH"],
            "Moderate",
            11,
            20,
            "Moderate Risk",
            "Mitochondrial efficiency is lagging, leading to brain fog, fatigue, and slow recovery.",
            "Add high-intensity interval training (HIIT) to stimulate mitochondrial biogenesis (PGC-1α), get morning sunlight, and consider cofactors (CoQ10, alpha-lipoic acid, magnesium).",
        ),
        (
            quiz_map["MITOCHONDRIAL_HEALTH"],
            "High",
            21,
            30,
            "High Risk",
            "Substantial mitochondrial dysfunction with elevated oxidative stress and cellular bioenergetic deficit.",
            "Medical evaluation including metabolic labs (lactate, pyruvate, CK, CMP, lipid profile). Implement targeted mitochondrial therapy and clinical antioxidant support.",
        ),
        # Stem Cell Vitality
        (
            quiz_map["STEM_CELL_VITALITY"],
            "Low",
            0,
            10,
            "Low Risk",
            "Regenerative stem cell pools and tissue repair mechanisms are thriving.",
            "Keep up healthy plant nutrition, regular exercise, deep sleep, and active stress management.",
        ),
        (
            quiz_map["STEM_CELL_VITALITY"],
            "Moderate",
            11,
            20,
            "Moderate Risk",
            "Accelerated cellular wear and tear depleting endogenous stem cell renewal.",
            "Incorporate safe intermittent fasting or time-restricted eating, eat polyphenol-rich foods (berries, green tea), and commit to 7-9 hours of nightly restorative sleep.",
        ),
        (
            quiz_map["STEM_CELL_VITALITY"],
            "High",
            21,
            30,
            "High Risk",
            "Severe stem cell exhaustion and compromised regenerative resilience.",
            "Work with a longevity medicine physician. Conduct comprehensive biomarker panel (telomere length, inflammatory cytokines, cellular health panels) and aggressive lifestyle rejuvenation.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO quiz_scoring_rules (
            quiz_id, risk_level, min_score, max_score, label, clinical_interpretation, recommended_actions
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """,
        scoring_rules_data,
    )

    # 13. Evidence-Based Therapeutic Supplements (Table 5 & Fullscript protocols)
    supplements_data = [
        (
            "Curcumin (Turmeric)",
            "Potent inhibitor of NF-κB, COX-2, and inflammatory cytokines (TNF-α, IL-6). Reduces joint pain and cartilage breakdown.",
            "500–2,000 mg/day (standardized to 95% curcuminoids, enhanced with piperine/black pepper extract for 2000% bioavailability).",
            "Chronic inflammation, osteoarthritis, metabolic syndrome, gut permeability.",
            "Fullscript Joint & Inflammation Protocol",
        ),
        (
            "Omega-3 Fatty Acids (EPA/DHA)",
            "Precursor to specialized pro-resolving mediators (resolvins, protectins). Lowers triglycerides, CRP, and cardiovascular risk.",
            "1,000–4,000 mg/day of combined EPA/DHA from molecularly distilled fish oil or algae oil.",
            "Cardiovascular risk, elevated triglycerides, brain health, arthritis, neuro-inflammation.",
            "Fullscript Cardiometabolic & Brain Protocol",
        ),
        (
            "Ginger (Zingiber officinale)",
            "Inhibits cyclooxygenase and lipoxygenase pathways, reducing leukotrienes and prostaglandins.",
            "1,000–2,000 mg/day standardized ginger extract.",
            "Digestive discomfort, nausea, joint stiffness, exercise-induced muscle soreness.",
            "Fullscript GI & Pain Protocol",
        ),
        (
            "Boswellia serrata (Frankincense)",
            "Blocks 5-lipoxygenase (5-LOX) pro-inflammatory enzyme; preserves connective tissue glycosaminoglycans.",
            "200–1,000 mg/day (standardized to 30–65% boswellic acids / AKBA).",
            "Osteoarthritis, back pain, inflammatory bowel complaints, asthma.",
            "Fullscript Joint & Inflammation Protocol",
        ),
        (
            "Quercetin",
            "Flavonoid antioxidant with senolytic properties; stabilizes mast cells, inhibits histamine release, and supports zinc ionophore uptake.",
            "200–500 mg/day (often paired with bromelain or vitamin C).",
            "Cellular senescence, seasonal allergies, vascular endothelitis, longevity.",
            "Fullscript Cellular Health Protocol",
        ),
        (
            "Coenzyme Q10 (Ubiquinol)",
            "Essential electron carrier in mitochondrial respiratory chain (Complexes I, II, III). Potent lipophilic antioxidant.",
            "100–300 mg/day ubiquinol with fat-containing meal.",
            "Mitochondrial dysfunction, statin-induced myopathy, heart failure, cognitive fatigue.",
            "Fullscript Mitochondrial Vitality Protocol",
        ),
        (
            "Magnesium (Glycinate / Malate / Threonate)",
            "Cofactor in > 300 enzymatic reactions including ATP synthesis, DNA repair, and muscle relaxation.",
            "200–400 mg/day elemental magnesium.",
            "Insomnia, muscle cramps, anxiety, hypertension, insulin resistance.",
            "Fullscript Relaxation & Sleep Protocol",
        ),
        (
            "Berberine",
            "Activates AMP-activated protein kinase (AMPK), mimics caloric restriction, lowers glucose and LDL cholesterol.",
            "500 mg 2–3 times daily before meals.",
            "Insulin resistance, type 2 diabetes, dyslipidemia, gut dysbiosis.",
            "Fullscript Metabolic Power Protocol",
        ),
        (
            "Alpha-Lipoic Acid (ALA)",
            "Universal water- and fat-soluble antioxidant; regenerates glutathione, vitamin C, and coenzyme Q10.",
            "300–600 mg/day.",
            "Diabetic neuropathy, insulin sensitivity, mitochondrial protection.",
            "Fullscript Antioxidant & Nerve Protocol",
        ),
        (
            "PQQ (Pyrroloquinoline Quinone)",
            "Stimulates mitochondrial biogenesis via CREB phosphorylation and PGC-1α activation.",
            "10–20 mg/day.",
            "Cellular aging, cognitive decline, mitochondrial renewal.",
            "Fullscript Mitochondrial Vitality Protocol",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO therapeutic_supplements (name, mechanism_and_evidence, typical_dosage_and_notes, primary_indications, fullscript_protocol_name)
        VALUES (?, ?, ?, ?, ?)
    """,
        supplements_data,
    )

    # 14. Lab Biomarkers (Insurance vs. Functional)
    labs_data = [
        # Insurance-covered
        (
            "Comprehensive Metabolic Panel (CMP)",
            "Insurance Covered",
            "Liver, Kidneys, Electrolytes, Glucose",
            "Evaluates baseline hepatic enzymes (AST/ALT), kidney filtration (BUN/Creatinine), fasting blood glucose, and electrolyte balance.",
        ),
        (
            "Complete Blood Count (CBC) with Differential",
            "Insurance Covered",
            "Hematopoietic & Immune System",
            "Assesses red blood cells, hemoglobin, white blood cell sub-types, and platelet count to screen for anemia and infection.",
        ),
        (
            "Lipid Panel (Standard)",
            "Insurance Covered",
            "Cardiovascular & Lipid Metabolism",
            "Measures Total Cholesterol, Triglycerides, HDL, LDL, and Non-HDL cholesterol to evaluate atherogenic risk.",
        ),
        (
            "Hemoglobin A1c (HbA1c)",
            "Insurance Covered",
            "Glycemic Control (3-Month Average)",
            "Measures percentage of glycated hemoglobin; standard clinical diagnostic marker for pre-diabetes (5.7–6.4%) and diabetes (≥ 6.5%).",
        ),
        (
            "High-Sensitivity C-Reactive Protein (hs-CRP)",
            "Insurance Covered",
            "Systemic Vascular Inflammation",
            "Acute phase reactant synthesized by liver in response to IL-6. Scores < 1.0 mg/L represent low systemic vascular inflammation.",
        ),
        (
            "Erythrocyte Sedimentation Rate (ESR)",
            "Insurance Covered",
            "Systemic Chronic Inflammation",
            "Non-specific rate of red blood cell settling; elevated in autoimmune conditions, infection, and chronic inflammation.",
        ),
        (
            "Fasting Insulin",
            "Insurance Covered",
            "Pancreatic Beta-Cell Function & Insulin Resistance",
            "Detects compensatory hyperinsulinemia years before fasting blood glucose rises; used to compute HOMA-IR index.",
        ),
        (
            "Lactate and Pyruvate",
            "Insurance Covered",
            "Mitochondrial Energy Metabolism",
            "Elevated lactate/pyruvate ratio indicates impaired mitochondrial oxidative phosphorylation and shift to anaerobic glycolysis.",
        ),
        (
            "Creatine Kinase (CK) & LDH",
            "Insurance Covered",
            "Muscle & Tissue Breakdown",
            "Screens for myopathy, muscle damage from statins, or metabolic muscle disease.",
        ),
        (
            "Vitamin D (25-Hydroxyvitamin D)",
            "Insurance Covered",
            "Immune, Bone, and Gene Modulation",
            "Hormone precursor regulating thousands of genes. Optimal longevity target is 50–80 ng/mL.",
        ),
        # Functional / Out of pocket
        (
            "Epigenetic DNA Methylation Age Clock (GrimAge / Horvath)",
            "Functional / Out of Pocket",
            "Biological vs. Chronological Aging",
            "Analyzes CpG island methylation patterns across the genome to measure biological pace of aging and mortality risk.",
        ),
        (
            "Leukocyte Telomere Length Assay",
            "Functional / Out of Pocket",
            "Cellular Senescence & Longevity",
            "Quantifies mean terminal restriction fragment length of telomeres to benchmark cellular age against age-matched controls.",
        ),
        (
            "Comprehensive Stool Microbiome DNA Panel (GI-MAP)",
            "Functional / Out of Pocket",
            "Gastrointestinal Dysbiosis & Permeability",
            "Quantifies abundance of keystone bacteria (Faecalibacterium prausnitzii, Akkermansia muciniphila) and detects dysbiosis or zonulin leaks.",
        ),
        (
            "Organic Acids Test (OAT)",
            "Functional / Out of Pocket",
            "Metabolic & Mitochondrial Byproducts",
            "Measures urinary organic acid metabolites reflecting Krebs cycle efficiency, neurotransmitter turnover, and yeast/bacterial overgrowth.",
        ),
        (
            "Environmental Toxins & Heavy Metals Panel",
            "Functional / Out of Pocket",
            "Xenobiotic Toxic Burden",
            "Urinary or blood analysis of phthalates, parabens, organophosphates, lead, mercury, arsenic, and cadmium.",
        ),
    ]
    cur.executemany(
        """
        INSERT INTO lab_biomarkers (test_name, coverage_category, target_system, clinical_significance)
        VALUES (?, ?, ?, ?)
    """,
        labs_data,
    )

    conn.commit()
    print("Database seeded with complete LiveWell data successfully!")

    # Export all tables as JSON for API & Frontend
    export_data = {}
    tables = [
        "book_metadata",
        "lifestyle_pillars",
        "hallmarks_of_aging",
        "pillar_hallmark_map",
        "habits_superpowers",
        "ashtanga_limbs",
        "chronic_disease_drivers",
        "my_goal_do_it_steps",
        "microhabits_catalog",
        "clinical_quizzes",
        "quiz_questions",
        "quiz_scoring_rules",
        "therapeutic_supplements",
        "lab_biomarkers",
    ]

    for table in tables:
        cur.execute(f"SELECT * FROM {table}")
        rows = [dict(row) for row in cur.fetchall()]
        export_data[table] = rows

    with open(JSON_EXPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)

    print(f"Exported complete LiveWell dataset to {JSON_EXPORT_PATH}")
    conn.close()


if __name__ == "__main__":
    init_database()
    seed_database()
