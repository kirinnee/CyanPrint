import {Core} from "@kirinnee/core";

interface IGuidGenerator {
    GenerateGuid(): string;
}

class GuidGenerator implements IGuidGenerator {

    private static guids: string[] = [];

    constructor(core: Core) {
        core.AssertExtend();
    }

    GenerateGuid(): string {
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            d += performance.now(); //use high-precision timer if available
        }
        let x = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        if (GuidGenerator.guids.Has(x)) {
            return this.GenerateGuid();
        } else {
            GuidGenerator.guids.push(x);
            return x;
        }
    }

    IsGuid(guid: string) {
        let regex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        return regex.test(guid) && guid.length === 36;
    }
}

export {GuidGenerator, IGuidGenerator}