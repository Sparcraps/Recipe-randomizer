import { KitchenWare, Method, has_separable_inventory } from "../basics";
import { Pair, head, pair, tail } from "../lib/list";
import { SaveData } from "../data/save_load_data";

/**
 * CookingStep data type.
 * contains the name of one cooking method, the ingredients it's applied to
 * and the kitchenware used for it.
 */
export type CookingStep = {
    ingredient_names: Array<string>,
    cooking_method: string,
    kitchenware: KitchenWare
    is_kw_existing: boolean
};

function new_cooking_step(
    cooking_method: string, ingredient_names: Array<string>,
    kitchenware: KitchenWare,
    is_kw_existing: boolean
    ): CookingStep {
    return {
        cooking_method, ingredient_names, kitchenware, is_kw_existing
    };
}

/** Generates cooking steps from already randomized ingredient information.
 * @param selected_methods - Array containing methods and ingredient names.
 * @param kw_data - Array of kitchenware to use in cooking steps generation.
 * @returns an array of CookingStep objects.
*/
export function generate_cooking_steps(
    selected_methods: Array<Pair<Method, Array<string>>>,
    data: SaveData
): Array<CookingStep> {
    const cooking_steps: Array<CookingStep> = [];
    const active_kitchenware: Array<KitchenWare> = [];

    const kw_data: Array<KitchenWare> = JSON.parse(JSON.stringify( // creates copy of kitchenware data
        data.kitchenware
    ));

    // first looks for kitchenware with the cooking method in the recipe's active
    // kitchenware, then looks in saved kitchenware, and returns the first one it finds
    // in a pair with a boolean for whether of not the kitchenware was already active.
    // needs to be updated to choose randomly if multiple kitchenware have the cooking method available
    function get_kitchenware_from_method(cooking_method: string): Pair<KitchenWare, boolean> {
        for (let i = 0; i < active_kitchenware.length; i++) {
            const kw = active_kitchenware[i];
            if (kw.cooking_methods.includes(cooking_method)) {
                return pair(kw, true);
            }
        }

        for (let i = 0; i < kw_data.length; i++) {
            const kw = kw_data[i];
            if (kw.cooking_methods.includes(cooking_method)) {
                const copy_kw = JSON.parse(JSON.stringify(kw)); // copies kitchenware if it's from save data
                active_kitchenware.push(copy_kw);
                return pair(copy_kw, false);
            }
        }

        throw new Error("No kitchenware with cooking method " + cooking_method + "exists.");
    }


    // adds cooking step to steps array, removes first element in method, calls
    // recursively until method is empty.
    function add_cooking_step(
        method: Array<string>, ingredient_names: Array<string>, 
        steps: Array<CookingStep>, kw: KitchenWare | undefined = undefined
        ): void {
        if (method.length === 0) {
            return;
        } else {}

        const current_method = method[0];
        method.shift(); // removes current method from method

        let kw_exists = true;
        if (kw === undefined || !kw.cooking_methods.includes(current_method)) {
            [kw, kw_exists] = get_kitchenware_from_method(current_method);
        } else {}

        let extra_i: Array<string> = [];
        if (has_separable_inventory(kw)) {
            extra_i = do_separable_method(current_method);
        } else {}

        const current_step = new_cooking_step(
            current_method, [...ingredient_names, ...extra_i], kw, kw_exists
            );
        steps.push(current_step);

        const more_ingredients = do_similar_methods(method, steps); // finds ingredients that use the same method as the rest of method from some point.
        ingredient_names.push(...more_ingredients);

        return add_cooking_step(method, ingredient_names, steps);
    }

    // for separable kitchenware, finds all ingredients with same cooking method
    // first in method array and returns ingredient names for method step.
    function do_separable_method(method: string): Array<string> {
        const ingredient_names: Array<string> = [];
        for (let i = 0; i < selected_methods.length; i++) {
            const other_method = head(selected_methods[i]);
            const m = other_method[0];
            if (m === method) {
                const names = tail(selected_methods[i]);
                ingredient_names.push(...names); // adds ingredient for matching method to list
                other_method.shift(); // removes method from other_method
            }
        }
        return ingredient_names;
    }

    // finds methods that contain the input method at the end and adds cooking
    // steps for the earlier parts of their methods. 
    // Returns their ingredient names.
    function do_similar_methods(
        method: Array<string>, steps: Array<CookingStep>
        ): Array<string> {
        const ingredient_names: Array<string> = [];
        for (let i = 0; i < selected_methods.length; i++) {
            const other_method = head(selected_methods[i]);
            if (other_method === method) {
                continue;
            } else {}
            const copy_method = [...other_method];
            for (let j = 0; j < other_method.length; j++) {
                if (copy_method.toString() === method.toString()) {
                    const names = tail(selected_methods[i])
                    ingredient_names.push(...names); // adds ingredient for matching method to list
                    other_method.splice(j, method.length); // removes part of other method that matches method
                    add_cooking_step(other_method, names, steps);
                    break;
                } else {
                    copy_method.shift();
                }
            }
        }
        return ingredient_names;
    }

    for (let i = 0; i < selected_methods.length; i++) {
        const [method, ingredients] = selected_methods[i];
        if (!(method.length === 0)) {
            const more_ingredients = do_similar_methods(method, cooking_steps);
            ingredients.push(...more_ingredients);
            add_cooking_step(method, ingredients, cooking_steps);
        } else {}
    }

    return cooking_steps;
}