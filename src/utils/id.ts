export const idEq = (a: string | number | null | undefined, b: string | number | null | undefined) =>
    String(a) === String(b)

export const toId = (x: unknown) => String(x ?? '')
