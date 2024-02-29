import {
    prompt
} from "./main_menu";

import {
    type Ingredient, empty_ingredient
} from "../basics";

import {
    type Pair, pair
} from "../lib/list";

import {
    push
} from "../lib/stack";

import {
    type Configuration, add_to_dietary_restrictions, change_portion_amount,
    load_configuration, remove_from_dietary_restrictions
} from "../save_config";

import {
    type SaveData, delete_ingredient, load_data, save_new_ingredient
} from "../save_load_data";

import {
    valid_dietary_restrictions
} from "./main_menu";

import {
    check_input, integer_prompt, print_alternatives, print_bold
} from "./menu_global_functions";

import {
    get_menu_memory, set_menu_memory, oblivion
} from "./menu_memory";

/**
 * A submenu of main menu, where the user can select
 * what they want to configure.
 */
export function configure(): void {
    //submenu for changing portion size
    function configure_portion(): void {            
        valid_inputs = ["y", "n"];

        console.log("Current portion amount: " + config.portion_amount.toString());
        user_input = check_input(valid_inputs, "Do you wish to change the portion amount? (y/n): ");

        if (user_input === "y") {
            const input_int = integer_prompt("Enter new portion amount: ")
            config = change_portion_amount(input_int, config);
            console.log("New amount registered.")
        } else if (user_input === "n") {
            oblivion();
        } else {
            throw new Error("Error: invalid user_input has escaped.");
        }
    }

    //submenu for dietary restrictions where active restrictions can be viewed
    function dietary_prompt(): void {
        //subsubmenu for dietary restrictions where active restrictions can be changed
        function configure_dietary(): void {
            //prompts the user to enter a valid dietary restriction and returns the
            //input as well as information of its existance in currently active dietary restrictions
            function select_valid_dietary(): Pair<boolean, string> {
                const valid = valid_dietary_restrictions;

                print_bold("Valid alternatives: ");
                print_alternatives(valid);
                
                const input = check_input(valid, "Choose dietary restriction of the above: ");
                const is_already_in_arr = config.dietary_restrictions.includes(input);
                return pair(is_already_in_arr, input);
            }

            function add_diet(): void {
                const diet_pair = select_valid_dietary();
                if (!diet_pair[0]) {
                    config = add_to_dietary_restrictions(diet_pair[1], config);
                    console.log("Dietary restriction successfully added!")
                } else {
                    console.log("Dietary restriction not added; it is already active.")
                }
            }

            function remove_diet(): void {
                const diet_pair = select_valid_dietary();
                if (diet_pair[0]) {
                    config = remove_from_dietary_restrictions(diet_pair[1], config);
                    console.log("Dietary restriction successfully removed!")
                } else {
                    console.log("Dietary restriction not removed; it is not active.")
                }
            }

            print_menu = ['"a" = add dietary restriction', '"r" = remove dietary restriction',
                          '"v" = view active dietary restrictions', '"b" = back to configurations menu'];
            valid_inputs = ["a", "r", "v", "b"];
    
            print_alternatives(print_menu);
            user_input = check_input(valid_inputs, "Choose an alternative: ");
            
            if (user_input === "a") {
                add_diet();
            } else if (user_input === "r") {
                remove_diet();
            } else if (user_input === "v") {
                view_active_diet();
            } else if (user_input === "b") {
                oblivion(2);
            } else {
                throw new Error("Error: invalid user_input has escaped.");
            }
        }

        function view_active_diet(): void {
            print_bold("Active dietary restrictions: ");
            print_alternatives(config.dietary_restrictions);
        }

        valid_inputs = ["y", "n"];

        view_active_diet();
        user_input = check_input(valid_inputs, "Do you wish to change the active dietary restrictions? (y/n): ");

        if (user_input === "y") {
            set_menu_memory(push(configure_dietary, get_menu_memory()));
        } else if (user_input === "n") {
            oblivion();
        } else {
            throw new Error("Error: invalid user_input has escaped.");
        }
    }

    //submenu for configuring ingredients
    function configure_ingredients(): void {
        //submenu for adding an ingredient
        function select_name(ingredient: Ingredient, print_contents = false): Ingredient {
            if (print_contents) {
                console.log("Current ingredient name: " + ingredient.name);
            } else {}
            
            let name = prompt("Enter new ingredient name: ").trim().toLowerCase();
            console.log();
            while (name === "") {
                console.log("Ingredient name cannot be empty / only contain whitespace.")
                name = prompt("Enter new ingredient name: ").trim().toLowerCase();
            }
            ingredient.name = name;
            return ingredient;
        }

        function select_category(ingredient: Ingredient, print_contents = false): Ingredient {
            if (print_contents) {
                console.log("Current ingredient category: " + ingredient.category);
            } else {}

            print_bold("Valid ingredient categories: ");
            const category_names: Array<string> = [];
            const cats = data.categories;
            for (let i = 0; i < cats.length; i++) {
                category_names[i] = cats[i].name;
            }
            print_alternatives(category_names);
            user_input = check_input(
                category_names,
                "Choose which category the new ingredient belongs to: "
                );
            ingredient.category = user_input;
            return ingredient;
        }

        function select_allergies(ingredient: Ingredient, print_contents = false): Ingredient {
            if (print_contents) {
                console.log("Current ingredient dietary restrictions: ");
                print_alternatives(ingredient.allergies);
            } else {}

            const allergy_array: Array<string> = [];
            const valid_dietary_not_active = [...valid_dietary_restrictions];
            valid_dietary_not_active.push("");

            print_bold("Valid dietary restrictions: ");
            print_alternatives(valid_dietary_restrictions);
            user_input = check_input(
                valid_dietary_not_active,
                "Enter a dietary restriction of the above that applies to the new ingredient, " +
                "or press enter if no dietary restrictions apply: ");
            while (user_input !== "") {
                allergy_array.push(user_input);
                const index = valid_dietary_not_active.indexOf(user_input);
                if (index !== -1) {
                    valid_dietary_not_active.splice(index, 1);
                } else {
                    throw new Error("Error: could not find active dietary restriction");
                }

                print_bold("Valid dietary restrictions that have not yet been added: ");
                print_alternatives(valid_dietary_not_active);
                user_input = check_input(
                    valid_dietary_not_active,
                    "Enter another dietary restriction that applies to the new ingredient, " +
                    "or press enter if no more dietary restrictions apply: ");
            }
            ingredient.allergies = allergy_array;
            return ingredient;
        }

        function select_measurement(ingredient: Ingredient, print_contents = false): Ingredient {
            if (print_contents) {
                console.log("Current ingredient measurement: " + ingredient.measurement);
            } else {}

            ingredient.measurement = prompt('Enter unit of measurement either as amount in the format of a float number, or as a float followed by a string, e.g. "0.5dl": ').trim().toLowerCase();
            return ingredient;
        }

        function select_kcal_per_measurement(ingredient: Ingredient, print_contents = false): Ingredient {
            if (print_contents) {
                console.log("Current ingredient kcal per measurement: " + ingredient.kcal_per_measurement.toString());
            } else {}

            ingredient.kcal_per_measurement = integer_prompt("Enter the amount of kcal per measurement (rounded to nearest integer) for the new ingredient: ");
            return ingredient;
        }

        function select_range(ingredient: Ingredient, print_contents = false): Ingredient {
            if (print_contents) {
                console.log("Current ingredient amount range: " + ingredient.range[0].toString() + " - " + ingredient.range[1].toString());
            } else {}

            let lower_range = integer_prompt("Enter the lower limit for the amount able to be randomized of the new ingredient, measured in the ingredients measurement: ");
            while (lower_range < 0) {
                console.log("the lower limit cannot be negative");
                lower_range = integer_prompt("Please choose a new lower limit: ");
            }
            let upper_range = integer_prompt("Enter the upper limit for the amount able to be randomized of the new ingredient, measured in the ingredients measurement: ");
            while (upper_range < lower_range) {
                console.log("the upper limit cannot be lower than the lower limit");
                upper_range = integer_prompt("Please choose a new upper limit: ");
            }
            ingredient.range = pair(lower_range, upper_range);
            return ingredient;
        }

        function add_ingredient_menu(): void {
            let new_ingredient: Ingredient = empty_ingredient();
            new_ingredient = select_name(new_ingredient);
            new_ingredient = select_category(new_ingredient);
            new_ingredient = select_allergies(new_ingredient);
            new_ingredient = select_measurement(new_ingredient);
            new_ingredient = select_kcal_per_measurement(new_ingredient);
            new_ingredient = select_range(new_ingredient);

            const keys = Object.keys(new_ingredient);
            const values = Object.values(new_ingredient);

            print_bold("Data for the new ingredient: ")
            print_alternatives(keys);
            for (let i = 0; i < values.length; i++) {
                console.log(values[i]);
            }

            valid_inputs = ["y", "n"];
            user_input = check_input(valid_inputs, "Are you happy with the ingredient data? (y/n): ");

            if (user_input === "y") {
                save_new_ingredient(new_ingredient);
                oblivion();
            } else if (user_input === "n") {
                set_menu_memory(push(ingredient_adjustments, get_menu_memory()));
            } else {
                throw new Error("Error: invalid user_input has escaped.");
            }
            
            //submenu for when adjusting a newly registered ingredient
            function ingredient_adjustments(): void {
                print_menu = [
                    '"n" = change ingredient name',
                    '"c" = change ingredient categories',
                    '"d" = change ingredient dietary restrictions',
                    '"m" = change ingredient measurement',
                    '"k" = change ingredient kcal per measurement',
                    '"r" = change ingredient amount range',
                    '"b" = save ingredient and go back to ingredient menu'
                ];
                valid_inputs = ["n", "c", "d", "m", "k", "r", "b"]

                print_alternatives(print_menu)
                user_input = check_input(valid_inputs, "Choose what ingredient data you want to adjust: ")

                if (user_input === "n") {
                    new_ingredient = select_name(new_ingredient);
                } else if (user_input === "c") {
                    new_ingredient = select_category(new_ingredient);
                } else if (user_input === "d") {
                    new_ingredient = select_allergies(new_ingredient);
                } else if (user_input === "m") {
                    new_ingredient = select_measurement(new_ingredient);
                }  else if (user_input === "k") {
                    new_ingredient = select_kcal_per_measurement(new_ingredient);
                } else if (user_input === "r") {
                    new_ingredient = select_range(new_ingredient);
                } else if (user_input === "b") {
                    save_new_ingredient(new_ingredient);
                    oblivion(2);
                } else {
                    throw new Error("Error: invalid user_input has escaped.");
                }
            }
        }

        function remove_ingredient_menu(): void {
            function search_and_delete(): void {
                let input = prompt("Enter search string, or press enter to go back without removing an ingredient: ").trim().toLowerCase();
                if (input !== "") {
                    try {
                        data = delete_ingredient(input);
                    } catch { //might have to handle error
                        console.log("There is no ingredient with that name.")
                    }
                } else {}
            }

            function print_all_ingredients(): void {
                const ingr = data.ingredients;

                print_bold("Currently registered ingredients: ")
                for (let i = 0; i < ingr.length; i++) {
                    for (let j = 0; j < ingr[i].length; j++) {
                        console.log("- " + ingr[i][j].name);
                    }
                }
            }

            print_menu = [
                '"s" = search for ingredient by name',
                '"l" = display a list of existing ingredients before searching for ingredient by name',
                '"b" = back to ingredient menu'];
            valid_inputs = ["s", "l", "b"];
            
            print_alternatives(print_menu);
            user_input = check_input(valid_inputs, "Choose an alternative: ");

            if (user_input === "s") {
                search_and_delete();
            } else if (user_input === "l") {
                print_all_ingredients();
                search_and_delete();
            } else if (user_input === "b") {
                oblivion();
            } else {
                throw new Error("Error: invalid user_input has escaped.");
            }
        }

        valid_inputs = ["a", "r", "b"];
        print_menu = ['"a" = add ingredient', '"r" = remove ingredient', '"b" = back to configurations menu'];

        print_alternatives(print_menu);
        user_input = check_input(valid_inputs, "Choose an alternative: ");

        if (user_input === "a") {
            set_menu_memory(push(add_ingredient_menu, get_menu_memory()));
        } else if (user_input === "r") {
            set_menu_memory(push(remove_ingredient_menu, get_menu_memory()));
        } else if (user_input === "b") {
            oblivion();
        } else {
            throw new Error("Error: invalid user_input has escaped.");
        }
    }

    let config: Configuration = load_configuration();
    let data: SaveData = load_data();
    let print_menu = ['"p" = portion amount',
                  '"d" = dietary restrictions',
                  '"i" = ingredient data',
                  '"b" = back to main menu'];
    let valid_inputs = ["p", "d", "i", "b"];

    print_alternatives(print_menu);
    let user_input = check_input(valid_inputs, "Choose what you want to configure: ");

    if (user_input === "p") {
    set_menu_memory(push(configure_portion, get_menu_memory()));
    } else if (user_input === "d") {
    set_menu_memory(push(dietary_prompt, get_menu_memory()));
    } else if (user_input === "i") {
    set_menu_memory(push(configure_ingredients, get_menu_memory()));
    } else if (user_input === "b") {
    oblivion();
    } else {
    throw new Error("Error: invalid user_input has escaped.");
    }
}