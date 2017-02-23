$(function() {
	var dataset = [];
		//city, state, 2015_murders, 2016_murders, change, latitude, longitude
	//MAP VARS BEGIN
	var murders_six = [];
	var murders_five = [];
	var changes = [];

	var width = 960;
	var height = 600;

	var map = d3.select("#map").append("svg")
	    .attr("width", width)
	    .attr("height", height);

    var tooltip = d3.select("body").append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);

    var projection = d3.geoAlbersUsa()
	   .translate([width/2, height/2])    
	   .scale([1000]);          
        
	var path = d3.geoPath(projection);

	var kScale = d3.scaleLinear().domain([0,400]).range([5,25]);
	var changeScale = d3.scaleLinear().domain([0,125]).range([5,25]);
	//MAP VARS END

	//BAR GRAPH VARS BEGIN
	var x = d3.scaleLinear();
	// .domain([0, dod3.max(data)])
 //    .range([0, 420]);


	//BAR GRAPH VARS END


	d3.queue()
	    .defer(d3.json, "us.json")
	    .defer(d3.csv, "city_murder.csv")
	    .await(ready);

	function ready(error, us, murder) {

  		if (error) throw error;



  		//sets murder vars to be numbers
  		for (var i = 0; i < murder.length; i++) {
  			murder[i].latitude = +murder[i].latitude;
  			murder[i].longitude = +murder[i].longitude;
  			murder[i].change = +murder[i].change;
  			murder[i]["2016_murders"] = +murder[i]["2016_murders"];
  			murder[i]["2015_murders"] = +murder[i]["2015_murders"];
  			murders_six.push(murder[i]["2016_murders"]);
  			murders_five.push(murder[i]["2015_murders"]);
  			changes.push(murder[i]["change"]);
  			dataset[i] = murder[i];
  		}

  		dataset.sort(function(a, b){return b["2015_murders"]-a["2015_murders"]});
  		  		console.log(dataset);

  		//appends the shape objects
		map.append("g")
	      	.attr("class", "states")
	    	.selectAll("path")
	    	.data(topojson.feature(us, us.objects.states).features)
	    	.enter().append("path")
	      	.attr("d", path);

	  	map.append("path")
	      .attr("class", "state-borders")
	      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));



      	//Creates all the cities and scales them by 2016_murders
	    var cities = map.selectAll("circles.points")
		    .data(dataset)
			.enter()
			.append("circle")
		    .attr("r",function(d) {
		    	var killed = d["2016_murders"];
		    	return kScale(killed);
		    })
		    .attr("opacity", 0.75)
		    .attr("transform", function(d) {
		    	return "translate(" + projection([d.longitude,d.latitude]) + ")";})
		    .attr("d", path)
		    .on("mouseover", function(d) { 
		    	tooltip.transition()
					.duration(200)
					.style("opacity", .9);
		       	tooltip.html(d.city + ", " + d.state + "<br/>" + "Murders: " + d["2016_murders"])
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
		    })
		    .on("mouseout", function(d) {
		    		
		    	tooltip.transition()
					.duration(500)
					.style("opacity", 0);
		    });

		x.domain([0,d3.max(murders_six)]).range([0, 420]);
		var dataSort = dataset;
		dataSort.sort(function(a, b){return b["2016_murders"]-a["2016_murders"]});
		//Graph stuff doe
	    d3.select("#graph")
		  .selectAll("div")
		    .data(dataSort)
		  .enter()
		  .append("div")
		    .style("width", function(d) { return x(d["2016_murders"]) + "px"; })
		    //add on mouseover
		    .on("mouseover", function(d) {

		    	tooltip.transition()
					.duration(200)
					.style("opacity", .9);
		       	tooltip.html(d.city + ", " + d.state)
					.style("left", (d3.select(this).property("offsetLeft") + parseFloat(d3.select(this).style("width")) + 10) + "px")
					.style("top", d3.select(this).property("offsetTop") + "px");
		    })
		    .on("mouseout", function(d) {
		    	tooltip.transition()
					.duration(500)
					.style("opacity", 0);
		    })
		    .text(function(d) { return d["2016_murders"]; });


  	}

  	$("#2015").click(function() {
  		changeData("2015_murders");
  	});
  	$("#2016").click(function() {
  		changeData("2016_murders");
  	});
  	$("#change").click(function() {
  		changeData("change");
  	});





  	function changeData(year) {
  		var tipString = "Murders ";
  		if (year === "change") {
  			tipString = "Change since 2015: ";
  		}

  		//Change titles
  		var mapTitleStr;
  		if (year === "change") {
  			mapTitleStr = "Change in murders 2015 to 2016";
  		} else if (year === "2015_murders") {
  			mapTitleStr = "Murders in 2015";
  		} else {
  			mapTitleStr = "Murders in 2016";
  		}

  		mapTitleStr = mapTitleStr + " in 80 most populated cities";
  		$("#mapTitle").html(mapTitleStr);

  		var graphTitleStr;
  		if (year === "change") {
  			graphTitleStr = "Cities ranked by change in murders from 2015 to 2016";
  		} else if (year === "2016_murders") {
  			graphTitleStr = "Cities ranked by most murders in 2016";
  		} else {
  			graphTitleStr = "Cities ranked by most murders in 2015";
  		}

  		$("#graphTitle").html(graphTitleStr);


  		var cities = map.selectAll("circle");
  		console.log(cities);
  		console.log(dataset);
  		cities
  			.transition()
  			.duration(500)
  			.attr("transform", function(d) {
		    	return "translate(" + projection([d.longitude,d.latitude]) + ")";})
		    .attr("r",function(d) {

		    	var sz = d[year];
		    	if (year === "2016_murders" || year === "2015_murders") {
		
			    	return kScale(sz);	
		    	} else {
		    		return changeScale(Math.abs(sz));
		    	}
		    })
		    
		    .style("fill", function(d) {
		    	if (year === "change") {
		    		if (d[year] < 0) {
		    			return "blue";
		    		} else {
		    			return "red";
		    		}
		    	} else {
		    		return "black";
		    	}
		    });
		cities.on("mouseover", function(d) {
			console.log(d);
			var toolTipStr;
			if (year === "change") {
   				toolTipStr = d.city + ", " + d.state + "<br/>Change since 2015: " + d[year];
   			} else {
   				toolTipStr = d.city + ", " + d.state + "<br/>" + "Murders: " + d[year];
   			}


       			
	    	tooltip.transition()
				.duration(200)
				.style("opacity", .9);
	       	tooltip.html(toolTipStr)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		    })
		var murderArr = [];
		if (year === "2016_murders") {
			murderArr = murders_six;
			x.domain([0,530]).range([0, 420]);	
		} else if (year === "2015_murders") {
			murderArr = murders_five;
			x.domain([0,530]).range([0, 420]);
		} else {
			murderArr = changes;
			x.domain([d3.min(murderArr),d3.max(murderArr)]).range([0, 420]);
		}
		

		//Graph stuff doe
	    d3.select("#graph")
			.selectAll("div")
			.data(dataset.sort(function(a, b){return b[year]-a[year]}))
			.transition()
			.duration(500)
			.style("width", function(d) { return x(d[year]) + "px"; })
		    //add on mouseover

		    .text(function(d) { return d[year]; });
  	}
  	//toggle to show change
});

