# VO loudness per video frame (60 fps), 0..1, for the HUD waveform: python3 scripts/env.py
import array, json, math, subprocess
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "public/audio/vo-jessica.mp3", "-ac", "1", "-ar", "48000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
a = array.array("h", pcm)
n = 800  # 48000 / 60
rms = [math.sqrt(sum(x * x for x in a[i:i + n]) / n) for i in range(0, len(a) - n, n)]
peak = sorted(rms)[int(len(rms) * 0.97)]
json.dump([round(min(1, r / peak), 3) for r in rms], open("public/audio/vo-env.json", "w"))
print(len(rms), "frames")
