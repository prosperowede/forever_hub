const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");

function resize(){

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize",resize);

const stars=[];

const STAR_COUNT=180;

for(let i=0;i<STAR_COUNT;i++){

stars.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

r:Math.random()*2,

speed:0.15+Math.random()*0.5,

opacity:0.2+Math.random()*0.8,

twinkle:Math.random()*0.02

});

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

stars.forEach(star=>{

star.y-=star.speed;

star.opacity+=star.twinkle;

if(star.opacity>=1 || star.opacity<=0.2){

star.twinkle*=-1;

}

if(star.y<0){

star.y=canvas.height;

star.x=Math.random()*canvas.width;

}

ctx.beginPath();

ctx.arc(star.x,star.y,star.r,0,Math.PI*2);

ctx.fillStyle=`rgba(255,255,255,${star.opacity})`;

ctx.fill();

});

requestAnimationFrame(draw);

}

draw();