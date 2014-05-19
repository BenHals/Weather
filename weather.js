
		var W = window.innerWidth, H = window.innerHeight;

	var cloudArray = new Array();
	var rainDrops = new Array();

	var lightCloud = new Image();
	var heavyCloud = new Image();
	var rain = new Image();
	var snow = new Image();

	var currentInterval = 0;
	lightCloud.src = 'cloud2.png';
	heavyCloud.src = 'cloud2Rain.png';
	rain.src = 'rain.png';
	//var canvas = document.getElementById("canvas");
	var ctx = document.getCSSCanvasContext("2d", "mybackground", W, H);
	//var ctx = canvas.getContext("2d");
	var imageObj = new Image();
	imageObj.src = 'brushed_alu_@2X.png'
	imageObj.onload = function(){
		ctx.drawImage(imageObj,0,0,W,H);
	}
	document.onkeypress = function(e){
		e =e || window.event;
		if(e.keyCode == 119){
			ctx.fillStyle = "rgb(10,200,99)";
			ctx.fillRect(0,0,100,250);
		}
	}


function handleClick(){
	clearInterval(currentInterval);
	var data = document.getElementById("cityInput").value;
	$.getJSON( "basic.py?cityInput="+data, function (response_text){
		var cityName = response_text.name;
		var country = response_text.sys.country;
		var weather = response_text.weather[0].main;
		var description = response_text.weather[0].description;
		var temperature = parseFloat(response_text.main.temp) - 275.15;
		var humidity = response_text.main.humidity;
		var windSpeed = response_text.wind.speed;
		var windDirection = response_text.wind.deg;
		var cloudnum = response_text.clouds.all;
		var weatherId = parseInt(response_text.weather[0].id);
		var sunrise = new Date(response_text.sys.sunrise * 1000);
		var current = new Date(response_text.dt * 1000);
		var currentTime = ((response_text.dt  - response_text.sys.sunrise ) % 86400 )/60;
		var timeText = 'Past'
		if(currentTime < 0){
			currentTime = currentTime * -1;
			timeText = 'Before'
		}
		var timeOpacity = ((response_text.dt - response_text.sys.sunrise) % 86400) / (response_text.sys.sunset - response_text.sys.sunrise);
		$("#header").html(cityName + "-"+ country);
		$("#Main").html("<p> At "+Math.floor(currentTime/60)+":"+ Math.floor(currentTime%60) +  " " + timeText  + " Sunrise " + "</p>" + "<p>" + weather+ " - " + description + "</p>" +"<p>" + temperature.toFixed(2)+ " degrees celcius - " + humidity + "% Humidity</p>" + "<p>Wind Speed: " + windSpeed+ " kilometers/hour - bearing " + windDirection + " degrees</p>");
		drawSky(weatherId);
		clouds(cloudnum,weatherId);
		if(weatherId < 700){
			Rain(weatherId);
		}
		currentInterval = setInterval(function(){
		updateCanvas(weatherId, parseFloat(windSpeed), timeOpacity);
		},50);
	});

	event.preventDefault();
	return false;
}

function drawSky(weatherId){
		var clearSky = "rgb(89,235,255)";
		var thunderSky = "rgb(80,80,80)";
		var rainSky = "rgb(110,110,125)";
		var drizzleSky = "rgb(170,170,180)";
		var snowSky = "rgb(150,150,160)";
		var cloudSky = "rgb(210,230,250)";
		if(weatherId-250 <= 0)
			ctx.fillStyle= thunderSky;
		else if(weatherId-350 <= 0)
			ctx.fillStyle= drizzleSky;
		else if(weatherId-550 <= 0)
			ctx.fillStyle= rainSky;
		else if(weatherId-650 <= 0)
			ctx.fillStyle= snowSky;
		else if(weatherId-850 <= 0)
			ctx.fillStyle= cloudSky;

		if(weatherId == 800)
			ctx.fillStyle = clearSky;

		ctx.fillRect(0,0,W,H);
}
function clouds(amount, weather){
	// var cloudImage = new Image();
	// clouds = [];
	// if(weather>=800){
	// 	cloudImage.src = 'Clear-Cloud.png';
	// }
	// else{
	// 	cloudImage.src = 'Rain-Cloud.png';
	//}
	//cloudImage.onload = function(){
		for(var i = 0; i<amount; i++){
			var X = Math.floor(Math.random() * W) + 1;
			var Y = Math.floor(Math.random() * H) + 1;
			cloudArray.push([X,Y]);
			//ctx.drawImage(cloudImage,X, Y,100,75 );
		}
	//}
}

function Rain(weather){
	var amount = weather %100 +10
	// alert(amount);
	// var rainImage = new Image();
	// rainDrops = [];
	// if(weather < 600){
	// 	rainImage.src = 'rain.png';
	// }
	// else{
	// 	rainImage.src = 'snow.png';
	// }
	// rainImage.onload = function(){
		for(var i = 0; i<amount; i++){
			var X = Math.floor(Math.random() * W) + 1;
			var Y = Math.floor(Math.random() * H) + 1;
			rainDrops.push([X,Y]);
			//ctx.drawImage(rainImage, X, Y,10,20 );
		}
	//}
}

function updateCanvas(weather, windSpeed, timeOpacity){
	if(timeOpacity > 1){
		timeOpacity = 1;
	}
	var nightOpacity = 0;
	var morningOpacity = 0;
	if(timeOpacity < 0.3){
		morningOpacity = 0.3 - (timeOpacity);
	}
	if(timeOpacity > 0.8){
		nightOpacity = (timeOpacity-0.8)*3;
	}
	drawSky(weather);
	var LCloudArray = cloudArray;
	var LRainArray = rainDrops;
	var cloudImage = new Image();
	if(weather>=800){
		cloudImage  = lightCloud;
	}
	else{
		cloudImage = heavyCloud;
	}
	//cloudImage.onload = function(){
		for(var i = 0; i<cloudArray.length; i++){
			cloudArray[i][0] = (((cloudArray[i][0] -windSpeed)+100 % (W+100))+(W+100))%(W+100)-100;
			ctx.drawImage(cloudImage,cloudArray[i][0], cloudArray[i][1],100,75 );
		}
	//}

	var rainImage = new Image();
	if(weather < 600){
		rainImage = rain;
	}
	else{
		rainImage = snow;
	}
	//rainImage.onload = function(){
		for(var i = 0; i<rainDrops.length; i++){
			rainDrops[i][0] = (((rainDrops[i][0] -windSpeed) % W)+W)%W;
			rainDrops[i][1] = (rainDrops[i][1] +windSpeed) % H;
			ctx.drawImage(rainImage, rainDrops[i][0], rainDrops[i][1],10,20 );
		}
	//}

	ctx.fillStyle = 'rgba(235,200,0,' + morningOpacity +')';
	ctx.fillRect(0,0,W,H);

	ctx.fillStyle = 'rgba(26,39,102,' + nightOpacity +')';
	ctx.fillRect(0,0,W,H);
}