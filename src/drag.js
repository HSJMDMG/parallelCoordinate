var drag = d3.behavior.drag()
                .origin(null)
                .on('drag', dragmove);
function dragmove(d) {
    d.dx += d3.event.dx;
    d3.select(this)
            .attr('transform', 'translate('+d.dx+','+d.dy+')');
}