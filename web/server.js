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
  socket.on("recpage",function(data){
    console.log('a');
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
});
