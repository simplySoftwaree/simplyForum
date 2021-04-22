module.exports = async (arr, startPoint) => {
    let endPoint = 20;
    if(arr.length > startPoint * 20){
        return endPoint = startPoint * 20;
    }else{
        return endPoint = arr.length;
    };
}