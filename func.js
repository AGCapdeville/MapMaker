
const terrainTileTypes = ["dirt", "grass", "stone", "river"];
const objectTypes = ["hero-spawn", "nightmare-spawn"];
const wallTypes = ["stone-wall"];

let IS_DRAGGING = false;

function changeMapTo(row_length, col_length) {
    let gridContainer = document.querySelector('.grid-container');

    gridContainer.innerHTML = "";
    gridContainer.style.gridTemplateRows = `repeat(${row_length * 2 + 1}, 0fr)`;
    gridContainer.style.gridTemplateColumns = `repeat(${col_length * 2 + 1}, 0fr)`;

    localStorage.setItem("rows", row_length);
    localStorage.setItem("cols", col_length);
            
    for (let row = (row_length * 2); row > -1; row--) {
        for (let col = 0; col < (col_length * 2 + 1); col++) {
            
            let tile = document.createElement("button");
            tile.id = "tile";
            tile.classList.add("cell");
            tile.setAttribute("position", row + ',' + col);

            if (row % 2 == 0 && col % 2 == 0) {
                tile.classList.add("void");
            } else if (row % 2 != 0 && col % 2 != 0) {
                tile.classList.add("space");
                tile.onclick = function() {
                    paintSpace(this);
                };
            } else {
                if (row % 2 == 0) {
                    tile.classList.add("horizontal-wall");
                } else {
                    tile.classList.add("vertical-wall");
                }
                tile.onclick = function() {
                    paintWall(this);
                }
            }

            gridContainer.appendChild(tile);   
        }        
    }

    const tiles = document.querySelectorAll('.grid-container button');

    tiles.forEach(t => {
        t.addEventListener("mouseover", function() {
            if (IS_DRAGGING) {
                t.click();
            }
            let pos = t.getAttribute("position").split(',');
            document.getElementById("currentTile").innerHTML = '[' + (pos[0]/2 - 0.5) + ',' + (pos[1]/2 - 0.5)  + ']';
        });
    });

}

function loadPrevState() {
    prevSelectedTileType = localStorage.getItem("tileType");
    const prevButton = document.querySelector('button[value="'+ prevSelectedTileType + '"]');
    if (prevButton) {
        prevButton.classList.remove("defaultState");
        prevButton.classList.add("selectedTile");
    }
}

function selectTile(element) {
    let terrainTileButtons = document.querySelectorAll('[id="tileButton"]');

    terrainTileButtons.forEach( (tile) => {
        tile.classList.remove("selectedTile");
        if (!tile.classList.contains("defaultState")) {
            tile.classList.add("defaultState");
        }
    });

    element.classList.remove("defaultState");
    element.classList.add("selectedTile");

    localStorage.setItem("tileType", element.value);
}

function paintSpace(element) {
    let type = localStorage.getItem("tileType");

    if (terrainTileTypes.includes(type)) {
        element.style.backgroundColor = "var(--" + type + ")";
    } else if (objectTypes.includes(type)) {
        paintObject(element, type);
    } else if (type == "eraser") {
        element.innerHTML = "";
        element.style = "";
    }
}

function paintObject(element, type) {
    element.innerHTML = "";

    let obj = document.createElement("div");
    obj.id = type;
    obj.style.backgroundColor = "var(--" + type + ")";
    obj.style.width = "20px";
    obj.style.height = "20px";

    element.appendChild(obj);
}

function paintWall(element) {
    let type = localStorage.getItem("tileType");
    if (wallTypes.includes(type)) {
        element.style.backgroundColor = "var(--" + type + ")";
    } else if (type == "eraser") {
        element.innerHTML = "";
        element.style = "";
    }
}

function saveMapToJSON() {
    const tiles = document.querySelectorAll('.grid-container button');
    let tileObjectDictionary = {};

    tiles.forEach(tile => {
        let tileObject = {};
        let position = tile.getAttribute("position").split(',');

        if (tile.innerHTML) {
            tileObject.obj = tile.children[0].id;
        } else {
            tileObject.obj = null;
        }

        let terrain = "space"
        let color = window.getComputedStyle(tile).backgroundColor;
        switch (color) {
            case "rgb(245, 245, 245)": // empty space
                terrain = "space";
                break;
            case "rgb(0, 0, 0)":
                terrain = "void";
                break;
            case "rgb(64, 42, 35)":
                terrain = "dirt";
                break;
            case "rgb(35, 64, 40)":
                terrain = "grass";
                break;
            case "rgb(80, 80, 80)":
                terrain = "stone";
                break;
            case "rgb(0, 83, 154)":
                terrain = "river";
                break;
            case "rgb(46, 46, 46)":
                terrain = "stone-wall";
                break;
            case "rgb(200, 200, 200)":
                terrain = "no-wall";
                break;
            default:
                terrain = "space";
                break;
        }
        tileObject.terrain = terrain; // [space, void, stone-wall, no-wall, dirt, grass, stone, river]
        tileObjectDictionary[position[0] + ",0," + position[1]] = tileObject;
    });


    const validSpaces = ["space", "dirt", "grass", "stone", "river"];
    const walls = ["stone-wall"];

    // since Z is depth, we use x 
    const cardinal_directions = {
        "north":{x: 1, z: 0},
        "east":{x: 0, z: 1}, 
        "south":{x: -1, z: 0}, 
        "west":{x: 0, z: -1}
    };

    Object.entries(tileObjectDictionary).forEach(([key, value]) => {

        if (validSpaces.includes(value.terrain)) {

            let current_x = parseInt(key.split(',')[0]);
            let current_z = parseInt(key.split(',')[2]);

            Object.entries(cardinal_directions).forEach(([k, v]) => {

                let check_position = (current_x + v.x) + ",0," + (current_z + v.z);

                if (walls.includes(tileObjectDictionary[check_position].terrain)) {
                    tileObjectDictionary[key.split(',')[0] + ",0," + key.split(',')[2]][k] = "stone-wall";
                } else {
                    tileObjectDictionary[key.split(',')[0] + ",0," + key.split(',')[2]][k] = "no-wall";
                }
            });
        }
    });

    let onlySpacesDictionary = {"map":{}};
    Object.entries(tileObjectDictionary).forEach(([key, value]) => {
        if (validSpaces.includes(value.terrain)) {
            // Since Z in unity is rows and X is Columns
            onlySpacesDictionary.map[(key.split(',')[2]/2 - 0.5) + ',0,' + (key.split(',')[0]/2 - 0.5)] = value;
        }
    });

    // Since Z in unity is rows and X is Columns
    onlySpacesDictionary["rows"] = localStorage.getItem("cols");
    onlySpacesDictionary["cols"] = localStorage.getItem("rows");

    // Convert the JSON object to a string and then to a Blob
    let jsonString = JSON.stringify(onlySpacesDictionary, null, 2);
    let blob = new Blob([jsonString], { type: 'application/json' });

    // Create a link element, use it to download the JSON file
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'map_data.json'; // Default file name
    document.body.appendChild(a);
    a.click(); // Trigger the download
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Release the object URL

}

function loadJSONMap(inputElement) {
    const file = inputElement.files[0]; // Get the selected file
    const fileNameLabel = document.getElementById('fileName');

    let loadedJSON = {};
    if (file) {
        fileNameLabel.textContent = fileInput.files[0].name;

        const reader = new FileReader();
        reader.onload = function(event) {
            const jsonData = JSON.parse(event.target.result);

            for (let key in jsonData) {
                if (jsonData.hasOwnProperty(key)) {
                    loadedJSON[key] = jsonData[key];
                }
            }

            if (!loadedJSON.map.hasOwnProperty("0,0,0")) {
                console.log('Foundation Key Not Found!');
            } else {
                handleLoadedJSON(loadedJSON);
            }

        };
        reader.readAsText(file);    
    } else {
        console.log('No file selected');
    }
}

function handleLoadedJSON(JSON) {
    changeMapTo(parseInt(JSON.cols), parseInt(JSON.rows));
    
    for (let z = 0; z < parseInt(JSON.cols); z++) {
        for (let x = 0; x < parseInt(JSON.rows); x++) {
            shiftedZ = 2 * z + 1;
            shiftedX = 2 * x + 1;

            let currentSpace = document.querySelector('button[position="' + shiftedZ + ',' + shiftedX +'"]');
            let currentJSONTile = JSON.map[x + ',0,' + z];

            currentSpace.style.backgroundColor = "var(--" + currentJSONTile.terrain + ')'; 

            if (currentJSONTile.hasOwnProperty("obj")) {
                paintObject(currentSpace, currentJSONTile.obj);
            }

            let north = currentJSONTile["north"];   // north: " 0, 0, 1"
            let east = currentJSONTile["east"]; // east:  " 1, 0, 0"
            let south = currentJSONTile["south"];  // south: " 0, 0,-1"
            let west = currentJSONTile["west"]; // west:  "-1, 0, 0"

            if (north == "stone-wall") {
                let wallTile = document.querySelector('button[position="' + (shiftedZ + 1) + ',' + shiftedX +'"]');
                wallTile.style.backgroundColor = "var(--" + north + ")";
            }
            if (east == "stone-wall") {
                let wallTile = document.querySelector('button[position="' + shiftedZ + ',' + (shiftedX + 1) +'"]');
                wallTile.style.backgroundColor = "var(--" + east + ")";
            }
            if (south == "stone-wall") {
                let wallTile = document.querySelector('button[position="' + (shiftedZ - 1) + ',' + shiftedX +'"]');
                wallTile.style.backgroundColor = "var(--" + south + ")";
            }
            if (west == "stone-wall") {
                let wallTile = document.querySelector('button[position="' + shiftedZ + ',' + (shiftedX - 1) +'"]');
                wallTile.style.backgroundColor = "var(--" + west + ")";
            }

        }
    }
}

onload = changeMapTo(8,8);
loadPrevState();

document.addEventListener("mousedown", function() {
    IS_DRAGGING = true;
}, true);
document.addEventListener("mouseup", function() {
    IS_DRAGGING = false;
}, true);

document.getElementById("sizeInputRow").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        let row = document.getElementById("sizeInputRow").value;
        let col = document.getElementById("sizeInputCol").value;
        changeMapTo(row, col);
    }
});
document.getElementById("sizeInputCol").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        let row = document.getElementById("sizeInputRow").value;
        let col = document.getElementById("sizeInputCol").value;
        changeMapTo(row, col);
    }
});
