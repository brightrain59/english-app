#!/usr/bin/env node
// 이용권 코드 만들기.  결과: private/codes-<시각>.csv(배포용 목록) + private/codes-<시각>.sql(Supabase에 붙여 넣기)
//
//  레벨 이용권(1년·3대):   node tools/make-codes.mjs --kind level --level 1 --count 50 --label 스마트스토어
//  전체(Level 1~4):        node tools/make-codes.mjs --kind all --count 10 --label 전체권
//  학원용(학생 30명):      node tools/make-codes.mjs --kind level --level 2 --count 1 --devices 30 --label "OO학원 중2"
//  단원 이용권(30일·3대):  node tools/make-codes.mjs --kind unit --units 3,5 --count 20 --label 단원권
//
//  옵션: --days(기본: 레벨·전체 365, 단원 30)  --devices(기본 3)  --label(메모)
import { randomInt } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";

const arg = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith("--") ? [...a, [v.slice(2), all[i + 1]]] : a), []));
const kind = arg.kind;
if (!["level", "all", "unit"].includes(kind)) { console.error("--kind 은 level | all | unit 중 하나"); process.exit(1); }
const nums = (s) => String(s ?? "").split(",").map(Number).filter(Boolean);
const levels = kind === "level" ? nums(arg.level ?? arg.levels) : [];
const units = kind === "unit" ? nums(arg.units) : [];
if (kind === "level" && !levels.every((l) => l >= 1 && l <= 4) || kind === "level" && !levels.length) { console.error("--level 은 1~4"); process.exit(1); }
if (kind === "unit" && (!units.length || !units.every((u) => u >= 1 && u <= 80))) { console.error("--units 는 1~80 (쉼표로 구분)"); process.exit(1); }
const count = Number(arg.count ?? 1), devices = Number(arg.devices ?? 3);
const days = Number(arg.days ?? (kind === "unit" ? 30 : 365));
const label = arg.label ?? "";

const ALPHA = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // 헷갈리는 I L O U 제외
const make = () => Array.from({ length: 12 }, () => ALPHA[randomInt(32)]).join("");
const codes = new Set(); while (codes.size < count) codes.add(make());

const pg = (a) => `'{${a.join(",")}}'`;
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const target = kind === "all" ? "Level 1~4 전체" : kind === "level" ? `Level ${levels.join(",")}` : `Unit ${units.join(",")}`;
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
mkdirSync("private", { recursive: true });

const csv = ["﻿코드,종류,대상,기간(일),기기 수,메모", ...[...codes].map((c) => `${c.replace(/(.{4})(.{4})(.{4})/, "$1-$2-$3")},${kind},${target},${days},${devices},${label}`)].join("\n");
const sql = `insert into access_codes (code, kind, levels, units, duration_days, max_devices, label) values\n` +
  [...codes].map((c) => `  (${q(c)}, ${q(kind)}, ${pg(levels)}, ${pg(units)}, ${days}, ${devices}, ${q(label)})`).join(",\n") + ";\n";
writeFileSync(`private/codes-${stamp}.csv`, csv);
writeFileSync(`private/codes-${stamp}.sql`, sql);
console.log(`${count}개 생성: ${target}, ${days}일, 기기 ${devices}대 → private/codes-${stamp}.csv / .sql`);
console.log("※ private/ 폴더는 GitHub에 올라가지 않습니다. 목록(csv)은 안전한 곳에 보관하세요.");
