import { Carousel } from './carousel.js';
export class SwipeCarousel extends Carousel {
  constructor(options = {}) {
    super(options)
  }


  _initListeners() {
    super._initListeners()
    this.container.addEventListener('touchstart', this.swipeStartHandler.bind(this))
    this.container.addEventListener('mousedown', this.swipeStartHandler.bind(this))
    this.container.addEventListener('touchend', this.swipeEndHandler.bind(this))
    this.container.addEventListener('mouseup', this.swipeEndHandler.bind(this))
  }

  swipeStartHandler(e) {
    this.startPosX = e instanceof MouseEvent
      ? e.pageX
      : e.changedTouches[0].pageX
  }

  swipeEndHandler(e) {
    this.endPosX = e instanceof MouseEvent
      ? e.pageX
      : e.changedTouches[0].pageX

    if (this.endPosX - this.startPosX > 100) this.prevHandler()
    if (this.endPosX - this.startPosX < -100) this.nextHandler()
  }
};