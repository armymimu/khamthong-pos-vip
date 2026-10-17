import json, os, subprocess
import whisper

audio_path = r"C:/Users/ooaz1/Downloads/Compressed/คลิป 2 -20260825T164931Z-1-001/คลิป 2/Clip 2 ก่อนจะสร้างนวตกรรม.m4a"
project_path = os.path.expandvars(r"%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft\0831\draft_content.json")

data = json.load(open(project_path, encoding="utf-8"))
a_track = data["tracks"][1]

model = whisper.load_model("base")

timeline_segments = []
for idx, seg in enumerate(a_track["segments"]):
    src_start = seg["source_timerange"]["start"] / 1e6
    src_dur = seg["source_timerange"]["duration"] / 1e6
    tgt_start = seg["target_timerange"]["start"] / 1e6
    tgt_dur = seg["target_timerange"]["duration"] / 1e6
    
    tmp_file = f"seg_{idx}.wav"
    subprocess.run([
        "ffmpeg", "-y", "-ss", str(src_start), "-t", str(src_dur),
        "-i", audio_path, "-ar", "16000", "-ac", "1", tmp_file
    ], capture_output=True)
    
    res = model.transcribe(tmp_file, language="th")
    text = res["text"].strip()
    timeline_segments.append({
        "seg_index": idx,
        "src_range": f"{src_start:.2f}s - {src_start+src_dur:.2f}s",
        "src_start": src_start,
        "src_dur": src_dur,
        "tgt_start": tgt_start,
        "tgt_dur": tgt_dur,
        "text": text
    })
    print(f"Seg {idx:2d} [{src_start:6.2f}s - {src_start+src_dur:6.2f}s]: {text}")
    try:
        os.remove(tmp_file)
    except:
        pass

with open("timeline_transcripts.json", "w", encoding="utf-8") as f:
    json.dump(timeline_segments, f, ensure_ascii=False, indent=2)

print("Done extracting timeline transcripts!")
