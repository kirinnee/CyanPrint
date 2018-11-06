import {Shape} from "./Shape";

class Square implements Shape {
	private readonly side: number;
	
	constructor(side: number) {
		this.side = side;
	}
	
	get area() {
		return this.side * this.side;
	}
	
	parameter() {
		return this.side * 4;
	}
}

export {Square};