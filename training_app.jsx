import { useState } from "react";

// Interval workout variations: each entry maps to weeks that have interval sessions
// Keyed by a rough description of the rep count so they can be swapped in
const INTERVAL_VARIATIONS = {
  "5x1km": [
    { name: "Classic 1km reps", desc: "2km warm-up. 5×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down." },
    { name: "Pyramid", desc: "2km warm-up. 600m – 800m – 1km – 1km – 800m – 600m at 4:00–4:10/km pace, 90 sec recovery between each. 1km cool-down." },
    { name: "Cruise intervals", desc: "2km warm-up. 5×1km at 4:10–4:20/km (tempo-ish effort) with only 60 sec standing recovery. 1km cool-down. Trains lactate clearance." },
  ],
  "6x1km": [
    { name: "Classic 1km reps", desc: "2km warm-up. 6×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down." },
    { name: "2km blocks", desc: "2km warm-up. 3×2km at 4:05–4:15/km with 2 min jog recovery. 1km cool-down. Builds race-pace endurance over longer efforts." },
    { name: "400m repeats", desc: "2km warm-up. 12×400m at 3:50–3:55/km (sharp!) with 60 sec full rest between each. 1km cool-down. Great for leg turnover." },
  ],
  "7x1km": [
    { name: "Classic 1km reps", desc: "2km warm-up. 7×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down." },
    { name: "Ladder up/down", desc: "2km warm-up. 400m – 600m – 800m – 1km – 800m – 600m – 400m at 4:00/km effort, 90 sec recovery each. 1km cool-down. Great variety session." },
    { name: "1-2-1 blocks", desc: "2km warm-up. 1km easy – 2km hard (4:00–4:05/km) – 1km easy, repeat 3 times. No full recovery; the easy km IS the recovery. 1km cool-down." },
  ],
  "8x1km": [
    { name: "Classic 1km reps", desc: "2km warm-up. 8×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down." },
    { name: "Broken tempo", desc: "2km warm-up. 4×2km at 4:10–4:15/km with 90 sec jog recovery. 1km cool-down. Simulates the feel of holding race pace over half marathon distance." },
    { name: "Mile reps", desc: "2km warm-up. 5×1.6km at 4:05–4:10/km with 2 min jog recovery. 1km cool-down. Slightly longer effort than 1km — builds mental toughness." },
  ],
  "4x1km": [
    { name: "Classic 1km reps", desc: "2km warm-up. 4×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down." },
    { name: "Short & sharp 400s", desc: "2km warm-up. 8×400m at 3:50–3:55/km with 75 sec full rest. 1km cool-down. Taper week — keep legs feeling snappy without accumulating fatigue." },
    { name: "Strides + tempo block", desc: "2km warm-up. 6×200m strides at 3:45–3:50/km, 90 sec rest. Then 2km continuous at 4:10/km. 1km cool-down. Race prep sharpener." },
  ],
  "6x1km_taper": [
    { name: "Classic 1km reps", desc: "2km warm-up. 6×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down. Stay sharp." },
    { name: "Race-pace blocks", desc: "2km warm-up. 3×(1km at 4:05/km + 1km at 4:20/km) as alternating hard/float, no rest between pairs, 90 sec after each pair. 1km cool-down." },
    { name: "Descending reps", desc: "2km warm-up. 1.5km – 1.2km – 1km – 800m – 600m – 400m, each 5 sec per km faster than the last, starting at 4:15/km. 90 sec jog recovery. 1km cool-down." },
  ],
};

const RACE_DATE = new Date(2026, 10, 22); // Nov 22 2026
const START_DATE = new Date(2026, 5, 22); // Jun 22 2026

// ── Training data ──────────────────────────────────────────────────────────
const PHASES = [
  { id: 1, name: "Base", weeks: "1–6", color: "#E6F1FB", text: "#0C447C", border: "#378ADD", desc: "Build aerobic base. Keep all runs easy to moderate." },
  { id: 2, name: "Build", weeks: "7–13", color: "#E1F5EE", text: "#085041", border: "#1D9E75", desc: "Introduce race-pace miles. Increase interval intensity." },
  { id: 3, name: "Peak", weeks: "14–19", color: "#FAEEDA", text: "#633806", border: "#BA7517", desc: "Highest mileage. Race-pace efforts in long runs." },
  { id: 4, name: "Taper", weeks: "20–22", color: "#FBEAF0", text: "#72243E", border: "#D4537E", desc: "Reduce mileage. Stay sharp, arrive fresh." },
];

const WORKOUTS = {
  run: { bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
  strength: { bg: "#EAF3DE", text: "#27500A", dot: "#639922" },
  rest: { bg: "#F1EFE8", text: "#5F5E5A", dot: "#B4B2A9" },
  race: { bg: "#FBEAF0", text: "#72243E", dot: "#D4537E" },
};

// week index 0 = week 1
const WEEKS = [
  // Phase 1
  { phase:1, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Warm up 10 min walk/jog. Run at fully conversational pace. Cool down 5 min walk.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Deadlifts 3×8 · Bulgarian split squats 3×10 · Single-leg hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"40–45 min"},
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Steady aerobic run. Focus on form and relaxed breathing. Keep heart rate in Zone 2.",rpe:"RPE 5/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest or gentle 20 min walk. Foam roll quads and calves.",rpe:""},
    {type:"run",label:"Tempo run",dist:"6km",pace:"4:25–4:35/km",detail:"2km easy warm-up, then 4km at tempo effort (comfortably hard). 1km cool-down jog.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Lateral band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"40–45 min"},
    {type:"run",label:"Long run",dist:"12km",pace:"5:10–5:30/km",detail:"Build longest run of the week. Comfortable aerobic effort throughout. Hydrate every 4km.",rpe:"RPE 5–6/10"},
  ]},
  { phase:1, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Recovery effort from long run. Keep it very easy. Focus on relaxed stride.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Deadlifts 3×8 · Bulgarian split squats 3×10 · Single-leg hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"40–45 min"},
    {type:"run",label:"Easy run",dist:"9km",pace:"5:30–6:00/km",detail:"Steady easy run, slightly longer than Monday. Zone 2 heart rate throughout.",rpe:"RPE 5/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest. Sleep well tonight ahead of tempo session.",rpe:""},
    {type:"run",label:"Tempo run",dist:"7km",pace:"4:25–4:35/km",detail:"2km warm-up, 5km tempo effort, no cool-down needed. Push the distance this week.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Lateral band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"40–45 min"},
    {type:"run",label:"Long run",dist:"13km",pace:"5:10–5:30/km",detail:"+1km from last week. Easy aerobic effort. No racing the long run.",rpe:"RPE 5–6/10"},
  ]},
  { phase:1, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Easy start to the week. Let legs recover from Sunday.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Deadlifts 3×8 · Bulgarian split squats 3×10 · Single-leg hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"40–45 min"},
    {type:"run",label:"Intervals",dist:"8km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 5×1km at 4:00–4:10/km with 90 sec recovery jog. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest. Prioritise recovery after intervals.",rpe:""},
    {type:"run",label:"Tempo run",dist:"7km",pace:"4:25–4:35/km",detail:"2km warm-up, 5km sustained tempo effort. Try to hold even splits.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Lateral band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"40–45 min"},
    {type:"run",label:"Long run",dist:"14km",pace:"5:10–5:30/km",detail:"Steady long run. Take a gel at 50 min if going over 75 min.",rpe:"RPE 5–6/10"},
  ]},
  { phase:1, recovery:true, days:[
    {type:"run",label:"Easy run",dist:"6km",pace:"5:30–6:00/km",detail:"Very easy recovery run. No pressure on pace.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Reduce to 2 sets this week. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Another easy recovery run. Zone 1–2 heart rate only.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Complete rest. Body needs this week to consolidate gains.",rpe:""},
    {type:"run",label:"Easy run",dist:"6km",pace:"5:30–6:00/km",detail:"Short and easy. No quality work this week.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest or easy walk. Save legs for Sunday.",rpe:""},
    {type:"run",label:"Long run",dist:"11km",pace:"5:10–5:30/km",detail:"Shorter long run this recovery week. Comfortable throughout.",rpe:"RPE 5/10"},
  ]},
  { phase:1, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Back to normal training. Feel refreshed after recovery week.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Deadlifts 3×8 · Bulgarian split squats 3×10 · Single-leg hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"40–45 min"},
    {type:"run",label:"Intervals",dist:"9km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 6×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest after hard interval session.",rpe:""},
    {type:"run",label:"Tempo run",dist:"8km",pace:"4:25–4:35/km",detail:"2km warm-up, 6km tempo effort. This is the key session of the week.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Lateral band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"40–45 min"},
    {type:"run",label:"Long run",dist:"15km",pace:"5:10–5:30/km",detail:"Longest run so far. Take a gel at 60 min. Finish the last km slightly faster.",rpe:"RPE 5–6/10"},
  ]},
  { phase:1, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"End of base phase. Keep easy effort.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Deadlifts 3×8 · Bulgarian split squats 3×10 · Single-leg hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"40–45 min"},
    {type:"run",label:"Intervals",dist:"9km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 6×1km at 4:00–4:10/km with 90 sec jog recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"8km",pace:"4:25–4:35/km",detail:"2km warm-up, 6km tempo. You should be feeling stronger than week 1.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Lateral band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"40–45 min"},
    {type:"run",label:"Long run",dist:"16km",pace:"5:10–5:30/km",detail:"Last long run of Phase 1. Take a gel at 60 min. Gel again at 90 min if needed.",rpe:"RPE 5–6/10"},
  ]},
  // Phase 2 weeks 7–13
  { phase:2, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Start of build phase. Fresh legs. Easy aerobic effort.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Add plyometrics: box jumps 3×8 before main lifts. Deadlifts 3×8 · Split squats 3×10 · Hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"45 min"},
    {type:"run",label:"Intervals",dist:"10km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 7×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"9km",pace:"4:25–4:35/km",detail:"2km warm-up, 7km at tempo effort. Aim to hold consistent splits throughout.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups weighted 3×10 · Band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"45 min"},
    {type:"run",label:"Long run",dist:"17km",pace:"5:10–5:30/km",detail:"Long run with last 2km at race pace (4:16/km). Take gel at 60 and 90 min.",rpe:"RPE 6/10"},
  ]},
  { phase:2, recovery:true, days:[
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Recovery week begins. Easy pace only.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets only this week. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Easy run. No intervals or tempo this recovery week.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Short easy run to stay moving.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest or walk only.",rpe:""},
    {type:"run",label:"Long run",dist:"13km",pace:"5:10–5:30/km",detail:"Shorter long run for recovery week. Comfortable throughout.",rpe:"RPE 5/10"},
  ]},
  { phase:2, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"9km",pace:"5:30–6:00/km",detail:"Refreshed after recovery week. Back to full training.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Box jumps 3×8. Deadlifts 3×8 · Split squats 3×10 · Hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"45 min"},
    {type:"run",label:"Intervals",dist:"11km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 7×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"10km",pace:"4:25–4:35/km",detail:"2km warm-up, 8km tempo. Longest tempo so far.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"45 min"},
    {type:"run",label:"Long run",dist:"18km",pace:"5:10–5:30/km",detail:"Long run with last 3km at race pace. Gel at 60 and 90 min.",rpe:"RPE 6/10"},
  ]},
  { phase:2, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"9km",pace:"5:30–6:00/km",detail:"Easy effort. Steady state aerobic.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Box jumps 3×8. Deadlifts 3×8 · Split squats 3×10 · Hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"45 min"},
    {type:"run",label:"Intervals",dist:"11km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 7×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"10km",pace:"4:25–4:35/km",detail:"2km warm-up, 8km tempo. Focus on even effort and relaxed form.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"45 min"},
    {type:"run",label:"Long run",dist:"19km",pace:"5:10–5:30/km",detail:"Long run with last 3km at race pace. Gel every 40 min.",rpe:"RPE 6/10"},
  ]},
  { phase:2, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"9km",pace:"5:30–6:00/km",detail:"Easy run. Biggest week coming up.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Box jumps 3×8. Deadlifts 3×8 · Split squats 3×10 · Hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"45 min"},
    {type:"run",label:"Intervals",dist:"12km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 8×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest. Big long run coming on Sunday.",rpe:""},
    {type:"run",label:"Tempo run",dist:"11km",pace:"4:25–4:35/km",detail:"2km warm-up, 9km tempo. You're getting close to half marathon tempo distance!",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"45 min"},
    {type:"run",label:"Long run",dist:"20km",pace:"5:10–5:30/km",detail:"20km! Last 4km at race pace. Gel every 40 min. This is your longest training run.",rpe:"RPE 6/10"},
  ]},
  { phase:2, recovery:true, days:[
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Well-deserved recovery week. Easy only.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets only. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Easy aerobic run.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Easy short run.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest.",rpe:""},
    {type:"run",label:"Long run",dist:"14km",pace:"5:10–5:30/km",detail:"Recovery week long run. Comfortable and easy.",rpe:"RPE 5/10"},
  ]},
  { phase:2, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"10km",pace:"5:30–6:00/km",detail:"Final week of build phase. Double digits on the easy run now.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Box jumps 3×8. Deadlifts 3×8 · Split squats 3×10 · Hip thrusts 3×12 · Calf raises 3×15 · Plank 3×45s",rpe:"45 min"},
    {type:"run",label:"Intervals",dist:"12km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 8×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"11km",pace:"4:25–4:35/km",detail:"2km warm-up, 9km tempo. Strong finish to the build phase.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Step-ups 3×10 · Band walks 3×15 · Single-leg RDL 3×10 · Copenhagen holds 3×20s · Pallof press 3×12",rpe:"45 min"},
    {type:"run",label:"Long run",dist:"21km",pace:"5:10–5:30/km",detail:"Race distance minus 100m! Last 4km at race pace. Gel every 40 min.",rpe:"RPE 6/10"},
  ]},
  // Phase 3 weeks 14–19
  { phase:3, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"10km",pace:"5:30–6:00/km",detail:"Peak phase begins. 10km easy runs are the new normal.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Reduce to 2 sets to absorb running load. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Intervals",dist:"13km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 8×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down. Tough session.",rpe:"RPE 8–9/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest. Peak phase demands serious recovery.",rpe:""},
    {type:"run",label:"Tempo run",dist:"12km",pace:"4:25–4:35/km",detail:"2km warm-up, 10km tempo. 10km at threshold — a huge session.",rpe:"RPE 7–8/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"Reduce to 2 sets. Step-ups · Band walks · Single-leg RDL · Copenhagen holds · Pallof press",rpe:"30 min"},
    {type:"run",label:"Long run",dist:"22km",pace:"5:10–5:30/km",detail:"Peak long run. Last 4km at race pace (4:16/km). Gel every 35–40 min. This is your hardest run.",rpe:"RPE 6–7/10"},
  ]},
  { phase:3, recovery:true, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Much-needed recovery week. Really easy.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets, lighter weight. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"25 min"},
    {type:"run",label:"Easy run",dist:"9km",pace:"5:30–6:00/km",detail:"Easy aerobic run only.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Easy run.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest.",rpe:""},
    {type:"run",label:"Long run",dist:"15km",pace:"5:10–5:30/km",detail:"Recovery week long run. Easy and comfortable.",rpe:"RPE 5/10"},
  ]},
  { phase:3, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"10km",pace:"5:30–6:00/km",detail:"Back to peak training.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Intervals",dist:"13km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 8×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8–9/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"12km",pace:"4:25–4:35/km",detail:"2km warm-up, 10km tempo. You should hold this better than week 14.",rpe:"RPE 7–8/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"2 sets. Step-ups · Band walks · Single-leg RDL · Copenhagen holds · Pallof press",rpe:"30 min"},
    {type:"run",label:"Long run",dist:"22km",pace:"5:10–5:30/km",detail:"Second peak long run. Last 4km at race pace. Gel every 35–40 min.",rpe:"RPE 6–7/10"},
  ]},
  { phase:3, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"10km",pace:"5:30–6:00/km",detail:"Easy run. You're at peak fitness now.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Intervals",dist:"13km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 8×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8–9/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"13km",pace:"4:25–4:35/km",detail:"2km warm-up, 11km tempo. Last big tempo session. Leave it all here.",rpe:"RPE 7–8/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"2 sets. Step-ups · Band walks · Single-leg RDL · Copenhagen holds · Pallof press",rpe:"30 min"},
    {type:"run",label:"Long run",dist:"21km",pace:"5:10–5:30/km",detail:"Final 21km run. Last 4km at race pace. Taper starts next week!",rpe:"RPE 6–7/10"},
  ]},
  { phase:3, recovery:true, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Recovery week. Easy only.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"25 min"},
    {type:"run",label:"Easy run",dist:"9km",pace:"5:30–6:00/km",detail:"Easy run.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Easy run.",rpe:"RPE 4/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest.",rpe:""},
    {type:"run",label:"Long run",dist:"16km",pace:"5:10–5:30/km",detail:"Recovery week long run.",rpe:"RPE 5/10"},
  ]},
  { phase:3, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"10km",pace:"5:30–6:00/km",detail:"Last week of peak phase. Focus and stay healthy.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"2 sets. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Intervals",dist:"12km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 7×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"11km",pace:"4:25–4:35/km",detail:"2km warm-up, 9km tempo. Controlled effort — don't go too hard entering taper.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"2 sets. Step-ups · Band walks · Single-leg RDL · Copenhagen holds · Pallof press",rpe:"30 min"},
    {type:"run",label:"Long run",dist:"19km",pace:"5:10–5:30/km",detail:"Last big long run. Last 3km at race pace. Taper starts next week — enjoy this!",rpe:"RPE 6/10"},
  ]},
  // Phase 4 weeks 20–22
  { phase:4, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"8km",pace:"5:30–6:00/km",detail:"Taper begins! Mileage drops but keep quality. Easy start.",rpe:"RPE 5/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Last full strength session. 2 sets. Deadlifts · Split squats · Hip thrusts · Calf raises · Plank",rpe:"30 min"},
    {type:"run",label:"Intervals",dist:"10km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 6×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down. Stay sharp.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"9km",pace:"4:25–4:35/km",detail:"2km warm-up, 7km tempo. Controlled and confident.",rpe:"RPE 7/10"},
    {type:"strength",label:"Strength B",dist:"",pace:"",detail:"2 sets. Step-ups · Band walks · Single-leg RDL · Copenhagen holds · Pallof press",rpe:"30 min"},
    {type:"run",label:"Long run",dist:"16km",pace:"5:10–5:30/km",detail:"Reduced long run. Last 2km at race pace to stay sharp.",rpe:"RPE 6/10"},
  ]},
  { phase:4, recovery:false, days:[
    {type:"run",label:"Easy run",dist:"7km",pace:"5:30–6:00/km",detail:"Second taper week. Mileage drops further. Feel the freshness coming.",rpe:"RPE 4/10"},
    {type:"strength",label:"Strength A",dist:"",pace:"",detail:"Light session only — 2 sets, reduced weight. No soreness before race week.",rpe:"20 min"},
    {type:"run",label:"Intervals",dist:"8km",pace:"4:00–4:10/km reps",detail:"2km warm-up. 4×1km at 4:00–4:10/km with 90 sec recovery. 1km cool-down.",rpe:"RPE 8/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest.",rpe:""},
    {type:"run",label:"Tempo run",dist:"7km",pace:"4:25–4:35/km",detail:"2km warm-up, 5km tempo. Short but sharp. Last quality session before race.",rpe:"RPE 7/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest. No strength this week. Save everything for Sunday.",rpe:""},
    {type:"run",label:"Long run",dist:"13km",pace:"5:10–5:30/km",detail:"Last long run. Keep it easy. Last 2km at race pace. You're ready.",rpe:"RPE 5/10"},
  ]},
  { phase:4, recovery:false, days:[
    {type:"run",label:"Easy shakeout",dist:"5km",pace:"5:30–6:00/km",detail:"Monday easy shakeout. Very easy. Just keep legs moving. No effort at all.",rpe:"RPE 3/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Full rest. Eat well, sleep well, stay hydrated.",rpe:""},
    {type:"run",label:"Strides",dist:"4km",pace:"Race pace strides",detail:"3km easy jog, then 4×100m strides at race pace. Legs should feel fast and light.",rpe:"RPE 5/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest. Pack your race bag. Sleep early.",rpe:""},
    {type:"run",label:"Easy shakeout",dist:"3km",pace:"5:30–6:00/km",detail:"3km very easy. Just 15–20 minutes. Keep legs loose. Nothing more.",rpe:"RPE 3/10"},
    {type:"rest",label:"Rest",dist:"",pace:"",detail:"Rest. Eat your carbs. Hydrate. Lay out your kit. Sleep well.",rpe:""},
    {type:"race",label:"RACE DAY 🏁",dist:"21.1km",pace:"Goal: 4:16/km",detail:"Start at 4:20–4:22/km for first 3km. Settle into 4:16/km from km 3–18. Lift and push in the final 3km. You've done the work. Run your race!",rpe:"1:30:00 target"},
  ]},
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getDateForWeekDay(weekIdx, dayIdx) {
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + weekIdx * 7 + dayIdx);
  return d;
}

function getDaysToRace(from) {
  const diff = RACE_DATE - from;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function typeIcon(type) {
  if (type === "run") return "🏃";
  if (type === "strength") return "🏋️";
  if (type === "race") return "🏁";
  return "💤";
}

// Map interval detail strings to variation keys
function getIntervalVariationKey(detail) {
  if (detail.includes("5×1km")) return "5x1km";
  if (detail.includes("6×1km") && detail.includes("Stay sharp")) return "6x1km_taper";
  if (detail.includes("6×1km")) return "6x1km";
  if (detail.includes("7×1km")) return "7x1km";
  if (detail.includes("8×1km")) return "8x1km";
  if (detail.includes("4×1km")) return "4x1km";
  return null;
}

function dateKey(date) {
  return date.toISOString().split("T")[0];
}

export default function App() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState("calendar"); // "calendar" | "detail"
  const [completedWorkouts, setCompletedWorkouts] = useState({});
  const [intervalVariantIdx, setIntervalVariantIdx] = useState({}); // dateKey -> variant index

  function toggleComplete(date) {
    const k = dateKey(date);
    setCompletedWorkouts(prev => ({ ...prev, [k]: !prev[k] }));
  }

  function isCompleted(date) {
    return !!completedWorkouts[dateKey(date)];
  }

  function getVariantIdx(date) {
    return intervalVariantIdx[dateKey(date)] || 0;
  }

  function setVariantIdx(date, idx) {
    setIntervalVariantIdx(prev => ({ ...prev, [dateKey(date)]: idx }));
  }

  // Find week/day for a date
  function getWorkoutForDate(date) {
    for (let wi = 0; wi < WEEKS.length; wi++) {
      for (let di = 0; di < 7; di++) {
        const d = getDateForWeekDay(wi, di);
        if (d.toDateString() === date.toDateString()) {
          return { week: wi, day: di, data: WEEKS[wi].days[di], weekObj: WEEKS[wi] };
        }
      }
    }
    return null;
  }

  function getPhase(phaseId) {
    return PHASES.find(p => p.id === phaseId);
  }

  // Build months to display
  const months = [];
  const cur = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), 1);
  const end = new Date(RACE_DATE.getFullYear(), RACE_DATE.getMonth() + 1, 1);
  while (cur < end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  const [visibleMonthIdx, setVisibleMonthIdx] = useState(() => {
    for (let i = 0; i < months.length; i++) {
      if (months[i].getMonth() === today.getMonth() && months[i].getFullYear() === today.getFullYear()) return i;
    }
    return 0;
  });

  function CalendarMonth({ monthDate }) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday-first
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));

    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#888780", fontWeight: 500, padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const workout = getWorkoutForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isRaceDay = date.toDateString() === RACE_DATE.toDateString();
            const isPast = date < today && !isToday;
            const inPlan = !!workout;

            let bg = "transparent";
            let textColor = inPlan ? "#2C2C2A" : "#B4B2A9";
            let borderColor = "transparent";

            if (workout) {
              const wType = workout.data.type;
              bg = WORKOUTS[wType].bg;
              textColor = WORKOUTS[wType].text;
            }
            if (isRaceDay) { bg = "#FBEAF0"; textColor = "#72243E"; }
            if (isSelected) { borderColor = "#378ADD"; }
            if (isToday) { borderColor = "#1D9E75"; }
            if (isPast && inPlan) { bg = bg; textColor = textColor; }

            return (
              <div
                key={i}
                onClick={() => { if (workout) { setSelectedDate(date); setView("detail"); } }}
                style={{
                  background: bg,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: "4px 2px",
                  textAlign: "center",
                  cursor: workout ? "pointer" : "default",
                  opacity: isPast && !inPlan ? 0.4 : 1,
                  minHeight: 38,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: textColor }}>{date.getDate()}</div>
                {workout && (
                  <div style={{ fontSize: 10 }}>{isCompleted(date) ? "✅" : typeIcon(workout.data.type)}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function DetailView() {
    const workout = getWorkoutForDate(selectedDate);
    if (!workout) return null;
    const { week, day, data, weekObj } = workout;
    const phase = getPhase(weekObj.phase);
    const daysLeft = getDaysToRace(selectedDate);
    const wType = data.type;
    const colors = WORKOUTS[wType];

    // Interval variation logic
    const varKey = data.label === "Intervals" ? getIntervalVariationKey(data.detail) : null;
    const variations = varKey ? INTERVAL_VARIATIONS[varKey] : null;
    const varIdx = getVariantIdx(selectedDate);
    const activeVariation = variations ? variations[varIdx] : null;
    const displayDetail = activeVariation ? activeVariation.desc : data.detail;

    const completed = isCompleted(selectedDate);

    return (
      <div style={{ padding: "0 0 80px" }}>
        {/* Back button */}
        <button
          onClick={() => setView("calendar")}
          style={{ background: "none", border: "none", color: "#378ADD", fontSize: 15, cursor: "pointer", padding: "12px 0 8px", display: "flex", alignItems: "center", gap: 4 }}
        >
          ← Back to calendar
        </button>

        {/* Header card */}
        <div style={{ background: colors.bg, borderRadius: 16, padding: "18px 16px 14px", marginBottom: 12, border: `1px solid ${colors.dot}` }}>
          <div style={{ fontSize: 11, color: colors.text, fontWeight: 600, letterSpacing: 1, marginBottom: 4, opacity: 0.7 }}>
            WEEK {week + 1} · {DAY_NAMES[day].toUpperCase()} · {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.text, marginBottom: 6 }}>
            {typeIcon(data.type)} {data.label}
          </div>
          {data.dist && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {data.dist && <span style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "3px 10px", fontSize: 13, color: colors.text, fontWeight: 500 }}>{data.dist}</span>}
              {data.pace && <span style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "3px 10px", fontSize: 13, color: colors.text }}>{data.pace}</span>}
              {data.rpe && <span style={{ background: "rgba(255,255,255,0.6)", borderRadius: 8, padding: "3px 10px", fontSize: 13, color: colors.text }}>{data.rpe}</span>}
            </div>
          )}
        </div>

        {/* Interval variation picker */}
        {variations && (
          <div style={{ background: "#fff", border: "0.5px solid #E0DFD8", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#888780", fontWeight: 600, marginBottom: 10 }}>WORKOUT VARIATION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {variations.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVariantIdx(selectedDate, i)}
                  style={{
                    background: varIdx === i ? colors.bg : "#F9F9F7",
                    border: `1.5px solid ${varIdx === i ? colors.dot : "#E0DFD8"}`,
                    borderRadius: 10,
                    padding: "9px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14, color: varIdx === i ? colors.dot : "#B4B2A9", fontWeight: 700 }}>
                    {varIdx === i ? "●" : "○"}
                  </span>
                  <span style={{ fontSize: 13, color: varIdx === i ? colors.text : "#5F5E5A", fontWeight: varIdx === i ? 600 : 400 }}>
                    {v.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detail */}
        <div style={{ background: "#fff", border: "0.5px solid #E0DFD8", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "#888780", fontWeight: 600, marginBottom: 6 }}>WORKOUT DETAIL</div>
          <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.6 }}>{displayDetail}</div>
        </div>

        {/* Phase info */}
        <div style={{ background: phase.color, border: `0.5px solid ${phase.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: phase.text, fontWeight: 600, marginBottom: 2 }}>
            PHASE {phase.id} — {phase.name.toUpperCase()} (weeks {phase.weeks})
          </div>
          <div style={{ fontSize: 13, color: phase.text }}>{phase.desc}</div>
          {weekObj.recovery && (
            <div style={{ marginTop: 8, background: "#FAEEDA", borderRadius: 8, padding: "4px 10px", display: "inline-block", fontSize: 12, color: "#633806", fontWeight: 600 }}>
              ⚡ Recovery week — keep it easy
            </div>
          )}
        </div>

        {/* Completion checkbox */}
        <button
          onClick={() => toggleComplete(selectedDate)}
          style={{
            width: "100%",
            background: completed ? "#E1F5EE" : "#fff",
            border: `1.5px solid ${completed ? "#1D9E75" : "#E0DFD8"}`,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            border: `2px solid ${completed ? "#1D9E75" : "#C0BEB7"}`,
            background: completed ? "#1D9E75" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}>
            {completed && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>}
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: completed ? "#085041" : "#5F5E5A" }}>
            {completed ? "Workout complete 🎉" : "Mark workout as complete"}
          </span>
        </button>

        {/* Days to race */}
        {daysLeft > 0 && (
          <div style={{ background: "#F1EFE8", borderRadius: 14, padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "#5F5E5A" }}>Days to race day</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>{daysLeft}</span>
          </div>
        )}

        {/* Week overview */}
        <div style={{ background: "#fff", border: "0.5px solid #E0DFD8", borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: "#888780", fontWeight: 600, marginBottom: 10 }}>THIS WEEK</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {weekObj.days.map((d, di) => {
              const isThis = di === day;
              const dc = WORKOUTS[d.type];
              const dayDate = getDateForWeekDay(week, di);
              const dayDone = isCompleted(dayDate);
              return (
                <div key={di} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 10, background: isThis ? dc.bg : "transparent", border: isThis ? `1px solid ${dc.dot}` : "none" }}>
                  <span style={{ width: 30, fontSize: 11, color: "#888780", fontWeight: 500 }}>{DAY_NAMES[di]}</span>
                  <span style={{ fontSize: 13 }}>{dayDone ? "✅" : typeIcon(d.type)}</span>
                  <span style={{ fontSize: 13, color: dayDone ? "#1D9E75" : dc.text, fontWeight: isThis ? 600 : 400, textDecoration: dayDone ? "line-through" : "none", opacity: dayDone ? 0.7 : 1 }}>{d.label}</span>
                  {d.dist && <span style={{ marginLeft: "auto", fontSize: 12, color: "#888780" }}>{d.dist}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysToRace(today);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#FAFAF8", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: "#0C447C", padding: "18px 16px 14px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 11, color: "#B5D4F4", fontWeight: 600, letterSpacing: 1 }}>HALF MARATHON PLAN</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2 }}>
          <div style={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>
            {view === "detail" && selectedDate
              ? `${DAY_NAMES[(selectedDate.getDay() + 6) % 7]}, ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`
              : "Training Calendar"}
          </div>
          {daysLeft > 0 && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, color: "#fff", fontWeight: 700, lineHeight: 1 }}>{daysLeft}</div>
              <div style={{ fontSize: 10, color: "#B5D4F4" }}>days to race</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 12px" }}>
        {view === "detail" && selectedDate ? (
          <DetailView />
        ) : (
          <div style={{ paddingBottom: 80 }}>
            {/* Legend */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "12px 4px 8px", borderBottom: "0.5px solid #E0DFD8", marginBottom: 12 }}>
              {[["run","🏃","Run"],["strength","🏋️","Strength"],["rest","💤","Rest"],["race","🏁","Race"]].map(([t,ic,lb]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5F5E5A" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: WORKOUTS[t].bg, border: `1px solid ${WORKOUTS[t].dot}` }} />
                  {lb}
                </div>
              ))}
            </div>

            {/* Month navigation */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 4px" }}>
              <button onClick={() => setVisibleMonthIdx(Math.max(0, visibleMonthIdx - 1))} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: visibleMonthIdx === 0 ? "#ccc" : "#0C447C", padding: "4px 8px" }}>‹</button>
              <div style={{ fontWeight: 600, fontSize: 16, color: "#2C2C2A" }}>
                {MONTH_NAMES[months[visibleMonthIdx].getMonth()]} {months[visibleMonthIdx].getFullYear()}
              </div>
              <button onClick={() => setVisibleMonthIdx(Math.min(months.length - 1, visibleMonthIdx + 1))} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: visibleMonthIdx === months.length - 1 ? "#ccc" : "#0C447C", padding: "4px 8px" }}>›</button>
            </div>

            <CalendarMonth monthDate={months[visibleMonthIdx]} />

            {/* Phase overview */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A", marginBottom: 10, padding: "0 4px" }}>PHASES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {PHASES.map(p => (
                  <div key={p.id} style={{ background: p.color, border: `0.5px solid ${p.border}`, borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: p.text }}>Phase {p.id} — {p.name}</div>
                      <div style={{ fontSize: 12, color: p.text, opacity: 0.8 }}>Wks {p.weeks}</div>
                    </div>
                    <div style={{ fontSize: 12, color: p.text, marginTop: 2, opacity: 0.85 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
