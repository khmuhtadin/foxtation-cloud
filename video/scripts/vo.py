# Generates the voiceover with character timestamps: python3 scripts/vo.py <voice_id> <name>
import base64, json, os, sys, urllib.request

TEXT = ("Typing is slow. Talking isn't. "
        "Meet Foxtation. "
        "Hold Option, speak, let go... and it's typed, in any app on your Mac. "
        "Twenty-three languages. Even two in one sentence. "
        "Ramble a little? Pro cleans it up, in the right tone for every app. "
        "Free, open source, and private. "
        "Foxtation. Hold Option, and say hello.")

voice, name = sys.argv[1], sys.argv[2]
key = os.environ["ELEVENLABS_API_KEY"]
body = {
    "text": TEXT,
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True},
}
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_192",
    data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
d = json.load(urllib.request.urlopen(req))
open(f"public/audio/vo-{name}.mp3", "wb").write(base64.b64decode(d["audio_base64"]))

a = d["alignment"]
words, cur, start = [], "", None
for ch, s, e in zip(a["characters"], a["character_start_times_seconds"], a["character_end_times_seconds"]):
    if ch == " ":
        if cur: words.append({"w": cur, "s": round(start, 3), "e": round(end, 3)})
        cur, start = "", None
        continue
    if start is None: start = s
    cur += ch; end = e
if cur: words.append({"w": cur, "s": round(start, 3), "e": round(end, 3)})
json.dump(words, open(f"public/audio/vo-{name}.json", "w"), indent=1)
for w in words: print(f'{w["s"]:6.2f} {w["e"]:6.2f} {w["w"]}')
