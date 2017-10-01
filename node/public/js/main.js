var player = {};
var vent;
var maree;
var socket = io.connect('http://localhost:8080');
var gameData;

$.ajax({
  url: '/data.json',
  type: 'GET',
  dataType: 'json'
})
.done(function(data) {
  gameData = data;
  console.log(gameData);
})
.fail(function() {
  console.log("error");
})
.always(function() {
  console.log("complete");
});


if (!player.id) {
  $("#jeu").hide();
}

socket.on('id', function(id){
  player.id = id;
  $("#jeu").show('400');
  drawSea();
  $("#playerScore").html(player.username+'<strong class="pull-right"><span id="score">0</span> <span class="fa fa-diamond"></span></span>');
});

socket.on('updatePlayers', function(players){
  $('#playersList li').remove();
  for (var i = 0, l = players.length; i < l; i++) {
    $('#playersList').append('<li class="list-group-item">'+players[i].nom+(players[i].id == player.id && !players[i].ready ? '<button class="btn btn-success btn-xs pull-right" id="playerReady"><span class="fa fa-thumb-up"></span> Prêt !</button>' : (players[i].ready ? '<span class="pull-right text-success">Prêt !</span>' : ''))+'</li>');
  }
});

socket.on('tooMuchPlayers', function(){
  console.log("Il y a déjà trop de joueurs !");
});

socket.on('assign_ports', function(ports){
  player.port = ports[player.id];
  for (var i = 0; i < gameData.ports.granville.bateaux.length; i++) {
    $("#playerBateaux").append(`
        <div class="col-md-`+(12 / gameData.ports.granville.bateaux.length)+`">
          <div class="panel panel-info">
            <div class="panel-heading">
              <h4 class="panel-title text-center">`+gameData.ports.granville.bateaux[i].nom+`</h4>
            </div>
            <div class="panel-body">
              <p>`+gameData.ports.granville.bateaux[i].voile+`<span class="fa fa-arrows"></span></p>
              <br>
              <p>1/`+gameData.ports.granville.bateaux[i].cale+` <span class="fa fa-truck"></span></p>
              <br>
              <p>`+gameData.ports.granville.bateaux[i].canons+` <span class="fa fa-bolt"></span></p>
              <br>
              <p>`+gameData.ports.granville.bateaux[i].pv+` <span class="fa fa-heart"></span></p>
            </div>
          </div>
        </div>
      `);
  }
});

socket.on('send_wind', function(wind){
  vent = wind;
  $("#boussoleVent").html('<span class="fa fa-compass"></span> '+vent.toUpperCase());
  console.log(vent);
});

socket.on('start_game', function(){
  alert("Go mamène !!!");
});

$("body").on('click', '#playerReady', function(event) {
  event.preventDefault();
  socket.emit('player_ready', player.id);
  $(this).hide('400');
});

$("#add_user").submit(function(event) {
  event.preventDefault();

  var username = $("#username").val();
  if (username != '') {
    socket.emit('nouveau_joueur', username);
    $("#username").val('');
    $("#add_user").hide('400');
    player.username = username;
  }
});

$("body").on('click', '#mareeHaute', function(event) {
  event.preventDefault();
  socket.emit('mareeHaute');
});
$("body").on('click', '#mareeDesc', function(event) {
  event.preventDefault();
  socket.emit('mareeDesc');
});
$("body").on('click', '#mareeBasse', function(event) {
  event.preventDefault();
  socket.emit('mareeBasse');
});
$("body").on('click', '#mareeMont', function(event) {
  event.preventDefault();
  socket.emit('mareeMont');
});

var hexagonGrid = new HexagonGrid("hexCanvas", 25);
// Grille entière
hexagonGrid.drawHexGrid(15, 17, 25, 25, true);
function drawSea(){
  for (var i = 0; i < gameData.grid.terre.length; i++) {
    hexagonGrid.drawHexAtColRow(gameData.grid.terre[i].x, gameData.grid.terre[i].y, "#669900");
  }
  for (var i = 0; i < gameData.grid.mer_haute.length; i++) {
    hexagonGrid.drawHexAtColRow(gameData.grid.mer_haute[i].x, gameData.grid.mer_haute[i].y, "rgba(0,153,204,0.6)");
  }

// Ports
hexagonGrid.drawHexAtColRow(2, 2, "#cc33ff", "✙ CH");
hexagonGrid.drawHexAtColRow(10, 4, "#0099cc", "✠ GRVL");
hexagonGrid.drawHexAtColRow(0, 12, "#33cc33", "✴ CNCL");
hexagonGrid.drawHexAtColRow(10, 14, "#ffff00", "✞ MSM");
hexagonGrid.drawHexAtColRow(16, 13, "#0066ff", "✽ AVR");
hexagonGrid.drawHexAtColRow(12, 9, "#ff5050", "❖ CHMP");
// Terre
for (var i = 0; i < 8; i++) {
  hexagonGrid.drawHexAtColRow(11, i, "#669900");
}
for (var i = 0; i < 9; i++) {
  hexagonGrid.drawHexAtColRow(12, i, "#669900");
}
for (var i = 0; i < 11; i++) {
  hexagonGrid.drawHexAtColRow(13, i, "#669900");
}
for (var i = 0; i < 12; i++) {
  hexagonGrid.drawHexAtColRow(14, i, "#669900");
}
for (var i = 0; i < 12; i++) {
  hexagonGrid.drawHexAtColRow(15, i, "#669900");
}
for (var i = 0; i < 13; i++) {
  hexagonGrid.drawHexAtColRow(16, i, "#669900");
}
for (var i = 0; i < 10; i++) {
  hexagonGrid.drawHexAtColRow(i, 14, "#669900");
}
for (var i = 11; i < 17; i++) {
  hexagonGrid.drawHexAtColRow(i, 14, "#669900");
}
hexagonGrid.drawHexAtColRow(0, 11, "#669900");
hexagonGrid.drawHexAtColRow(1, 2, "#669900");
hexagonGrid.drawHexAtColRow(3, 2, "#669900");
hexagonGrid.drawHexAtColRow(3, 1, "#669900");
  // Mer 0
  hexagonGrid.drawHexAtColRow(0, 10, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(0, 13, "rgba(0,153,204,0.6)");
  for (var i = 10; i < 14; i++) {
    hexagonGrid.drawHexAtColRow(1, i, "rgba(0,153,204,0.6)");
  }
  for (var i = 2; i < 16; i++) {
    hexagonGrid.drawHexAtColRow(i, 13, "rgba(0,153,204,0.6)");
  }
  hexagonGrid.drawHexAtColRow(15, 12, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(14, 12, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(13, 11, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(12, 11, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(12, 10, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(11, 9, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(11, 8, "rgba(0,153,204,0.6)");
  for (var i = 0; i < 4; i++) {
    hexagonGrid.drawHexAtColRow(10, i, "rgba(0,153,204,0.6)");
  }
  for (var i = 5; i < 9; i++) {
    hexagonGrid.drawHexAtColRow(10, i, "rgba(0,153,204,0.6)");
  }
  hexagonGrid.drawHexAtColRow(9, 3, "rgba(0,153,204,0.6)");
  hexagonGrid.drawHexAtColRow(9, 4, "rgba(0,153,204,0.6)");
  // Mer 1
  hexagonGrid.drawHexAtColRow(0, 8, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(0, 9, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(1, 8, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(1, 9, "rgba(0,115,153,0.75)");
  for (var i = 9; i < 13; i++) {
    hexagonGrid.drawHexAtColRow(2, i, "rgba(0,115,153,0.75)");
  }
  for (var i = 9; i < 13; i++) {
    hexagonGrid.drawHexAtColRow(3, i, "rgba(0,115,153,0.75)");
  }
  hexagonGrid.drawHexAtColRow(4, 11, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(4, 12, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(5, 11, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(5, 12, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(6, 11, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(6, 12, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(7, 11, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(7, 12, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(8, 11, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(8, 12, "rgba(0,115,153,0.75)");
  for (var i = 0; i < 3; i++) {
    hexagonGrid.drawHexAtColRow(9, i, "rgba(0,115,153,0.75)");
  }
  for (var i = 5; i < 13; i++) {
    hexagonGrid.drawHexAtColRow(9, i, "rgba(0,115,153,0.75)");
  }
  for (var i = 0; i < 10; i++) {
    hexagonGrid.drawHexAtColRow(8, i, "rgba(0,115,153,0.75)");
  }
  for (var i = 2; i < 6; i++) {
    hexagonGrid.drawHexAtColRow(7, i, "rgba(0,115,153,0.75)");
  }
  for (var i = 9; i < 13; i++) {
    hexagonGrid.drawHexAtColRow(10, i, "rgba(0,115,153,0.75)");
  }
  for (var i = 10; i < 13; i++) {
    hexagonGrid.drawHexAtColRow(11, i, "rgba(0,115,153,0.75)");
  }
  hexagonGrid.drawHexAtColRow(12, 12, "rgba(0,115,153,0.75)");
  hexagonGrid.drawHexAtColRow(13, 12, "rgba(0,115,153,0.75)");
  // Mer 2
  for (var i = 0; i < 8; i++) {
    hexagonGrid.drawHexAtColRow(0, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 3; i < 8; i++) {
    hexagonGrid.drawHexAtColRow(1, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 3; i < 9; i++) {
    hexagonGrid.drawHexAtColRow(2, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 3; i < 9; i++) {
    hexagonGrid.drawHexAtColRow(3, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 0; i < 11; i++) {
    hexagonGrid.drawHexAtColRow(4, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 0; i < 11; i++) {
    hexagonGrid.drawHexAtColRow(5, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 0; i < 11; i++) {
    hexagonGrid.drawHexAtColRow(6, i, "rgba(0,77,102,0.75)");
  }
  for (var i = 6; i < 11; i++) {
    hexagonGrid.drawHexAtColRow(7, i, "rgba(0,77,102,0.75)");
  }
  hexagonGrid.drawHexAtColRow(8, 10, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(7, 0, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(7, 1, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(3, 0, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(2, 0, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(2, 1, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(1, 0, "rgba(0,77,102,0.75)");
  hexagonGrid.drawHexAtColRow(1, 1, "rgba(0,77,102,0.75)");

}
