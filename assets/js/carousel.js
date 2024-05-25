export class Carousel {
  constructor(options = {}) {
    try {
      const defaultOptions = {
        containerIdName: "#carousel",
        slidesClassName: ".slide__item",
        isAutoplayCarousel: true,
        autoPlayInterval: 10000,
        isControlButtonsEnabled: true,
        isControlPlayPauseEnabled: true,
        isIndicatorsEnabled: true,
        isPauseAfterAction: false,
        isAnimateButtonsHandler: true,
        isAnimateButtonAutoplay: false,
        isPauseWhenMouseFocus: false,
        userIcons: {},
        userStyles: {},
      };

      const finalOptions = { ...defaultOptions, ...options };

      Object.keys(finalOptions).forEach((key) => {
        this[key] = finalOptions[key];
      });
    } catch (error) {
      console.error(error);
    }
  }

  _initProps() {
    this.container = document.querySelector(this.containerIdName);
    this.slides = this.container.querySelectorAll(this.slidesClassName);

    const defaultIcons = {
      iconPause: '<i class="fas fa-pause" id="pause-btn"></i>',
      iconPlay: '<i class="fas fa-play" id="play-btn"></i>',
      iconPrev: '<i class="fas fa-angle-left" id="prev-btn"></i>',
      iconNext: '<i class="fas fa-angle-right" id="next-btn"></i>',
      iconDownload: '<i class="fa-solid fa-spinner"></i>',
    };
    const icons = { ...defaultIcons, ...this.userIcons };
    const { iconPause, iconPlay, iconPrev, iconNext, iconDownload } = icons;

    this.FA_PAUSE = iconPause;
    this.FA_PLAY = iconPlay;
    this.FA_PREV = iconPrev;
    this.FA_NEXT = iconNext;
    this.FA_DOWNLOAD = iconDownload;

    this.CODE_ARROW_LEFT = "ArrowLeft";
    this.CODE_ARROW_RIGHT = "ArrowRight";
    this.CODE_SPACE = "Space";

    this.SLIDES_COUNT = this.slides.length;
    this.currentSlide = 0;

    this.isPlaying = this.isAutoplayCarousel;
    this.isMouseFocus = false;
  }
  _createWrapper(itemClass, itemId) {
    const control = document.createElement("div");
    control.setAttribute("class", itemClass);
    control.setAttribute("id", itemId);
    this.container.append(control);

    return this.container.querySelector(`#${itemId}`);
  }

  _initButtons() {
    this.PLAY_CLASS = "control-play";
    return {
      PLAY: `<div class="control__item control-pause"><div id="pause-btn">${this.FA_PLAY}</div></div>`,
      PAUSE: `<div class="control__item control-pause"><div id="pause-btn">${this.FA_PAUSE}</div></div >`,
      PREV: `<div class="control__item control-prev"> <div id="prev-btn">${this.FA_PREV}</div></div >`,
      NEXT: `<div class="control__item control-next"> <div id="next-btn">${this.FA_NEXT} </div></div >`,
    };
  }

  _initControlItem() {
    const { PLAY, PAUSE, PREV, NEXT } = this._initButtons();
    this._createWrapper("control", "control-container").innerHTML = this
      .isControlPlayPauseEnabled
      ? PREV + (!this.isAutoplayCarousel ? PLAY : PAUSE) + NEXT
      : PREV + NEXT;
  }

  _initIndicatorItem() {
    const indicatorContainer = this._createWrapper(
      "indicator",
      "indicator-container",
    );

    this.slides.forEach((item, index) => {
      const indicator = `<div class="indicator__item" data-index="${index}"></div>`;
      indicatorContainer.innerHTML += indicator;
    });
  }

  _initElements() {
    if (this.isControlButtonsEnabled) {
      if (this.isControlPlayPauseEnabled) {
        this.pauseBtn = this.container.querySelector("#pause-btn");
      }
      this.prevBtn = this.container.querySelector("#prev-btn");
      this.nextBtn = this.container.querySelector("#next-btn");
    }

    if (this.isIndicatorsEnabled) {
      this.indicatorsContainer = this.container.querySelector(
        "#indicator-container",
      );
      this.indicatorItems =
        this.indicatorsContainer.querySelectorAll(".indicator__item");
      if (this.indicatorItems.length === 0) {
        this.container.querySelector("#indicator-container").childNodes;
      }
    }
  }

  _initButtonsListeners() {
    this.pauseBtn?.addEventListener("click", this.pausePlayHandler.bind(this));
    this.nextBtn.addEventListener("click", this.nextHandler.bind(this));
    this.prevBtn.addEventListener("click", this.prevHandler.bind(this));
  }

  _initIndicatorsListeners() {
    this.indicatorsContainer.addEventListener(
      "click",
      this._indicateHandler.bind(this),
    );
  }

  _initMouseListeners() {
    this.container.addEventListener("mouseenter", (event) =>
      this.pauseMouseFocus(event),
    );
    this.container.addEventListener("mouseleave", (event) =>
      this.playMouseFocus(event),
    );
  }

  _initKeyListeners() {
    document.addEventListener("keydown", this._pressKey.bind(this));
  }

  _initListeners() {
    if (this.isControlButtonsEnabled) this._initButtonsListeners();
    if (this.isIndicatorsEnabled) this._initIndicatorsListeners();
    if (this.isPauseWhenMouseFocus) this._initMouseListeners();
    if (this.isControlButtonsEnabled || this.isIndicatorsEnabled)
      this._initKeyListeners();
  }

  _initUserClasses() {
    Object.keys(this.userStyles).forEach((key) => {
      const element =
        key === "carousel"
          ? [this.container]
          : this.container.querySelectorAll(`.${key}`);
      element.forEach((item) =>
        item.setAttribute("style", this.userStyles[key]),
      );
    });
  }

  _indicateHandler(e) {
    const { target } = e;
    const index = +target.dataset.index;
    if (target.classList.contains("indicator__item")) {
      if (this.isAnimateButtonsHandler) {
        const direction =
          index < this.currentSlide ? this.prevBtn : this.nextBtn;
        this.btnAnimation(direction);
      }
      this.pauseHandler();
      this.gotoNth(index);
    }
  }

  _pressKey(e) {
    const { code } = e;

    if (code === this.CODE_ARROW_LEFT) {
      this.prevHandler(), e.preventDefault();
    }
    if (code === this.CODE_ARROW_RIGHT) {
      this.nextHandler(), e.preventDefault();
    }
    if (code === this.CODE_SPACE) {
      this.pausePlayHandler(), e.preventDefault();
    }
  }

  _setAutoPlayInterval() {
    this.timerId = setInterval(
      () => this._autoPlaySlides(),
      this.autoPlayInterval,
    );
  }

  _autoPlaySlides() {
    if (this.isAnimateButtonAutoplay) {
      this.btnAnimation(this.nextBtn);
    }
    this.gotoNth(this.currentSlide + 1);
  }

  _toggleSlideClass() {
    this.slides[this.currentSlide].classList.toggle("slide__item--active");
    if (this.isIndicatorsEnabled) {
      this.indicatorItems[this.currentSlide].classList.toggle(
        "indicator__item--active",
      );
    }
  }

  _changePauseBtn(btn) {
    if (this.isControlButtonsEnabled && this.isControlPlayPauseEnabled) {
      if (btn === "pause") {
        this.pauseBtn.classList.add(this.PLAY_CLASS);
        this.pauseBtn.innerHTML = this.FA_PLAY;
      }
      if (btn === "play") {
        this.pauseBtn.classList.remove(this.PLAY_CLASS);
        this.pauseBtn.innerHTML = this.FA_PAUSE;
      }
    }
  }
  gotoNth(n) {
    this._toggleSlideClass();
    this.currentSlide = (n + this.SLIDES_COUNT) % this.SLIDES_COUNT;
    this._toggleSlideClass();
  }

  gotoNext() {
    this.btnAnimation(this.nextBtn);
    this.gotoNth(this.currentSlide + 1);
  }

  gotoPrev() {
    this.btnAnimation(this.prevBtn);
    this.gotoNth(this.currentSlide - 1);
  }

  pauseHandler() {
    this.isPlaying = false;
    clearInterval(this.timerId);
    this._changePauseBtn("pause");
  }

  playHandler() {
    this.isPlaying = true;
    this._changePauseBtn("play");
    this._setAutoPlayInterval();
  }

  pausePlay() {
    this.isPlaying ? this.pauseHandler() : this.playHandler();
  }

  pausePlayHandler() {
    if (this.isControlButtonsEnabled && this.isControlPlayPauseEnabled)
      this.pausePlay();
  }

  pauseMouseFocus() {
    if (this.isMouseFocus) return;
    this.isMouseFocus = true;
    if (this.isPlaying) this.pauseHandler();
  }

  playMouseFocus() {
    this.isMouseFocus = false;
    if (!this.isPlaying) this.playHandler();
  }

  nextHandler() {
    !this.isPauseAfterAction || this.pauseHandler();
    this.gotoNext();
  }

  prevHandler() {
    !this.isPauseAfterAction || this.pauseHandler();
    this.gotoPrev();
  }

  btnAnimation(btn) {
    if (this.isControlButtonsEnabled) {
      btn.classList.add("handleAnimation");
      setTimeout(() => btn.classList.remove("handleAnimation"), 500);
    }
  }

  _loadListener(type) {
    if (type === "add")
      window.addEventListener("load", this.hideLoadingScreen.bind(this));
    if (type === "remove")
      window.removeEventListener("load", this.hideLoadingScreen.bind(this));
  }

  hideLoadingScreen() {
    this.container.classList.toggle("carousel--loading");
    setTimeout(
      () => this.container.querySelector("#loading-screen").remove(),
      1000,
    );

    this._loadListener("remove");
    if (this.isAutoplayCarousel) this._setAutoPlayInterval();
  }

  initLoadingScreen() {
    this.container.classList.toggle("carousel--loading");
    this.container.insertAdjacentHTML(
      "beforeend",
      `<div class="loading-screen" id="loading-screen">${this.FA_DOWNLOAD ?? ""}</div>`,
    );
    this._loadListener("add");
  }

  initCarousel() {
    this._initProps();
    this.initLoadingScreen();
    !this.isControlButtonsEnabled || this._initControlItem();
    !this.isIndicatorsEnabled || this._initIndicatorItem();
    this._initElements();
    this._initListeners();
    this._initUserClasses();
    this._toggleSlideClass();
  }
}
