export async function replaceAsync(
    str: string, regex: RegExp, asyncFn: (substring: string, ...args: unknown[]) => Promise<string>
): Promise<string> {
    const promises = new Array<Promise<string>>();
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
        return match;
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => {
        const shift = data.shift();
        if (!shift) {
            throw new Error("Some how it didn't quite align.");
        }
        return shift;
    });
}
