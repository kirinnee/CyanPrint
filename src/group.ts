import path from 'path';

import {Group} from "./classLibrary/Group";
import {Core, Kore} from "@kirinnee/core";

let core: Core = new Kore();
core.ExtendPrimitives();
let root = path.resolve(__dirname, '../templates');
let group: Group = new Group(core, root);

function CreateGroup(name: string): string {
	return group.Create(name);
}

function DeleteGroup(name: string): string {
	return group.Delete(name);
}

function ListGroup(): string {
	return group.List();
}

function ExistGroup(name: string): boolean {
	return group.Exist(name);
}

export {CreateGroup, DeleteGroup, ListGroup, ExistGroup};