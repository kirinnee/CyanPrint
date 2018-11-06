import {Core} from "@kirinnee/core";

interface IPermuteManager {
	Completed(): boolean
	
	Start(initial?: boolean): void;
	
	End(): void;
	
	GetChoice(allChoices: number[]): number;
	
}

class PermuteManager implements IPermuteManager {
	
	public currentIteration: number[] = [];
	private alternatives: number[][] = [];
	private currentQueue: number[] = [];
	
	constructor(core: Core) {
		if (!core.IsExtended) throw new Error("Core needs to be extended");
	}
	
	Completed(): boolean {
		return this.currentQueue.length === 0
			&& this.alternatives.length === 0
			&& this.currentIteration.length === 0;
	}
	
	End(): void {
		this.currentIteration = [];
		this.currentQueue = [];
	}
	
	GetChoice(allChoices: number[]): number {
		if (this.currentQueue.length !== 0) {
			let choice: number = this.currentQueue.shift()!;
			this.currentIteration.push(choice);
			return choice;
		} else {
			let choice: number = allChoices[0];
			allChoices.Skip(1)
				
				.Map(n => this.currentIteration.concat(n))
				.Each(alternatives => this.alternatives.push(alternatives));
			this.currentIteration.push(choice);
			return choice;
		}
	}
	
	Start(initial: boolean = false): void {
		if (!initial) {
			this.currentQueue = this.alternatives.pop()!;
		}
	}
	
}

export {PermuteManager, IPermuteManager}
