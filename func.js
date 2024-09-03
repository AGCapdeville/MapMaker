
const terrainTileTypes = ["dirt", "grass", "stone", "river"];
const objectTypes = ["hero-spawn", "nightmare-spawn"];
const wallTypes = ["stone-wall"];

let IS_DRAGGING = false;

function changeMapTo(row_length, col_length) {
    let gridContainer = document.querySelector('.grid-container');

    gridContainer.innerHTML = "";
    gridContainer.style.gridTemplateRows = `repeat(${row_length * 2 + 1}, 0fr)`;
    gridContainer.style.gridTemplateColumns = `repeat(${col_length * 2 + 1}, 0fr)`;

    // for (let row = 0; row < (row_length * 2 + 1); row++) {
    //     for (let col = 0; col < (col_length * 2 + 1); col++) {
            
    for (let row = (row_length * 2); row > -1; row--) {
        for (let col = 0; col < (col_length * 2 + 1); col++) {
            
            let cell = document.createElement("button");
            cell.id = "cellTile";
            cell.classList.add("cell");
            cell.setAttribute("position", row + ',' + col);

            if (row % 2 == 0 && col % 2 == 0) {
                cell.classList.add("void");
            } else if (row % 2 != 0 && col % 2 != 0) {
                cell.classList.add("space");
                cell.onclick = function() {
                    paintSpace(this);
                };
            } else {
                if (row % 2 == 0) {
                    cell.classList.add("horizontal-wall");
                } else {
                    cell.classList.add("vertical-wall");
                }
                cell.onclick = function() {
                    paintWall(this);
                }
            }

            gridContainer.appendChild(cell);   
        }        
    }

    const cells = document.querySelectorAll('.grid-container button');

    cells.forEach(c => {
        c.addEventListener("mouseover", function() {
            if (IS_DRAGGING) {
                c.click();
            }
            let pos = c.getAttribute("position").split(',');
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
        element.innerHTML = "";

        let obj = document.createElement("div");
        obj.id = type;
        obj.style.backgroundColor = "var(--" + type + ")";
        obj.style.width = "20px";
        obj.style.height = "20px";

        element.appendChild(obj);
    } else if (type == "eraser") {
        element.innerHTML = "";
        element.style = "";

    }
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

        let cell = "space"
        let color = window.getComputedStyle(tile).backgroundColor;
        switch (color) {
            case "rgb(245, 245, 245)": // empty space
                cell = "space";
                break;
            case "rgb(0, 0, 0)":
                cell = "void";
                break;
            case "rgb(64, 42, 35)":
                cell = "dirt";
                break;
            case "rgb(35, 64, 40)":
                cell = "grass";
                break;
            case "rgb(80, 80, 80)":
                cell = "stone";
                break;
            case "rgb(0, 83, 154)":
                cell = "river";
                break;
            case "rgb(46, 46, 46)":
                cell = "stone-wall";
                break;
            case "rgb(200, 200, 200)":
                cell = "no-wall";
                break;
            default:
                cell = "space";
                break;
        }
        tileObject.cell = cell; // [space, void, stone-wall, no-wall, dirt, grass, stone, river]
        tileObjectDictionary[position[1] + ",0," + position[0]] = tileObject; // Filped due to X being horizontal & Z is depth
    });


    const validSpaces = ["space", "dirt", "grass", "stone", "river"];
    const walls = ["stone-wall"];
    const cardinal_directions = [{x: 0, z: 1}, {x: 1, z: 0}, {x: 0, z: -1}, {x: -1, z: 0}];

    // tileObjectDictionary.forEach((key, value) => {
    Object.entries(tileObjectDictionary).forEach(([key, value]) => {

        if (validSpaces.includes(value.cell)) {
            
            let current_x = Number(key.split(',')[0]);
            let current_z = Number(key.split(',')[2]);

            cardinal_directions.forEach((diriection) => {

                let check_position = (current_x + diriection.x) + ",0," + (current_z + diriection.z);

                if (walls.includes(tileObjectDictionary[check_position].cell)) {
                    tileObjectDictionary[key][check_position] = "stone-wall";
                } else {
                    tileObjectDictionary[key][check_position] = "no-wall";
                }
            });
        }
    });

    console.log(tileObjectDictionary);

    // Convert the JSON object to a string and then to a Blob
    let jsonString = JSON.stringify(tileObjectDictionary, null, 2);
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
