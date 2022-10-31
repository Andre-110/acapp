class Player extends AcGameObject{
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.playground=playground;
        this.ctx=this.playground.game_map.ctx;
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.speed=speed;
        // 其他人的移动通过网络传输，自己的移动通过鼠标和键盘
        this.is_me=is_me;

        // 全局速度与移动模长
        this.vx=0;
        this.vy=0;
        this.move_length=0;


        this.damage_x=0;
        this.damage_y=0;
        this.damage_speed=0;
        this.friction=0.9;

        //浮点数运算的误差
        this.eps=0.1;
        this.spent_time=0;
        //当前选择的技能
        this.cur_skill=null;

    }

    start(){
        if(this.is_me){
            this.add_listening_events();
        }
        else{
            //给敌人定义一个随机目的地
            let tx=Math.random()*this.playground.width;
            let ty=Math.random()*this.playground.height;
            this.move_to(tx,ty);
        }
    }

    //监听函数，监听鼠标事件
    add_listening_events(){
        let outer = this;
        //关闭鼠标右键功能
        this.playground.game_map.$canvas.on("contextmenu",function(){
        return false;
        });
        //鼠标点击 绑定函数
        this.playground.game_map.$canvas.mousedown(function(e){
            //坐标变换
            const rect = outer.ctx.canvas.getBoundingClientRect();
            //右键事件
            if(e.which===3){
                //移到某个坐标处（鼠标点击）
                outer.move_to(e.clientX-rect.left,e.clientY-rect.top);
            }
            else if(e.which===1){//左键事件
                //判断功能
                if(outer.cur_skill==="fireball"){
                    //发射火球
                    outer.shoot_fireball(e.clientX-rect.left,e.clientY-rect.top);
                }
                //将技能重置
                outer.cur_skill = null;
            }
        });
        //获取当前键盘事件，触发火球事件
        $(window).keydown(function(e){
            if(e.which===81){
                outer.cur_skill="fireball";
                return false;
            }
        });
    }

    //发射火球
    shoot_fireball(tx,ty){
        let x=this.x,y=this.y;
        let radius=this.playground.height*0.01;
        let angle = Math.atan2(ty-this.y,tx-this.x);
        let vx=Math.cos(angle),vy=Math.sin(angle);
        let color="orange";
        let speed = this.playground.height*0.5;
        let move_length = this.playground.height*1;
        new FireBall(this.playground,this,x,y,radius,vx,vy,color,speed,move_length,this.playground.height*0.01);
    }
    //求两点间欧几里得距离
    get_dist(x1,y1,x2,y2){
        let dx=x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }

    //计算移动需要的方向和模长，更新全局变量
    move_to(tx,ty){
        this.move_length=this.get_dist(this.x,this.y,tx,ty);
        let angle = Math.atan2(ty-this.y,tx-this.x);
        this.vx=Math.cos(angle);
        this.vy=Math.sin(angle);
    }

    is_attacked(angle,damage){
        //console.log(this.x);
        //console.log(this.y);
        //console.log(this.radius);
        //console.log(this.playground.height/this.radius)
        for(let i=0;i<20+Math.random()*10+this.playground.height*0.05/this.radius*10;i++){
            let x=this.x,y=this.y;
            let radius=this.radius*Math.random()*0.3;
            let angle=Math.PI*2*Math.random();
            let vx=Math.cos(angle),vy=Math.sin(angle);
            x = this.x+this.radius*Math.cos(angle);
            y = this.y+this.radius*Math.sin(angle);
            let color=this.color;
            let speed=this.speed*0.5;
            let move_length=this.radius*(Math.random()*0.1+0.2);
           
            
            //console.log(x);
            //console.log(y);
            //console.log(move_length);
            new Particle(this.playground,x,y,radius,vx,vy,color,speed,move_length);

        }
        //如果被攻击，则半径减去伤害值变小
        this.radius-=damage;
        //小到一定程度消失
        if(this.radius<10){
            this.destroy();
            return false;
        }

        //冲击力
        this.damage_x=Math.cos(angle);
        this.damage_y=Math.sin(angle);
        this.damage_speed=damage*100;
        this.speed*=0.8;
    }
    update(){
        this.spent_time+=this.timedelta/1000;
        if(!this.is_me&&this.spent_time>4&&Math.random()<1/300.0){
            let player=this.playground.players[Math.floor(Math.random()*this.playground.players.length)];
            let tx=player.x+player.speed*this.vx*this.timedelta/1000*0.3;
            let ty=player.y+player.speed*this.vy*this.timedelta/1000*0.3;
            this.shoot_fireball(tx,ty);
        }
        if(this.damage_speed>10){
            this.vx=this.vy=0;
            this.move_length=0;
            this.x+=this.damage_x*this.damage_speed*this.timedelta/1000;
            this.y+=this.damage_y*this.damage_speed*this.timedelta/1000;
            this.damage_speed*=this.friction;
        }
        else{
            //如果已经足够接近
            if(this.move_length<this.eps){
                this.move_length=0;
                this.vx=this.vy=0;
                //如果是敌人，则继续向下一个点前进
                if(!this.is_me){
                    let tx=Math.random()*this.playground.width;
                    let ty=Math.random()*this.playground.height;
                    this.move_to(tx,ty);
                }
            }
            else{
                //如果需要移动
                //取当前剩余距离与速度乘时间的距离中的最小值，防止移动出界
                let moved=Math.min(this.move_length,this.speed*this.timedelta/1000);
                this.x+=this.vx*moved;
                this.y+=this.vy*moved;
                //总的移动距离在变小
                this.move_length-=moved;
            }
        }
        this.render();
    }

    render(){
    //画圆
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }
    on_destroy(){
        for(let i=0;i<this.playground.players.length;i++){
            if(this.playground.players[i]===this){
                this.playground.players.splice(i,1);
            }
        }
    }

}
