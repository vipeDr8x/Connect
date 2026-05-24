export function getMessageAsVibrationsArray(messageInMorse: string): number[] {

    const VIBRATIONS_MAPPER = {'.': [50, 50], '-': [150, 50], ' ': 100, '/': 200} // all values are in ms, separations of words is -> ' / ' -> 400ms, not 200ms
    let vibrationsArr: number[] = [];

    for (const code of messageInMorse) {
        switch (code) {
            case '.':
            case '-':
                vibrationsArr.push(...VIBRATIONS_MAPPER[code]);
                break;
            case ' ':
            case '/':
                vibrationsArr[vibrationsArr.length - 1] += VIBRATIONS_MAPPER[code];
                break;
        }
    }

    return vibrationsArr;

}