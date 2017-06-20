(function() {
    'use strict';

    let bcController = function BarChartController($element, StringUtil){
        let ctrl = this;
        let legendSquareSize = 18;
        let DEFAULT_LEGEND_ITEMS_PER_ROW = Math.floor(ctrl.width / 200.0) > 0 ? Math.floor(ctrl.width / 200.0) : 1;
        ctrl.$onInit = function() {

            let data = [];
            let ytitle = "";
            let xtitle = "";
            let itemsperrow = DEFAULT_LEGEND_ITEMS_PER_ROW;

            Object.defineProperty(ctrl, 'data', {
                get: function(){
                    return data;
                },

                set: function(newVal){
                    console.log("LC new data");
                    console.log(newVal);
                    data = newVal;
                    display();
                }
            });

            Object.defineProperty(ctrl, 'ytitle', {
                get: function(){
                    return ytitle;
                },
                set: function(newVal){
                    ytitle = newVal;
                    display();
                }
            });

            Object.defineProperty(ctrl, 'xtitle', {
                get: function(){
                    return xtitle;
                },
                set: function(newVal){
                    xtitle = newVal;
                    display();
                }
            });

            Object.defineProperty(ctrl, 'itemsperrow', {
                get: function(){
                    return itemsperrow;
                },
                set: function(newVal){
                    console.log("setting IPR");
                    itemsperrow = newVal;
                    display();
                }
            });
            display();
        };

        function getLegendSquareX(position, arr, itemsPerRow) {
            let space = 200.0; // The amount of space between the legend elements
            return (position > 0) ? arr.slice(0, position % itemsPerRow).length * space : 0;
        }

        function getLegendSquareY(position, offset, itemsPerRow) {
            return offset+((2*legendSquareSize*Math.floor(position/itemsPerRow)));
        }

        function legendRowsNeeded(length, itemsPerRow) {
            return (length < itemsPerRow)? 2 : Math.ceil(length/itemsPerRow)+1;
        }

        function display() {
            let legendBuffer = legendRowsNeeded(ctrl.data.length, ctrl.itemsperrow)*50;
            let margin = {top: 20, right: 20, bottom: legendBuffer, left: 60};
            let width = ctrl.width;
            let height = ctrl.height;

            let xAxisTitleYPosition = height+70;
            let legendYPostionStart = xAxisTitleYPosition+30;
            let legendYPostionOffset = 0;

            xAxisTitleYPosition = height+70;

            let minDate = d3.min(ctrl.data, (list) => d3.min(list, (item) => item.date));
            let maxDate = d3.max(ctrl.data, (list) => d3.max(list, (item) => item.date));

            let xScale = d3.scaleTime()
                        .range([margin.left, width-margin.right])
                        .domain([minDate, maxDate]);

            let minY = d3.min(ctrl.data, (list) => d3.min(list, (item) => item.value));
            let maxY = d3.max(ctrl.data, (list) => d3.max(list, (item) => item.value));

            let yScale = d3.scaleLinear()
                            .range([height - margin.top, 0])
                            .domain([minY, maxY]);

            let zScale = null;
            if(ctrl.data.length < 10){
                zScale = d3.scaleOrdinal(d3.schemeCategory10);
            } else {
                zScale = d3.scaleOrdinal(d3.schemeCategory20);
            }

            let zDom = ctrl.data.map(a => a[0].species);
            zScale.domain(zDom);

            let lineGen = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d.value));

            let circleGen = d3.symbol()
                                .type(d3.symbolCircle)
                                .size(24);

            let xAxis = d3.axisBottom()
                .scale(xScale);
                // .tickValues(xValues);

            let yAxis = d3.axisLeft()
                .scale(yScale);
                // .ticks(10);

            //Get the graph container
            let container = d3.select($element.find("div")[1]);
            //
            container.selectAll("*").remove();
            let svg = container.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "middle")
                .attr("transform", "translate(-15, 22) rotate(-65)");

            svg.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate("+margin.left+", "+margin.top+")")
                .call(yAxis);

            svg.append("text")
                .attr("y", 0+xAxisTitleYPosition)
                .attr("x", width/2)
                .style("text-anchor", "middle")
                .text(ctrl.xtitle);

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0-margin.left/1.8)
                .attr("x", 0-(height/2))
                .style("text-anchor", "middle")
                .text(ctrl.ytitle);

            let lines = svg.selectAll(".serie")
                .data(ctrl.data)
                .enter();

            lines.append("path")
                .attr("d", (item) => lineGen(item))
                .attr('stroke', (item) => zScale(item[0].species))
                .attr('stroke-width', 2)
                .attr('fill', 'none');


            lines.selectAll(".circles")
                .data((d) => d).enter()
                .append("path")
                .attr("d", (item) => circleGen())
                .attr("transform", item => "translate("+xScale(item.date)+"," + yScale(item.value) + ")")
                .attr('fill', item => zScale(item.species));

            let legend = svg.selectAll(".legend")
                .data(zDom)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => "translate("+margin.left+"," + legendYPostionStart + ")")
                .style("font", "12pt sans-serif");

            legend.append("rect")
              .attr("x", (d,i) => getLegendSquareX(i, zDom, ctrl.itemsperrow))
              .attr("y", (d,i) => getLegendSquareY(i, legendYPostionOffset, ctrl.itemsperrow))
              .attr("width", legendSquareSize)
              .attr("height", legendSquareSize)
              .attr("fill", (item) => zScale(item));


            legend.append("text")
              .attr("x", (d,i) => getLegendSquareX(i, zDom, ctrl.itemsperrow)+24)
              .attr("y", (d,i) => getLegendSquareY(i, legendYPostionOffset, ctrl.itemsperrow))
              .attr("dy", "1em")
              .attr("text-anchor", "start")
              .text(StringUtil.cleanAndCapitalise);
        }
    };


    angular.module('app')
        .component('lineChart', {
            templateUrl: 'components/charts/line-chart/line-chart.template.html',
            controller: bcController,
            bindings: {
                data: '=?',
                xtitle: '=',
                ytitle: '=',
                itemsperrow: '=?',
                height: '=',
                width: '='
            }
        });
})();
