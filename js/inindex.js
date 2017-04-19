var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;

var img = document.querySelector('img');

window.addEventListener('mousemove', function(e){
  var x = e.pageX;
  var y = e.pageY;
  ctx.drawImage(img, x - 370, y - 15);
});