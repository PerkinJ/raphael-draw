// dependencies: jquery, raphael

import Event from "./event"

import Polygon from "./plugins/polygon"


class Canvas extends Event {
	constructor (container){
		super()

        this.container = $(container);

        // 画布区域
        this.main = this.canvas = $('<div class="canvas">').appendTo(container);
        // 背景图层
        // this.bgOuter = $('<div class="bg-container">').appendTo(this.canvas);
        // 形状图层
        this.layersOuter = $('<div class="layers-container">').appendTo(this.canvas);
        // 遮挡图层
        this.mask = $('<div class="svg-mask">').appendTo(this.canvas);

        this.initProps();
        this.createSVG()
	}

	initProps(){
		this.set('foreground', '#000');
        this.set('background', '#fff');

		this.isDisabled = false;
        this.size = {
            width: this.container.outerWidth(),
            height: this.container.outerHeight(),
            zoom: 1
        }
        this.list = [];
	}

	createSVG() {
        let width = this.size.width;
        let height = this.size.height;

        // raphael添加svg, 向前添加
        this.paper = Raphael(this.layersOuter.get(0), width, height);

        // 添加画布
        this.layers = this.paper;

        this.resize(width, height)

    }

    clear(){
        this.paper.clear()
        this.list = []
    }

    resize(width, height) {
    	let size = {
            width: width,
            height: height
        }
        $.extend(this.size, size);
        this.paper.setSize(width, height).setViewBox(0, 0, width, height);
        this.mask.css(size);
    }

	set(name, value){
        this[name] = value;
        if(name == "isDisabled" && this.plugin){
            this.plugin.clear()
        }
        this.trigger('propschange', name, value);
        // eve('canvas.' + name, this, value);
    }

    get(name){
        return name.substr(0, 1) != "_" ? this[name]: "";
    }

	switch(name){
		let plugin = this.plugin;
		if(plugin){
			plugin.destroy()
		}
		let ClassPlugin = Canvas.getPlugin(name)
		this.plugin = new ClassPlugin(this)
	}

	zoomOut(){

	}

	zoomIn(){

	}

    add(shape){
        let type = shape.type;
        let plugin = Canvas.getPlugin(type)
        let element = plugin.draw(this.layers, shape.points, shape.attr)
        this.trigger('shapes', shape);
        this.list.push(element)
    }

	static getPlugin(name){
		if(Canvas._plugins){
			return Canvas._plugins[name]
		}
		return null
	}

	static register(name, pluginClass){
		if(!Canvas._plugins){
			Canvas._plugins = {}
		}
		Canvas._plugins[name] = pluginClass
	}
}

Canvas.register("polygon", Polygon)

export default Canvas