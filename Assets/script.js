$(document).ready(function () {
  var todayDiv = $("#today");
  var fiveDaysDiv = $("#forecast");
  var apiKey = "f6bea1b827dd03c7a9837bca6fe6d8dc";
  var storage = JSON.parse(localStorage.getItem("history")) || [];

  //click search button, pass search term to functions, save term in local storage
  $("#search-button").on("click", function (e) {
    e.preventDefault();
    var city = $("#search-value").val(); //grab value
    $("#search-value").val(""); //empty search input
    getWeather(city); //call get weather function
    //if city is in localstorage, do nothing, otherwise push
    if (storage.indexOf(city) === -1) {
      storage.push(city);
    }
    localStorage.setItem("history", JSON.stringify(storage));
    diplayRecent(storage); //display list of cities from local storage
  });

  //if click on recent search city, fetch data fro that city
  $("body").on("click", ".recent", function () {
    var city = $(this).attr("data-name");
    getWeather(city);
  });

  //fetch data from api using fetch method
  function getWeather(searchValue) {
    console.log("fired", searchValue);
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${searchValue}&units=metric&appid=${apiKey}`;

    fetch(url)
      .then((response) => response.json())

      .then(function (response) {
        //pass lat and lon to uv index function
        getUVIndex(response.city.coord.lat, response.city.coord.lon);

        //empty containers before displaying data
        todayDiv.html("");
        fiveDaysDiv.html("");
        console.log(response);
        //pass data to display functions
        displayOneDay(response);
        fiveDays(response);
      });
  }

  //get uv index
  function getUVIndex(lat, lon) {
    const url = `http://api.openweathermap.org/data/2.5/uvi?&lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(url)
      .then((response) => response.json())

      .then(function (response) {
        uvIndexBtn(response.value);
      });
  }

  //create different color class for uv index button based on value
  function uvIndexBtn(uvIndex) {
    var btnClass = "";
    if (uvIndex < 3) {
      btnClass = "success";
    } else if (uvIndex < 7) {
      btnClass = "warning";
    } else {
      btnClass = "danger";
    }
    var btnGroup = $("<div>").addClass("btn-group");
    var txt = $("<button>")
      .addClass(`btn btn-outline-${btnClass}`)
      .text("UV Index: ");
    var val = $("<button>").addClass(`btn btn-${btnClass}`).text(uvIndex);
    btnGroup.append(txt);
    btnGroup.append(val);
    $("body").find("#one-day .card-body .card-text").append(btnGroup);
  }

  //main container
  function displayOneDay(data) {
    var cityCard = $("<div>").addClass("card").attr("id", "one-day");
    var cardHeader = $("<div>").addClass("card-header bg-white");
    var cardTitle = $("<div>").addClass("card-title");
    var cardBody = $("<div>").addClass("card-body");
    var cardText = $("<div>").addClass("card-text");
    var infoList = $("<ul>").addClass("list-unstyled");

    var cityName = data.city.name;
    var countryName = data.city.country;
    var todayDate = data.list[0].dt_txt.split(" ")[0].toLocaleString();
    var icon = `<img src="http://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png">`;
    var temperature = data.list[0].main.temp;
    var humidity = data.list[0].main.humidity;
    var windSpeed = data.list[0].wind.speed;
    var today = dayjs();

    cardHeader.html(`<h1 class="text-custom">Weather Dashboard</h1>`);

    cardTitle.html(`
				<h3>${cityName}, ${countryName}</h3>
				<h5>${today.format("dddd, MMMM D YYYY")}</h5>
				<div class="d-flex align-items-center justify-content-center"> ${icon}<h1> ${temperature} </h1><span class="mb-4 font-weight-bold">°C</span> </div>
			`);

    infoList.html(`
        <li>Humidity: <b>${humidity} %</b></li>
        <li>Wind speed: <b>${windSpeed} meter/sec</b></li>
		`);

    cityCard.append(cardHeader);
    cityCard.append(cardBody);
    cardBody.append(cardTitle);
    cardBody.append(cardText);
    cardText.append(infoList);
    todayDiv.append(cityCard);
  }

  //display list of recently searched cities stored in local storage
  function diplayRecent(arr) {
    var listGroup = $(".history");
    listGroup.html("");

    for (const element of arr) {
      var listGroupItem = $("<li>");
      var linkName = $("<a>");
      listGroupItem.addClass("list-group-item text-capitalize");
      linkName.attr("href", "#");
      linkName.addClass("recent");
      linkName.attr("data-name", element);
      linkName.text(element);
      listGroup.append(listGroupItem);
      listGroupItem.append(linkName);
    }
  }

  //display 5 days data
  function fiveDays(data) {
    var dataRow = $("<div>");
    var title = $("<h3>").addClass("text-light text-center");

    dataRow.addClass("row my-3 justify-content-between");

    for (var i = 0; i < data.list.length; i++) {
      var dataCol = $("<div>");
      dataCol.addClass(
        "col-md-2 five-days mx-2 rounded text-dark p-3 text-center border"
      );
      var icon = `<img src="http://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png">`;
      if (data.list[i].dt_txt.includes("18:00:00")) {
        var date = data.list[i].dt_txt;
        dataCol.html(`
				
          <h6>${dayjs(date).format("ddd, MMM D")}</h6>
					<div class="m-0">${icon}</div>
					<ul class="list-unstyled m-0">
					<li>Temp: <b>${data.list[i].main.temp} °C</b></li>
          <li>Humidity:<b> ${data.list[i].main.humidity} %</b></li>
          <li>Wind speed:<b> ${data.list[i].wind.speed} m/s</b></li>
					</ul>
          
        `);

        //console.log(data.list[i]);
        dataRow.append(dataCol);
      }
    }

    title.text("5-Day Forecast");
    fiveDaysDiv.append(title);
    fiveDaysDiv.append(dataRow);
  }

  diplayRecent(storage);
});
