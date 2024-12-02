import * as PIXI from "https://cdn.skypack.dev/pixi.js@5.x";
import { KawaseBlurFilter } from "https://cdn.skypack.dev/@pixi/filter-kawase-blur@3.2.0";
import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@3.0.0";
import hsl from "https://cdn.skypack.dev/hsl-to-hex";
// Импортируем debounce из lodash
import debounce from "https://cdn.jsdelivr.net/npm/lodash.debounce@4.0.8/index.min.js";

console.log("Я тебя люблю, моя дорогая Марина.");

// Функция создания снежинки
function createSnowflake() {
  const snowFlake = document.createElement('span');
  snowFlake.classList.add('snowflake');
  snowFlake.textContent = '❄';
  snowFlake.style.left = Math.random() * 100 + 'vw';
  snowFlake.style.opacity = Math.random();
  snowFlake.style.transform = 'scale(' + Math.random() + ')';
  snowFlake.style.animationDuration = Math.random() * 3 + 2 + 's';

  document.body.appendChild(snowFlake);

  setTimeout(() => {
    snowFlake.remove();
  }, 5000);
}

setInterval(createSnowflake, 100);

// Генерация случайного числа в диапазоне
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Преобразование числа из одного диапазона в другой
function map(n, start1, end1, start2, end2) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

// Создание экземпляра Simplex Noise
const simplex = new SimplexNoise();

// Класс для управления цветовыми палитрами
class ColorPalette {
  constructor() {
    this.setColors();
    this.setCustomProperties();
  }

  setColors() {
    this.hue = ~~random(220, 360);
    this.complimentaryHue1 = this.hue + 30;
    this.complimentaryHue2 = this.hue + 60;
    this.saturation = 95;
    this.lightness = 50;

    this.baseColor = hsl(this.hue, this.saturation, this.lightness);
    this.complimentaryColor1 = hsl(
      this.complimentaryHue1,
      this.saturation,
      this.lightness
    );
    this.complimentaryColor2 = hsl(
      this.complimentaryHue2,
      this.saturation,
      this.lightness
    );

    this.colorChoices = [
      this.baseColor,
      this.complimentaryColor1,
      this.complimentaryColor2
    ];
  }

  randomColor() {
    return this.colorChoices[~~random(0, this.colorChoices.length)].replace(
      "#",
      "0x"
    );
  }

  setCustomProperties() {
    document.documentElement.style.setProperty("--hue", this.hue);
    document.documentElement.style.setProperty(
      "--hue-complimentary1",
      this.complimentaryHue1
    );
    document.documentElement.style.setProperty(
      "--hue-complimentary2",
      this.complimentaryHue2
    );
  }
}

// Класс Orb
class Orb {
  constructor(fill = 0x000000) {
    this.bounds = this.setBounds();
    this.x = random(this.bounds["x"].min, this.bounds["x"].max);
    this.y = random(this.bounds["y"].min, this.bounds["y"].max);
    this.scale = 1;
    this.fill = fill;
    this.radius = random(window.innerHeight / 6, window.innerHeight / 3);
    this.xOff = random(0, 1000);
    this.yOff = random(0, 1000);
    this.inc = 0.002;

    this.graphics = new PIXI.Graphics();
    this.graphics.alpha = 0.825;

    // Используем debounce для изменения размеров окна
    window.addEventListener(
      "resize",
      debounce(() => {
        this.bounds = this.setBounds();
      }, 250)
    );
  }

  setBounds() {
    const maxDist =
      window.innerWidth < 1000 ? window.innerWidth / 3 : window.innerWidth / 5;
    const originX = window.innerWidth / 1.25;
    const originY =
      window.innerWidth < 1000
        ? window.innerHeight
        : window.innerHeight / 1.375;

    return {
      x: {
        min: originX - maxDist,
        max: originX + maxDist
      },
      y: {
        min: originY - maxDist,
        max: originY + maxDist
      }
    };
  }

  update() {
    const xNoise = simplex.noise2D(this.xOff, this.xOff);
    const yNoise = simplex.noise2D(this.yOff, this.yOff);
    const scaleNoise = simplex.noise2D(this.xOff, this.yOff);

    this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
    this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);
    this.scale = map(scaleNoise, -1, 1, 0.5, 1);

    this.xOff += this.inc;
    this.yOff += this.inc;
  }

  render() {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.scale.set(this.scale);
    this.graphics.clear();
    this.graphics.beginFill(this.fill);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
  }
}

// Создаем приложение PixiJS
const app = new PIXI.Application({
  view: document.querySelector(".orb-canvas"),
  resizeTo: window,
  transparent: true
});

app.stage.filters = [new KawaseBlurFilter(30, 10, true)];

// Создаем цветовую палитру
const colorPalette = new ColorPalette();

// Создаем шары (Orbs)
const orbs = [];

for (let i = 0; i < 10; i++) {
  const orb = new Orb(colorPalette.randomColor());
  app.stage.addChild(orb.graphics);
  orbs.push(orb);
}

// Анимация
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  app.ticker.add(() => {
    orbs.forEach((orb) => {
      orb.update();
      orb.render();
    });
  });
} else {
  orbs.forEach((orb) => {
    orb.update();
    orb.render();
  });
}

// Таймер
document.addEventListener("DOMContentLoaded", function() {
    const startTime = new Date("3 December 2022 21:37:00").getTime();

    function updateTimer() {
        const timeNow = new Date().getTime();
        const timePassed = Math.round((timeNow - startTime) / 1000);
        const timeElement = document.getElementById("time");
        if (timeElement) {
            timeElement.innerHTML = timePassed;
        }
    }

    updateTimer();
    setInterval(updateTimer, 1000);
});

// Адвент-календарь
document.addEventListener('DOMContentLoaded', function() {
    const cells = document.querySelectorAll('.calendar-cell');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    const closeButton = document.querySelector('.close');

    cells.forEach(cell => {
        const cellDate = new Date(cell.dataset.date);
        const today = new Date();

        if (today >= cellDate) {
            cell.classList.add('open');
            cell.addEventListener('click', () => {
                modalText.textContent = cell.dataset.text;
                modal.style.display = 'block';
            });
        }
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', event => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
