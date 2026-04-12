const RESERVED_USERNAMES = new Set([
    "about",
    "account",
    "admin",
    "api",
    "auth",
    "available",
    "checkemail",
    "contact",
    "dashboard",
    "delete",
    "forgotpassword",
    "game",
    "games",
    "help",
    "info",
    "login",
    "logout",
    "mail",
    "moderator",
    "notes",
    "owner",
    "privacy",
    "profile",
    "register",
    "requestgame",
    "resendverificationemail",
    "resetpassword",
    "root",
    "security",
    "seed",
    "settings",
    "signin",
    "signup",
    "staff",
    "support",
    "system",
    "terms",
    "test",
    "users",
    "verify",
    "www",
]);

const STRICT_RESERVED_PREFIXES = new Set([
    "admin",
    "moderator",
    "root",
    "staff",
    "support",
]);

export function normalizeUsername(username: string) {
    return username.trim().toLowerCase();
}

export function isReservedUsername(username: string) {
    const normalized = normalizeUsername(username);
    if (RESERVED_USERNAMES.has(normalized)) {
        return true;
    }
    // Block reserved names followed by separators like:
    // admin_user, admin-user, admin.user
    for (const reserved of RESERVED_USERNAMES) {
        if (
            normalized.startsWith(`${reserved}_`)
        ) {
            return true;
        }
    }

    // Optionally block any username starting with highly sensitive reserved words
    for (const reserved of STRICT_RESERVED_PREFIXES) {
        if (normalized.startsWith(reserved)) {
            return true;
        }
    }
    return false;
}

export { RESERVED_USERNAMES, STRICT_RESERVED_PREFIXES };