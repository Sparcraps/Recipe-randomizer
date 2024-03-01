"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate_recipe = exports.new_recipe = void 0;
var list_1 = require("../lib/list");
var save_load_data_1 = require("../data/save_load_data");
var cooking_steps_1 = require("./cooking_steps");
var generate_name_1 = require("./generate_name");
var ingredients_methods_1 = require("./ingredients_methods");
var printing_1 = require("./printing");
var data = (0, save_load_data_1.load_data)();
function new_recipe(portions) {
    return {
        tag: "recipe", name: "",
        portions: portions,
        ingredient_info: [], steps: [], kcal_per_portion: 0
    };
}
exports.new_recipe = new_recipe;
function generate_recipe(min_max_kcal, portions, filters) {
    var recipe = new_recipe(portions);
    var selected_methods = (0, ingredients_methods_1.randomize_ingredients_and_methods)(min_max_kcal, recipe, filters, data);
    var steps = (0, cooking_steps_1.generate_cooking_steps)(selected_methods, data);
    recipe.steps = steps;
    try {
        recipe.name = (0, generate_name_1.generate_name)(recipe);
    }
    catch (err) {
        console.error(err);
    }
    return recipe;
}
exports.generate_recipe = generate_recipe;
if (require.main === module) {
    var recipe = generate_recipe((0, list_1.pair)(400, 700), 4, []);
    (0, printing_1.print_recipe)(recipe);
}