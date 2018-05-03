import { Injectable } from '@angular/core';
import { IShopItem } from '../shop/shop-item';
import { IEquipmentItem, equipmentType, equipmentSlot } from '../equipment/equipment-item';
import { EquipmentService } from "../equipment/equipment.service";
import { IEnchantment, enchantmentType } from './enchantment';

//Responsible for determining what you get from a chest

@Injectable()
export class LootService {

    allEquipmentSlots: equipmentSlot[]
    materialsByChestRank;
    baseItemsBySlot : string[][] = [["wand", "staff", "briefcase", "towel", "screwdriver", "paintbrush", "checkbook"],
    ["fidget spinner", "orb", "book", "pint glass", "duckie"],
    ["robe", "armor", "suit"], ["hat", "helm", "beanie", "headphones"], ["pants", "pantaloons", "greaves", "leg guards", "chaps"],
    ["sandals", "shoes", "boots"], ["gloves"], ["cloak", "cape", "backguard", "backpack"], ["wristguards", "bracelets", "manacles"],
    ["belt", "girdle", "fanny pack", "waistguard"], ["shoulder pads", "pauldrons"], ["ring"], ["amulet"], ["badge"]];
    //The rookie chest shouldn't have anything. The basic chest can only have the first 5 slots. After that every
    //chest allows 1 more slot.
    
    prefixes : string[] = ["lustrous", "vorpal", "acidic", "questionable", "vibrating", "ineffable", "silly",
     "reknowned", "glistening", "gossamer", "toxic", "bejeweled", "shadowy", "shady", "resplendent",
    "serpentine", "hircine", "hirsute", "xenophilic", "blessed", "well-crafted", "deluxe", "shiny",
    "humorous", "ill-tempered", "solid", "ectoplasmic", "adamantine", "faceted", "sancified", "kinky",
    "perverted", "diurnal", "crepuscular", "nocturnal", "saturnine", "grim", "hardened", "hallowed",
    "elven", "dwarven", "inhuman", "divine", "profane", "axiomatic", "tautological", "your mom's",
    "nonbinary", "engorged", "problematic", "blue", "dour", "mythic", "legendary"];
    suffixes : string[] = ["of the eagle", "of Zagy", "of gainful conjuration", "of the bear", 
     "of feather fall ", "of the diplodocus", "of charisma", "of annihilation", "of lordly might",
     "of the mole rat", "of masculinity/femininity", "+1", ", defender", "+2", "of ill repute"]
    allEnchantments : IEnchantment[] = [];


    slotsAllowedByRank : number[] = [1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    constructor(private _equipmentService: EquipmentService) {
        this.allEquipmentSlots = _equipmentService.getAllEquipmentSlots();
        this.materialsByChestRank = [[{ name: "unknown", power: 1 }],
         [{ name: "iron", power: 2 }, { name: "steel", power: 3 }],
         [{ name: "decrepit", power: 2 }, { name: "unearthed", power: 3 }, { name: "historic", power: 4 }],
         [{ name: "zinc", power: 2 }, { name: "tin", power: 3 }, { name: "silver", power: 4 }, { name: "mithril", power: 5 }],
         [{ name: "silicone", power: 3 }, { name: "silicon", power: 4 }, { name: "electric", power: 5 }, { name: "cybernetic", power: 6 }],
         [{ name: "imitation", power: 4 }, { name: "rubber", power: 5 }, { name: "inflatable", power: 6 }, { name: "rainbow", power: 7 }],
         [{ name: "pyrite", power: 5 }, { name: "gilt", power: 6 }, { name: "gold", power: 7 }, { name: "orichalcum", power: 8 }]
        ];
        this.prefixes.forEach((item) => this.allEnchantments.push({text: item, type: enchantmentType.prefix}));
        this.suffixes.forEach((item) => this.allEnchantments.push({text: item, type: enchantmentType.suffix}));
    }

    getItemsForLootBox(lootBox: IShopItem): IEquipmentItem[] {
        if (lootBox.rank == 0) {
            return [{
                itemName: "Sword of Starting", type: equipmentType.equipabble, slot: equipmentSlot.mainhand,
                power: 3, value: 1
            }]
        }
        var slot = this.getRandomSlotForLootBox(lootBox);
        var baseItem = this.getNameAndPowerForItem(lootBox, slot);
        return [{ itemName: baseItem.name, type: equipmentType.equipabble, slot: slot, power: baseItem.power, value: baseItem.power }];
    }

    getRandomSlotForLootBox(lootBox: IShopItem): equipmentSlot {
        let slotsAllowed;
        if (lootBox.rank > this.slotsAllowedByRank.length + 1) {
            slotsAllowed = this.allEquipmentSlots.length;
        }
        slotsAllowed = Math.min(this.allEquipmentSlots.length, this.slotsAllowedByRank[lootBox.rank])
        return this.allEquipmentSlots[Math.floor(Math.random() * slotsAllowed)];
    }

    getNameAndPowerForItem(lootBox: IShopItem, slot: equipmentSlot) {
        let materialAndPowerList = this.materialsByChestRank[lootBox.rank];
        let materialAndPower = materialAndPowerList[Math.floor(Math.random() * materialAndPowerList.length)];
        let enchantmentCount = this.getEnchantmentCountForChest(lootBox);
        let baseName = materialAndPower.name + " " + this.getBaseItemBySlot(slot);

        return { name: this.getEnchantedName(baseName, enchantmentCount),
         power: materialAndPower.power + this.powerForEnchantmentCount[enchantmentCount] };
    }

    getEnchantedName(baseName: string, enchantmentCount: number): string {
        let enchantments : IEnchantment[] = [];
        for (let i = 0; i < enchantmentCount; i++) {
            enchantments.push(this.allEnchantments[Math.floor(Math.random() * this.allEnchantments.length)]);
        }
        let workingName : string = baseName;
        enchantments.forEach((enchantment) => {
            if (enchantment.type == enchantmentType.prefix){
                workingName = enchantment.text + " " + workingName;
            }
            else { //it's a suffix
                workingName = workingName + " " + enchantment.text;
            }
        })
        return workingName;
    }

    chanceOfEnchantment: number = 1/6;

    /*Each rank beyond the first gives a 1/6 chance of an enchantment.
    Enchantment power is triangular so 1/2/3/4 enchantments gives 1/3/6/10 power.*/
    getEnchantmentCountForChest(lootBox: IShopItem): number {
        let enchantments = 0;
        for(let i = 1; i < lootBox.rank; i++) {
            if (Math.random() < this.chanceOfEnchantment) {
                enchantments++;
            }
        }
        return enchantments;
    }

    powerForEnchantmentCount: number[] = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120, 136, 153, 171, 190, 210, 231, 253, 276, 300, 325, 351, 378, 406, 435, 465, 496, 528, 561, 595, 630, 666];

    getPowerForEnchantmentCount(count: number): number {
        return this.powerForEnchantmentCount[count];
    }

    getBaseItemBySlot(slot: equipmentSlot): string {
        let possibleBaseItems = this.baseItemsBySlot[slot];
        return possibleBaseItems[Math.floor(Math.random() * possibleBaseItems.length)];
    }
}

