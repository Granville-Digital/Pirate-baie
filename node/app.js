var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent');
var shell = require('shelljs');
var SerialPort = require('serialport');
var port = new SerialPort('/dev/tty-usbserial1');
var players = [];
var start = 0;
var vent;
var maree;
const bateaux = [
	{
		id: 1,
		type: "Terre-Neuvier",
		pv: 100,
		cale: 4,
		atk: 40,
		steps: 4
	},
	{
		id: 2,
		type: "Bisquine",
		pv: 100,
		cale: 3,
		atk: 40,
		steps: 5
	},
	{
		id: 3,
		type: "Barque",
		pv: 85,
		cale: 4,
		atk: 40,
		steps: 4
	},
	{
		id: 4,
		type: "Goélette",
		pv: 100,
		cale: 3,
		atk: 60,
		steps: 4
	}
];
const ports = [
	{
		id: 1,
		nom: "Granville",
		coord_x: 10,
		coord_y: 4,
		bateaux: [
			{
				id: 1,
				type_id: 1,
				pv: bateaux[0].pv,
				coord_x: 10,
				coord_y: 4,
				respawn: 0
			},
			{
				id: 2,
				type_id: 1,
				pv: bateaux[0].pv,
				coord_x: 10,
				coord_y: 4,
				respawn: 1
			},
			{
				id: 3,
				type_id: 2,
				pv: bateaux[1].pv,
				coord_x: 10,
				coord_y: 4,
				respawn: 2
			},
		]
	},
	{
		id: 2,
		nom: "Avranches",
		coord_x: 16,
		coord_x: 13,
		bateaux: [
			{
				id: 1,
				type_id: 3,
				pv: bateaux[2].pv,
				coord_x: 16,
				coord_y: 13,
				respawn: 0
			},
			{
				id: 2,
				type_id: 3,
				pv: bateaux[2].pv,
				coord_x: 16,
				coord_y: 13,
				respawn: 1
			},
			{
				id: 3,
				type_id: 3,
				pv: bateaux[2].pv,
				coord_x: 16,
				coord_y: 13,
				respawn: 2
			},
			{
				id: 4,
				type_id: 3,
				pv: bateaux[2].pv,
				coord_x: 16,
				coord_y: 13,
				respawn: 3
			}
		]
	},
	{
		id: 3,
		nom: "Champeaux",
		coord_x: 12,
		coord_y: 9,
		bateaux: [
			{
				id: 1,
				type_id: 2,
				pv: bateaux[1].pv,
				coord_x: 12,
				coord_y: 9,
				respawn: 0
			},
			{
				id: 2,
				type_id: 4,
				pv: bateaux[3].pv,
				coord_x: 12,
				coord_y: 9,
				respawn: 1
			},
			{
				id: 3,
				type_id: 4,
				pv: bateaux[3].pv,
				coord_x: 12,
				coord_y: 9,
				respawn: 2
			}
		]
	},
	{
		id: 4,
		nom: "Cancale",
		coord_x: 0,
		coord_x: 12,
		bateaux: [
			{
				id: 1,
				type_id: 2,
				pv: bateaux[1].pv,
				coord_x: 0,
				coord_x: 12,
				respawn: 0
			},
			{
				id: 2,
				type_id: 2,
				pv: bateaux[1].pv,
				coord_x: 0,
				coord_x: 12,
				respawn: 1
			},
			{
				id: 3,
				type_id: 3,
				pv: bateaux[2].pv,
				coord_x: 0,
				coord_x: 12,
				respawn: 2
			}
		]
	},
	{
		id: 5,
		nom: "Mont Saint-Michel",
		coord_x: 10,
		coord_y: 14,
		bateaux: [
			{
				id: 1,
				type_id: 2,
				pv: bateaux[1].pv,
				coord_x: 10,
				coord_y: 14,
				respawn: 0
			},
			{
				id: 2,
				type_id: 4,
				pv: bateaux[3].pv,
				coord_x: 10,
				coord_y: 14,
				respawn: 1
			},
			{
				id: 3,
				type_id: 3,
				pv: bateaux[2].pv,
				coord_x: 10,
				coord_y: 14,
				respawn: 2
			}
		]
	}
];

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res){
	res.render('home.ejs', {players: players});
})
.use(function(req, res, next){
	res.redirect('/');
});

io.sockets.on('connection', function(socket){

	console.log('Nouveau participant');

	socket.on('nouveau_joueur', function(username){
		if (players.length == 5 || start == 1) {
			socket.emit('tooMuchPlayers');
		}
		else {
			socket.username = ent.encode(username);
			socket.id = players.length;
			var newPlayer = {
				id: socket.id,
				nom: socket.username
			};
			players.push(newPlayer);
			socket.emit('updatePlayers', players);
			socket.emit('id', socket.id);
			socket.broadcast.emit('updatePlayers', players);
		}
	});

	socket.on('player_ready', function(id){
		for (var i = 0, r = 0; i < players.length; i++) {
			if (players[i].id == id) {
				players[i].ready = true;
			}
			if (players[i].ready){
				r++;
			}
			if (r == players.length) {
				socket.emit('start_game');
				socket.broadcast.emit('start_game');
				socket.emit('assign_ports', ports);
				socket.broadcast.emit('assign_ports', ports);
				start_pirates();
				socket.emit('send_wind', vent);
				socket.broadcast.emit('send_wind', vent);
				start = 1;
			}
		}
		socket.broadcast.emit('updatePlayers', players);
	});

	socket.on('move_bateau', function(id, bateau_id, x, y){
		ports[id].bateaux[bateau_id].coord_x = x;
		ports[id].bateaux[bateau_id].coord_y = y;
	});

});

var tours = 0;

function start_pirates(){
	if (tours === 0) {
		vent = "se";
		maree = 0;
	} else if (tours === 1) {
		vent = "s";
		maree = 1;
	} else {
		var ventRand = Matho.random()*100;
		if (ventRand <= 16){
			vent = "n";
		} else if (ventRand > 16 && ventRand <= 32) {
			vent = "s";
		} else if (ventRand > 32 && ventRand <= 48) {
			vent = "nw";
		} else if (ventRand > 48 && ventRand <= 64) {
			vent = "sw";
		} else if (ventRand > 64 && ventRand <= 80) {
			vent = "ne";
		} else {
			vent = "se";
		}
		if (maree == 3) {
			maree--;
		}
		else {

		}
	}
}

server.listen(8080);
