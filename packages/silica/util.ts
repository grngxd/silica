// eg: const a = { b: { c: { d: 1 } } };
// getNestedProperty(a, 'b.c.d') // returns 1
export const getNestedProperty = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
}