if (typeof jQuery !== 'undefined') {
  framework = jQuery;
} else {
  framework = $;
}
if (typeof framework !== 'undefined') {
  var idora;
  framework.fn.idora = function (opts) {

    idora = new Idora(this, opts).buildStage().setupKeyboard().buildArrows().buildDots().setupSwipes();
    return this;
  };
  framework.fn.idora.destroy = function () {
    idora.destroy();
  };

} else {
  console.error("no jQuery style plugin loaded; Idora may not work.");
}

function Idora(root, opts) {
  var defaults = {
    startOn: 0,
    slidesPerDot: 1,
    loop: false,
    prevPeek: 0
  };

  this.handlers = {};
  this.opts = $.extend(defaults, opts);
  this.buildResizeListener(opts);
  var $window = $(window);
  this.opts = Idora.applyBreakpoints(this.opts, $window.width());
  this.startOn = this.opts.startOn;
  this.slidesPerDot = this.opts.slidesPerDot;
  this.loop = this.opts.loop;
  this.prevPeek = this.opts.prevPeek;
  this.root = root;
  this.state = new Idora.StatefulNavigation(this);
}

Idora.prototype.destroy = function () {
  this.root.find('.idora-nav').remove();
  this.root.find('.idora-dots').remove();
  this.root.find('.idora-slide').unwrap().unwrap().removeClass('idora-slide');
  this.root.find('*').off("dragstart", this.handlers.draghandler);
  this.root.hammer().off("panstart", this.handlers.swipehandler);
  $(document).off("keydown", this.handlers.arrowKeyHandler);
  $(window).off("resize", this.handlers.resizr);
};

Idora.prototype.buildStage = function () {
  this.root.children().addClass('idora-slide');
  this.root.wrapInner("<div class='idora-stage'></div>").wrapInner("<div class='idora-inner'></div>");
  return this;
};

Idora.prototype.numSlides = function () {
  return this.root.find(".idora-stage").children().length;
};

Idora.prototype.scrollTo = function (i) {
  var idora = this;
  var stage = idora.root.find(".idora-stage");
  var target = idora.findSlideNum(i);
  var left = stage.find(".idora-slide:nth-child(" + (target + 1) + ")").position().left;
  if (this.loop || target != 0) {
    left -= idora.prevPeek;
  }
  stage.animate({'left': -1 * left}, {queue: false, duration: 300});
  idora.root.trigger("idora:scrollTo", target);
};

Idora.prototype.findSlideNum = function (i) {
  var numSlides = this.numSlides();
  var ret;
  if (this.loop) {
    if (i < 0) {
      ret = numSlides - 1 - (Math.abs(i + 1) % numSlides);
    } else {
      ret = i % numSlides;
    }
  } else {
    if (i < 0) {
      ret = 0;
    } else if (i >= numSlides) {
      ret = numSlides - 1;
    } else {
      ret = i;
    }
  }

  return ret;
};

//Responsive

Idora.applyBreakpoints = function (opts, width) {
  var matchingBreakpoints = $(opts.responsive).filter(function (i, breakpoint) {
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
      idora.destroy();
      idora.root.idora(opts);
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
  this.currentItem = idora.startOn;
  var state = this;
  this.idora.root.on("idora:scrollTo", function (e, i) {
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
  idora.root.append(nav);
  idora.root.on("idora:scrollTo", function (e, target) {
    idora.disableArrows(target);
  });
  idora.disableArrows(idora.startOn);

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
  if (target == (this.numSlides() - 1)) {
    next.addClass('idora-disabled');
  } else {
    next.removeClass('idora-disabled');
  }
};

//Dots

Idora.prototype.buildDots = function () {
  var idora = this;
  idora.dots = $("<div class='idora-dots'></div>");
  $(".idora-stage").children().each(function (i, o) {
    if (i % idora.slidesPerDot == 0) {
      idora.dots.append(idora.dot(i, o));
    }
  });
  idora.root.append(idora.dots);
  idora.root.on("idora:scrollTo", function (e, target) {
    idora.activateDots(target);
  });
  idora.activateDots(idora.startOn);

  return idora;
};

Idora.prototype.activateDots = function (i) {
  var idora = this;
  idora.dots.find('.idora-dot').removeClass('idora-active').eq(Math.floor(i / idora.slidesPerDot)).addClass('idora-active');
};

Idora.prototype.dot = function (i, o) {
  var idora = this;
  return $("<div><div class='idora-dot'></div></div>").on("click", function () {
    idora.scrollTo(i);
  })
};