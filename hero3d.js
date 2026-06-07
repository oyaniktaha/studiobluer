/* hero3d.js — Perspective Grid Parallax (v4) */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, scrollY = 0;

  const BG   = '#07070a';
  const LINE = 'rgba(190,240,120,';
  const GLOW = 'rgba(140,200,255,';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    const grd = ctx.createRadialGradient(W*.5,H*.38,0,W*.5,H*.38,W*.55);
    grd.addColorStop(0, GLOW+'0.10)');
    grd.addColorStop(.5, GLOW+'0.04)');
    grd.addColorStop(1, GLOW+'0.00)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

    const parallaxShift = scrollY * 0.12;
    const horizonY = H * 0.42 + parallaxShift;
    const vp = { x: W * 0.5, y: horizonY };
    const VCOLS = 18, HROWS = 14, SPREAD = W * 1.8;

    ctx.save();
    ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip();

    for (let i = -VCOLS; i <= VCOLS; i++) {
      const t = i / VCOLS;
      const xBot = vp.x + t * SPREAD;
      const xHor = vp.x + t * 8;
      const bright = 1 - Math.abs(t) * 0.8;
      ctx.beginPath();
      ctx.moveTo(xHor, horizonY);
      ctx.lineTo(xBot, H + 20);
      ctx.strokeStyle = LINE + (bright * 0.55) + ')';
      ctx.lineWidth   = i === 0 ? 1.5 : 0.7;
      ctx.stroke();
    }

    for (let r = 0; r < HROWS; r++) {
      const p  = Math.pow((r + 1) / HROWS, 1.8);
      const y  = horizonY + p * (H + 20 - horizonY);
      const xL = vp.x - p * SPREAD;
      const xR = vp.x + p * SPREAD;
      ctx.beginPath();
      ctx.moveTo(Math.max(xL,-10), y);
      ctx.lineTo(Math.min(xR,W+10), y);
      ctx.strokeStyle = LINE + (0.12 + p * 0.28) + ')';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    ctx.save();
    ctx.filter = 'blur(6px)';
    ctx.beginPath();
    ctx.moveTo(0, horizonY); ctx.lineTo(W, horizonY);
    ctx.strokeStyle = LINE + '0.35)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();

    ctx.restore();
    drawStars(horizonY, parallaxShift);

    const vig = ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.9);
    vig.addColorStop(0,'rgba(7,7,10,0)');
    vig.addColorStop(1,'rgba(7,7,10,0.72)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);
  }

  const STARS = [];
  function initStars() {
    STARS.length = 0;
    let s = 42;
    function rng(){s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/4294967296;}
    for(let i=0;i<160;i++) STARS.push({x:rng(),y:rng()*.55,r:rng()*1.5+.3,a:rng()*.6+.2,depth:rng()*.5+.5});
  }

  function drawStars(horizonY, shift) {
    for (const s of STARS) {
      const sy = s.y * horizonY + shift * (1 - s.depth) * 0.4;
      if (sy > horizonY) continue;
      ctx.beginPath();
      ctx.arc(s.x * W, sy, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(220,235,255,${s.a})`;
      ctx.fill();
    }
  }

  function loop(){ draw(); requestAnimationFrame(loop); }

  window.addEventListener('scroll',()=>{ scrollY=window.scrollY; },{passive:true});
  window.addEventListener('resize', resize);
  resize(); initStars(); loop();
})();
