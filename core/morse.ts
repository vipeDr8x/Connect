const MAPPER: Record<string, string> = {а:'.-',б:'-...',в:'.--',г:'--.',д:'-..',е:'.',ж:'...-',з:'--..',и:'..',й:'.---',к:'-.-',л:'.-..',м:'--',н:'-.',о:'---',п:'.--.',р:'.-.',с:'...',т:'-',у:'..-',ф:'..-.',х:'....',ц:'-.-.',ч:'---.',ш:'----',щ:'--.-',ъ:'--.--',ю:'..--',я:'.-.-','.' :'.-.-.-',',' :'--..--','?' :'..--..','!' :'-.-.--',':' :'---...',';' :'-.-.-.','/' :'-..-.','=' :'-...-','+' :'.-.-.','-' :'-....-','\'' :'.----.','"' :'.-..-.','(' :'-.--.',')' :'-.--.-','@' :'.--.-.', ' ': '/'}

const reverseMapper = Object.fromEntries(Object.entries(MAPPER).map((v) => [v[1], v[0]]));


export function translateToMorse(text: string): string{

    if (text === ''){
        return '';
    }
    
    let morseCodedArr: string[] = [];
    
    console.log("tyk");
    console.log(text);
    for (let c of text.trim()){
        c = c.toLowerCase();
        if (!(c in MAPPER)){
            throw Error(`Символът ${c} не се поддържа!`);
        }
        morseCodedArr.push(MAPPER[c]);
    }
    
    return morseCodedArr.join(" ");
}


export function translateFromMorse(morseCode: string): string{

    if (morseCode === ''){
        return '';
    }
    
    console.log(morseCode);
    const codes = morseCode.trim().split(" ");
    const message: string[] = [];
    
    for (let code of codes){
        code = code;
        if (!(code in reverseMapper)){
            console.log(code);
            throw Error(`Символът ${code} не се поддържа!`);
        }
        message.push(reverseMapper[code])
    }

    return message.join("");
}
