const canvas = document.querySelector('canvas'); 
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// when first loding in get the cookies
setup();

// Game Variables
let player;
let enemies;
let particals;
let boss;
let controls = eval('({' + getCookie("controls") + '})');
let abilitys = eval('({' + getCookie("abilitys") + '})');
let currPoints = 0;
let currAblity = 0;
document.querySelector(".abilityDis").innerHTML = `Ability: ${Object.keys(abilitys)[currAblity]} - ${abilitys[Object.keys(abilitys)[currAblity]]}`;
let start = false;
let teleport = false;
let stoptime = false;
let repel = false;
let immunity = false;
// so if it is another ability is active you can use it 
let speedx2 = false;



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
        if(immunity){
            c.beginPath();
            c.arc(this.x, this.y, this.radius+3, 0, Math.PI*2, false);
            c.fillStyle = "cyan";
            c.fill();
        }
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

        // check if the player is colliding with the boss
        if(boss.active){
            if(checkCollision(this.x, this.y, this.radius, boss.x, boss.y, boss.radius)){ 
                if(boss.vulnerable){ boss.health --; boss.color = "red"; boss.vulnerable = false; setTimeout(() => {boss.color = "black";}, 600); }
                this.velocity.y = -Math.abs(this.velocity.y)* 2;
            }
            if(checkCollision(this.x, this.y, this.radius, boss.x, boss.y, boss.radius)){
                if(boss.vulnerable){ boss.health --; boss.color = "red"; boss.vulnerable = false; setTimeout(() => {boss.color = "black";}, 600); }
                if(this.x > boss.x-(this.radius/2)){
                     this.velocity.x = -Math.abs(this.velocity.x)* 2;
                }else if(this.x <= boss.x-(this.radius/2)){ 
                    this.velocity.x = Math.abs(this.velocity.x)* 2; 
                }
            }
        }

        if(this.x - this.velocity.x - this.radius/2 < 0 || this.x - this.velocity.x + this.radius/2 > canvas.width){
            this.velocity.x = 0;
        }
        if(this.y - this.velocity.y - this.radius/2 < 0 || this.y - this.velocity.y + this.radius/2 > canvas.height){
            this.velocity.y = 0
        }

        // Check if the player is pressing two buttons at once
        this.x -= (this.dir[0] || this.dir[1]) && (this.dir[2] || this.dir[3]) ? this.velocity.x/1.5 : this.velocity.x;
        this.y -= (this.dir[0] || this.dir[1]) && (this.dir[2] || this.dir[3]) ? this.velocity.y/1.5 :this.velocity.y;
    }
}

class Enemy{
    constructor(x, y, velocity, type, speed, radius){
        this.x = x;
        this.y = y;
        this.color = "black";
        this.radius = radius;
        this.velocity = velocity;
        this.type = type;
        this.speed = speed;
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update(){
        this.draw();
        this.x -= this.velocity.x;
        this.y -= this.velocity.y;
    }
}

class Boss{
    constructor(){
        this.radius = 500;
        this.x = canvas.width/2;
        this.y = 0-this.radius/1.5;
        this.color = "black";
        this.health = 5;
        this.active = false;
        this.vulnerable = false;
    }
    draw(){
        this.active = true;
        if(this.health <= 0){ this.active = false; return; }
        // boss
        if(!this.vulnerable){
            c.beginPath();
            c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
            c.fillStyle = "cyan";
            c.fill();
        }
        c.beginPath();
        c.arc(this.x, this.y, this.radius-15, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    spawn(){
        c.fillStyle = "red"
        c.font = "48px serif";
        c.fillText("Boss Incoming!!!", canvas.width/2-148, canvas.height/2-148);
    }
    startBattle(){
        enemies = [];
        player.x = canvas.width/2;
        player.y = canvas.height/2;



    }
}

const friction = 0.98
class Partical{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    
    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    
    explode(){
        for(let i =0; i < Math.floor(Math.random()*25)+25; i++){
            particals.push(new Partical(player.x, player.y, Math.random()*2, "red", {x: (Math.random()-0.5)*(Math.random()*5), y: (Math.random()-0.5)*(Math.random()*5)}))
        }
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
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
        if(dist - enemy.radius - player.radius < 0 && !immunity){
            setTimeout(() => {
                cancelAnimationFrame(frame);
                endgame();
            }, 0)
        }

        enemy.color = "white";
        enemy.draw(); 
    }); return; }

    // Update the score
    currPoints += 2;

    // Every random few frames spawn a enemy
    if(frame%((Math.floor(Math.random()*20))+30) == 0){
        spawnEnemies();
    }

    if(boss.active && frame%((Math.floor(Math.random()*1100))+900) == 0){
        // summon giant enemy
        let x, y;
        let radius = Math.round(Math.random()*4)+150;
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const angle = Math.atan2(player.y - y, player.x - x);
        const velocityX = Math.cos(angle) * -(4 - radius/50),
            velocityY = Math.sin(angle) * -(4 - radius/50);

        enemies.push(new Enemy(x, y, {x:velocityX, y:velocityY}, "giant", -(4 - radius/50), radius));
    }

    enemies.forEach((enemy, index) => {
        // if stop time is not active set the color to normal
        enemy.color = "black";
        // The chance for the enemy to turn towords the player
        if(Math.random() > 0.99 && !repel && enemy.type != "giant"){
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)

            enemy.velocity.x = Math.cos(angle)* enemy.speed;
            enemy.velocity.y = Math.sin(angle)* enemy.speed;
        }else if(repel){
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x)

            enemy.velocity.x = Math.cos(angle)* -enemy.speed;
            enemy.velocity.y = Math.sin(angle)* -enemy.speed;
        }

        // if enemy goes off screen remove it
        if(enemy.x + enemy.radius < -40 || enemy.x - enemy.radius > canvas.width+40 || enemy.y + enemy.radius < -40 || enemy.y - enemy.radius > canvas.height+40){
            setTimeout(() =>{
                enemies.splice(index, 1)
            }, 0)
        }

        // end the game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if(dist - enemy.radius - player.radius < 0 && !immunity){
            setTimeout(() => {
                cancelAnimationFrame(frame);
                endgame();
            }, 30)
        }

        if(immunity){
            if(checkCollision(enemy.x, enemy.y, enemy.radius, player.x, player.y, player.radius)){
                enemy.velocity.x *= -1;
                enemy.velocity.y *= -1;
            }
        }

        if(checkCollision(enemy.x, enemy.y, enemy.radius, boss.x, boss.y, boss.radius) && boss.active){
            enemy.velocity.x *= -1;
            enemy.velocity.y *= -1;
        }

        enemy.update();
    })

    //return;
    // boss code **WIP**
    if(currPoints >= 4900 && currPoints <= 5000){ boss.spawn(); }
    if(currPoints == 5000){ boss.startBattle() }
    if(currPoints >= 5001){
        if(currPoints%1000 == 0){ boss.vulnerable = true; }
        boss.draw();
    }
}

function spawnEnemies(){
    // set the spawn pos and get the direction towords the player
    let x, y;
    let radius = Math.round(Math.random()*4)+10;
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

    enemies.push(new Enemy(x, y, {x:velocityX, y:velocityY}, "normal", -(4 - radius/6), radius));
}

function useAbility(ability){
    if(abilitys[ability] < 1 || eval(ability) || player.speed > 7){ return; }

    abilitys[ability] --;

    if(ability == "stoptime"){ stoptime = true; setTimeout(() => {stoptime = false;}, 5000)}
    else if(ability == "teleport"){ teleport = true; cancelAnimationFrame(frame); }
    else if(ability == "repel"){ repel = true; setTimeout(() => {repel = false;}, 500)}
    else if(ability == "immunity"){ immunity = true; setTimeout(() => {immunity = false;}, 2000); }
    else if(ability == "speedx2"){ player.speed *= 2; setTimeout(() => {player.speed = 7}, 5000); }

    document.querySelector(".abilityDis").innerHTML = `Ability: ${Object.keys(abilitys)[currAblity]} - ${abilitys[Object.keys(abilitys)[currAblity]]}`;
}

const checkCollision = (p1x, p1y, r1, p2x, p2y, r2) => ((r1 + r2) ** 2 > (p1x - p2x) ** 2 + (p1y - p2y) ** 2)

let notSecretCodeIndex = 0;
const notSecretCode = ["n", "a", "t", "h", "a", "n"];
let notCount = false;

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

    // not the secret code code
    if(e.key.toLowerCase() == notSecretCode[notSecretCodeIndex]){
        notCount = true;
        notSecretCodeIndex ++;
        if(notSecretCodeIndex >= notSecretCode.length){ immunity = !immunity }
    }else{
        notSecretCodeIndex = 0;
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

window.onmousedown = (e) => {
    if(!teleport){ return; }

    player.x = e.x;
    player.y = e.y;
    player.radius = 0;
    gsap.to(player, {
        radius: 10
    })
    teleport = false;
    Update();
}


function init(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.querySelector(".abilityDis").innerHTML = `Ability: ${Object.keys(abilitys)[currAblity]} - ${abilitys[Object.keys(abilitys)[currAblity]]}`;
    player = new Player(canvas.width/2, canvas.height/2, 10, "red", {x:0, y:0});
    enemies = [];
    particals = [];
    boss = new Boss();
    currPoints = 0;
    start = true;
    notCount = false;
    Update();
}

function endgame(){
    if(notCount){ currPoints = 0; }
    document.querySelector(".pointsDis").innerHTML = `Points: ${currPoints}`;
    document.querySelector(".menu").style.left= "calc(50% - 300px)";
    score += currPoints;
    if(highscore <= currPoints){
        highscore = currPoints;
        document.querySelector(".menu .score").innerHTML = `Highscore: ${highscore}`;
        document.querySelector(".menu .score").style.animationName = "new-high-score";
    }else{
        document.querySelector(".menu .score").style.animationName = "nothing"; 
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

function makeShop(){
    document.querySelector(".shop .shop-options").innerHTML = "";
    shopOptions.forEach(([name, cost]) => {
        document.querySelector(".shop .shop-options").innerHTML += `<div><span style="font-size: xx-large;">${name}: </span><span style="font-size: x-large;"> $${cost} </span><button style="height: 40px; min-width: 80px; background-color: #EF4444; border-radius: 999px; color: white;" onclick="buy(this);">Buy</button><span style="font-size: xx-large;"> - ${abilitys[name]}</span></div>`;
    })
}

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
// AHHHHHHH

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
