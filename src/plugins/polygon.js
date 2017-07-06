import Plugin from "./super.js"
import util from "../lib/util"


function getPath(x1, y1, x2, y2) {
    return "M" + x1 + " " + y1 + " L" + x2 + " " + y2;
}


function IsPolygonSelfIntersect(pts, isLast){
    if(pts.length <= 3){
        return false;
    }
    let max = pts.length;
    if(isLast){
        max += 1;
    }
    for(let i = 3; i< max; i++){
        for(let j = 1; j < i - 1; j++){
            if(i == pts.length && j == 1) continue;
            if(IsSegmentIntersect(
                    pts[i-1], 
                    pts[i%pts.length],
                    pts[j - 1],
                    pts[j]) ){
                return true
            }
        }
    }
    return false;
}

function IsSegmentIntersect(pa,pb,pc,pd){
    let vca = [pa.x - pc.x, pa.y - pc.y];
    let vcd = [pd.x - pc.x, pd.y - pc.y];
    let vcb = [pb.x - pc.x, pb.y - pc.y];

    let vac = [pc.x - pa.x, pc.y - pa.y];
    let vab = [pb.x - pa.x, pb.y - pa.y];
    let vad = [pd.x - pa.x, pd.y - pa.y];

    return (Cross2dVectors(vca, vcd) * Cross2dVectors(vcb, vcd) <= 0
            && Cross2dVectors(vac, vab) * Cross2dVectors(vad, vab) <= 0);
}

function Cross2dVectors(vec1, vec2){
    return vec1[0] * vec2[1] - vec2[0] * vec1[1];
}

let pointRadius = 5;
let pathWidth = 1;
let fontSize = 14;

class Polygon extends Plugin {
    
    constructor(parent, options){
        super(parent, options)
    }

    clear(){
        this.initProps()
        this.el && this.el.remove()
    }

    initProps(){
        // 开始状态
        this.isStart = false;
        // 点的长度
        this.count = 0;

        // 点开始的位置
        this.startX = 0;
        this.startY = 0;

        this.x = 0;
        this.y = 0;

        this.firstX = 0;
        this.firstY = 0;

        this.points = [];
    }

    bindEvent(){
        $(this.canvas.main)
            .on('mousedown.Polygon', ".svg-mask", this.mousedown.bind(this))

        $("body").on("mousemove.Polygon", this.mousemove.bind(this))
    }

    mousedown(e){
        e.preventDefault();
        if (e.button != 0 || this.parent.isDisabled) return false;

        let offset = this.getRealOffset(e);
        this.x = this.getZoomSize(offset.offsetX);
        this.y = this.getZoomSize(offset.offsetY);

        let pointInCanvas = this.checkPointInCanvas(this.x, this.y)

        if(!pointInCanvas){
            console.warn("point is not in canvas")
            return false;
        }

        this.startX = e.pageX;
        this.startY = e.pageY;
        this.count++;

        if (!this.isStart) {

            this.parent.trigger('polygon:beforestart', this.points);
            this.firstX = this.x;
            this.firstY = this.y;

            this.drawPoint(this.x, this.y);

            this.isStart = true;
            this.parent.trigger('polygon:start', this.points);
        }else {
            let isEnd = this.isEnd(this.x, this.y)
            if(isEnd){
                if(this.count <= 3){
                    this.count --;
                    this.parent.trigger('polygon:pointerror', {
                        x: x,
                        y: y
                    });
                }else{
                    this.drawEnd(this.firstX, this.firstY);
                }
            }

            // else if (this.count == 10){
            //     let s = this.drawLine(this.x, this.y);
            //     if(!s){
            //         return false;
            //     }
            //     this.drawEnd(this.firstX, this.firstY);
            // }

            else{
                this.drawLine(this.x, this.y);
            }
        }
    }

    checkPointInCanvas(x, y){
        let size = this.parent.size;
        return x > 0 && x <= size.width 
            && y > 0 && y <= size.height
    }

    mousemove(e){
        if(!this.isStart){return false;}

        let offset = this.getRealOffset(e);
        let x2 = this.getZoomSize(offset.offsetX);
        let y2 = this.getZoomSize(offset.offsetY);
        this.updatePath(x2, y2);
    }

    drawPoint(x, y){
        let canvas = this.canvas;
        let set = this.layers.add([
            {

                "type": "path",
                "path": getPath(x, y, x, y),
                "fill": "transparent",
                "stroke-width": this.getFixSize(pathWidth),
                "stroke": this.parent.get("foreground")

            }
        ]);

        let p = this._drawCircle(x, y)

        set.push(p)

        this.el = set;

        
        this.points = [{
            x: x,
            y: y
        }]
    }

    drawLine(x, y){
        let points = this.points.slice(0)
        points.push({
            x: x,
            y: y
        })
        if(IsPolygonSelfIntersect(points)){
            this.count --;
            this.parent.trigger('polygon:pointerror', "不能是相交的线", this.points);
            return false;
        }
        let el = this.el[0];
        let path = el.attr('path');
        path.push(["L", x, y]);
        el.attr('path', path);

        let p = this._drawCircle(x, y)
        
        this.el.push(p)


        this.points.push({
            x: x,
            y: y
        })

        return true;
    }

    _drawCircle(x, y){
        let r = this.getFixSize(pointRadius);
        // draw point
        let p = this.layers.add([{
            type: "circle",
            r: r,
            cx: x,
            cy: y,
            "fill": this.parent.get("background"),
            "stroke-width": 1,
            "stroke": this.parent.get("foreground")
        }]);
        return p
    }

    drawEnd(x, y){
        let el = this.el[0];
        let path = el.attr('path');
        path[path.length - 1] = ["Z"];
        el.attr('path', path);

        let invalid = IsPolygonSelfIntersect(this.points, true)


        if(invalid){
            $(this.parent).trigger('c:patherror', "不能存在相交的线", this.points);
            return false;
        }

        this.count = 0;
        this.isStart = false;
        this.el.remove()

        this.addShape("polygon", this.points.splice(0));
    }

    isEnd(x, y){
        let step = Math.max(this.getZoomSize(5), 5);
        return this.firstX - step < x
            && this.firstX + step > x
            && this.firstY - step < y
            && this.firstY + step > y
    }

    updatePath(x, y){
        let el = this.el[0];
        let path = el.attr('path');
        let last = path[path.length - 1];
        last[1] = x;
        last[2] = y;
        el.attr('path', path);
    }

    static draw(paper, points, attr){
        let path = points.map((item, index)=>{
            // return (index == 0 ?"M": "L") + item.x+ " "+ item.y
            return [(index == 0 ?"M": "L"), item.x, item.y]
        })
        path.push("Z")

        attr = $.extend({

            "type": "path",
            "path": path.join(""),
            "stroke-width": 1,
            "stroke": "#000"

        }, attr || {})

        return paper.path().attr(attr)
    }

}

export default Polygon