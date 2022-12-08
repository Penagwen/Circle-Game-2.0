const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables
let player;
let eneimes;
const controls = {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    sprint: "r",
}

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
        if(this.dir[0]){
            this.velocity.y = this.speed;
        }else if(this.velocity.y == this.speed){
            this.velocity.y = 0;
        }
        //Going Down
        if(this.dir[1]){
            this.velocity.y = -this.speed;
        }else if(this.velocity.y == -this.speed){
            this.velocity.y = 0;
        }
        //Going Left
        if(this.dir[2]){
            this.velocity.x = this.speed;
        }else if(this.velocity.x == this.speed){
            this.velocity.x = 0;
        }
        //Going Right
        if(this.dir[3]){
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

function Update(){
    requestAnimationFrame(Update);
    c.fillStyle = "white";
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();
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
    player = new Player(canvas.width/2, canvas.height/2, 10, "red", {x:0, y:0});
    eneimes = [];
    Update();
}

init();

