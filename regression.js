const papa = require('papaparse');
const fs = require('fs');
const math = require('mathjs')

const dataFile = fs.readFileSync("data.csv", 'utf8')
var json = papa.parse(dataFile)
const columns = json.data[0];

//remove off the columns
json.data.splice(0, 1)
//remove off the last empty row
json.data.splice(json.data.length - 1, 1)

//regex to see if an entry is not strictly a number
var re = /[a-zA-Z]+/

//empty array to hold what values need to be replaced with dummies
var uniques = []
for (let i = 0; i < columns.length; i++) {
    uniques[i] = new Set();
}

for (let i of json.data) {
    let index = 0; //keep track of the index we are working with
    for (let j of i) {
        if (j.match(re) == null) {
            index++;
            continue;
        }
        // if the string contains more than just numbers, it is a categorical variable
        uniques[index].add(j);
        index++;
    }
}

//now that we have which variables are not numbers, we can iterate and replace with dummies. The uniques array can also serve as a key too.
//find the indices of the values that need dummies and also convert the sets into lists for easier indexing
dummyIndices = [];
uniques.forEach((arr, index) => {
    //convert set to array
    uniques[index] = [...arr];
    if (arr.size > 0) {
        dummyIndices.push(index);
    }
})

let indexI = 0
for (let i of json.data) {
    let indexJ = 0;
    for (let j of i) {
        //check to see if this index is one that needs a dummy value
        if (dummyIndices.includes(indexJ)) {
            //if it is, replace it with a dummy
            json.data[indexI][indexJ] = uniques[indexJ].indexOf(j);
        } else {
            //convert the strings to floats
            json.data[indexI][indexJ] = parseFloat(j);
        }
        indexJ++;
    }
    indexI++;
}


//now our data is pure numbers and we can do the regression
//this is where you do your magic with selecting the X and Y values. I will use all the values to predict education level(column 4/ index 3)




var X = [];
var Y = [];

//just doing this with variables to help you out
target = 3;

//just make sure the target isn't possible to select
selected = [1, 2, 4];

//theres gotta be a better way than looping through all this
json.data.forEach((arr) => {
    Y.push(arr.slice(target, target + 1)[0]);

    //add all the selected into an array, then push it to X
    let tempArr = [];
    selected.forEach(num => tempArr.push(arr[num]))

    //add the bias
    tempArr.push(1);
    X.push(tempArr);
})

//least squares
w = math.multiply(math.inv(math.multiply(math.transpose(X), X)), math.multiply(math.transpose(X), Y));

y = math.multiply(X, w);

console.log(y)
