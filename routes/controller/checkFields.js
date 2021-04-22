module.exports = async (allFields) => {
    let isEmpty = false;
    allFields.forEach((i) => {
        if(i == ""){
            isEmpty = true;
        }
    })
    return isEmpty;
}