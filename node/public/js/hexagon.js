// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

function HexagonGrid(canvasId, radius) {
    this.radius = radius;

    this.height = Math.sqrt(3) * radius;
    this.width = 2 * radius;
    this.side = (3 / 2) * radius;

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvasOriginX = 0;
    this.canvasOriginY = 0;

    this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
};

HexagonGrid.prototype.drawHexGrid = function (rows, cols, originX, originY, isDebug) {
    this.canvasOriginX = originX;
    this.canvasOriginY = originY;

    var currentHexX;
    var currentHexY;
    var debugText = "";

    var offsetColumn = false;

    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {

            if (!offsetColumn) {
                currentHexX = (col * this.side) + originX;
                currentHexY = (row * this.height) + originY;
            } else {
                currentHexX = col * this.side + originX;
                currentHexY = (row * this.height) + originY + (this.height * 0.5);
            }

            if (isDebug) {
                debugText = col + "," + row;
            }

            this.drawHex(currentHexX, currentHexY, "#ddd", debugText);
        }
        offsetColumn = !offsetColumn;
    }
};

HexagonGrid.prototype.drawHexAtColRow = function(column, row, color, debugText = column+","+row) {
    if (column >= 0 && column < 26 && row >= 0 && row < 21) {
      var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);
      var drawx = (column * this.side) + this.canvasOriginX;

      this.drawHex(drawx, drawy, color, debugText);
    }
};

HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText, debugTextColor = "#000") {
    this.context.strokeStyle = "#000";
    this.context.beginPath();
    this.context.moveTo(x0 + this.width - this.side, y0);
    this.context.lineTo(x0 + this.side, y0);
    this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
    this.context.lineTo(x0 + this.side, y0 + this.height);
    this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
    this.context.lineTo(x0, y0 + (this.height / 2));

    if (fillColor) {
        this.context.fillStyle = fillColor;
        this.context.fill();
    }

    this.context.closePath();
    this.context.stroke();

    if (debugText) {
        this.context.font = "8px";
        this.context.fillStyle = debugTextColor;
        this.context.fillText(debugText, x0 + (this.width / 2) - (this.width/4), y0 + (this.height - 5));
    }
};

//Recusivly step up to the body to calculate canvas offset.
HexagonGrid.prototype.getRelativeCanvasOffset = function() {
	var x = 0, y = 0;
	var layoutElement = this.canvas;
    if (layoutElement.offsetParent) {
        do {
            x += layoutElement.offsetLeft;
            y += layoutElement.offsetTop;
        } while (layoutElement = layoutElement.offsetParent);

        return { x: x, y: y };
    }
}

//Uses a grid overlay algorithm to determine hexagon location
//Left edge of grid has a test to acuratly determin correct hex
HexagonGrid.prototype.getSelectedTile = function(mouseX, mouseY) {

	var offSet = this.getRelativeCanvasOffset();

    mouseX -= offSet.x;
    mouseY -= offSet.y;

    var column = Math.floor((mouseX) / this.side);
    var row = Math.floor(
        column % 2 == 0
            ? Math.floor((mouseY) / this.height)
            : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);


    //Test if on left side of frame
    if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {


        //Now test which of the two triangles we are in
        //Top left triangle points
        var p1 = new Object();
        p1.x = column * this.side;
        p1.y = column % 2 == 0
            ? row * this.height
            : (row * this.height) + (this.height / 2);

        var p2 = new Object();
        p2.x = p1.x;
        p2.y = p1.y + (this.height / 2);

        var p3 = new Object();
        p3.x = p1.x + this.width - this.side;
        p3.y = p1.y;

        var mousePoint = new Object();
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;

        if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {
            column--;

            if (column % 2 != 0) {
                row--;
            }
        }

        //Bottom left triangle points
        var p4 = new Object();
        p4 = p2;

        var p5 = new Object();
        p5.x = p4.x;
        p5.y = p4.y + (this.height / 2);

        var p6 = new Object();
        p6.x = p5.x + (this.width - this.side);
        p6.y = p5.y;

        if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {
            column--;

            if (column % 2 == 0) {
                row++;
            }
        }
    }
    return  { row: row, column: column };
};


HexagonGrid.prototype.sign = function(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

//TODO: Replace with optimized barycentric coordinate method
HexagonGrid.prototype.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
    var b1, b2, b3;

    b1 = this.sign(pt, v1, v2) < 0.0;
    b2 = this.sign(pt, v2, v3) < 0.0;
    b3 = this.sign(pt, v3, v1) < 0.0;

    return ((b1 == b2) && (b2 == b3));
};

HexagonGrid.prototype.clickEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;

    var tile = this.getSelectedTile(localX, localY);
    for (var i = 0; i < player.port.bateaux.length; i++) {
      if (player.port.bateaux) {
        if (player.port.bateaux[i].coord_x == tile.column && player.port.bateaux[i].coord_y == tile.row && !player.port.bateaux[i].selected) {
          if (tile.column >= 0 && tile.column < 17 && tile.row >= 0 && tile.row < 14) {
            var drawy = tile.column % 2 == 0 ? (tile.row * this.height) + this.canvasOriginY + 6 : (tile.row * this.height) + this.canvasOriginY + 6 + (this.height / 2);
            var drawx = (tile.column * this.side) + this.canvasOriginX;
            player.port.bateaux[i].selected = true;

            console.log(tile);
            this.drawHex(drawx, drawy - 6, "rgba(0,0,110,1)", tile.column+","+tile.row, "#fff");
            switch (vent) {
              case "n":
              if (tile.column % 2 === 0) {
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 4, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
              }
              else {
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 4, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
              }

              break;
              case "s":
              if (tile.column % 2 === 0) {
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 4, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
              }
              else {
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 4, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 3, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
              }
              break;
              case "se":
              if (tile.column % 2 === 0) {
                if (!checkBoatMove({"x": tile.column - 1, "y": tile.row - 1})) this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 2, "y": tile.row - 1})) this.drawHexAtColRow(tile.column - 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 3, "y": tile.row - 2})) this.drawHexAtColRow(tile.column - 3, tile.row - 2, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 4, "y": tile.row - 2})) this.drawHexAtColRow(tile.column - 4, tile.row - 2, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 1, "y": tile.row})) this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 2, "y": tile.row})) this.drawHexAtColRow(tile.column - 2, tile.row, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 2, "y": tile.row + 1})) this.drawHexAtColRow(tile.column - 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column, "y": tile.row + 1})) this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column + 1, "y": tile.row - 1})) this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column, "y": tile.row - 1})) this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column, "y": tile.row - 2})) this.drawHexAtColRow(tile.column, tile.row - 2, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 1, "y": tile.row - 2})) this.drawHexAtColRow(tile.column - 1, tile.row - 2, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 3, "y": tile.row - 1})) this.drawHexAtColRow(tile.column - 3, tile.row - 1, "rgba(0, 255, 0, 1)");
                if (!checkBoatMove({"x": tile.column - 2, "y": tile.row - 2})) this.drawHexAtColRow(tile.column - 2, tile.row - 2, "rgba(0, 255, 0, 1)");
              }
              else {
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 3, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 4, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 3, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row - 2, "rgba(0, 255, 0, 1)");
              }
              break;
              case "sw":
              if (tile.column % 2 === 0) {
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 4, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 2, "rgba(0, 255, 0, 1)");
              }
              else {
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 4, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 2, "rgba(0, 255, 0, 1)");
              }
              break;
              case "ne":
              if (tile.column % 2 === 0) {
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 3, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 4, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 3, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
              }
              else {
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 3, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 4, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 3, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 2, tile.row + 2, "rgba(0, 255, 0, 1)");
              }
              break;
              case "nw":
              if (tile.column % 2 === 0) {
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 4, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
              }
              else {
                this.drawHexAtColRow(tile.column + 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 4, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column - 1, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row - 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 1, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column, tile.row + 2, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 3, tile.row + 1, "rgba(0, 255, 0, 1)");
                this.drawHexAtColRow(tile.column + 2, tile.row + 2, "rgba(0, 255, 0, 1)");
              }
              break;
            default:
              break;
            }
          }
        } else if (player.port.bateaux[i].coord_x == tile.column && player.port.bateaux[i].coord_y == tile.row && player.port.bateaux[i].selected) {
          player.port.bateaux[i].selected = !player.port.bateaux[i].selected;
          drawSea();
        }
      }
    }
};

function checkBoatMove(obj){
  for (var i = 0; i < gameData.grid.terre.length; i++) {
    if (gameData.grid.terre[i].x == obj.x && gameData.grid.terre[i].y == obj.y) {
      return true;
    }
  }
  return false;
}
