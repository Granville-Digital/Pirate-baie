<?php
session_start();
if (isset($_POST['username']) && !empty($_POST['username'])) {
  $_SESSION['connected'] = 1;
  $_SESSION['username'] = trim(htmlspecialchars($_POST['username']));
}
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Pirate Baie</title>
    <link rel="stylesheet" href="https://bootswatch.com/superhero/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/styles.css">
    <script type="text/javascript" src="js/hexagon.js"></script>
  </head>
  <body>
    <div class="container">
      <h1 class="pahe-header">Pirate Baie</h1>
      <?php
      if (isset($_SESSION['connected'])) {
        ?>
      <div class="row">
        <div class="col-xs-12 col-md-4">
          <h2 class="page-header"><?= $_SESSION['username']; ?></h2>
          25 <span class="fa fa-connectdevelop"></span>
        </div>
        <div class="clearfix visible-xs-block"></div>
        <div class="col-xs-12 col-md-4">
          <ul class="list-group">
            <li class="list-group-item">
              <strong><span class="fa fa-ship"></span> Bateau 1</strong>
              <hr>
              <div class="row">
                <div class="col-xs-6">
                  <p>4 <span class="fa fa-arrows"></span></p>
                  <br>
                  <p>1/3 <span class="fa fa-truck"></span></p>
                  <br>
                  <p>40 <span class="fa fa-bolt"></span></p>
                  <br>
                  <p>95 <span class="fa fa-heart"></span></p>
                </div>
                <div class="col-xs-6">
                  <div class="panel panel-warning">
                    <div class="panel-heading">
                      <h3 class="panel-title">Débris <span class="text-right">0 <span class="fa fa-connectdevelop"></span></span></h3>
                    </div>
                  </div>
                  <div class="panel panel-success">
                    <div class="panel-heading">
                      <h3 class="panel-title">|</h3>
                    </div>
                  </div>
                  <div class="panel panel-success">
                    <div class="panel-heading">
                      <h3 class="panel-title">|</h3>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li class="list-group-item">
              <strong><span class="fa fa-ship"></span> Bateau 2</strong>
              <hr>
              <div class="row">
                <div class="col-xs-6">
                  <p>4 <span class="fa fa-arrows"></span></p>
                  <br>
                  <p>2/3 <span class="fa fa-truck"></span></p>
                  <br>
                  <p>40 <span class="fa fa-bolt"></span></p>
                  <br>
                  <p>60 <span class="fa fa-heart"></span></p>
                </div>
                <div class="col-xs-6">
                  <div class="panel panel-info">
                    <div class="panel-heading">
                      <h3 class="panel-title">Poissons <span class="text-right">1 <span class="fa fa-connectdevelop"></span></span></h3>
                    </div>
                  </div>
                  <div class="panel panel-info">
                    <div class="panel-heading">
                      <h3 class="panel-title">Trésor <span class="text-right">5 <span class="fa fa-connectdevelop"></span></span></h3>
                    </div>
                  </div>
                  <div class="panel panel-success">
                    <div class="panel-heading">
                      <h3 class="panel-title">|</h3>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li class="list-group-item">
              <strong class="text-danger"><span class="fa fa-ship"></span> Bateau 3</strong>
              <hr>
              <div class="row">
                <div class="col-xs-6">
                  <p>4 <span class="fa fa-arrows"></span></p>
                  <br>
                  <p>0/3 <span class="fa fa-truck"></span></p>
                  <br>
                  <p>40 <span class="fa fa-bolt"></span></p>
                  <br>
                  <p>100 <span class="fa fa-heart"></span></p>
                </div>
                <div class="col-xs-6">
                  <div class="panel panel-danger">
                    <div class="panel-heading">
                      <h3 class="panel-title">Piège <span class="fa fa-ban"></span></h3>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="clearfix visible-xs-block"></div>
        <div class="col-xs-12 col-md-4">
          <img src="img/yellow_grid_map.png" alt="Carte" class="img-responsive">
        </div>
        <div class="clearfix visible-xs-block"></div>
      </div>
      <div id="map">
        <canvas id="hexCanvas" width="1200" height="1000"></canvas>
      </div>
      <a href="logout.php" title="Quitter la partie" class="btn btn-danger"><span class="fa fa-times"></span> Quitter la partie</a>
      <?php
    }
    else {
      ?>
      <form class="" action="index.php" method="post">
        <div class="form-group">
          <label for="username">Pseudo</label>
          <input type="text" class="form-control" name="username">
        </div>
        <button class="btn btn-success" type="submit"><span class="fa fa-check-circle-o"></span> Go !</button>
      </form>
      <?php
    }
    ?>
    </div>
    <script type="text/javascript">
      var hexagonGrid = new HexagonGrid("hexCanvas", 25);
      hexagonGrid.drawHexGrid(21, 26, 25, 25, true);
      hexagonGrid.drawHexAtColRow(1, 2, "#ff0000");
    </script>
  </body>
</html>
