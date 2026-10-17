# Music and sound effects from ElevenLabs: python3 scripts/sfx.py
import json, os, urllib.request
from concurrent.futures import ThreadPoolExecutor

key = os.environ["ELEVENLABS_API_KEY"]

def post(path, body, out):
    req = urllib.request.Request(f"https://api.elevenlabs.io{path}", data=json.dumps(body).encode(),
                                 headers={"xi-api-key": key, "Content-Type": "application/json"})
    try:
        open(out, "wb").write(urllib.request.urlopen(req, timeout=300).read())
        return out + " ok"
    except urllib.error.HTTPError as e:
        return out + " " + e.read().decode()[:300]

MUSIC = ("Playful, bright, premium tech product commercial. Instrumental only. 112 BPM, major key. "
         "Opens with a lone soft marimba motif for two seconds, then warm plucked synths, light finger snaps, "
         "airy claps and a round bouncy bass join at second 4. Confident, joyful, clean, modern, uncluttered, "
         "leaves room for a voiceover. Gentle lift around second 20, resolves to a tidy final chord with a short ring-out at the end.")

SFX = {
    "key-press": ("Single satisfying press of a large mechanical keyboard key, deep thock, clean, close-up, no room noise", 0.6),
    "key-release": ("Single mechanical keyboard key being released, soft light click, clean, close-up", 0.5),
    "typing": ("Slow hesitant typing on a laptop keyboard, about six keystrokes, quiet, clean, dry", 1.6),
    "pop": ("Soft cute UI pop, rounded bubble pop, app interface, clean, short", 0.5),
    "whoosh": ("Short airy soft whoosh transition, smooth, modern UI motion, clean", 0.8),
    "swoosh-fast": ("Very quick light swish, card sliding across a screen, clean, subtle", 0.5),
    "success": ("Gentle bright two-note success chime, glassy, friendly app notification, clean", 0.9),
    "tick": ("Tiny soft UI tick click, subtle, clean, short", 0.5),
    "sparkle": ("Light magical sparkle shimmer, short, soft and tasteful, clean", 1.0),
    "stamp": ("Soft deep thud of a word landing on screen, punchy low impact, tasteful, clean", 0.6),
}

jobs = [("/v1/music", {"prompt": MUSIC, "music_length_ms": 31000, "model_id": "music_v1", "force_instrumental": True}, "public/audio/music.mp3")]
for name, (text, dur) in SFX.items():
    jobs.append(("/v1/sound-generation", {"text": text, "duration_seconds": dur, "prompt_influence": 0.6}, f"public/audio/sfx-{name}.mp3"))

with ThreadPoolExecutor(6) as ex:
    for r in ex.map(lambda j: post(*j), jobs):
        print(r)
