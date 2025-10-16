/*
  # Add Health Education System
  
  ## Overview
  This migration adds a comprehensive health education system to support elderly patients
  with chronic diseases (hypertension, diabetes, etc.) by providing educational content
  about disease management, diet, exercise, and non-pharmaceutical interventions.
  
  ## New Tables
  
  ### `health_topics`
  - `id` (uuid, primary key) - Unique topic identifier
  - `title` (text) - Topic title (e.g., "Managing High Blood Pressure")
  - `category` (text) - Category: 'hypertension', 'diabetes', 'general', 'exercise', 'diet'
  - `description` (text) - Brief description of the topic
  - `icon` (text) - Icon identifier for UI display
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - When topic was created
  
  ### `health_articles`
  - `id` (uuid, primary key) - Unique article identifier
  - `topic_id` (uuid) - References health_topics table
  - `title` (text) - Article title
  - `content` (text) - Full article content
  - `summary` (text) - Brief summary
  - `reading_time_minutes` (integer) - Estimated reading time
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz) - When article was created
  
  ### `user_article_progress`
  - `id` (uuid, primary key) - Unique progress identifier
  - `user_id` (uuid) - References profiles table
  - `article_id` (uuid) - References health_articles table
  - `read_at` (timestamptz) - When user read the article
  - `bookmarked` (boolean) - Whether user bookmarked this article
  - `created_at` (timestamptz) - When progress was created
  
  ## Security
  
  - Health education content is readable by all authenticated users
  - User progress is private to each user
  - RLS policies ensure data privacy
  
  ## Important Notes
  
  1. **Educational Focus**: Content focused on elderly chronic disease management
  2. **Multi-language Ready**: Schema supports future internationalization
  3. **Progress Tracking**: Users can track what they've read
  4. **Bookmarking**: Users can save articles for later reference
*/

-- Create health_topics table
CREATE TABLE IF NOT EXISTS health_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('hypertension', 'diabetes', 'heart_health', 'general', 'exercise', 'diet', 'medication_safety')),
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'book',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_topics ENABLE ROW LEVEL SECURITY;

-- Create health_articles table
CREATE TABLE IF NOT EXISTS health_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES health_topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  summary text NOT NULL,
  reading_time_minutes integer DEFAULT 5,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_articles ENABLE ROW LEVEL SECURITY;

-- Create user_article_progress table
CREATE TABLE IF NOT EXISTS user_article_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES health_articles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  bookmarked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

ALTER TABLE user_article_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_topics
CREATE POLICY "Anyone can view health topics"
  ON health_topics FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for health_articles
CREATE POLICY "Anyone can view health articles"
  ON health_articles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_article_progress
CREATE POLICY "Users can view own progress"
  ON user_article_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress"
  ON user_article_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON user_article_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own progress"
  ON user_article_progress FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_topics_category ON health_topics(category);
CREATE INDEX IF NOT EXISTS idx_health_topics_order ON health_topics(order_index);
CREATE INDEX IF NOT EXISTS idx_health_articles_topic_id ON health_articles(topic_id);
CREATE INDEX IF NOT EXISTS idx_health_articles_published ON health_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_user_article_progress_user ON user_article_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_article_progress_article ON user_article_progress(article_id);

-- Insert initial health topics
INSERT INTO health_topics (title, category, description, icon, order_index) VALUES
  ('Understanding High Blood Pressure', 'hypertension', 'Learn about hypertension, its causes, and how to manage it effectively', 'heart', 1),
  ('Managing Diabetes', 'diabetes', 'Essential information about diabetes management and blood sugar control', 'activity', 2),
  ('Heart Health Basics', 'heart_health', 'Tips for maintaining a healthy heart as you age', 'heart-pulse', 3),
  ('Healthy Eating Guide', 'diet', 'Nutritional advice for managing chronic conditions', 'apple', 4),
  ('Exercise for Seniors', 'exercise', 'Safe and effective exercises for older adults', 'dumbbell', 5),
  ('Medication Safety Tips', 'medication_safety', 'Important guidelines for taking medications safely', 'shield-check', 6)
ON CONFLICT DO NOTHING;

-- Insert initial health articles for hypertension
INSERT INTO health_articles (topic_id, title, content, summary, reading_time_minutes) 
SELECT 
  ht.id,
  'What is High Blood Pressure?',
  E'High blood pressure, or hypertension, occurs when the force of blood against your artery walls is consistently too high. This condition often has no symptoms but can lead to serious health problems if left untreated.\n\n**Normal vs High Blood Pressure**\nNormal blood pressure is typically below 120/80 mmHg. High blood pressure is generally 130/80 mmHg or higher.\n\n**Why It Matters**\nOver time, high blood pressure can damage your blood vessels and organs, particularly your heart, brain, kidneys, and eyes. The good news is that lifestyle changes and medications can help control it.\n\n**Key Symptoms to Watch**\nWhile most people don\'t experience symptoms, severe hypertension may cause:\n- Headaches\n- Shortness of breath\n- Nosebleeds\n- Chest pain\n\n**When to See a Doctor**\nRegular check-ups are essential. If you experience severe symptoms or your blood pressure reading is extremely high (180/120 mmHg or higher), seek immediate medical attention.',
  'Learn what high blood pressure is, why it matters, and when to seek medical help.',
  7
FROM health_topics ht WHERE ht.category = 'hypertension' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO health_articles (topic_id, title, content, summary, reading_time_minutes) 
SELECT 
  ht.id,
  'Diet Tips for Managing Blood Pressure',
  E'What you eat has a significant impact on your blood pressure. Here are evidence-based dietary strategies to help manage hypertension.\n\n**The DASH Diet Approach**\nThe DASH (Dietary Approaches to Stop Hypertension) diet emphasizes:\n- Fruits and vegetables (4-5 servings each daily)\n- Whole grains (6-8 servings daily)\n- Lean proteins (fish, poultry, beans)\n- Low-fat dairy products\n- Nuts and seeds (4-5 servings weekly)\n\n**Foods to Limit**\n- Sodium: Aim for less than 2,300 mg daily (ideally 1,500 mg)\n- Processed foods and canned goods\n- Red meat and fatty cuts\n- Sugary drinks and sweets\n- Alcohol (no more than one drink daily for women, two for men)\n\n**Foods That Help Lower Blood Pressure**\n- Bananas, oranges, and potassium-rich foods\n- Leafy greens (spinach, kale)\n- Berries (especially blueberries)\n- Beets and beet juice\n- Oatmeal and whole grains\n- Fatty fish (salmon, mackerel)\n- Garlic and herbs (instead of salt)\n\n**Practical Tips**\n- Read nutrition labels carefully\n- Cook at home more often\n- Use herbs and spices for flavor\n- Prepare meals in advance\n- Stay hydrated with water',
  'Discover which foods can help lower blood pressure and which ones to avoid.',
  8
FROM health_topics ht WHERE ht.category = 'hypertension' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert diabetes management articles
INSERT INTO health_articles (topic_id, title, content, summary, reading_time_minutes) 
SELECT 
  ht.id,
  'Understanding Type 2 Diabetes',
  E'Type 2 diabetes is a chronic condition that affects how your body processes blood sugar (glucose). With proper management, you can live a healthy, active life.\n\n**What Happens in Diabetes**\nYour body either doesn\'t produce enough insulin or can\'t use it effectively. Insulin is the hormone that helps glucose enter your cells for energy. When this process doesn\'t work properly, sugar builds up in your bloodstream.\n\n**Common Symptoms**\n- Increased thirst and frequent urination\n- Increased hunger\n- Unintended weight loss\n- Fatigue and weakness\n- Blurred vision\n- Slow-healing sores\n- Frequent infections\n\n**Risk Factors**\n- Age (45 or older)\n- Family history\n- Being overweight or obese\n- Physical inactivity\n- High blood pressure\n- High cholesterol\n\n**Complications to Prevent**\n- Heart disease and stroke\n- Nerve damage (neuropathy)\n- Kidney damage (nephropathy)\n- Eye damage (retinopathy)\n- Foot problems\n\n**The Power of Management**\nWith proper diet, exercise, medication, and monitoring, you can keep your blood sugar levels in a healthy range and prevent complications.',
  'Essential information about Type 2 diabetes, its symptoms, and why management matters.',
  8
FROM health_topics ht WHERE ht.category = 'diabetes' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert exercise articles
INSERT INTO health_articles (topic_id, title, content, summary, reading_time_minutes) 
SELECT 
  ht.id,
  'Safe Exercise for Seniors',
  E'Regular physical activity is one of the most important things you can do for your health, especially as you age. Here\'s how to exercise safely and effectively.\n\n**Benefits of Exercise**\n- Lowers blood pressure and blood sugar\n- Strengthens heart and bones\n- Improves balance and flexibility\n- Boosts mood and mental health\n- Helps maintain independence\n\n**Recommended Activities**\n\n*Aerobic Exercise (150 minutes weekly)*\n- Brisk walking\n- Swimming or water aerobics\n- Cycling\n- Dancing\n- Gardening\n\n*Strength Training (2 days weekly)*\n- Light weights or resistance bands\n- Chair exercises\n- Bodyweight exercises (wall push-ups, sit-to-stand)\n\n*Balance and Flexibility*\n- Tai chi\n- Yoga\n- Simple stretching routines\n\n**Safety Guidelines**\n- Always warm up (5-10 minutes)\n- Start slowly and build gradually\n- Listen to your body\n- Stay hydrated\n- Wear proper footwear\n- Exercise with a partner when possible\n\n**When to Stop**\nStop exercising and consult your doctor if you experience:\n- Chest pain or pressure\n- Severe shortness of breath\n- Dizziness or lightheadedness\n- Irregular heartbeat\n\n**Talk to Your Doctor**\nBefore starting any exercise program, discuss your plans with your healthcare provider, especially if you have chronic conditions.',
  'Learn about safe, effective exercises for older adults with chronic conditions.',
  9
FROM health_topics ht WHERE ht.category = 'exercise' LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert medication safety article
INSERT INTO health_articles (topic_id, title, content, summary, reading_time_minutes) 
SELECT 
  ht.id,
  'Taking Medications Safely',
  E'When managing chronic conditions, taking medications correctly is crucial. Here are essential tips for medication safety.\n\n**Understanding Your Medications**\n- Know the name, purpose, and dosage of each medication\n- Understand when and how to take each one\n- Be aware of potential side effects\n- Know which medications interact with each other\n\n**Best Practices**\n\n*Timing and Consistency*\n- Take medications at the same time each day\n- Use pill organizers to stay organized\n- Set reminders on your phone or watch\n- Keep a medication schedule visible\n\n*Storage*\n- Store in a cool, dry place (unless refrigeration required)\n- Keep medications in original containers\n- Check expiration dates regularly\n- Keep out of reach of children and pets\n\n*Food and Drink Interactions*\n- Some medications should be taken with food\n- Others work best on an empty stomach\n- Avoid alcohol unless approved by your doctor\n- Ask about interactions with supplements\n\n**Important Reminders**\n- Never skip doses\n- Don\'t stop taking medications without consulting your doctor\n- Don\'t share medications with others\n- Bring all medications to doctor appointments\n- Keep an updated list of all medications\n\n**Managing Side Effects**\n- Report any new or worsening symptoms\n- Don\'t adjust dosage on your own\n- Ask about alternatives if side effects are severe\n\n**Questions to Ask Your Doctor**\n- What is this medication for?\n- How and when should I take it?\n- What side effects should I watch for?\n- Are there any food or drug interactions?\n- What should I do if I miss a dose?',
  'Essential guidelines for taking medications safely and effectively.',
  10
FROM health_topics ht WHERE ht.category = 'medication_safety' LIMIT 1
ON CONFLICT DO NOTHING;