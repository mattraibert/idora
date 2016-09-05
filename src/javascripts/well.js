$(document).ready(function () {
  $("#carousel").well();
});

jQuery.fn.well = function () {
  var well = new Well(this).setupKeyboard().buildStage().buildArrows().buildDots();
  return this;
};

function Well(root) {
  this.root = root;
  this.currentItem = 0;
}

Well.prototype.buildStage = function () {
  this.root.wrapInner("<div class='carousel_stage'></div>").wrapInner("<div class='carousel_inner'></div>");
  return this;
};

Well.prototype.scrollNext = function () {
  this.scrollBy(1);
};

Well.prototype.scrollPrev = function () {
  this.scrollBy(-1);
};

Well.prototype.scrollBy = function (n) {
  this.scrollTo(this.currentItem + n);
};

Well.prototype.numItems = function () {
  return $(".carousel_stage").children().length;
};

Well.prototype.scrollTo = function (i) {
  var stage = $(".carousel_stage");
  var target = this.findSlideNum(i);
  var left = stage.find("div:nth-child(" + target + ")").position().left;
  stage.animate({'left': -1 * left}, {queue: false, duration: 300});
  this.currentItem = i;
};

Well.prototype.findSlideNum = function (i) {
  var numItems = this.numItems();
  var ret;
  if (i < 0) {
    ret = numItems - (Math.abs(i + 1) % numItems);
  } else {
    ret = i % numItems + 1;
  }
  return ret;
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
  return this;
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
  this.root.append(nav);
  return this;
};

//Dots

Well.prototype.buildDots = function () {
  var dots = $("<div class='dots'></div>");
  var well = this;
  $(".carousel_stage").children().each(function (i, o) {
    if (i % 2 == 0) {
      dots.append(well.dot(i, o));
    }
  });
  this.root.append(dots);
  return this;
};

Well.prototype.dot = function (i, o) {
  var well = this;
  return $("<div><div class='dot'></div></div>").on("click", function () {
    well.scrollTo(i);
  })
};