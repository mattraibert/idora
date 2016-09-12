function Idora(root, opts) {
  this.root = root;
  var defaults = {
    startOn: 0,
    slidesPerDot: 1,
    loop: false,
    prevPeek: 0,
    center: false
  };

  this.handlers = {};
  var optsWDefaults = $.extend(defaults, opts);
  this.buildResizeListener(opts);
  this.opts = Idora.applyBreakpoints(optsWDefaults);
  this.root.wrapInner("<div class='idora-stage'></div>").wrapInner("<div class='idora-inner'></div>");
  this.root.find(".idora-stage").children().addClass('idora-slide');
  this.state = new Idora.StatefulNavigation(this);
  this.buildPlugins();
  this.scrollTo(this.opts.startOn);
}

Idora.prototype.buildPlugins = function () {
  this.setupKeyboard().buildArrows().setupSwipes();
  this.dots = new Idora.Dots(this);
};

Idora.prototype.destroy = function () {
  this.dots.destroy();
  this.root.find('.idora-nav').remove();
  this.root.find('*').off("dragstart", this.handlers.draghandler);
  this.root.hammer().off("panstart", this.handlers.swipehandler);
  $(document).off("keydown", this.handlers.arrowKeyHandler);
  $(window).off("resize", this.handlers.resizr);
  this.root.find('.idora-slide').unwrap().unwrap().removeClass('idora-slide');
};

Idora.prototype.slides = function () {
  return this.root.find(".idora-stage").find('.idora-slide');
};


Idora.prototype.append = function (elem) {
  this.root.append(elem);
};

Idora.prototype.scrollToHandler = function (handler) {
  this.root.on("idora:scrollTo", function (event, target) {
    return handler(target);
  });
};

Idora.prototype.scrollTo = function (target) {
  var idora = this;
  target = idora.findSlideNum(target);
  var stage = idora.root.find(".idora-stage");
  stage.animate({'left': this.moveByPx(target)}, {queue: false, duration: 300});
  idora.root.trigger("idora:scrollTo", target);
};

Idora.prototype.moveByPx = function (target) {
  var slide = this.slides().eq(target);
  var left = slide.position().left;
  if (this.opts.loop || target != 0) {
    left -= this.opts.prevPeek;
  }
  if (this.opts.center) {
    left -= (this.root.width() / 2) - (slide.width() / 2);
  }
  return -1 * left;
};

Idora.prototype.findSlideNum = function (i) {
  var numSlides = this.slides().length;
  var ret;
  if (this.opts.loop) {
    if (i < 0) {
      ret = numSlides - 1 - (Math.abs(i + 1) % numSlides);
    } else {
      ret = i % numSlides;
    }
  } else {
    ret = Math.min(Math.max(i, 0), numSlides - 1)
  }

  return ret;
};

//Responsive

Idora.applyBreakpoints = function (opts) {
  var matchingBreakpoints = $(opts.responsive).filter(function (i, breakpoint) {
    var width = $(window).width();
    return ((breakpoint.minWidth <= width) && (width <= breakpoint.maxWidth));
  });

  matchingBreakpoints.each(function (i, breakpoint) {
    opts = $.extend(opts, breakpoint);
  });
  return opts;
};

Idora.prototype.buildResizeListener = function (opts) {
  var idora = this;
  idora.previousWindowWidth = $(window).width();
  idora.handlers.resizr = function (e) {
    clearTimeout(idora.windowDelay);
    idora.windowDelay = window.setTimeout(function () {
      if (idora.previousWindowWidth != $(window).width()) {
        idora.destroy();
        idora.root.idora(opts);
      }
    }, 200);
  };
  $(window).resize(idora.handlers.resizr);
};

//Swipe

//todo maybe try something more like: https://jsfiddle.net/Richard_Liu/7cqqcrmm/
Idora.prototype.setupSwipes = function () {
  var idora = this;

  idora.handlers.draghandler = function () {
    return false;
  };

  idora.root.find("*").on("dragstart", idora.handlers.draghandler);

  idora.handlers.swipehandler = function (ev) {
    var deltaY = ev.gesture.deltaY;
    var deltaX = ev.gesture.deltaX;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      var scrollAmt = Math.min(Math.round(deltaX / -8), 10);
      idora.state.scrollBy(scrollAmt);
    }
  };

  idora.root.hammer().on("panstart", idora.handlers.swipehandler);

  return idora;
};

//Stateful navigation

Idora.StatefulNavigation = function (idora) {
  this.idora = idora;
  this.currentItem = idora.opts.startOn;
  var state = this;
  this.idora.scrollToHandler(function (i) {
    state.currentItem = i;
  });
};

Idora.StatefulNavigation.prototype.scrollNext = function () {
  this.scrollBy(1);
};

Idora.StatefulNavigation.prototype.scrollPrev = function () {
  this.scrollBy(-1);
};

Idora.StatefulNavigation.prototype.scrollBy = function (n) {
  this.idora.scrollTo(this.currentItem + n);
};

//Keyboard

Idora.prototype.setupKeyboard = function () {
  var idora = this;
  idora.handlers.arrowKeyHandler = function (e) {
    if (e.which == 37) {
      idora.state.scrollPrev();
      e.preventDefault();
    }
    if (e.which == 39) {
      idora.state.scrollNext();
      e.preventDefault();
    }
  };
  $(document).on("keydown", idora.handlers.arrowKeyHandler);
  return idora;
};

//Arrows

Idora.prototype.buildArrows = function () {
  var idora = this;
  var nav = $("<div class='idora-nav'></div>");
  nav.append($("<div class='idora-prev idora-arrow'></div>").on("click", function () {
    idora.state.scrollPrev();
  }));
  nav.append($("<div class='idora-next idora-arrow'></div>").on("click", function () {
    idora.state.scrollNext();
  }));
  idora.append(nav);
  idora.scrollToHandler(function (target) {
    idora.disableArrows(target);
  });

  return idora;
};

Idora.prototype.disableArrows = function (target) {
  var prev = this.root.find('.idora-prev');
  if (target == 0) {
    prev.addClass('idora-disabled');
  } else {
    prev.removeClass('idora-disabled');
  }

  var next = this.root.find('.idora-next');
  if (target == (this.slides().length - 1)) {
    next.addClass('idora-disabled');
  } else {
    next.removeClass('idora-disabled');
  }
};

Idora.Dots = function (idora) {
  this.idora = idora;
  this.dotContainer = $("<div class='idora-dots'></div>");
  var dots = this;
  idora.slides().each(function (i, o) {
    if (i % idora.opts.slidesPerDot == 0) {
      dots.dotContainer.append(dots.dot(i, o));
    }
  });
  idora.append(this.dotContainer);
  idora.scrollToHandler(function (target) {
    dots.activateDots(target);
  });
};

Idora.Dots.prototype.destroy = function () {
};

Idora.Dots.prototype.activateDots = function (i) {
  this.dotContainer.find('.idora-dot').removeClass('idora-active').eq(Math.floor(i / this.idora.opts.slidesPerDot)).addClass('idora-active');
};

Idora.Dots.prototype.dot = function (i, o) {
  var dots = this;
  return $("<div><div class='idora-dot'></div></div>").on("click", function () {
    dots.idora.scrollTo(i);
  })
};