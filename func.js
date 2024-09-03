
const terrainTileTypes = ["dirt", "grass", "stone", "river"];
const objectTypes = ["hero", "nightmare"];
const wallTypes = ["stoneWall"];

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
    prevButton.classList.remove("defaultState");
    prevButton.classList.add("selectedTile");
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
    let JSON = [];


    // Dynamically adding properties
    // dynamicObject.name = "Jane Doe";
    // dynamicObject.age = 25;
    // dynamicObject.skills = ["Python", "Django"];
    // dynamicObject.address = {
    //     street: "456 Elm St",
    //     city: "Othertown",
    //     zip: "67890"
    // };

    let objArray = [];

    tiles.forEach(tile => {
        let tileObj = {};
        // console.log(tile.getAttribute("position"));
        let position = tile.getAttribute("position").split(',');

        if (tile.innerHTML) {
            console.log(tile.children[0].id);
,            tile.obj = tile.children[0].id;
        }

        let cell = "space"
        switch (window.getComputedStyle(tile).backgroundColor) {
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
                cell = "stone wall";
            case "rgb(200, 200, 200)":
                cell = "no wall";
            default:
                cell = "space";
                break;
        }
        tileObj.cell = cell; // [space, void, wall, dirt, grass, stone, river]


        //TODO: create a dictionary of tiles so to create complex unity
        
        // switch (tile.style.backgroundColor) {
        //     case "#1234":
        //         break;
        //     default:
        //         break;
        // }
    });
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
