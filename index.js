const canvas = document.querySelector('canvas'); 
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// when first loding in get the cookies
setup();

// Game Variables
let player;
let enemies;
let controls = eval('({' + getCookie("controls") + '})');
let abilitys = eval('({' + getCookie("abilitys") + '})');
let currPoints = 0;
let currAblity = 0;
document.querySelector(".abilityDis").innerHTML = `Ability: ${Object.keys(abilitys)[currAblity]} - ${abilitys[Object.keys(abilitys)[currAblity]]}`;
let start = false;
let stoptime = false;



// Classes
class Player{
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.speed = 7;

        // Up Down Left Right
        this.dir = [false, false, false, false];
        this.sprinting = false;
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(){
        // Player movement

        // Going up
        if(this.dir[0] && (this.y - this.speed) > 0){
            this.velocity.y = this.speed;
        }else if(this.velocity.y == this.speed){
            this.velocity.y = 0;
        }
        //Going Down
        if(this.dir[1] && (this.y - this.speed + this.radius*2) < canvas.height){
            this.velocity.y = -this.speed;
        }else if(this.velocity.y == -this.speed){
            this.velocity.y = 0;
        }
        //Going Left
        if(this.dir[2] && (this.x - this.speed) > 0){
            this.velocity.x = this.speed;
        }else if(this.velocity.x == this.speed){
            this.velocity.x = 0;
        }
        //Going Right
        if(this.dir[3] && (this.x - this.speed + this.radius*2) < canvas.width){
            this.velocity.x = -this.speed;
        }else if(this.velocity.x == -this.speed){
            this.velocity.x = 0;
        }
 
 

        this.draw();
        // Check if the player is pressing two buttons at once
        this.x -= (this.dir[0] || this.dir[1]) && (this.dir[2] || this.dir[3]) ? this.velocity.x/1.5 : this.velocity.x;
        this.y -= (this.dir[0] || this.dir[1]) && (this.dir[2] || this.dir[3]) ? this.velocity.y/1.5 :this.velocity.y;
    }
}

class Enemy{
    constructor(x, y, velocity, type, speed){
        this.x = x;
        this.y = y;
        this.radius = (Math.random()*8)+4;
        this.velocity = velocity;
        this.type = type;
        this.speed = speed;
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = "black";
        c.fill();
    }
    update(){
        this.draw();
        this.x -= this.velocity.x;
        this.y -= this.velocity.y;
    }
}

let frame;
function Update(){
    // clear the screen
    frame = requestAnimationFrame(Update);
    c.fillStyle = "rgba(255, 255, 255, 0.65)";
    // if stop time is active start the effect
    if(stoptime){c.fillStyle = "rgba(0, 0, 0, 0.05)"}
    c.fillRect(0, 0, canvas.width, canvas.height);

    document.querySelector(".pointsDis").innerHTML = `Points: ${currPoints}`;
    player.update();

    if(stoptime){ enemies.forEach((enemy) => {
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 0){
            setTimeout(() => {
                cancelAnimationFrame(frame);
                endgame();
            }, 0)
        }

        enemy.color = "white";
        enemy.draw(); 
    }); return; }

    // Update the score
    currPoints ++;

    // Every random few frames spawn a enemy
    if(frame%((Math.floor(Math.random()*20))+30) == 0){
        spawnEnemies();
    }

    enemies.forEach((enemy, index) => {
        // if stop time is not active set the color to normal
        enemy.color = "black";
        // The chance for the enemy to turn towords the player
        if(Math.random() > 0.99){
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)

            enemy.velocity.x = Math.cos(angle)* enemy.speed;
            enemy.velocity.y = Math.sin(angle)* enemy.speed;
        }

        // if enemy goes off screen remove it
        if(enemy.x + enemy.radius < -40 || enemy.x - enemy.radius > canvas.width+40 || enemy.y + enemy.radius < -40 || enemy.y - enemy.radius > canvas.height+40){
            setTimeout(() =>{
                enemies.splice(index, 1)
            }, 0)
        }

        // end the game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 0){
            setTimeout(() => {
                cancelAnimationFrame(frame);
                endgame();
            }, 0)
        }

        enemy.update();
    })
}

function spawnEnemies(){
    // set the spawn pos and get the direction towords the player
    let x, y;
    let radius = Math.round(Math.random()*7)+7;
    if(Math.random() < 0.5){
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
    }else{
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const angle = Math.atan2(player.y - y, player.x - x);
    const velocityX = Math.cos(angle)* -(4 - radius/6),
        velocityY = Math.sin(angle)* -(4 - radius/6);

    enemies.push(new Enemy(x, y, {x:velocityX, y:velocityY}, "normal", -(4 - radius/6)));
}

function useAbility(ability){
    if(ability == "stoptime"){ stoptime = true; setTimeout(() => {stoptime = false;}, 5000)}
}

window.onkeydown = (e) => {
    if(!start){ return; }
    // Up
    if(e.key.toLowerCase() == controls.up){
        player.dir[0] = true;
    }
    // Down
    if(e.key.toLowerCase() == controls.down){
        player.dir[1] = true;
    }
    // Left
    if(e.key.toLowerCase() == controls.left){
        player.dir[2] = true;
    }
    // Right
    if(e.key.toLowerCase() == controls.right){
        player.dir[3] = true;
    }

    // abilitys
    if(e.key.toLowerCase() == controls["cycle ability"]){
        currAblity = Object.keys(abilitys).length-1 == currAblity ? 0 : currAblity + 1;
        document.querySelector(".abilityDis").innerHTML = `Ability: ${Object.keys(abilitys)[currAblity]} - ${abilitys[Object.keys(abilitys)[currAblity]]}`;
    }
    if(e.key.toLowerCase() == controls["use ability"]){
        useAbility(Object.keys(abilitys)[currAblity]);
    }
}

window.onkeyup = (e) => {
    if(!start){ return; }
    // Up
    if(e.key.toLowerCase() == controls.up){
        player.dir[0] = false;
    }
    // Down
    if(e.key.toLowerCase() == controls.down){
        player.dir[1] = false;
    }
    // Left
    if(e.key.toLowerCase() == controls.left){
        player.dir[2] = false;
    }
    // Right
    if(e.key.toLowerCase() == controls.right){
        player.dir[3] = false;
    }
}


function init(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.querySelector(".abilityDis").innerHTML = `Ability: ${Object.keys(abilitys)[currAblity]} - ${abilitys[Object.keys(abilitys)[currAblity]]}`;
    player = new Player(canvas.width/2, canvas.height/2, 10, "red", {x:0, y:0});
    enemies = [];
    currPoints = 0;
    start = true;
    Update();
}

function endgame(){
    document.querySelector(".pointsDis").innerHTML = `Points: ${currPoints}`;
    document.querySelector(".menu").style.left= "calc(50% - 300px)";
    score += currPoints;
    if(highscore < currPoints){
        highscore = currPoints;
        document.querySelector(".menu .score").innerHTML = `Highscore: ${highscore}`;
        document.querySelector(".menu .score").style.animationName = "new-high-score"; 
    }else{
        document.querySelector(".menu .score").style.animationName = ""; 
    }
    document.querySelector(".menu .points").innerHTML = `Points: ${score}`;

    document.cookie = `score= ${score}; expires=Mon, 1 Jan 2026 12:00:00 GMT;`;
    document.cookie = `high=${highscore}; expires=Mon, 1 Jan 2026 12:00:00 GMT;`; 

    start = false;
}

// Menu Variables

let highscore = parseInt(getCookie("high"));
let score = parseInt(getCookie("score"));
const shopOptions = [["stoptime", 800], ["teleport", 1000], ["repel", 600], ["immunity", 800], ["speedx2", 400]];


// Menu Javascript

document.querySelector(".startBtn").onmousedown = (e) => {
    document.querySelector(".menu").style.left= "calc(100% + 600px)";
    init();
}

let controlsText = [];
Object.entries(controls).forEach(([name, val]) => {
    controlsText.push(`<span style="font-size: x-large;">${name.toUpperCase()}: </span>` + `<button class="changeCtrlBtn ${name}" style="height: 40px; min-width: 80px; background-color: #EF4444; border-radius: 999px; color: white;" onclick="changeControl(this)">${val.toUpperCase()}</button>`);
})
document.querySelector(".settingsMenu .controls").innerHTML = controlsText.join("<br>");

function changeControl(el){
    el.onkeydown = (e) => {
        e.target.innerHTML = e.key.toUpperCase();
        controls[e.target.className.substring(14, e.target.className.length).toLowerCase()] = e.key.toLowerCase();
        document.cookie = `controls= ${JSON.stringify(controls).replace("{", "").replace("}", "")}; expires=Mon, 1 Jan 2099 12:00:00 GMT;`;
    }
}

shopOptions.forEach(([name, cost]) => {
    document.querySelector(".shop .shop-options").innerHTML += `<div><span style="font-size: xx-large;">${name}: </span><span style="font-size: x-large;"> $${cost} </span><button style="height: 40px; min-width: 80px; background-color: #EF4444; border-radius: 999px; color: white;" onclick="buy(this);">Buy</button><span style="font-size: xx-large;"> - ${abilitys[name]}</span></div>`;
})

function buy(ability){
    if(parseInt(Object.values(ability.parentNode.children)[1].innerHTML.replace("$", "")) > score){ return; }
    score -= parseInt(Object.values(ability.parentNode.children)[1].innerHTML.replace("$", ""));
    document.cookie = `score= ${score}; expires=Mon, 1 Jan 2026 12:00:00 GMT;`;
    document.querySelector('.shopPointsDis').innerHTML = `Points: ${score}`;
    document.querySelector('.points').innerHTML = `Points: ${score}`;

    abilitys[ability.parentNode.firstChild.innerHTML.replace(":", "").replace(" ", "")] ++;
    ability.parentNode.lastChild.innerHTML =  ` - ${abilitys[ability.parentNode.firstChild.innerHTML.replace(":", "").replace(" ", "")]}`;
    document.cookie = `abilitys= ${JSON.stringify(abilitys).replace("{", "").replace("}", "")}; expires=Mon, 1 Jan 2099 12:00:00 GMT;`;
}

function setup(){
    if(getCookie("controls") == null){ document.cookie = `controls= ${'"up":"w","down":"s","left":"a","right":"d","use ability":"q","cycle ability":"r",'}; expires=Mon, 1 Jan 2099 12:00:00 GMT;`; }
    if(getCookie("score") == null){ document.cookie = `score= 0; expires=Mon, 1 Jan 2026 12:00:00 GMT;`; }
    if(getCookie("high") == null){ document.cookie = `high= 0; expires=Mon, 1 Jan 2026 12:00:00 GMT;`; }
    if(getCookie("abilitys") == null){ document.cookie = `abilitys= ${'stoptime: 0,teleport: 0,repel: 0,immunity: 0,speedx2: 0,'}; expires=Mon, 1 Jan 2026 12:00:00 GMT;`; }

    document.querySelector(".menu .points").innerHTML = `Points: ${getCookie("score")}`;
    document.querySelector(".menu .score").innerHTML = `Highscore: ${getCookie("high")}`;
}

function getCookie(name) {
    var nameEQ = name + "=";
    //alert(document.cookie);
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(nameEQ) != -1) return c.substring(nameEQ.length,c.length);
    }
    return null;
} 