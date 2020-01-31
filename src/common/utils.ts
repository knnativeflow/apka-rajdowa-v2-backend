export function isObjectID(text: string): boolean {
    const regex = new RegExp('^[0-9a-fA-F]{24}$')
    return regex.test(text)
}

export function byIdQuery(id: string): {_id: string} | {slug: string} {
    return isObjectID(id)
        ? { _id: id }
        : { slug: id }
}