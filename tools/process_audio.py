#!/usr/bin/env python3
"""녹음 mp3 후처리·점검.
  - 앞뒤 무음 제거 → 앞 0.15초·뒤 0.25초의 같은 무음을 붙임
  - 22.05kHz 모노 64kbps mp3로 변환
  - 문장·단락 파일의 말하기 속도(단어/초, 무음 제외)를 단원 목표와 비교
사용:  python3 process_audio.py <입력 폴더> <출력 폴더> <단원번호> <대본 csv> [--fit]
  --fit : 목표 속도와 ±15% 이상 다르면 속도를 맞춤(0.8~1.25배 범위 안에서만; 범위를 넘으면 다시 녹음하라고 표시)
"""
import sys, os, csv, subprocess, re, tempfile, json

LEAD, TAIL = 0.15, 0.25
THRESH = "-45dB"
def target_rate(unit):  # 단원 구간별 목표 (단어/초)
    return 2.0 if unit <= 20 else 2.5 if unit <= 40 else 3.0 if unit <= 60 else 3.5

def run(cmd): return subprocess.run(cmd, capture_output=True, text=True)
def dur(path):
    return float(run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",path]).stdout.strip())

TRIM = f"silenceremove=start_periods=1:start_threshold={THRESH}:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold={THRESH}:start_silence=0.02,areverse"

def main():
    src, dst, unit, script = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
    fit = "--fit" in sys.argv
    os.makedirs(dst, exist_ok=True)
    rows = {r[0].split("/")[1]: r for r in list(csv.reader(open(script, encoding="utf-8-sig")))[1:] if r[0].startswith(f"u{unit:03d}/")}
    tgt = target_rate(unit); report = []
    for name in sorted(os.listdir(src)):
        if not name.endswith(".mp3"): continue
        if name not in rows: print("대본에 없는 파일:", name); continue
        text = rows[name][2]; words = len(text.split())
        with tempfile.TemporaryDirectory() as td:
            trimmed = os.path.join(td, "t.wav")
            run(["ffmpeg","-y","-v","error","-i",os.path.join(src,name),"-af",TRIM,"-ar","22050","-ac","1",trimmed])
            speech = dur(trimmed)
            kind = rows[name][1]
            rate = words / speech if kind != "단어" and speech > 0 else None
            tempo, status = 1.0, "OK"
            if rate:
                ratio = rate / tgt          # >1 이면 목표보다 빠름
                if abs(ratio - 1) > 0.15:
                    if fit and 0.8 <= 1/ratio <= 1.25: tempo = 1/ratio; status = f"속도 보정 x{tempo:.2f}"
                    else: status = "빠름" if ratio > 1 else "느림"
            af = f"atempo={tempo:.4f}," if tempo != 1.0 else ""
            out = os.path.join(dst, name)
            r = run(["ffmpeg","-y","-v","error","-i",trimmed,"-af",
                     f"{af}afade=t=in:d=0.01,afade=t=out:st={max(speech/tempo-0.02,0):.3f}:d=0.02,adelay={int(LEAD*1000)}:all=1,apad=pad_dur={TAIL}",
                     "-ar","22050","-ac","1","-c:a","libmp3lame","-b:a","64k",out])
            if r.returncode: print("변환 실패", name, r.stderr[:200]); continue
            report.append([name, kind, words, round(speech,2), round(rate,2) if rate else "", tgt if rate else "", status, round(dur(out),2), round(os.path.getsize(out)/1024)])
    with open(os.path.join(dst, f"report_u{unit:03d}.csv"), "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f); w.writerow(["파일","종류","단어수","말한 시간(초)","속도(단어/초)","목표","판정","최종 길이(초)","크기(KB)"]); w.writerows(report)
    flagged = [x for x in report if x[6] != "OK"]
    print(f"U{unit}: {len(report)}개 처리, 목표 {tgt} 단어/초, 점검 필요 {len(flagged)}개")
main()
