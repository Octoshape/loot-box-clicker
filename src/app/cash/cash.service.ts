import { Injectable } from '@angular/core';
import { IHero } from '../hero/hero';
import { ICash, cashType } from './cash';
import { IShopItem } from '../shop/shop-item';

@Injectable()
export class CashService {
    
    allCash: ICash[];

    constructor() {
        this.allCash = [];
    }

    getAllCash(): ICash[]{
        return this.allCash;
    }

    currencyNames: string[] = ["copper pieces", "denarii", "silver pieces"];

    getCurrencyName(cash: ICash) {
        return this.currencyNames[cash.currency];
    }

    adventure(hero: IHero) {
        if (this.allCash[cashType.copper]){
            this.allCash[cashType.copper].quantity += 1;
        }
        else{
            this.allCash[cashType.copper] = {currency: cashType.copper, quantity: 1}
        }
    }

    purchase(item: IShopItem): boolean{
        if (!(item.cost.currency in this.allCash)) {
            return false;
        }
        else if (item.cost.quantity > this.allCash[item.cost.currency].quantity){
            return false;
        }
        else {
            this.allCash[item.cost.currency].quantity -= item.cost.quantity;
            return true;
        }

        //TODO grant the thing you just paid for
    }
}
