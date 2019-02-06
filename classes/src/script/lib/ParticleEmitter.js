import raf from "@mediamonks/temple/util/raf.js";
import Particle from "./Particle";
import isOutOfBounds from "./isOutOfBounds";

export default class ParticleEmitter {
  constructor(canvas, options = {}) {
    this.maxParticles = options.maxParticles || 100;
    this.maxSpawnAmount = options.maxSpawnAmount || 2;

    this.count = 0;
    this._particles = [];
    this._particlesLength = this._particles.length;
    this._particleClasses = [];
    this._particleClassesLength = this._particleClasses.length;
    this.ctx = canvas.getContext("2d");
  }

  /**
   *
   * @param {Particle} particle
   * @param {function} getSettings returns a object for the Particle class
   */
  addParticleClass(particle, getSettings) {
    // particle test
    const p = new particle(getSettings);
    if (p instanceof Particle) {
      this._particleClasses.push([particle, getSettings]);
      this._particleClassesLength = this._particleClasses.length;
    }
  }

  start() {
    if (this._raf) {
      this._raf.stop();
    }
    this._raf = raf(this.tick);
    this._raf.start();

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 200, 200);
  }

  stop() {
    if (this._raf) {
      this._raf.stop();
    }

    this._raf = null;
  }

  tick = () => {
  	const {width, height} = this.ctx.canvas;
	  this.ctx.clearRect(0, 0, width, height);
    this._particles.forEach(particle => {
      particle.update();
      particle.render(this.ctx);
    });

    for (let i = 0; i < this.maxSpawnAmount; i++) {
      if (this.maxParticles > this._particlesLength) {
        const [ParticleClass, settingsFunction] = this._particleClasses[
          this.count % this._particleClassesLength
        ];
        const particle = new ParticleClass(settingsFunction());

        this._particles.push(particle);
        this._particlesLength = this._particles.length;
        this.count++;
      }
    }

    this._particles = this._particles.filter(part => {
	    return part.timeToLive > 0 && !isOutOfBounds(part, width, height)
    });
    this._particlesLength = this._particles.length;


  };
}
