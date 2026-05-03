/* DammiGYM — Exercise Database */
window.DG = window.DG || {};

DG.Exercises = (() => {
  // Priority: must, have, can, skip
  const DEFAULT_EXERCISES = [
    // === Day 1 & 4: Chest + Triceps ===
    // Day 1 (Sunday)
    {id:'ex001',name:'Barbell Bench Press',group:'Chest',split:'Chest + Triceps',day:1,priority:'must',met:6.0,youtubeUrl:'https://www.youtube.com/shorts/5NStATS0zrw',instructions:'Lie flat on bench. Grip bar slightly wider than shoulder width. Lower to mid-chest, press up explosively.'},
    {id:'ex002',name:'Incline Dumbbell Press',group:'Chest',split:'Chest + Triceps',day:1,priority:'must',met:5.0,youtubeUrl:'',instructions:'Set bench to 30-45°. Press dumbbells up from shoulder level. Focus on upper chest contraction.'},
    {id:'ex003',name:'Cable Flyes',group:'Chest',split:'Chest + Triceps',day:1,priority:'have',met:4.0,youtubeUrl:'',instructions:'Stand between cable stations. Bring handles together in an arc motion. Squeeze chest at peak.'},
    {id:'ex004',name:'Chest Dips',group:'Chest',split:'Chest + Triceps',day:1,priority:'have',met:6.0,youtubeUrl:'',instructions:'Lean forward on dip bars. Lower until upper arms are parallel to floor. Press up.'},
    {id:'ex005',name:'Tricep Pushdowns',group:'Triceps',split:'Chest + Triceps',day:1,priority:'must',met:3.5,youtubeUrl:'',instructions:'Cable machine with rope or bar. Keep elbows pinned to sides. Push down until arms fully extended.'},
    {id:'ex006',name:'Overhead Tricep Extension',group:'Triceps',split:'Chest + Triceps',day:1,priority:'have',met:3.5,youtubeUrl:'',instructions:'Hold dumbbell or cable overhead. Lower behind head by bending elbows. Extend arms fully.'},
    {id:'ex007',name:'Skull Crushers',group:'Triceps',split:'Chest + Triceps',day:1,priority:'can',met:3.5,youtubeUrl:'',instructions:'Lie flat with EZ bar. Lower bar to forehead by bending elbows. Extend arms straight up.'},

    // Day 4 (Wednesday) — Chest + Triceps Variation
    {id:'ex008',name:'Dumbbell Bench Press',group:'Chest',split:'Chest + Triceps',day:4,priority:'must',met:5.5,youtubeUrl:'',instructions:'Lie flat. Press dumbbells up from chest level with full range of motion.'},
    {id:'ex009',name:'Incline Barbell Press',group:'Chest',split:'Chest + Triceps',day:4,priority:'must',met:6.0,youtubeUrl:'',instructions:'Incline bench 30-45°. Press barbell up from upper chest. Control the negative.'},
    {id:'ex010',name:'Pec Deck Machine',group:'Chest',split:'Chest + Triceps',day:4,priority:'have',met:3.5,youtubeUrl:'',instructions:'Sit with arms at 90°. Bring pads together in front. Squeeze and control return.'},
    {id:'ex011',name:'Push-ups',group:'Chest',split:'Chest + Triceps',day:4,priority:'can',met:3.8,youtubeUrl:'',instructions:'Body straight, hands shoulder width. Lower chest to floor. Push up. Keep core tight.'},
    {id:'ex012',name:'Close-Grip Bench Press',group:'Triceps',split:'Chest + Triceps',day:4,priority:'must',met:5.0,youtubeUrl:'',instructions:'Narrow grip on barbell (shoulder width). Press from mid-chest. Focus on tricep contraction.'},
    {id:'ex013',name:'Tricep Rope Pushdowns',group:'Triceps',split:'Chest + Triceps',day:4,priority:'have',met:3.5,youtubeUrl:'',instructions:'Cable with rope attachment. Push down and spread rope at bottom. Squeeze triceps.'},
    {id:'ex014',name:'Diamond Push-ups',group:'Triceps',split:'Chest + Triceps',day:4,priority:'can',met:3.8,youtubeUrl:'',instructions:'Hands close together forming diamond shape. Lower chest to hands. Press up.'},

    // === Day 2 & 5: Back + Biceps ===
    // Day 2 (Monday)
    {id:'ex015',name:'Deadlift',group:'Back',split:'Back + Biceps',day:2,priority:'must',met:6.0,youtubeUrl:'',instructions:'Stand over barbell, hip-width stance. Hinge at hips, grip bar. Drive through heels, lockout at top.'},
    {id:'ex016',name:'Lat Pulldowns',group:'Back',split:'Back + Biceps',day:2,priority:'must',met:5.0,youtubeUrl:'',instructions:'Wide grip on bar. Pull to upper chest while leaning slightly back. Squeeze lats.'},
    {id:'ex017',name:'Barbell Bent-Over Rows',group:'Back',split:'Back + Biceps',day:2,priority:'must',met:6.0,youtubeUrl:'',instructions:'Hinge at hips 45°. Pull barbell to lower chest/upper abs. Squeeze shoulder blades.'},
    {id:'ex018',name:'Seated Cable Rows',group:'Back',split:'Back + Biceps',day:2,priority:'have',met:4.5,youtubeUrl:'',instructions:'Sit upright. Pull handle to lower chest. Squeeze back muscles. Control return.'},
    {id:'ex019',name:'Face Pulls',group:'Back',split:'Back + Biceps',day:2,priority:'have',met:3.0,youtubeUrl:'',instructions:'Cable at face height. Pull rope to face with elbows high. External rotate at end.'},
    {id:'ex020',name:'Barbell Bicep Curls',group:'Biceps',split:'Back + Biceps',day:2,priority:'must',met:3.5,youtubeUrl:'',instructions:'Stand with barbell, shoulder-width grip. Curl up keeping elbows stationary. Lower controlled.'},
    {id:'ex021',name:'Hammer Curls',group:'Biceps',split:'Back + Biceps',day:2,priority:'can',met:3.0,youtubeUrl:'',instructions:'Hold dumbbells with neutral grip (palms facing in). Curl up alternating arms.'},

    // Day 5 (Thursday) — Back + Biceps Variation
    {id:'ex022',name:'Pull-ups',group:'Back',split:'Back + Biceps',day:5,priority:'must',met:8.0,youtubeUrl:'',instructions:'Hang from bar, overhand grip. Pull up until chin clears bar. Lower with control.'},
    {id:'ex023',name:'T-Bar Rows',group:'Back',split:'Back + Biceps',day:5,priority:'must',met:6.0,youtubeUrl:'',instructions:'Straddle T-bar. Pull weight to chest. Keep back flat. Squeeze at top.'},
    {id:'ex024',name:'Single-Arm Dumbbell Rows',group:'Back',split:'Back + Biceps',day:5,priority:'have',met:5.0,youtubeUrl:'',instructions:'One knee on bench. Pull dumbbell to hip. Keep back flat. Squeeze lat.'},
    {id:'ex025',name:'Straight-Arm Pulldowns',group:'Back',split:'Back + Biceps',day:5,priority:'have',met:3.5,youtubeUrl:'',instructions:'Cable with straight bar. Arms extended, pull bar down to thighs. Squeeze lats.'},
    {id:'ex026',name:'Hyperextensions',group:'Back',split:'Back + Biceps',day:5,priority:'can',met:3.0,youtubeUrl:'',instructions:'Face down on hyperextension bench. Lower torso. Raise back to neutral. Hold at top.'},
    {id:'ex027',name:'Preacher Curls',group:'Biceps',split:'Back + Biceps',day:5,priority:'must',met:3.5,youtubeUrl:'',instructions:'Arms on preacher bench pad. Curl EZ bar up. Focus on the stretch at bottom.'},
    {id:'ex028',name:'Concentration Curls',group:'Biceps',split:'Back + Biceps',day:5,priority:'can',met:3.0,youtubeUrl:'',instructions:'Seated, elbow on inner thigh. Curl dumbbell up slowly. Squeeze at top.'},

    // === Day 3: Shoulders + Abs ===
    {id:'ex029',name:'Overhead Press',group:'Shoulders',split:'Shoulders + Abs',day:3,priority:'must',met:5.0,youtubeUrl:'',instructions:'Standing or seated. Press barbell/dumbbells overhead. Lock out at top. Lower to chin level.'},
    {id:'ex030',name:'Lateral Raises',group:'Shoulders',split:'Shoulders + Abs',day:3,priority:'must',met:3.5,youtubeUrl:'',instructions:'Stand with dumbbells at sides. Raise arms to shoulder height, slight bend in elbows.'},
    {id:'ex031',name:'Front Raises',group:'Shoulders',split:'Shoulders + Abs',day:3,priority:'have',met:3.0,youtubeUrl:'',instructions:'Hold dumbbells in front. Raise one arm at a time to shoulder height. Control descent.'},
    {id:'ex032',name:'Rear Delt Flyes',group:'Shoulders',split:'Shoulders + Abs',day:3,priority:'have',met:3.0,youtubeUrl:'',instructions:'Bent forward at hips. Raise dumbbells out to sides. Squeeze rear delts.'},
    {id:'ex033',name:'Barbell Shrugs',group:'Shoulders',split:'Shoulders + Abs',day:3,priority:'can',met:4.0,youtubeUrl:'',instructions:'Hold heavy barbell. Shrug shoulders up toward ears. Hold at top 1 second.'},
    {id:'ex034',name:'Hanging Leg Raises',group:'Abs',split:'Shoulders + Abs',day:3,priority:'must',met:4.0,youtubeUrl:'',instructions:'Hang from bar. Raise legs to 90°. Control the lowering. Avoid swinging.'},
    {id:'ex035',name:'Cable Crunches',group:'Abs',split:'Shoulders + Abs',day:3,priority:'have',met:3.5,youtubeUrl:'',instructions:'Kneel at cable machine. Hold rope behind head. Crunch down, squeezing abs.'},
    {id:'ex036',name:'Plank Hold',group:'Abs',split:'Shoulders + Abs',day:3,priority:'can',met:3.8,youtubeUrl:'',instructions:'Forearms and toes on floor. Keep body straight. Hold for 30-60 seconds. Breathe steadily.'},

    // === Day 6: Legs ===
    {id:'ex037',name:'Barbell Squats',group:'Legs',split:'Legs',day:6,priority:'must',met:6.0,youtubeUrl:'',instructions:'Bar on upper back. Feet shoulder width. Squat to parallel or below. Drive up through heels.'},
    {id:'ex038',name:'Leg Press',group:'Legs',split:'Legs',day:6,priority:'must',met:5.0,youtubeUrl:'',instructions:'Feet shoulder width on platform. Lower weight until knees at 90°. Press up. Dont lock knees.'},
    {id:'ex039',name:'Romanian Deadlifts',group:'Legs',split:'Legs',day:6,priority:'must',met:6.0,youtubeUrl:'',instructions:'Hold barbell, slight knee bend. Hinge at hips, lower bar along legs. Feel hamstring stretch.'},
    {id:'ex040',name:'Leg Curls',group:'Legs',split:'Legs',day:6,priority:'have',met:4.0,youtubeUrl:'',instructions:'Lie face down on machine. Curl weight up by bending knees. Squeeze hamstrings.'},
    {id:'ex041',name:'Leg Extensions',group:'Legs',split:'Legs',day:6,priority:'have',met:3.5,youtubeUrl:'',instructions:'Seated on machine. Extend legs until straight. Squeeze quads at top. Lower slowly.'},
    {id:'ex042',name:'Standing Calf Raises',group:'Legs',split:'Legs',day:6,priority:'must',met:3.0,youtubeUrl:'',instructions:'Stand on calf machine. Rise up on toes. Hold at top. Lower heels below platform.'},
    {id:'ex043',name:'Walking Lunges',group:'Legs',split:'Legs',day:6,priority:'can',met:5.0,youtubeUrl:'',instructions:'Step forward into lunge. Back knee almost touches floor. Alternate legs walking forward.'},
    {id:'ex044',name:'Hip Thrusts',group:'Legs',split:'Legs',day:6,priority:'can',met:5.0,youtubeUrl:'',instructions:'Upper back on bench, barbell over hips. Drive hips up. Squeeze glutes at top.'},

    // Cardio option
    {id:'ex045',name:'Treadmill Running',group:'Cardio',split:'any',day:0,priority:'can',met:9.8,youtubeUrl:'',isCardio:true,instructions:'Set desired speed and incline. Maintain good posture. Start slow and build up.'},
    {id:'ex046',name:'Treadmill Walking',group:'Cardio',split:'any',day:0,priority:'can',met:3.5,youtubeUrl:'',isCardio:true,instructions:'Set speed to brisk walk (5-6 km/h). Optional incline for intensity. Good for warm-up/cool-down.'}
  ];

  // Get exercises from storage or use defaults
  function getAll() {
    try {
      const stored = localStorage.getItem('dg_exercises');
      if (stored) {
        const decrypted = DG.Crypto.decrypt(stored);
        if (decrypted) return JSON.parse(decrypted);
      }
    } catch(e) {}
    return JSON.parse(JSON.stringify(DEFAULT_EXERCISES));
  }

  // Save exercises (admin function)
  function saveAll(exercises) {
    const encrypted = DG.Crypto.encrypt(JSON.stringify(exercises));
    localStorage.setItem('dg_exercises', encrypted);
  }

  // Get exercises for a specific day (1-6, 0=any/cardio)
  function getByDay(dayNum) {
    return getAll().filter(ex => ex.day === dayNum);
  }

  // Get exercises for today's split
  function getForToday() {
    const dayOfWeek = DG.Utils.getDayOfWeek(); // 0=Sun
    if (dayOfWeek === 6) return []; // Saturday rest
    // Map: Sun=0->day1, Mon=1->day2, ... Fri=5->day6
    const dayNum = dayOfWeek + 1;
    // Sat wraps but we already returned
    return getAll().filter(ex => ex.day === dayNum || ex.day === 0);
  }

  // Add or update exercise
  function save(exercise) {
    const all = getAll();
    const idx = all.findIndex(e => e.id === exercise.id);
    if (idx >= 0) all[idx] = exercise;
    else all.push(exercise);
    saveAll(all);
  }

  // Delete exercise
  function remove(id) {
    const all = getAll().filter(e => e.id !== id);
    saveAll(all);
  }

  // Swap all exercises between two days
  function swapDays(dayA, dayB) {
    dayA = parseInt(dayA);
    dayB = parseInt(dayB);
    if (isNaN(dayA) || isNaN(dayB) || dayA === dayB) return;
    
    const all = getAll();
    all.forEach(ex => {
      if (ex.day === dayA) ex.day = dayB;
      else if (ex.day === dayB) ex.day = dayA;
    });
    saveAll(all);
  }

  // Priority badge HTML
  function priorityBadge(priority) {
    const map = {
      must: { cls: 'badge-must', icon: '🔴', label: 'Must Do' },
      have: { cls: 'badge-have', icon: '🟠', label: 'Have To' },
      can: { cls: 'badge-can', icon: '🟢', label: 'Can Do' },
      skip: { cls: 'badge-skip', icon: '🔵', label: 'Can Skip' }
    };
    const p = map[priority] || map.can;
    return `<span class="badge ${p.cls}">${p.icon} ${p.label}</span>`;
  }

  return { getAll, saveAll, getByDay, getForToday, save, remove, swapDays, priorityBadge, DEFAULT_EXERCISES };
})();
