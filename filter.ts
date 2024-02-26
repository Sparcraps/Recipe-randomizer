import {
    type Ingredient
} from "./basics"



export function filter_allergies(ingredients: Array<Array<Ingredient>>, allergies: Array<string>): Array<Array<Ingredient>>{
    for(let categoryindex = 0; categoryindex < ingredients.length; categoryindex ++)
    {
        for(let ingredientindex = ingredients[categoryindex].length - 1; ingredientindex >= 0; ingredientindex = ingredientindex - 1)
        {
            const ingredientallergy = ingredients[categoryindex][ingredientindex].allergies;
            for(let userallergyindex = 0; userallergyindex < allergies.length; userallergyindex++)
            {
                if(ingredientallergy.includes(allergies[userallergyindex]))
                {
                    ingredients[categoryindex].splice(ingredientindex, 1);
                }
            }
        }
    }
    return ingredients;
}

