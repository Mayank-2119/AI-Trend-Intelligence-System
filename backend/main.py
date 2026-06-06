import os
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API keys from your .env file
load_dotenv()

app = FastAPI()

# Allow your React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("CRITICAL WARNING: GEMINI_API_KEY not found in .env file.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

def fetch_youtube_data(topic: str, max_results: int = 15):
    """Fetches live, real-time video data from YouTube based on the topic."""
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    if not YOUTUBE_API_KEY:
        print("❌ YOUTUBE API KEY MISSING FROM .ENV")
        return []

    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": topic,
        "type": "video",
        "maxResults": max_results,
        "relevanceLanguage": "en",
        "key": YOUTUBE_API_KEY
    }

    try:
        print(f"Fetching live YouTube data for: {topic}...")
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            print(f"❌ YOUTUBE API ERROR: Status Code {response.status_code}")
            return []
        
        data = response.json()
        items = data.get("items", [])
        posts = []
        
        for item in items:
            snippet = item.get("snippet", {})
            title = snippet.get("title", "")
            desc = snippet.get("description", "")
            
            if title or desc:
                posts.append({
                    "title": title,
                    "text": desc[:500] # Limit text length to save Gemini tokens
                })
                
        print(f"✅ SUCCESS: Scraped {len(posts)} live videos from YouTube.")
        return posts
        
    except Exception as e:
        print(f"❌ Scraping Error: {e}")
        return []


@app.get("/analyze")
async def analyze_topic(topic: str):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key missing on server.")

    # 1. Scrape live data from YouTube instead of Reddit
    youtube_data = fetch_youtube_data(topic)
    if not youtube_data:
        raise HTTPException(status_code=404, detail=f"No recent discussions found for '{topic}'.")

    # Convert the scraped data into a clean text block for the AI to read
    raw_text = "\n".join([f"Video: {p['title']} | Description: {p['text']}" for p in youtube_data])

    # 2. The Intelligence Prompt
    prompt = f"""
    You are an elite data intelligence analyst. I am providing you with live YouTube search data about the topic: "{topic}".
    Read this raw data and extract the underlying sentiment, emotional drivers, and specific real-world context (news, events, or factual anchors) driving the conversation.

    RAW DATA:
    {raw_text}

    Analyze the data and return a strict JSON object exactly matching this structure. Do not include markdown formatting like ```json.
    {{
        "topic": "{topic}",
        "sentiment": "Positive", // Must be Positive, Negative, or Neutral
        "summary": "A single cinematic, professional sentence summarizing the overall sentiment momentum.",
        "context": {{
            "summary": "A single sentence summarizing the factual real-world drivers behind the discussion.",
            "key_events": [
                {{
                    "headline": "Short 2-4 word headline of a specific event or narrative mentioned",
                    "detail": "One sentence explaining how this event is impacting the discussion."
                }},
                {{
                    "headline": "Another event headline",
                    "detail": "One sentence explaining the secondary driver."
                }}
            ]
        }},
        "virality_score": 85, // Integer 0-100 based on controversy and engagement
        "emotion_breakdown": {{
            "joy": 10, "surprise": 20, "anger": 40, "fear": 20, "sadness": 10 // Must sum to 100
        }},
        "nodes": [
            // Extract individual YouTube videos from the RAW DATA and assign them a sentiment and impact score
            {{ "id": 1, "title": "Exact Title of YouTube Video 1", "sentiment": "Positive", "score": 85 }},
            {{ "id": 2, "title": "Exact Title of YouTube Video 2", "sentiment": "Negative", "score": 42 }}
        ]
    }}
    """

    try:
        # 3. Call Gemini
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # This physically forces Gemini to ONLY output valid JSON. No markdown, no text.
        config = genai.GenerationConfig(response_mime_type="application/json")
        
        max_retries = 3
        response = None
        
        for attempt in range(max_retries):
            try:
                # Use the async call, pass the JSON config
                response = await model.generate_content_async(prompt, generation_config=config)
                break  # If successful, break out of the retry loop
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "Quota exceeded" in error_str:
                    if attempt < max_retries - 1:
                        print(f"⚠️ Google Quota Hit (Attempt {attempt + 1}/{max_retries}). Throttling backend for 35 seconds...")
                        import asyncio
                        await asyncio.sleep(35) 
                        continue
                raise e  # If it's a different error, throw it

        if not response:
            raise HTTPException(status_code=429, detail="Gemini API is temporarily overloaded.")

        # Because we forced JSON formatting, we don't need to strip markdown anymore
        analysis_data = json.loads(response.text)
        return analysis_data

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate intelligence report.")