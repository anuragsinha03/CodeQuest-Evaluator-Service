export default function pythonCodeCreator(
	startingCode: string,
	middleCode: string,
	endCode: string
): string {
	return `
    ${startingCode} 
    ${middleCode}
    ${endCode}`;
}

/*
 * For Python, endCode can be passed as empty string
 * For Java, endCode can be passed as empty string
 *
 *
 */
