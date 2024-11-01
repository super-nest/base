export const calculateEstimatedReadingTime = (longDescription: string) => {
    if (!longDescription) {
        return 0;
    }
    const textContent = longDescription.replace(/<[^>]+>/g, '').trim();
    const words = textContent.split(/\s+/);
    const wordCount = words.length;
    return Math.ceil(wordCount / 200);
};
