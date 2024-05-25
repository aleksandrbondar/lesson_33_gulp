import { SwipeCarousel } from './swipe.js'
import { Carousel } from './carousel.js'

const options = {
  autoPlayInterval: 2000,
  isControlButtonsEnabled: true,
  isControlPlayPauseEnabled: true,
  isIndicatorsEnabled: true,
  isPauseAfterAction: true,
  isAnimateButtonsHandler: true,
  isAnimateButtonAutoplay: true,
  isPauseWhenMouseFocus: false,
}

const carousel = new SwipeCarousel(options)
carousel.initCarousel()
