var myApp = angular.module('myApp', []);   
    myApp.directive('parallelCoordinate', function(){
        function link(scope, el, attr){
                var dataset;
                /* Generate Parallel Coordinate and Modify strokewidth and opacity*/
                function UpdateParallelCoordinate(dataset) {
                   // console.log(dataset);

                    var width = 1000;
                    var height = 600;
                    var padding = 50;
                    var innerWidth = width - 2 * padding;
                    var keynum = dataset[0] ? Object.keys(dataset[0]).length: 0; 
                    var color = d3.scale.category10();
                    var colornum =  10;  //10/20
                    var strokewidthscale = 10;
                    var opacityscale = 100;
                    var dragoffset = 25;
                    var dimensions = Object.keys(dataset[0]);
                    var lineFunction = d3.svg.line()
                                      .x(function(d) { return d.x;})
                                      .y(function(d) { return d.y;})
                                     .interpolate("linear");    
                    
                    
                    
                    
                    console.log(dataset[0]);
                    var Xdomain = new Array();
                    var i = 0;
                    for (attr in dataset[0])
                    {
                        Xdomain.push(padding + 1.0 * i * (width - 2 * padding)/(keynum - 1));
                        i++;
                    }
                    
                    console.log('Xdomain')
                    console.log(Xdomain);
                    //!!!最左边最右边有点歪
                   /* var ordinal = d3.scale.ordinal().domain([1,2,3,4,5]).rangePoints([0,100]);
                    console.log('ordinal')
                    console.log( ordinal.range());
                    ordinal.rangePoints([padding, width - padding],5);
                    console.log( ordinal.range() );
                    console.log(padding);
                    console.log(width);
                    */
                    var x = d3.scale.ordinal().domain(Xdomain);
                    x.rangePoints([padding, width - padding]);
                    
                    
                    
                    console.log(x.range());
                    console.log('aha')
                    var svg = d3.select('#chart').append('svg')
                                                .attr('width',width)
                                                .attr('height',height);
                    svg.append('g')
                    .attr('id','lineSet');
                    svg.append('g')
                    .attr('id','axisSet');

                    
                    var xScale = d3.scale.linear()
                                    .domain([0, width])
                                    .range([0, width]);
                    var yScale = d3.scale.linear()
                                    .domain([0, height])
                                    .range([0, height]);
                    
                    
                    var brush = d3.svg.brush()  //点击拖拽选择一个二维区域。
                                    .x(xScale)
                                    .y(yScale)
                                    .on('brush', onBrush);
                    
                    function onBrush() {
                        var extent = brush.extent();
                        /* 调整相应图1的x轴坐标和y轴坐标范围 */
                       console.log(extent);
                       
                    }
                    
                    
                    //console.log(dataset);

                     function CreateScale(key){
                            return  d3.scale.linear()
                                                .domain([0, d3.max(dataset, function(d){return +eval('d.' + key);})])
                                                .range([2 * padding, height - padding]);
                         //console.log(height - padding);
                     };

                    //dataset --> (x,y)
                    function reShapeData(dataset){

                            //line() only works if you provide an array of coordinates[{x:,y:},{x:,y:}...]
                            //so we reshape the dataset so that it reflects that structure
                            //for each datum {a,b,c} : and for each key, we create [{x:,y:},{x:,y:}...] that contains the coordinates of ONE line
                            //Coordinates are the different points on each axis. So x is calculated by counting on which axis it is
                            //y is calculated with the scale for that key, on the value of that key
                            //Ex : {x:padding,y:aScale(15)},{x:padding + width til next axis,y:bScale(20),{x:padding + 2*width til next axis,y:cScale(10)}...}
                            var newDataset = [];
                            dataset.forEach(function(group,indexGroup){
                                newDataset.push([]);
                                Object.keys(group).forEach(function(key,indexKey){
                                    //console.log(key); key:attribute name
                                    newDataset[indexGroup].push({x:padding + indexKey*( width -2 * padding)/(keynum - 1), y:CreateScale(key)(group[key])});
                                });
                            });
                            return newDataset;
                        };
                    
                    //update dataset after drag
                   
                    

                     function DrawAxis() {
                          //Axis
                         
                         
                        var axis = svg.select('#axisSet').selectAll('.axis')
                                         .data(Object.keys(dataset[0])); //mapping axis per keys in the dataset (ie 'a','b','c'...)
                        
                        var line = d3.svg.line();
                    
                         /*Drag*/
                         //?????
                         var dragging = {};

                        function path(d) {
                            return line(axis.map(function(p) { 
                                    return [position(p), axis[p](d[p])]; 
                                    }));
                        }


                        function position(d) {
                            
                            // if we're currently dragging the axis return the drag position
                            // otherwise return the normal x-axis position
                            var v = dragging[d];
                            return v == null ? x(d) : v;
                        }
                         
                         
                        function dragmove(d) {
                            //console.log(d);
                           //为什么是列名？！
                            // console.log(d.dx)
                            //console.log('axis[i]');
                            //console.log(i);
                            //console.log(axis[i]);
                            console.log(d3.event.x);
                        //    d.dx = d3.event.x;
                            d3.select(this)
                                    .attr('transform', 'translate('+d3.event.x+')');
                            
                            
                            //??????????????????????????????
                            dragging[d] = d3.event.x;

                            console.log('darggingd');
                            console.log(dragging[d]);
                            
                            svg.select('#lineSet').selectAll('.lines').attr('d', path);
                            dimensions.sort(function(a, b) { return position(a) - position(b); });
                          //  console.log('dimension')
                        //    console.log(dimensions);
                            
                            x.domain(dimensions);
                            console.log(svg.select('g.axisSet'));
                            svg.select('#axisSet').selectAll('.axis').attr('transform', function(d) { 
                          /*      console.log('d+posd');
                                console.log(d);
                                console.log(position(d));*/
                                return 'translate(' + position(d) + ')'; });
                        }
                      
                        function dragstart(d) {
                            
                        
                           /* var axispath = d3.select(this).select('path');
                            var  = node.cloneNode(true)
                            element.appendChild(cNode)*/
                            d3.select(this)
                                    .attr('stroke', '#66CCFF');
                            
                            d3.select(this)
                                .select('path')
                                .attr('fill', '#66CCFF')
                                .attr('opacity', 0.8);
                            console.log('start');
                            //console.log(d3.event.dx);
                            dragging[d] = this.__origin__ = x(d);
                            console.log(dragging[d]);
                            
                        }
                         
                        function dragend(d) {
                            d3.select(this)
                                    .attr('stroke', 'null');
                            d3.select(this)
                                    .select('path')
                                    .attr('fill', 'null')
                                    .attr('opacity', 1);
                            
                            delete this.__origin__;
                            delete dragging[d];
                            console.log('x-d');
                            console.log(x(d));
                            d3.select(this).attr('transform', 'translate(' + x(d) + ')');
                            
                            
                            svg.select('.lineSet').select('.lines').attr('d', path);
                            
                            
                            function ReOrderAxis() {
                                
                                
                            }
                        
                        function UpdateDataset(d)
                        {
                        
                        }
                            UpdateDataset(d);
                       
                          //  DrawAxis();
                        //    DrawLine();
                        }
                         
                         
      
                                             
                        var drag = d3.behavior.drag()
                                        .origin(null)
                                        .on('drag', dragmove)
                                        .on('dragstart',dragstart)
                                        .on('dragend', dragend);

                                   axis.enter()
                                         .append('g')
                                         .attr('class','axis')
                                         .append('text')
                                         .text(function(d){return d;})
                                         .attr('y', padding);// position of attribute name 
                         
                         
                                    axis //.transition()
                                        //.duration(1000)
                                        .attr('transform',function(d,i){return 'translate('+ (padding + i * (width - 2 * padding)/(keynum - 1))+')';})
                                        .each(function(d){
                                            d3.select(this).call(d3.svg.axis()
                                                                .scale(CreateScale(d)) //for each key there is a specific scale
                                                                .orient('left')
                                                                );
                                            });
                         
                         
                              //  console.log('axis!!!!!!!!')
                            //    console.log(axis);
                                    //Drag
                                var Yaxis = svg.select('#axisSet').selectAll('.axis');
                                Yaxis.each(function(d){
                                    d3.select(this).call(drag);
                                    
                                })
                         
                                
                                    axis.exit()
                                        .remove();

                     }
                    
                    function DrawLine() {
                            
                            svg.select('#lineSet').selectAll('.lines').remove();
                            
                            var lines = svg.select('#lineSet').selectAll('.lines')
                                                            .data(reShapeData(dataset));
                          //      console.log(lines);

                                    lines.enter()
                                            .append('path')
                                            .attr('class','lines')
                                            .attr('fill', 'none')
                                            .attr('d','M'+ padding +' ' + (height / 2)+' L'+(width - padding)+' '+(height /2) + '');

                               // console.log(lines)


                                            //??
                                        //   .attr('stroke-width', '1px')


                       //     console.log(color);
                                  
                         
                         lines.attr('stroke-width',5).attr('stroke-opacity',0.5);
                         
                                    lines.transition()
                                            .attr('d',function(d){return lineFunction(d);})
                                            .attr('stroke',function(d, i){return color(Math.floor( (d[0].y * colornum) / (height - 2 * padding) ));});

                                    
                                    
                                    scope.$watch('strwid', function(width_value){
                                      //  console.log('change!');
                                      lines.attr('stroke-width', width_value / strokewidthscale);
                                    })
                                    
                                    scope.$watch('opacity', function(opa_value){
                                      //  console.log('change!');
                                      lines.attr('stroke-opacity', opa_value / opacityscale);
                                    })
            
            
            
                         
                                    lines.exit()
                                            .remove();
                         
                         
                                

                /*
                    d3.selectAll('.lines').on('mouseover',function(){
                        d3.selectAll('.lines').attr('stroke','#777777');
                        d3.select(this).attr('stroke','#5500FF');
                     })

                     */


                    }


                    DrawAxis();
                    DrawLine();
                    
                    
                    
                   
                    
                    

                }

               
                
            
            
                /* get dataset*/
                d3.csv("Fisher.csv", function(error, data){
                        if (error)
                            alert('Error when loading dataset');
                        UpdateParallelCoordinate(data);
                        });


                /*d3.json("data.json", function(error, data){
                        if (error)
                            alert('Error when loading dataset');
                        UpdateParallelCoordinate(data);
                        });
                */



           

          }


          return {
            link: link,
            restrict: 'E',
            scope: { strwid: '=', opacity: '='}
          };
        });
    