/* =====================================================================
   EVENT_TEMPLATES — doldurup EVENTS dizisine taşı.
   '...' yazan yerleri sen yazarsın. effects örnekleri yorum olarak duruyor.
   ===================================================================== */
const EVENT_TEMPLATES = [
  { id:'musteri_1', title:'...', stage:'Kapıda',
    text:'...',
    choices:[
      { label:'...', result:'...', effects:{ /* tip:50, rating:0.2 */ } },
      { label:'...', outcomes:[
        { chance:0.6, result:'...', effects:{ /* tipPct:0.2 */ } },
        { chance:0.4, result:'...', effects:{ /* complaint:true, rating:-0.4 */ } } ] }
    ] },
  { id:'guvenlik_1', title:'...', stage:'Apartmanda',
    text:'...',
    choices:[
      { label:'...', result:'...', effects:{ } },
      { label:'...', result:'...', effects:{ } }
    ] },
  { id:'komsu_1', title:'...', stage:'Apartmanda',
    text:'...',
    choices:[
      { label:'...', result:'...', effects:{ } },
      { label:'...', outcomes:[
        { chance:0.5, result:'...', effects:{ } },
        { chance:0.5, result:'...', effects:{ } } ] }
    ] },
  { id:'cevirme_1', title:'...', stage:'Yolda',
    text:'...',
    choices:[
      { label:'...', result:'...', effects:{ /* money:-250 */ } },
      { label:'...', outcomes:[
        { chance:0.7, result:'...', effects:{ } },
        { chance:0.3, result:'...', effects:{ /* money:-900, feeLost:true */ } } ] }
    ] },
  { id:'restoran_gec_1', title:'...', stage:'Restoranda',
    text:'...',
    choices:[
      { label:'...', result:'...', effects:{ /* rating:-0.2 */ } },
      { label:'...', result:'...', effects:{ /* feeLost:true */ } }
    ] }
];
