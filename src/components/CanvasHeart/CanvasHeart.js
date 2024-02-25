import React, { useRef, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import "./CanvasHeart.css";

var settings = {
  particles: {
    length: 800, // maximum amount of particles
    duration: 2, // particle duration in sec
    velocity: 100, // particle velocity in pixels/sec
    effect: -0.6, // play with this for a nice effect
    size: 28, // particle size in pixels
  },
};

var Point = (function () {
  function Point(x, y) {
    this.x = (typeof x !== 'undefined') ? x : 0;
    this.y = (typeof y !== 'undefined') ? y : 0;
  }
  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function (length) {
    if (typeof length == 'undefined')
      return Math.sqrt(this.x * this.x + this.y * this.y);
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };
  Point.prototype.normalize = function () {
    var length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };
  return Point;
})();

/*
 * Particle class
 */
var Particle = (function () {
  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function (context, image) {
    function ease(t) {
      return (--t) * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
  };
  return Particle;
})();

/*
* ParticlePool class
*/
var ParticlePool = (function () {
  var particles,
    firstActive = 0,
    firstFree = 0,
    duration = settings.particles.duration;

  function ParticlePool(length) {
    // create and populate particle pool
    particles = new Array(length);
    for (var i = 0; i < particles.length; i++)
      particles[i] = new Particle();
  }
  ParticlePool.prototype.add = function (x, y, dx, dy) {
    particles[firstFree].initialize(x, y, dx, dy);

    // handle circular queue
    firstFree++;
    if (firstFree === particles.length) firstFree = 0;
    if (firstActive === firstFree) firstActive++;
    if (firstActive === particles.length) firstActive = 0;
  };
  ParticlePool.prototype.update = function (deltaTime) {
    var i;

    // update active particles
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].update(deltaTime);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].update(deltaTime);
      for (i = 0; i < firstFree; i++)
        particles[i].update(deltaTime);
    }

    // remove inactive particles
    while (particles[firstActive].age >= duration && firstActive !== firstFree) {
      firstActive++;
      if (firstActive === particles.length) firstActive = 0;
    }
  };
  ParticlePool.prototype.draw = function (context, image) {
    // draw active particles
    if (firstActive < firstFree) {
      for (let i = firstActive; i < firstFree; i++)
        particles[i].draw(context, image);
    }
    if (firstFree < firstActive) {
      for (let i = firstActive; i < particles.length; i++)
        particles[i].draw(context, image);
      for (let i = 0; i < firstFree; i++)
        particles[i].draw(context, image);
    }
  };
  return ParticlePool;
})();

const PARTICLE_SIZE = 10;
const PARTICLE_CHANGE_SIZE_SPEED = 0.1;
const PARTICLE_CHANGE_SPEED = 0.5;
const ACCELERATION = 0.12;
const DOT_CHANGE_SIZE_SPEED = 0.05;
const DOT_CHANGE_ALPHA_SPEED = 0.05;
const PARTICLE_MIN_SPEED = 16;
const NUMBER_PARTICLE_PER_BULLET = 30;

var particle = (function () {
  function particle(bullet, deg) {
    this.bullet = bullet;
    this.ctx = bullet.ctx;
    this.deg = deg;
    this.x = this.bullet.x;
    this.y = this.bullet.y;
    this.size = PARTICLE_SIZE;
    this.speed = Math.random() * 4 + PARTICLE_MIN_SPEED;
    this.speedX = 0;
    this.speedY = 0;
    this.fallSpeed = 0;
    this.color = this.bullet.color;
    this.dots = []
  }
  particle.prototype.update = function () {
    this.speed -= PARTICLE_CHANGE_SPEED;
    if (this.speed < 0) this.speed = 0;
    this.fallSpeed += ACCELERATION;
    this.speedX = this.speed * Math.cos(this.deg);
    this.speedY = this.speed * Math.sin(this.deg) + this.fallSpeed;
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > PARTICLE_CHANGE_SIZE_SPEED) this.size -= PARTICLE_CHANGE_SIZE_SPEED;
    if (this.size > 0) this.dots.push({
      x: this.x,
      y: this.y,
      alpha: 1,
      size: this.size
    })
    this.dots.forEach(dot => {
      dot.size -= DOT_CHANGE_SIZE_SPEED;
      dot.alpha -= DOT_CHANGE_ALPHA_SPEED;
    });
    this.dots = this.dots.filter(dot => dot.size > 0);
    setTimeout(() => this.remove(), 5000);
  }
  particle.prototype.remove = function () {
    this.bullet.particles.splice(this.bullet.particles.indexOf(this), 1);
  }

  particle.prototype.draw = function () {
    this.dots.forEach(dot => {
      this.ctx.fillStyle = 'rgba(' + this.color + ', ' + dot.alpha + ')';
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, dot.size, 0, 2 * Math.PI);
      this.ctx.fill();
    })
  };
  return particle;
})();

var bullet = (function () {
  function bullet(ctx, width, height) {
    this.ctx = ctx
    this.x = Math.random() * width;
    this.y = Math.random() * height / 2;
    this.color = Math.floor(Math.random() * 255) + ',' +
      Math.floor(Math.random() * 255) + ',' +
      Math.floor(Math.random() * 255);
    this.particles = [];
    let bulletDeg = Math.PI * 2 / NUMBER_PARTICLE_PER_BULLET;
    for (let i = 0; i < NUMBER_PARTICLE_PER_BULLET; i++) {
      let newParticle = new particle(this, i * bulletDeg);
      this.particles.push(newParticle);
    }
  }

  bullet.prototype.remove = function () {
    this.fireworks.bullets.splice(this.fireworks.bullets.indexOf(this), 1);
  }

  bullet.prototype.update = function () {
    this.particles.forEach(particle => particle.update());
  }

  bullet.prototype.draw = function () {
    this.particles.forEach(particle => particle.draw());
  }
  return bullet;
})();

const CanvasHeart = (props) => {
  const { isVisible, setIsVisible } = props;
  const canvasRef = useRef(null);
  const requestIdRef = useRef(null);

  const [isDrawing, setDrawing] = useState(true);

  useEffect(() => {
    draw();
  }, [isDrawing]);

  const draw = () => {
    const canvas = canvasRef.current;
    // const ctx = canvas.getContext('2d');

    if (isDrawing) {
      drawOld(canvas);
    } else {
      drawNew(canvas);
    }
  };

  const drawOld = (canvas) => {
    let context = canvas.getContext('2d'),
      particles = new ParticlePool(settings.particles.length),
      particleRate = settings.particles.length / settings.particles.duration, // particles/sec
      time;

    const text = 'Anh muốn bắt đầu bằng việc gửi đến em lời xin lỗi chân thành. Anh nhận ra rằng đã lỡ nặng lời và gây ra những cảm xúc tiêu cực cho em. Sâu trong tâm hồn, anh thấu hiểu rằng những lời nói của anh đã làm tổn thương em rất nhiều, và anh xin lỗi vô cùng vì điều đó. Anh đang cố gắng học hỏi từ những sai lầm của mình và anh hứa sẽ cố gắng hơn nữa để tránh những tình huống tương tự xảy ra trong tương lai. Nếu em cảm thấy thoải mái, anh mong được có cơ hội để nói trực tiếp với em những lời này. Anh trân trọng mọi khoảnh khắc mà chúng ta có cùng nhau, và anh muốn đảm bảo rằng chúng ta có thể vượt qua khó khăn này. Xin lỗi lần nữa và mong rằng em có thể tha thứ cho anh. I <3 U';
    let positionX = canvas.width; // Vị trí ban đầu của văn bản

    // get point on heart with -PI <= t <= PI
    function pointOnHeart(t) {
      return new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
      );
    }

    // creating the particle image using a dummy canvas
    var image = (function () {
      var canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
      canvas.width = settings.particles.size;
      canvas.height = settings.particles.size;
      // helper function to create the path
      function to(t) {
        var point = pointOnHeart(t);
        point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
        point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
        return point;
      }
      // create the path
      context.beginPath();
      var t = -Math.PI;
      var point = to(t);
      context.moveTo(point.x, point.y);
      while (t < Math.PI) {
        t += 0.01; // baby steps!
        point = to(t);
        context.lineTo(point.x, point.y);
      }
      context.closePath();
      context.fillStyle = '#ffc0cb';
      context.fill();
      // create the image
      var image = new Image();
      image.src = canvas.toDataURL();
      return image;
    })();

    // render that thing!
    function render() {
      // next animation frame
      requestAnimationFrame(render);

      // update time
      var newTime = new Date().getTime() / 10000,
        deltaTime = newTime - (time || newTime);
      time = newTime;

      // clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height); 

      // create new particles
      var amount = particleRate * deltaTime;
      for (var i = 0; i < amount; i++) {
        var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        var dir = pos.clone().length(settings.particles.velocity);
        particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
      }

      // update and draw particles
      particles.update(deltaTime);
      particles.draw(context, image);

      context.font = 'bold 1.3rem "Georgia", "Times New Roman", Times, serif';
      context.fillStyle = '#ffc0cb';
      context.fillText(text, positionX, 200);

      positionX -= 1; // Điều này xác định tốc độ chạy của văn bản

      if (positionX > canvas.width) {
        positionX = -context.measureText(text).width; // Reset vị trí khi văn bản vượt ra khỏi canvas
      }
    }

    function onResize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    // window.onresize = onResize;

    // delay rendering bootstrap
    setTimeout(function () {
      onResize();
      render();
    }, 10);
  }

  const drawNew = (canvas) => {
    let context = canvas.getContext('2d');
    let bullets = [];
    setInterval(() => {
      let newBullet = new bullet(context, canvas.width, canvas.height);
      bullets.push(newBullet);
    }, 500);

    function render() {
      requestAnimationFrame(render);

      context.clearRect(0, 0, canvas.width, canvas.height);

      bullets.forEach(bullet => {
        if (bullet.particles.length === 0) {
          bullets.splice(bullets.indexOf(this), 1);
        }
        bullet.update();
      });
      bullets.forEach(bullet => bullet.draw());

      let positionX = canvas.width; // Vị trí ban đầu của văn bản
      const text = 'Chúc mừng em đốm béo đã chọn phương án đúng'; 
      context.font = 'bold 1.3rem "Georgia", "Times New Roman", Times, serif';
      context.fillStyle = '#ffc0cb';
      context.fillText(text, positionX, 200);

      positionX -= 0.5; // Điều này xác định tốc độ chạy của văn bản

      if (positionX > canvas.width) {
        positionX = -context.measureText(text).width; // Reset vị trí khi văn bản vượt ra khỏi canvas
      }
    }
    setTimeout(function () {
      render();
    }, 10);
  }

  const yesClick = () => {
    alert("Vậy là em đốm đồng ý rồi nha");
    cancelAnimationFrame(requestIdRef.current);
    setDrawing(false);
    setIsVisible(3);
  }

  const noHover = () => {
    var x = Math.floor(Math.random() * window.innerWidth / 2) + 10;
    var y = Math.floor(Math.random() * window.innerHeight / 2) + 200;
    document.getElementById("btnNo").style.left = x + "px";
    document.getElementById("btnNo").style.top = y + "px";
  }

  return (
    <>{
      isVisible !== 0 && (
        isVisible === 3 ? (
          <div className="avatar-container">
            <img
              className="avatar-image"
              src='./img/love.jpg'
              alt="Avatar"
            />
          </div>
        ) : (
          <div className='love_container'>
            {/* <div className="question-container">
              <p id="loveQuestion">Em đốm tha thứ cho anh nha</p>
            </div> */}
            {
              isVisible === 1 && (
                <Button bsStyle="primary" id="btnYes" onClick={yesClick}>
                  Bấm vào đây để tha thứ cho anh
                </Button>
              )
            }
            {
              (isVisible === 1 || isVisible === 2) && (
                <Button bsStyle="primary" id="btnNo" onMouseOver={noHover}>
                  Bấm vào đây nếu em đốm vẫn muốn ghét anh
                </Button>
              )
            }
          </div >
        )
      )
    }
      <canvas ref={canvasRef} width={1500} height={1000}></canvas>;
    </>
  )
};

export default CanvasHeart;
