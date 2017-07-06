function realSize(size, zoom){
    return Math.max(Math.floor(size / zoom), 0);
}

function fixSize(size, zoom){
    return Math.max(size / zoom, 1);
}


var uniqueId = (function(){
    var types = {};
    return function(type){
        if(typeof types[type] == "undefined"){
            types[type] = 0;
        }
        types[type] += 1;
        return types[type];
    }
})()

export default {
    uniqueId: uniqueId,
    realSize: realSize,
    fixSize: fixSize
}