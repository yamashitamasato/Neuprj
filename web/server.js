var fs = require("fs");
var server = require("http").createServer(function(req, res) {
     res.writeHead(200, {"Content-Type":"text/html"});
     if(req.url=='/' || req.url=='/favicon.ico'){
       var output = fs.readFileSync("./index.html", "utf-8");
     }else if(req.url=='/Recruitment'||req.url=='/favicon.ico'){
       var output = fs.readFileSync("./Recruitment.html", "utf-8");
     }else if(req.url=='/Wait'||req.url=='/favicon.ico'){
       var output = fs.readFileSync("./wait.html", "utf-8");
     }else if(req.url=='/Game'||req.url=='/favicon.ico'){
       var output = fs.readFileSync("./game.html", "utf-8");
     }
     res.end(output);
}).listen(8080);
var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};
var usercount=0;


var cardkind=[['1','2','3','4','5','6','7','8','9'],['10'],['50','-1'],['-10'],['101']]
var cardnumber=[3,6,2,4,5]
var cardlist=[]
var cardsum=0;
for (  var i = 0;  i < cardkind.length;  i++  ) {
  for (var j=0; j < cardkind[i].length;j++){
    cardlist=cardlist.concat(Array(cardnumber[i]).fill(cardkind[i][j]));
  }
}




// 2.イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  socket.on("connected", function (name) {
    var msg = name + "が入室しました";
    userHash[socket.id] = name;
    usercount=usercount+1;
    io.sockets.emit("publish", {value: msg});
    io.sockets.emit("updateuser",{value: usercount});
  });

  // メッセージ送信カスタムイベント
  socket.on("publish", function (data) {
    io.sockets.emit("publish", {value:data.value});
  });


  socket.on("jump_to_start",function(data){
    io.sockets.emit('jump');
  });
  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  socket.on("disconnect", function () {
    if (userHash[socket.id]) {
      var msg = userHash[socket.id] + "が退出しました";
      usercount=usercount-1;
      delete userHash[socket.id];
      io.sockets.emit("publish", {value: msg});
      io.sockets.emit("updateuser",{value: usercount});
    }
  });
  socket.on("submitcard",function(card){
    if(card=='101'){
      cardsum=Number(card);
    }else{
      cardsum=cardsum+Number(card);
    }
    if(cardsum<=101){
      io.sockets.emit("cardupdate",{value:cardsum});
    }else{
      io.sockets.emit("Gameover");
    }
  });
});
