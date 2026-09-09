try {

    const response = await fetch("https://dummyjson.com/products?limit=10&skip=0");
    //const response = await fetch("https://dummyjson.com/http/500");

    if (!response.ok) throw new Error(
        `Response's OK: ${response.ok}, code status: ${response.status}.`
    );

    console.log(`Response's OK: ${response.ok}`);

    const data: unknown = await response.json();

    if (typeof data !== "object" || data === null) throw new Error(
        `Data is not an object.`
    );
    if (!("products" in data)) throw new Error(
        `Property "products" not exist.`
    );
    if (!Array.isArray(data.products)) throw new Error(
        `"products" is not an array.`
    );
    
    data.products.forEach((p, index) => {

        if (typeof p.id !== "number") throw new Error(
            `Product at index [${index}]: property "id" is not a number: ${p.id}.`
        )
        if (typeof p.title !== "string") throw new Error(
            `Product at index [${index}]: property "title" is not a string: ${p.title}.`
        )
        if (typeof p.price !== "number") throw new Error(
            `Product at index [${index}]: property "price" is not a number: ${p.price}.`
        )
    });

    console.table(data.products, ["id", "title", "price"]);

} catch(e) {
    console.log(
        `Query error.\n${e}`
    );
}