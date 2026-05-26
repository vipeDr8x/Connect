const MAPPER: Record<string, string> = {
  'а': '.-', 'б': '-...', 'в': '.--', 'г': '--.', 'д': '-..', 'е': '.', 'ж': '...-', 
  'з': '--..', 'и': '..', 'й': '.---', 'к': '-.-', 'л': '.-..', 'м': '--', 'н': '-.', 
  'о': '---', 'п': '.--.', 'р': '.-.', 'с': '...', 'т': '-', 'у': '..-', 'ф': '..-.', 
  'х': '....', 'ц': '-.-.', 'ч': '---.', 'ш': '----', 'щ': '--.-', 'ъ': '--.--', 
  'ю': '..--', 'я': '.-.-',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', ':': '---...', ';': '-.-.-.',
  '/': '-..-.', '=': '-...-', '+': '.-.-.', '-': '-....-', 
  '\'': '.----.', '"': '.-..-.', '(': '-.--.', ')': '-.--.-', '@': '.--.-.', 
  ' ': '/'
};

const reverseMapper = Object.fromEntries(Object.entries(MAPPER).map((v) => [v[1], v[0]]));

export function translateToMorse(text: string): string {
    let morseCodedArr: string[] = [];

    for (let c of text) {
        c = c.toLowerCase();
        if (!(c in MAPPER)) {
            
            throw new Error(`Символът ${c} не се поддържа!`); 
        }
        morseCodedArr.push(MAPPER[c]);
    }

    return morseCodedArr.join(" ");
}

export function translateFromMorse(morseCode: string): string {
    
    const words = morseCode.trim().split(/\s*\/\s*/);
    const decodedWords: string[] = [];

    for (let word of words) {
        if (word === "") continue;
        
        
        const characters = word.split(/\s+/);
        let decodedWord = "";
        
        for (let code of characters) {
            if (code === "") continue;
            if (!(code in reverseMapper)) {
                throw new Error(`Символът ${code} не се поддържа!`);
            }
            decodedWord += reverseMapper[code];
        }
        decodedWords.push(decodedWord);
    }

    
    return decodedWords.join(" ");
}