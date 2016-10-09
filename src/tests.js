var test = QUnit.test;
test("if loop is true then it loops", function (assert) {

  idora = new Idora($("<div><div /><div /><div /></div>"), {loop: true});

  assert.equal(idora.findSlideNum(-1), 2);
  assert.equal(idora.findSlideNum(0), 0);
  assert.equal(idora.findSlideNum(1), 1);
  assert.equal(idora.findSlideNum(2), 2);
  assert.equal(idora.findSlideNum(3), 0);
});

test("if loop is false then out of bounds slides stick at the ends", function (assert) {

  idora = new Idora($("<div><div /><div /><div /></div>"), {loop: false});

  assert.equal(idora.findSlideNum(0), 0);
  assert.equal(idora.findSlideNum(1), 1);
  assert.equal(idora.findSlideNum(2), 2);
  assert.equal(idora.findSlideNum(3), 2);
  assert.equal(idora.findSlideNum(4), 2);
  assert.equal(idora.findSlideNum(10), 2);
  assert.equal(idora.findSlideNum(-1), 0);
  assert.equal(idora.findSlideNum(-2), 0);
  assert.equal(idora.findSlideNum(-10), 0);
});

test("if loop is false then out of bounds slides stick at the ends", function (assert) {

  idora = new Idora($("<div><div /><div /><div /></div>"), {loop: false});

  assert.equal(idora.findSlideNum(0), 0);
  assert.equal(idora.findSlideNum(1), 1);
  assert.equal(idora.findSlideNum(2), 2);
  assert.equal(idora.findSlideNum(3), 2);
  assert.equal(idora.findSlideNum(4), 2);
  assert.equal(idora.findSlideNum(10), 2);
  assert.equal(idora.findSlideNum(-1), 0);
  assert.equal(idora.findSlideNum(-2), 0);
  assert.equal(idora.findSlideNum(-10), 0);
});