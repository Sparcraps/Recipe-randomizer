import {
    Ingredient, IngredientCategory, new_ingredient, find_ingredient
} from "./ingredients"
import { Pair } from "./lib/list"

// function read_json_to_array<T>(fd: number): Array<T> {
//     const fs = require('fs');
//     let arr = [];
//     fs.read(fd, (err: Error, buff: Buffer) => {
//         if (err) throw err;
//         const data = buff.toString();
//         arr = JSON.parse(data);
//         console.log(arr);
//     });
//     console.log(arr);
//     return arr;
// }

function save_ingredient(ingredient: Ingredient): void {
    const json_ingredient = JSON.stringify(ingredient, null, 2);
    const filename = "./ingredient_data.json";
    const fs = require('fs');

    try {
        fs.open(filename, 'r+', (err: Error, fd: number) => {
            if (err) throw err;
            try {
                const ingredient_arr: Array<Ingredient> = [];
                // const ingredient_arr: Array<Ingredient> = read_json_to_array(fd);

                // if (!(find_ingredient(ingredient.name, ingredient_arr) === undefined)) {
                //     console.log("hej");
                //     throw new Error("Error: Ingredient with this name already exists.");
                // } else {}

                ingredient_arr.push(ingredient);
                const json_ingredient_arr = JSON.stringify(ingredient_arr, null, 2);
                fs.write(fd, json_ingredient_arr, 0, (err: Error) => {
                    fs.close(fd);
                    if (err) throw err;
                });

            } catch (err) {
                fs.close(fd);
                throw err;
            }
        });

    } catch (err) {
        console.error(err);
    }

    return;
}

const test_category: IngredientCategory = {
    tag: "ingredientcategory", 
    cooking_methods: ["chop", "boil"],
    name: "test category"
};

try {
    save_ingredient(new_ingredient(test_category, "test ingredient", ["cat"], "liters", 100, [50, 500]));
} catch (err) {
    console.error(err);
}