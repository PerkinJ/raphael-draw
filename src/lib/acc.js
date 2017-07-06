function decimalLength(num){
    var str = num.toString();
    var index = str.indexOf('.');
    return index == -1 ? 0 : str.substr(index+1).length;
}

function suffixInteger(num, length){
    var str = num.toString();
    var decimalLen = decimalLength(num);
    str += Math.pow(10, length - decimalLen).toString().substr(1);
    return Number( str.replace('.', '') );
}

// 加法
function accAdd(num1, num2){
    var r1 = decimalLength(num1);
    var r2 = decimalLength(num2);

    var max = Math.max(r1, r2);

    var n1 = suffixInteger(num1, max);
    var n2 = suffixInteger(num2, max);

    return Number( ( (n1 + n2)/Math.pow(10, max) ).toFixed(max) );
}

// 减法
function accSubtr(num1, num2){
    var r1 = decimalLength(num1);
    var r2 = decimalLength(num2);

    var max = Math.max(r1, r2);

    var n1 = suffixInteger(num1, max);
    var n2 = suffixInteger(num2, max);

    return Number( ( (n1 - n2)/Math.pow(10, max) ).toFixed(max) );
}
// 乘法
function accMul(num1, num2){
    var r1 = decimalLength(num1);
    var r2 = decimalLength(num2);

    var max = Math.max(r1, r2);

    var n1 = suffixInteger(num1, max);
    var n2 = suffixInteger(num2, max);

    return n1*n2/Math.pow(10, max*2);

}
// 除法
function accDiv(num1, num2){
    var r1 = decimalLength(num1);
    var r2 = decimalLength(num2);

    var max = Math.max(r1, r2);

    var n1 = suffixInteger(num1, max);
    var n2 = suffixInteger(num2, max);

    return n1/n2;
}

export default {
    div: accDiv,
    mul: accMul,
    add: accAdd,
    subtr: accSubtr
}