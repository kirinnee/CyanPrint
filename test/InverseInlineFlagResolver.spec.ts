import {Utility} from "../src/classLibrary/Utility";
import {FileSystemInstance, IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';
import {InverseInlineFlagResolver} from "../src/classLibrary/ParsingStrategy/InverseInlineFlagResolver";

should();
let core: Core = new Kore();
let util: Utility = new Utility(core);
core.ExtendPrimitives();

let inlineFlagParser: InverseInlineFlagResolver = new InverseInlineFlagResolver(util);

let simpleFlagObject: object = {
	remove: {
		one: false,
		two: true,
		three: {
			one: false,
			two: true
		}
	},
	stay: false
};

describe("InlineFlagResolver", () => {
	
	describe("ResolveContents", () => {
		it("should remove false flags and remove injected code", () => {
			let files: FileSystemInstance[] = [
				{
					destinationAbsolutePath: "root/flag!~remove.one~one/one",
					relativePath: "flag!~remove.one~one/one",
					sourceAbsolutePath: "root/source/flag!~remove.one~one/one"
				},
				{
					destinationAbsolutePath: "root/flag!~remove.two~two/two",
					relativePath: "flag!~remove.two~two/two",
					sourceAbsolutePath: "root/source/flag!~remove.two~two/two"
				},
				{
					destinationAbsolutePath: "root/flag!~remove.three.one~one/31",
					relativePath: "flag!~remove.three.one~one/31",
					sourceAbsolutePath: "root/source/flag!~remove.three.one~one/31",
				},
				{
					destinationAbsolutePath: "root/flag!~remove.three.two~two/32",
					relativePath: "flag!~remove.three.two~two/32",
					sourceAbsolutePath: "root/source/flag!~remove.three.two~two/32",
				},
				{
					destinationAbsolutePath: "root/flag!~stay~stay/stay",
					relativePath: "flag!~stay~stay/stay",
					sourceAbsolutePath: "root/source/flag!~stay~stay/stay",
				},
				{
					destinationAbsolutePath: "root/test/stay",
					relativePath: "test/stay",
					sourceAbsolutePath: "root/source/test/stay",
				}
			];
			let expected: FileSystemInstance[] = [
				{
					destinationAbsolutePath: "root/one/one",
					relativePath: "flag!~remove.one~one/one",
					sourceAbsolutePath: "root/source/flag!~remove.one~one/one"
				},
				{
					destinationAbsolutePath: "root/one/31",
					relativePath: "flag!~remove.three.one~one/31",
					sourceAbsolutePath: "root/source/flag!~remove.three.one~one/31",
				},
				{
					destinationAbsolutePath: "root/stay/stay",
					relativePath: "flag!~stay~stay/stay",
					sourceAbsolutePath: "root/source/flag!~stay~stay/stay",
				},
				{
					destinationAbsolutePath: "root/test/stay",
					relativePath: "test/stay",
					sourceAbsolutePath: "root/source/test/stay",
				}
			];
			
			inlineFlagParser.ResolveFiles(simpleFlagObject, files).should.deep.equal(expected);
		});
	});
	
	describe("ResolveFileContent", () => {
		it("should remove lines that have false flag and remove flags from the rest of the lines", () => {
			let content: string =
				`Lorem ipsum dolor sit amet, flag!~remove.one~ consectetur adipiscing elit.
Integer quis est vulputate, interdum neque sed, pulvinar lacus.flag!~remove.two~
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.flag!~remove.three.one~
flag!~remove.three.two~Orci varius natoque penatibus et magnis dis parturient montes, nascetur
flag!~stay~ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
			let eString: string =
				`Lorem ipsum dolor sit amet,  consectetur adipiscing elit.
Curabitur dolor massa, varius cursus nunc sed, tincidunt mollis est.
ridiculus mus. Donec eu velit fermentum, maximus tortor sit amet, rhoncus
eros. Nullam semper libero in ullamcorper rhoncus. Fusce ligula sem, 
fringilla non enim vitae, congue interdum mi. Ut sed ex et neque laoreet 
eleifend. Donec maximus urna eros. Nunc gravida sollicitudin dignissim. 
Sed consequat ipsum at congue vulputate. In ac ipsum vel dui pellentesque blandit. 
Pellentesque tempus quis orci eu vulputate. Fusce vehicula nibh 
eget finibus venenatis.`;
			
			let map: Map<string, boolean> = util
				.FlattenFlagObject(simpleFlagObject)
				.MapKey(inlineFlagParser.ModifyFlagKeys)
				.MapValue((v: boolean) => !v);
			let actual: FileSystemInstance = {
				destinationAbsolutePath: "dest",
				relativePath: "rel",
				sourceAbsolutePath: "src",
				content: content
			} as FileSystemInstance;
			let expected: FileSystemInstance = {
				destinationAbsolutePath: "dest",
				relativePath: "rel",
				sourceAbsolutePath: "src",
				content: eString
			} as FileSystemInstance;
			
			inlineFlagParser.ResolveFileContent(map, actual).should.deep.equal(expected);
		});
	});
	
	describe("Count", () => {
		it("should count th number of each flag instance", () => {
			//setup
			let file: IFile = {
				sourceAbsolutePath: "flag!~remove.one~one/one",
				destinationAbsolutePath: "flag!~remove.one~one/one",
				relativePath: "flag!~remove.one~one/one",
				content: "flag!~remove.one~ flag!~remove.two~ asd\nflag!~remove.three.one~"
			};
			let dir: IDirectory = {
				sourceAbsolutePath: "flag!~remove.three.two~one/one",
				destinationAbsolutePath: "flag!~remove.three.two~one/one",
				relativePath: "flag!~remove.three.two~one/one",
			};
			let dir2: IDirectory = {
				sourceAbsolutePath: "flag!~stay~one/one",
				destinationAbsolutePath: "flag!~stay~one/one",
				relativePath: "flag!~stay~one/one",
			};
			
			let files: FileSystemInstance[] = [file, dir, dir2];
			let expected: [string, number][] = new Map<string, number>([
				["remove.one", 2],
				["remove.two", 1],
				["remove.three.one", 1],
				["remove.three.two", 1],
				["stay", 1]
			]).SortByKey(SortType.AtoZ).Arr();
			
			let oldMap: Map<string, number> = new Map<string, number>([
				["remove.one", 12],
				["stay", 4],
				["remove.three.two", 5]
			]);
			let oldExpected: [string, number][] = new Map([
				["remove.one", 14],
				["remove.two", 1],
				["remove.three.one", 1],
				["remove.three.two", 6],
				["stay", 5]
			]).SortByKey(SortType.AtoZ).Arr();
			
			let actual: [string, number][] = inlineFlagParser
				.Count(simpleFlagObject, files, new Map<string, number>([]), false)
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			let oldActual: [string, number][] = inlineFlagParser
				.Count(simpleFlagObject, files, oldMap, false)
				.SortByKey(SortType.AtoZ)
				.Arr();
			actual.should.deep.equal(expected);
			oldActual.should.deep.equal(oldExpected);
		});
	});
	
	describe("ModifyFlagKeys", () => {
		it("should correctly modify flag key", () => {
			let actual = inlineFlagParser.ModifyFlagKeys("someFlag");
			let expected = "flag!~someFlag~";
			actual.should.equal(expected);
		});
	});
	
});


