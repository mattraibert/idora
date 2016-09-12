if (typeof jQuery !== 'undefined') {
  framework = jQuery;
} else {
  framework = $;
}
if (typeof framework !== 'undefined') {
  var idora;
  framework.fn.idora = function (opts) {

    idora = new Idora(this, opts);
    return this;
  };
  framework.fn.idora.destroy = function () {
    idora.destroy();
  };

} else {
  console.error("no jQuery style plugin loaded; Idora may not work.");
}
