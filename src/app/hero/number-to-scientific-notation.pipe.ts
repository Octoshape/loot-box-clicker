import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numberToScientificNotation'
})
export class NumberToScientificNotationPipe implements PipeTransform {
    transform(input: number): string {
        if (input < 100000) {
            return "" + input;
        }
        let power = Math.round(Math.log10(input));
        let mantissa = input / (Math.pow(10, power)); //.toFixed(3);
        if (mantissa < 1) {
            mantissa *= 10;
            power -= 1;
        }
        return mantissa.toFixed(3) + ' × 10<sup>' + power.toString() + '</sup>';
    }
}