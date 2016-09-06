if (typeof jQuery !== 'undefined') {
  framework = jQuery;
} else {
  framework = $;
}

if (typeof framework !== 'undefined') {
  var well;
  framework.fn.well = function () {
    well = new Well(this).buildStage().setupKeyboard().buildArrows().buildDots().setupSwipes();

    return this;
  };
} else {
  console.error("no jQuery style plugin loaded; Well may not work.");
}

function Well(root) {
  this.root = root;
  this.currentItem = 0;
  this.slidesPerDot = 5;
  this.loop = false;
}

Well.prototype.buildStage = function () {
  this.root.wrapInner("<div class='carousel_stage'></div>").wrapInner("<div class='carousel_inner'></div>");
  return this;
};

Well.prototype.numItems = function () {
  return $(".carousel_stage").children().length;
};

Well.prototype.scrollTo = function (i) {
  var well = this;
  var stage = $(".carousel_stage");
  var target = well.findSlideNum(i);
  var left = stage.find("div:nth-child(" + (target + 1) + ")").position().left;
  stage.animate({'left': -1 * left}, {queue: false, duration: 300});
  well.root.trigger("well:scrollTo", target);
  well.currentItem = target;
};

Well.prototype.findSlideNum = function (i) {
  var numItems = this.numItems();
  var ret;
  if (this.loop) {
    if (i < 0) {
      ret = numItems - 1 - (Math.abs(i + 1) % numItems);
    } else {
      ret = i % numItems;
    }
  } else {
    if (i < 0) {
      ret = 0;
    } else if (i >= numItems) {
      ret = numItems - 1;
    } else {
      ret = i;
    }
  }

  return ret;
};

//Swipe

//todo maybe try something more like: https://jsfiddle.net/Richard_Liu/7cqqcrmm/

Well.prototype.setupSwipes = function () {
  var well = this;
  well.root.find("*").on("dragstart", function () {
    return false;
  });
  well.root.hammer().on("panstart", function (ev) {
    var deltaX = ev.gesture.deltaX;
    var scrollAmt = Math.min(Math.round(deltaX / -8), 10);
    well.scrollBy(scrollAmt);
  });

  return well;
};

//Stateful navigation

Well.prototype.scrollNext = function () {
  this.scrollBy(1);
};

Well.prototype.scrollPrev = function () {
  this.scrollBy(-1);
};

Well.prototype.scrollBy = function (n) {
  this.scrollTo(this.currentItem + n);
};

//Keyboard

Well.prototype.setupKeyboard = function () {
  var well = this;
  $(document).on("keydown", function (e) {
    if (e.which == 37) {
      well.scrollPrev();
      e.preventDefault();
    }
    if (e.which == 39) {
      well.scrollNext();
      e.preventDefault();
    }
  });
  return well;
};

//Arrows

Well.prototype.buildArrows = function () {
  var well = this;
  var nav = $("<div class='nav'></div>");
  nav.append($("<div class='prev arrow'></div>").on("click", function () {
    well.scrollPrev();
  }));
  nav.append($("<div class='next arrow'></div>").on("click", function () {
    well.scrollNext();
  }));
  well.root.append(nav);
  return well;
};

//Dots

Well.prototype.buildDots = function () {
  var well = this;
  well.dots = $("<div class='dots'></div>");
  $(".carousel_stage").children().each(function (i, o) {
    if (i % well.slidesPerDot == 0) {
      well.dots.append(well.dot(i, o));
    }
  });
  well.root.on("well:scrollTo", function (e, i) {
    well.activateDots(i);
  });
  well.root.append(well.dots);
  well.activateDots(well.currentItem);
  return well;
};

Well.prototype.activateDots = function (i) {
  var well = this;
  well.dots.find('.dot').removeClass('active').eq(Math.floor(i / well.slidesPerDot)).addClass('active');
};

Well.prototype.dot = function (i, o) {
  var well = this;
  return $("<div><div class='dot'></div></div>").on("click", function () {
    well.scrollTo(i);
  })
};