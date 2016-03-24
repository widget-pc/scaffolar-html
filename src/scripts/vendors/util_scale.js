/* This function return the scale value from a jQuery object. 
 * This use css transform property to get the current value */
function getMatrix(obj){
    var matrix = obj.css("-webkit-transform") ||
                 obj.css("-moz-transform")    ||
                 obj.css("-ms-transform")     ||
                 obj.css("-o-transform")      ||
                 obj.css("transform");
    return matrix;
};

function parseMatrix(_str){
    return _str.replace(/^matrix(3d)?\((.*)\)$/,'$2').split(/, /);
};

function getScaleDegrees(obj){
    var matrix = parseMatrix(getMatrix(obj)), scale = 1;

    if(matrix[0] !== 'none'){
        var a = matrix[0],
            b = matrix[1],
            d = 10;
            
        scale = (Math.sqrt( a*a + b*b ) * d) / d;
    }

    return scale;
};