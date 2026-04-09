/**
 * Generates a title for a note based on its content.
 * If the first 11 characters contain a whitespace at position 10 (index 10),
 * returns the first 10 characters. Otherwise, returns the first 7 characters followed by "..."
 */
export function generateNoteTitle(content: string): string {
    if (content.length < 18) {
        return content;
    }

    const thirteenChars = content.substring(0, 18);
    const lastChar = thirteenChars[17];

    if (lastChar === ' ' || /\s/.test(lastChar)) {
        return content.substring(0, 17);
    } else {
        return content.substring(0, 14) + '...';
    }
}
