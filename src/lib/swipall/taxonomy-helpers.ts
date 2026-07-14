export function sortByLabel<T extends { value: string | null; name: string }>(items: T[]): T[] {
    return [...items].sort((a, b) =>
        (a.value ?? a.name).localeCompare(b.value ?? b.name, 'es', { sensitivity: 'base' })
    );
}
