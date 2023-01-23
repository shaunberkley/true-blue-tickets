export function simpleSearch(
    searchText: string,
    items: any[],
    searchParameter: string
) {
    return items.filter((e: any) =>
        e[searchParameter].toLowerCase().includes(searchText.toLowerCase())
    );
}
