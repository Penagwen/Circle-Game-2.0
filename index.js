const canvas = document.querySelector('canvas'); 
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game Variables
let player;
let enemies;
const controls = {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    sprint: "shift",
}
let currPoints = 0;


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
    c.fillRect(0, 0, canvas.width, canvas.height);

    document.querySelector(".pointsDis").innerHTML = `Points: ${currPoints}`;
    player.update();

    // Update the score
    currPoints ++;

    // Every random few frames spawn a enemy
    if(frame%((Math.floor(Math.random()*20))+30) == 0){
        spawnEnemies();
    }

    enemies.forEach((enemy, index) => {
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
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - enemy.radius - player.radius < 1){
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

window.onkeydown = (e) => {
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
}

window.onkeyup = (e) => {
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
    player = new Player(canvas.width/2, canvas.height/2, 10, "red", {x:0, y:0});
    enemies = [];
    currPoints = 0;
    Update();
}

function endgame(){
    document.querySelector(".pointsDis").innerHTML = `Points: ${currPoints}`;
    document.querySelector(".menu").style.left= "calc(50% - 300px)";
    console.log(currPoints);
    score += currPoints;
    if(highscore < currPoints){
        highscore = currPoints;
        document.querySelector(".menu .score").innerHTML = `Highscore: ${highscore}`;
        document.querySelector(".menu .score").style.animationName = "new-high-score"; 
    }else{
        document.querySelector(".menu .score").style.animationName = ""; 
    }
    document.querySelector(".menu .points").innerHTML = `Points: ${score}`;
}

// Menu Variables

let highscore = 0;
let score = 0;

// Menu Javascript

document.querySelector(".startBtn").onmousedown = (e) => {
    document.querySelector(".menu").style.left= "calc(100% + 600px)";
    init();
}

let controlsText = [];
Object.entries(controls).forEach(([name, val]) => {
    controlsText.push(`<span style="font-size: x-large;">${name.toUpperCase()}: </span>` + `<button class="changeCtrlBtn" style="height: 40px; min-width: 80px; background-color: #EF4444; border-radius: 999px; color: white;">${val.toUpperCase()}</button>`);
})
document.querySelector(".settingsMenu .controls").innerHTML = controlsText.join("<br>");
document.querySelector(".settingsMenu .controls").onmousedown = (e) => {
    if(e.target.className == "changeCtrlBtn"){
        e.target.className = "changeCtrlBtn selected"
    }
}
document.querySelector(".selected").onkeydown = (e) => {
    console.log(e);
}
