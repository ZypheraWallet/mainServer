export function havePermission(scope: string, userScopes: string[]): boolean {
    if (!userScopes || userScopes.length === 0) return false;

    if (userScopes.includes('*')) return true;

    if (userScopes.includes(scope)) return true;

    const [resource, action] = scope.split(':');

    if (userScopes.includes(`${resource}:*`)) return true;

    return false;
}
