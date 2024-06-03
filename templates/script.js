function updateWebcam(imageBase64){
    let webcam = document.getElementById("webcam");
    webcam.src = imageBase64;
}

function updateDonut(key, data, destroy = false){

    let donut = document.getElementById(key);
    if(donut === null){
        let parent = document.getElementById("donuts");
        let container = document.createElement("div");
        container.className = "donut-container";
        parent.appendChild(container);
        let canvas = document.createElement("canvas");
        canvas.id = key;
        container.appendChild(canvas);
        donut = canvas;
    }
    if(Donuts[key] !== undefined && !destroy){
        Donuts[key].data.datasets[0].data = [data, lookUp[key]["max"] - data] /* [-3, lookUp[key]["max"] - data] */;
        Donuts[key].options.elements.center.text = data + " " + lookUp[key]["label"];
        Donuts[key].update();
    } else{
        donut = donut.getContext("2d");

        let dataConfig = {
            datasets: [{
                data: [data, lookUp[key]["max"] - data],
                backgroundColor: function(context) {
                    const index = context.dataIndex;
                    if (index == 1) return "rgba(0,0,0,0.04)";
                    let value = context.dataset.data[index];
                    if(value > lookUp[key]["thGood"][0] && value < lookUp[key]["thGood"][1]){
                        return '#00ff00';
                    } else if(value > lookUp[key]["thOkay"][0] && value < lookUp[key]["thOkay"][1]){
                        return '#e3fc05';
                    } else if(value > lookUp[key]["thWarning"][0] && value < lookUp[key]["thWarning"][1]){
                        return '#fcae05';
                    }
                    return '#ff0000';
                },
                hoverOffset: 4
            }],
        
            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: [
                lookUp[key]["label"],
                ''
            ]
        };

        const config = {
            type: 'doughnut',
            data: dataConfig,
            options: {
                plugins: {
                    legend: {
                    display: false
                    },
                    tooltip: {
                        filter: function(context) {
                            return context.dataIndex === 0;
                        },
                        displayColors: false,
                    }
                },
                cutout: "60%",
                rotation: 270,
                circumference: 180,
                elements: {
                    center: {
                    text: data + " " + lookUp[key]["label"],
                    color: '#333', // Default is #000000
                    fontStyle: 'Arial', // Default is Arial
                    sidePadding: 20, // Default is 20 (as a percentage)
                    minFontSize: 5, // Default is 20 (in px), set to false and text will not wrap.
                    lineHeight: 25 // Default is 25 (in px), used for when text wraps
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var datasetIndex = tooltipItem.datasetIndex;
                            var index = tooltipItem.index;
                            var entry = data.datasets[datasetIndex].dataset[index];
                            var percentage = data.datasets[datasetIndex].data[index];
        
                            return `${entry.name}: $${entry.value} (${(percentage * 100).toFixed(2)}%)`;
                        }
                    }
                }
            }
        };
        if(destroy){
            Donuts[key].destroy();
        }
        Donuts[key] = new Chart(donut, config);
    }
}

Chart.register({
    id: 'center-text',
    beforeDraw: function(chart) {
      if (chart.config.options.elements && chart.config.options.elements.center) {
        // Get ctx from string
        var ctx = chart.ctx;

        // Get options from the center object in options
        var centerConfig = chart.config.options.elements.center;
        var fontStyle = centerConfig.fontStyle || 'Arial';
        var txt = centerConfig.text;
        var color = centerConfig.color || '#000';
        var maxFontSize = centerConfig.maxFontSize || 75;
        var sidePadding = centerConfig.sidePadding || 20;
        var sidePaddingCalculated = (sidePadding / 100) * (chart.width)
        // Start with a base font of 30px
        ctx.font = "30px " + fontStyle;

        // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
        var stringWidth = ctx.measureText(txt).width;
        var elementWidth = (chart.width) - sidePaddingCalculated;

        // Find out how much the font can grow in width.
        var widthRatio = elementWidth / stringWidth;
        var newFontSize = Math.floor(30 * widthRatio);
        var elementHeight = (chart.width);

        // Pick a new font size so it will not be larger than the height of label.
        var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
        var minFontSize = centerConfig.minFontSize;
        var lineHeight = centerConfig.lineHeight || 25;
        var wrapText = false;
        if (minFontSize === undefined) {
          minFontSize = 20;
        }

        if (minFontSize && fontSizeToUse < minFontSize) {
          fontSizeToUse = minFontSize;
          wrapText = true;
        }

        // Set font settings to draw it correctly.
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
        ctx.font = fontSizeToUse + "px " + fontStyle;
        ctx.fillStyle = color;

        if (!wrapText) {
          ctx.fillText(txt, centerX, (centerY * 1.7));
          return;
        }

        var words = txt.split(' ');
        var line = '';
        var lines = [];

        // Break words up into multiple lines if necessary
        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > elementWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }

        // Move the center up depending on line height and number of lines
        centerY -= (lines.length / 2) * lineHeight;

        for (var n = 0; n < lines.length; n++) {
          ctx.fillText(lines[n], centerX, centerY);
          centerY += lineHeight;
        }
        //Draw text in center
        ctx.fillText(line, centerX, (centerY * 1.4) );
      }
    }
  });

function reloadInteractions(text, endpoint){
    let answer = JSON.parse(text);
    //flip array to show latest interactions first
    answer = answer.reverse();
    let container = document.getElementById("interactions");

    container.innerHTML = "";
    for (let i = 0; i < answer.length; i++) {
        let interaction = answer[i];
        let div = document.createElement("div");
        div.className = "interaction";
        let dateOpen = new Date(interaction.open);
        let dateClosed = new Date(interaction.closed);
        let options = {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          };
        let personString = "";
        for (let j = 0; j < interaction.persons.length; j++) {
            if(j > 0){
                personString += ", ";
            }
            personString += interaction.persons[j];
        }
        if(personString == ""){
            personString = "Unknown Person";
        }
        div.innerHTML = dateOpen.toLocaleDateString("de-DE", options) + 
        " - " + dateClosed.toLocaleDateString("de-DE", options) + " - " + interaction.persons;
        container.appendChild(div);
    }

}


function getInteractionsBeforeLineChart(chartData, endpoint, callbackData){
    let data = new FormData();
    let answer = JSON.parse(chartData);
    let timestampStart = answer[0].timestamp;
    let timestampEnd = answer[answer.length - 1].timestamp;
    data.append("start_timestamp", timestampStart);
    data.append("end_timestamp", timestampEnd);
    data.append("persons", "");
    //we retrieve information about interactions before drawing the chart
    fetch('http://' + ip + "/getTimestampRangeInteractions", {
        method: 'POST',
        headers: {
        },
        body: data
    }).then(
        response => {
            if(response.status == 200){
                response.text().then(function (text) {
                    let interactionData = JSON.parse(text);
                    drawLineChart(chartData, endpoint, interactionData);
                });
            }   
        }
    ).then(
        success => {
            
        }
    ).catch(
        error => {
            console.log("Error", error)
        }
    );
     
}

function drawLineChart(text, endpoint, interactionData){
    console.log(interactionData)
    let xBgPoints = [];
    let keys =  ["temperature", "humidity", "pressure"];
    let answer = JSON.parse(text);
    let labels = [];
    let datasets = [];
    for (let i = 0; i < answer.length; i++) {
        //fill in data according to keys
        for(let j = 0; j < keys.length; j++){
            if(typeof datasets[j] === 'undefined') {
                datasets.push({
                    label: keys[j],
                    data: [answer[i][keys[j]]],
                    fill: false,
                    borderColor: colors[keys[j]],
                    tension: 0.1
                });
            } else {
                datasets[j].data.push(answer[i][keys[j]]);
            }
        }
        let options = {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          };
        //create xBgPoints to draw background color on chart for interactions
        let loopIndex = 0;
        if(xBgPoints.length > 0 && xBgPoints[xBgPoints.length - 1].length > 1){
            loopIndex = xBgPoints.length;
        } else if(xBgPoints.length > 0){
            loopIndex = xBgPoints.length - 1;
        } 

        for(loopIndex; loopIndex < interactionData.length; loopIndex++){
            let interaction = interactionData[loopIndex];
            let dateOpen = new Date(interaction.open);
            let dateClosed = new Date(interaction.closed);
            let date = new Date(answer[i].timestamp);
            
            let length = xBgPoints.length;
            if(length > 0 && xBgPoints[length - 1].length == 1){
                if(date >= dateClosed){
                    xBgPoints[length - 1].push(i);
                }
            } else {
                if(date >= dateOpen && date <= dateClosed){
                    xBgPoints.push([i]);
                }
            }
        }
        let date = new Date(answer[i].timestamp);
        
        labels.push(date.toLocaleDateString("de-DE", options));
    }

    console.log(xBgPoints)
    /* if(labels.length != dataTemperature.length){
        console.log("Data Error")
        console.log(labels.length, dataTemperature.length)
    } */

    const data = {
        labels: labels,
        datasets: datasets
    };

    //since pressure values are very high, we need to scale the y-axis logarithmically
    //this will help to see changes in the lower values(temperature, humidity) better
    let scales = {}
    if(keys.includes("pressure") && keys.length > 1) {
        scales = {
    
        }
    }

    const plugin = {
        id: 'backgroundColorOnDoorInteraction',
        beforeDraw: (chart, args, options) => {
            const {ctx, chartArea : { top, bottom, left, right, width, height }, scales: {x,y}} = chart
            ctx.save();
            ctx.fillStyle = options.color;
            for(let i = 0; i < xBgPoints.length; i++){
                let point = xBgPoints[i];
                if(point.length < 2){
                    continue;
                }
                let startBg = x.getPixelForValue(point[0]);
                let endBg = x.getPixelForValue(point[point.length - 1]);
                let widthBg = endBg - startBg;
                ctx.fillRect(startBg, top, widthBg, height);
            }
            /* let startBg = x.getPixelForValue(4)
            let endBg = x.getPixelForValue(10)
            let widthBg = endBg - startBg;
            ctx.fillRect(startBg,top, widthBg, height);

            startBg = x.getPixelForValue(12)
            endBg = x.getPixelForValue(16)
            widthBg = endBg - startBg;
            ctx.fillRect(startBg,top, widthBg, height); */
        }
    };

    const config = {
        type: 'line',
        data: data,
        options : {
            scales: scales,
            plugins: {
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'xy',
                    modifierKey: 'ctrl',
                  },
                  zoom: {
                    drag: {
                      enabled: true
                    },
                    mode: 'xy',
                  },
                },
                backgroundColorOnDoorInteraction : {
                    color: "rgba(0,0,0,0.2)"
                }
            }
        },
        plugins: [plugin]
    };

    //if chart already exists, destroy it and create a new one
    //this was done with the global variable, as array, because initially we had multiple charts
    if(!dataSensorEndpoints[endpoint]){
        dataSensorEndpoints[endpoint] = new Chart(document.getElementById(endpoint), config);
        let zoomButton = document.querySelector("[data-canvas='" + endpoint + "']");
        zoomButton.style.display = "inline-block";
        zoomButton.addEventListener("click", function(event){
            dataSensorEndpoints[endpoint].resetZoom();
        });
    } else {
        dataSensorEndpoints[endpoint].destroy()
        dataSensorEndpoints[endpoint] = new Chart(document.getElementById(endpoint), config);
        let zoomButton = document.querySelector("[data-canvas='" + endpoint + "']");
        //remove old event listener
        elClone = zoomButton.cloneNode(true);
        zoomButton.parentNode.replaceChild(elClone, zoomButton);
        elClone.addEventListener("click", function(event){
            dataSensorEndpoints[endpoint].resetZoom();
        });
    } 
}

function parseTimestampRange(containerEle, form){
    let dateStart = containerEle.querySelector(".date-start input[type='date']");
    let timeStart = containerEle.querySelector(".date-start input[type='time']");
    let dateEnd = containerEle.querySelector(".date-end input[type='date']");
    let timeEnd = containerEle.querySelector(".date-end input[type='time']");
    let timestampStart = Date.parse( dateStart.value );
    let timestampEnd = Date.parse( dateEnd.value );

    let parseHourMinuteToTimestamp = function(hourMinute){
        let hour = parseInt(hourMinute.split(":")[0]);
        let minute = parseInt(hourMinute.split(":")[1]);
        let offset = new Date().getTimezoneOffset();
        return hour * 3600000 + minute * 60000 + offset * 60000;
    }
    timestampStart += parseHourMinuteToTimestamp(timeStart.value);
    timestampEnd += parseHourMinuteToTimestamp(timeEnd.value);
    data = new FormData(form);
    //remove date from data
    data.delete("date-start");
    data.delete("time-start");
    data.delete("date-end");
    data.delete("time-end");
    //add timestamp to data
    data.append("start_timestamp", timestampStart);
    data.append("end_timestamp", timestampEnd);
    return data;
}

function setTimestampFilterPreset(values, wrapperController){
    let dateStart = wrapperController.querySelector(".date-start input[type='date']");
    let timeStart = wrapperController.querySelector(".date-start input[type='time']");
    let dateEnd = wrapperController.querySelector(".date-end input[type='date']");
    let timeEnd = wrapperController.querySelector(".date-end input[type='time']");
    //date start from the first of current month and end to current date and time
    dateStart.value = values.dateStart;
    timeStart.value = values.timeStart;
    dateEnd.value = values.dateEnd;
    timeEnd.value = values.timeEnd;
}

document.addEventListener("DOMContentLoaded", function() {

    let tabs = document.querySelectorAll(".tab");
    for (let i = 0; i < tabs.length; i++) {
        let tab = tabs[i];
        tab.addEventListener("click", function(event){
            let tabs = document.querySelectorAll(".tab");
            for (let j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove("active");
            }
            let tabContent = document.querySelectorAll(".control-wrapper");
            for (let j = 0; j < tabContent.length; j++) {
                tabContent[j].classList.remove("active");
            }
            this.classList.add("active");
            let targetContent = document.querySelector("[data-control-wrapper='" + this.dataset.tab + "']");
            targetContent.classList.add("active");
        });
    }

    window.addEventListener("resize", function(){
        if(window.innerWidth != windowWidth){
            windowWidth = window.innerWidth;
            for (let key in sensors) {
                updateDonut(key, sensors[key], true);
            }
        }
    });

    let forms = document.querySelectorAll("form");
    for (let i = 0; i < forms.length; i++) {
        let form = forms[i];
        form.addEventListener("submit", function(event){
            event.preventDefault();
            let button = event.target.querySelector("button[type='submit']")
            button.classList.add("loading");
            let wrapperController = event.target.closest(".control-wrapper")
            let control = wrapperController.querySelector(".controler")
            let endPoint = control.dataset.endpoint;
            let data = -1;
            
            if(endPoint == "getTimestampRangeData"){
                data = parseTimestampRange(control, event.target);
            }
            else if(endPoint == "getTimestampRangeInteractions"){
                data = parseTimestampRange(control, event.target);
                let personCheckboxes = control.querySelectorAll(".person-checkbox input[type='checkbox']");
                let persons = "";
                for (let j = 0; j < personCheckboxes.length; j++) {
                    let checkbox = personCheckboxes[j];
                    let key = checkbox.name;
                    let value = checkbox.checked;
                    if(value){
                        if(persons != ""){
                            persons += ",";
                        }
                        persons += key;
                    }
                }
                //remove last character if ,
                if(persons != "" && persons[persons.length - 1] == ","){
                    persons = persons.slice(0, -1);
                }
                data.append("persons", persons);
            }
            if(data == -1) {
                console.table("Data Error", data, endPoint)
                return
            }
            fetchEndpoint(endPoint, data);
        });
        //on load update fields to current dates
        let wrapperController = form.closest(".control-wrapper")
        let valueSet = {
            dateStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            timeStart: "00:00",
            dateEnd: new Date().toISOString().split('T')[0],
            timeEnd: new Date().toTimeString().split(' ')[0].substring(0, 5)
        }
        setTimestampFilterPreset(valueSet, wrapperController);
    }
});

function fetchEndpoint(endPoint, data){
    console.log(endPoint)
    console.log(data)
    for(let pair of data.entries()) {
        console.log(pair[0]+ ', '+ pair[1]); 
    }
    fetch('http://' + ip + "/" + endPoint, {
        method: 'POST',
        headers: {
        },
        body: data
    }).then(
        response => {
            if(response.status == 200){
                response.text().then(function (text) {
                    if(endPoint in dataSensorEndpoints){
                        getInteractionsBeforeLineChart(text, endPoint)
                    } else if(endPoint == "getTimestampRangeInteractions"){
                        reloadInteractions(text, endPoint)
                    }
                    let button = document.querySelector(".controler[data-endpoint='" + endPoint + "'] button[type='submit']")
                    button.classList.remove("loading");
                    button.classList.remove("error");
                });
            } else {
                let button = document.querySelector(".controler[data-endpoint='" + endPoint + "'] button[type='submit']")
                button.classList.remove("loading");
                button.classList.add("error");
            }   
        }
    ).then(
        success => {
            let button = document.querySelector(".controler[data-endpoint='" + endPoint + "'] button[type='submit']")
            button.classList.remove("loading");
        }
    ).catch(
        error => {
            console.log("Error", error)
        }
    );
}

