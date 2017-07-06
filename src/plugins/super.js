import Event from "../event"
import util from "../lib/util"

class Plugin extends Event {

    constructor(parent, options){
        super()
        this.parent = parent;
        this.canvas = parent;
        this.layers = this.canvas.layers;

        this.options = $.extend(true, {}, options || {});

        this.container = this.canvas.main[0];
 
        this.initProps();

        this.bindEvent();

    }

    initProps(){}

    bindEvent(){}

    addShape(type, points){
        this.parent.add({
            type: type,
            points: points
        })
    }

    getZoomSize(size){
        var zoom = this.canvas.size.zoom || 1;
        return util.realSize(size, zoom)
    }

    getFixSize(size){
        var zoom = this.canvas.size.zoom || 1;
        return util.fixSize(size, zoom)
    }

    getRealOffset(e){
        // 最外层的位置
        var mainOffset = $(this.canvas.main).offset();
        // 鼠标点击在页面上的位置
        var pageSet = {
            x: e.pageX,
            y: e.pageY
        };
        // // canvas svg的位置，padding
        // var canvasOffset = $(this.canvas.main).position();
        // // canvas的滚动位置，scrollLeft, scrollTop
        // var canvas2Offset = $(this.canvas.canvas).position();

        // var offsetX = pageSet.x - mainOffset.left - canvasOffset.left - canvas2Offset.left;
        // var offsetY = pageSet.y - mainOffset.top - canvasOffset.top - canvas2Offset.top;

        var offsetX = pageSet.x - mainOffset.left;
        var offsetY = pageSet.y - mainOffset.top;

        // console.log(mainOffset, pageSet, canvasOffset,canvas2Offset,  offsetX, offsetY)
        if(offsetX < 0){
            offsetX = Math.min(0, offsetX);
        }

        if(offsetY < 0){
            offsetY = Math.min(0, offsetY);
        }

        return {
            offsetX: offsetX,
            offsetY: offsetY
        }
    }

    endDraw(){

    }

    destroy(){

    }
}

export default Plugin