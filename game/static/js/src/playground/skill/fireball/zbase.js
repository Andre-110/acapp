class FireBall extends AcGameObject{
    //火球计分与不伤害自己
    //速度不可改变
    constructor(playground,player,x,y,radius,vx,vy,color,speed,move_length,damage){
        super()
        this.playground=playground;
        this.player=player;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.vx=vx;
        this.vy=vy;
        this.color=color;
        this.speed=speed;

        //射程
        this.move_length=move_length;
        //伤害值
        this.damage=damage;

        this.eps=0.1;
    }
    start(){}
    update(){
        //到达距离后消失
        if(this.move_length<this.eps){
            this.destroy();
            return false;
        }
        //定义每次移动的距离，防止出界
        let moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
        this.x+=this.vx*moved;
        this.y+=this.vy*moved;
        this.move_length-=moved;

        //取出每个玩家，判断是否攻击到
        for(let i=0;i<this.playground.players.length;i++){
            let player=this.playground.players[i];
            if(this.player!==player && this.is_collision(player)){
                this.attack(player);
            }
        }
        this.render();
    }
    get_dist(x1,y1,x2,y2){
        let dx=x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }
    //判断是否与玩家碰撞
    is_collision(player){
        let distance=this.get_dist(this.x,this.y,player.x,player.y);
        if(distance<this.radius+player.radius){
            return true;
        }
        return false;
    }
    //
    attack(player){
        let angle=Math.atan2(player.y-this.y,player.x-this.x);
        //玩家被攻击，参数为伤害的角度与伤害值
        player.is_attacked(angle,this.damage);
        //火球消失
        this.destroy();
    }
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle=this.color;
        this.ctx.fill();
    }
}
